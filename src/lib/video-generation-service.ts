import OpenAI from "openai";
import { ProjectService } from "@/lib/project-service";
import { getImageStyle, getDefaultImageStyle } from "@/lib/image-config";
import { FalAIService } from "@/lib/falai-service";
import { OpenAIService } from "@/lib/openai-service";
import { R2Storage } from "@/lib/r2-storage";
import { parseStructuredOutput } from "@/lib/api-utils";
import { TranscriptionService } from "@/lib/transcription-service";
import { SpeechService } from "@/lib/speech-service";

// MP3 frame header parsing utilities
function getMP3Duration(buffer: Buffer): number | null {
  try {
    // MP3 frame header constants
    const SAMPLES_PER_FRAME = 1152; // For MPEG 1 Layer 3

    let offset = 0;
    let totalSamples = 0;
    let sampleRate = 0;
    let frameCount = 0;

    // Skip ID3 header if present
    if (buffer.subarray(0, 3).toString() === "ID3") {
      const id3Size =
        (buffer[6] << 21) | (buffer[7] << 14) | (buffer[8] << 7) | buffer[9];
      offset = id3Size + 10;
    }

    while (offset < buffer.length - 4) {
      // Look for MP3 frame sync (11111111 111)
      if (buffer[offset] === 0xff && (buffer[offset + 1] & 0xe0) === 0xe0) {
        const header =
          (buffer[offset] << 24) |
          (buffer[offset + 1] << 16) |
          (buffer[offset + 2] << 8) |
          buffer[offset + 3];

        // Parse header
        const version = (header >> 19) & 3;
        const layer = (header >> 17) & 3;
        const bitrateIndex = (header >> 12) & 15;
        const sampleRateIndex = (header >> 10) & 3;

        if (
          version === 1 &&
          layer === 1 &&
          bitrateIndex !== 0 &&
          bitrateIndex !== 15 &&
          sampleRateIndex !== 3
        ) {
          // MPEG 1 Layer 3 (MP3)
          const bitrates = [
            0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0,
          ];
          const sampleRates = [44100, 48000, 32000, 0];

          const bitrate = bitrates[bitrateIndex] * 1000;
          sampleRate = sampleRates[sampleRateIndex];

          if (bitrate && sampleRate) {
            const frameLength = Math.floor(
              (SAMPLES_PER_FRAME * bitrate) / (sampleRate * 8),
            );
            totalSamples += SAMPLES_PER_FRAME;
            frameCount++;
            offset += frameLength;
            continue;
          }
        }
      }
      offset++;
    }

    if (frameCount > 0 && sampleRate > 0) {
      return totalSamples / sampleRate;
    }

    return null;
  } catch (error) {
    console.warn("Error parsing MP3 duration from buffer:", error);
    return null;
  }
}

// Alternative: Simple estimation based on bitrate and file size
function estimateMP3Duration(buffer: Buffer): number {
  // OpenAI TTS typically generates MP3s at ~128kbps
  const estimatedBitrate = 128000; // bits per second
  const fileSizeInBits = buffer.length * 8;
  return fileSizeInBits / estimatedBitrate;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface VideoSegmentData {
  text: string;
  imagePrompt: string;
  order: number;
}

export interface MediaGenerationResult {
  imageResults: Array<{
    success: boolean;
    imageUrl?: string;
    error?: string;
    prompt: string;
    index: number;
  }>;
  audioResults: Array<{
    index: number;
    audioUrl: string;
    duration: number;
    segmentId: string;
    wordTimings?: any[];
  }>;
}

export class VideoGenerationService {
  /**
   * Break script into meaningful chunks for video segments
   */
  static async breakScriptIntoChunks(script: string): Promise<string[]> {
    const startTime = Date.now();
    console.log("[VideoGen] Starting script segmentation");
    console.log(`[VideoGen] Script length: ${script.length} characters`);
    console.log(`[VideoGen] Script preview: "${script.substring(0, 100)}..."`);

    try {
      console.log("[VideoGen] Sending script to OpenAI for segmentation...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a video script segmenter. Break down the provided script into meaningful chunks WITHOUT modifying the original text. Each chunk should:
1. Be 3-5 seconds of speaking time (roughly 8-15 words)
2. Form a complete thought or sentence fragment that makes sense
3. Be suitable for generating a single image that represents the content
4. Flow naturally from one chunk to the next
5. There can be a maximum of only 10 chunks
6. IMPORTANT: Use the EXACT original text without any modifications, corrections, or improvements

The response will be structured as a JSON object with a "chunks" array containing the original script segments.`,
          },
          {
            role: "user",
            content: script,
          },
        ],
        temperature: 1,
        response_format: { type: "json_object" },
      });

      console.log("[VideoGen] OpenAI response received, parsing chunks...");
      console.log(
        `[VideoGen] Raw response: ${completion.choices[0].message.content?.substring(0, 200)}...`,
      );

      const result = parseStructuredOutput<{ chunks: string[] }>(
        completion.choices[0].message.content || "{}",
      );

      if (!result.success || !result.data) {
        console.error(
          "[VideoGen] Failed to parse script chunks from OpenAI response",
        );
        throw new Error("Failed to parse script chunks");
      }

      const chunks = result.data.chunks;
      const duration = Date.now() - startTime;

      console.log(`[VideoGen] Script segmentation completed in ${duration}ms`);
      console.log(`[VideoGen] Generated ${chunks.length} chunks:`);
      chunks.forEach((chunk, index) => {
        console.log(`[VideoGen] Chunk ${index}: "${chunk}"`);
      });

      return chunks;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[VideoGen] Script segmentation failed after ${duration}ms:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate image prompts for video segments with visual consistency
   */
  static async generateImagePrompts(
    chunks: string[],
    styleId?: string,
    style?: string,
  ): Promise<string[]> {
    const startTime = Date.now();
    console.log(
      `[VideoGen] Starting image prompt generation for ${chunks.length} chunks`,
    );
    console.log(
      `[VideoGen] Style ID: ${styleId || "default"}, Style name: ${style || "dark and eerie"}`,
    );

    const imageStyle =
      (styleId && getImageStyle(styleId)) || getDefaultImageStyle();
    const styleName = style || "dark and eerie";

    console.log(`[VideoGen] Using image style: ${imageStyle.name}`);
    console.log(
      `[VideoGen] Style system prompt: "${imageStyle.systemPrompt.substring(0, 100)}..."`,
    );

    try {
      console.log(
        "[VideoGen] Sending chunks to OpenAI for image prompt generation...",
      );
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: `You are an expert at creating detailed image prompts for AI image generation that maintain visual consistency across a video sequence. For each script chunk provided, create a compelling visual prompt that:

1. Captures the essence and mood of the text
2. Is optimized for the ${styleName} visual style
3. Includes cinematic composition details
4. Specifies lighting, atmosphere, and visual effects
5. Is detailed enough to generate high-quality, engaging images
6. MAINTAINS VISUAL CONSISTENCY: Each image should feel like a natural progression from the previous frame
7. CREATES SMOOTH TRANSITIONS: Include consistent elements like camera angle, lighting setup, color palette, and environmental details
8. PRESERVES CONTINUITY: Keep consistent character positioning, environmental context, and visual style throughout the sequence

Base image style: ${imageStyle.systemPrompt}

Style guidelines for "${styleName}":
- Dark, moody atmosphere with dramatic lighting
- High contrast and rich shadows
- Cinematic composition with depth
- Detailed textures and atmospheric effects

CRITICAL CONSISTENCY REQUIREMENTS:
- Maintain the same camera perspective/angle throughout the sequence
- Keep consistent lighting conditions (time of day, light sources, shadows)
- Preserve environmental elements (location, weather, atmosphere)
- Use consistent color palette and mood
- Ensure smooth visual flow from one frame to the next
- Each prompt should reference visual elements that connect to the previous scene

Return a JSON object with "prompts" array containing one detailed prompt for each chunk, ensuring each builds upon the previous visual context.`,
          },
          {
            role: "user",
            content: `Create visually consistent image prompts for these script chunks that will form a cohesive video sequence: ${JSON.stringify(chunks)}`,
          },
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      });

      console.log("[VideoGen] OpenAI response received for image prompts");
      console.log(
        `[VideoGen] Raw prompt response: ${completion.choices[0].message.content?.substring(0, 200)}...`,
      );

      const result = parseStructuredOutput<{ prompts: string[] }>(
        completion.choices[0].message.content || "{}",
      );

      if (!result.success || !result.data) {
        console.error(
          "[VideoGen] Failed to parse image prompts from OpenAI response",
        );
        throw new Error("Failed to parse image prompts");
      }

      const prompts = result.data.prompts;
      const duration = Date.now() - startTime;

      console.log(
        `[VideoGen] Image prompt generation completed in ${duration}ms`,
      );
      console.log(`[VideoGen] Generated ${prompts.length} image prompts:`);
      prompts.forEach((prompt, index) => {
        console.log(
          `[VideoGen] Prompt ${index}: "${prompt.substring(0, 80)}..."`,
        );
      });

      if (prompts.length !== chunks.length) {
        console.warn(
          `[VideoGen] Prompt count mismatch: expected ${chunks.length}, got ${prompts.length}`,
        );
      }

      return prompts;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[VideoGen] Image prompt generation failed after ${duration}ms:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate audio for a text segment with word-level timestamps
   */
  static async generateAudio(
    text: string,
    voice: string,
    userId: string,
    projectId: string,
    segmentId: string,
    index: number,
  ): Promise<{
    audioUrl: string;
    key: string;
    duration: number;
    wordTimings?: any[];
  }> {
    // Use the unified SpeechService to generate speech
    const result = await SpeechService.generateSpeech(
      text,
      voice,
      userId,
      projectId,
      segmentId,
      index
    );

    return {
      audioUrl: result.audioUrl,
      key: result.key,
      duration: result.duration,
      wordTimings: result.wordTimings,
    };
  }

  /**
   * Generate image using appropriate service (OpenAI or FalAI)
   */
  static async generateImage(
    prompt: string,
    model: string,
    style: string | undefined,
    imageSize: string,
    userId: string,
    projectId: string,
    segmentId: string,
    index: number,
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
      if (this.isOpenAIModel(model)) {
        // Use OpenAI service for DALL-E models (already handles R2 upload and file record creation)
        return await OpenAIService.generateImage({
          prompt,
          style,
          imageSize,
          storeInR2: true,
          userId,
          projectId,
          segmentId,
        });
      } else {
        // Use FalAI service for Flux models
        const falAIResult = await FalAIService.generateImage(
          prompt,
          style,
          imageSize,
          model,
        );

        if (falAIResult.success && falAIResult.imageUrl) {
          // Download the image and upload to R2
          try {
            const imageResponse = await fetch(falAIResult.imageUrl);
            if (!imageResponse.ok) {
              throw new Error(
                `Failed to download image: ${imageResponse.statusText}`,
              );
            }

            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

            // Upload to R2 storage
            const { key, url } = await R2Storage.uploadImage(
              imageBuffer,
              userId,
              projectId,
              index,
              segmentId,
            );

            // Create file record in database
            await ProjectService.createFile({
              projectId: projectId,
              segmentId: segmentId,
              fileType: "image",
              fileName: `image_${segmentId}_${Date.now()}.jpg`,
              originalName: `segment_${index}_image.jpg`,
              mimeType: "image/jpeg",
              fileSize: imageBuffer.length,
              r2Key: key,
              r2Url: url,
              uploadStatus: "completed",
              metadata: {
                prompt: prompt,
                model: model,
                generatedAt: new Date().toISOString(),
              },
            });

            return {
              success: true,
              imageUrl: url,
            };
          } catch (uploadError) {
            console.error("Failed to upload FalAI image to R2:", uploadError);
            // Fallback to original FalAI result if R2 upload fails
            return falAIResult;
          }
        } else {
          return falAIResult;
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate image",
      };
    }
  }

  /**
   * Generate all media (images and audio) in parallel for video segments
   */
  static async generateMediaInParallel(
    segments: VideoSegmentData[],
    createdSegments: Array<{ id: string }>,
    styleId: string | undefined,
    voice: string,
    userId: string,
    projectId: string,
    imageModel?: string,
  ): Promise<MediaGenerationResult> {
    const startTime = Date.now();
    console.log(
      `[VideoGen] Starting parallel media generation for ${segments.length} segments`,
    );
    console.log(`[VideoGen] Project: ${projectId}, User: ${userId}`);
    console.log(
      `[VideoGen] Style: ${styleId || "default"}, Voice: ${voice}, Model: ${imageModel || "default"}`,
    );

    const imageStyle = styleId
      ? getImageStyle(styleId)
      : getDefaultImageStyle();

    console.log(
      `[VideoGen] Using image style: ${imageStyle?.name || "default"}`,
    );

    // Prepare image generation requests
    console.log("[VideoGen] Preparing image generation requests...");
    const imagePrompts = segments.map((segment, index) => {
      const enhancedPrompt = imageStyle
        ? `${imageStyle.systemPrompt}. ${segment.imagePrompt}`
        : segment.imagePrompt;

      const modelKey =
        imageModel ||
        (imageStyle?.model.includes("schnell")
          ? "flux-schnell"
          : imageStyle?.model.includes("dev")
            ? "flux-dev"
            : imageStyle?.model.includes("pro")
              ? "flux-pro"
              : imageStyle?.model.includes("nano-banana")
                ? "nano-banana"
                : "flux-schnell");

      console.log(
        `[VideoGen] Segment ${index}: Model=${modelKey}, Prompt="${segment.imagePrompt}"`,
      );

      return {
        prompt: enhancedPrompt,
        style: imageStyle?.name,
        imageSize: "portrait_16_9",
        model: modelKey,
        segmentId: createdSegments[index].id,
        index,
      };
    });

    // Prepare audio generation requests
    console.log("[VideoGen] Preparing audio generation requests...");
    const audioPromises = segments.map(async (segment, index) => {
      console.log(
        `[VideoGen] Starting audio generation for segment ${index}: "${segment.text}"`,
      );
      const result = await this.generateAudio(
        segment.text,
        voice,
        userId,
        projectId,
        createdSegments[index].id,
        index,
      );

      console.log(
        `[VideoGen] Audio generation completed for segment ${index}, duration: ${result.duration}s`,
      );
      return {
        index,
        audioUrl: result.audioUrl,
        duration: result.duration,
        segmentId: createdSegments[index].id,
        wordTimings: result.wordTimings,
      };
    });

    // Generate images
    console.log("[VideoGen] Preparing image generation promises...");
    const imageGenerationPromises = imagePrompts.map(async (promptData) => {
      console.log(
        `[VideoGen] Starting image generation for segment ${promptData.index}`,
      );
      const result = await this.generateImage(
        promptData.prompt,
        promptData.model,
        promptData.style,
        promptData.imageSize,
        userId,
        projectId,
        promptData.segmentId,
        promptData.index,
      );

      console.log(
        `[VideoGen] Image generation ${result.success ? "completed" : "failed"} for segment ${promptData.index}`,
      );
      return {
        ...result,
        prompt: promptData.prompt,
        index: promptData.index,
      };
    });

    // Execute parallel generation
    console.log(
      "[VideoGen] Starting parallel execution of image and audio generation...",
    );
    const parallelStartTime = Date.now();

    try {
      const [imageResults, audioResults] = await Promise.all([
        Promise.all(imageGenerationPromises),
        Promise.all(audioPromises),
      ]);

      const parallelDuration = Date.now() - parallelStartTime;
      const totalDuration = Date.now() - startTime;

      console.log(
        `[VideoGen] Parallel generation completed in ${parallelDuration}ms`,
      );
      console.log(`[VideoGen] Total media generation time: ${totalDuration}ms`);

      // Log results summary
      const successfulImages = imageResults.filter((r) => r.success).length;
      const successfulAudio = audioResults.length; // All audio should succeed or throw

      console.log(
        `[VideoGen] Results: ${successfulImages}/${imageResults.length} images, ${successfulAudio}/${segments.length} audio files`,
      );

      if (successfulImages < imageResults.length) {
        const failedImages = imageResults.filter((r) => !r.success);
        console.warn(
          `[VideoGen] Failed image generations:`,
          failedImages.map((r) => ({ index: r.index, error: r.error })),
        );
      }

      return { imageResults, audioResults };
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      console.error(
        `[VideoGen] Parallel media generation failed after ${totalDuration}ms:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Process complete video generation pipeline
   */
  static async processCompleteVideo(
    projectId: string,
    userId: string,
    params: {
      script: string;
      styleId?: string;
      imageModel?: string;
      voice: string;
    },
  ): Promise<void> {
    const pipelineStartTime = Date.now();
    const { script, styleId, imageModel, voice } = params;

    console.log(`[VideoGen] Starting complete video generation pipeline`);
    console.log(`[VideoGen] Project: ${projectId}, User: ${userId}`);
    console.log(`[VideoGen] Parameters:`, {
      styleId,
      imageModel,
      voice,
      scriptLength: script.length,
    });

    try {
      // Step 1: Break script into chunks
      console.log("[VideoGen] === STEP 1: Script Segmentation ===");
      const step1Start = Date.now();
      const chunks = await this.breakScriptIntoChunks(script);
      const step1Duration = Date.now() - step1Start;
      console.log(
        `[VideoGen] Step 1 completed in ${step1Duration}ms - Generated ${chunks.length} segments`,
      );

      // Step 2: Generate image prompts
      console.log("[VideoGen] === STEP 2: Image Prompt Generation ===");
      const step2Start = Date.now();
      const imageStyle = styleId
        ? getImageStyle(styleId)
        : getDefaultImageStyle();
      const prompts = await this.generateImagePrompts(
        chunks,
        styleId,
        imageStyle?.name ?? getDefaultImageStyle().name,
      );
      const step2Duration = Date.now() - step2Start;
      console.log(
        `[VideoGen] Step 2 completed in ${step2Duration}ms - Generated ${prompts.length} prompts`,
      );

      // Step 3: Create segments in batch
      console.log("[VideoGen] === STEP 3: Database Segment Creation ===");
      const step3Start = Date.now();
      const segments: VideoSegmentData[] = chunks.map(
        (chunk: string, index: number) => ({
          text: chunk,
          imagePrompt: prompts[index] || `Visual representation of: ${chunk}`,
          order: index,
        }),
      );

      console.log(
        `[VideoGen] Creating ${segments.length} segments in database...`,
      );
      const createdSegments = await ProjectService.createSegmentsBatch(
        projectId,
        userId,
        segments,
      );
      const step3Duration = Date.now() - step3Start;
      console.log(
        `[VideoGen] Step 3 completed in ${step3Duration}ms - Created ${createdSegments.length} database records`,
      );

      // Step 4: Parallel media generation
      console.log("[VideoGen] === STEP 4: Parallel Media Generation ===");
      const step4Start = Date.now();
      const { imageResults, audioResults } = await this.generateMediaInParallel(
        segments,
        createdSegments,
        styleId,
        voice,
        userId,
        projectId,
        imageModel,
      );
      const step4Duration = Date.now() - step4Start;
      console.log(
        `[VideoGen] Step 4 completed in ${step4Duration}ms - Generated media for all segments`,
      );

      // Step 5: Update segments with generated media URLs, durations, and word timings
      console.log("[VideoGen] === STEP 5: Database Updates ===");
      const step5Start = Date.now();
      console.log(
        "[VideoGen] Updating segments with generated media URLs and metadata...",
      );

      const updatePromises = createdSegments.map(async (segment, index) => {
        const updates: any = {};

        // Update image URL if generation was successful
        const imageResult = imageResults.find((r) => r.index === index);
        if (imageResult?.success && imageResult.imageUrl) {
          updates.imageUrl = imageResult.imageUrl;
          console.log(`[VideoGen] Segment ${index}: Image URL updated`);
        } else {
          console.warn(
            `[VideoGen] Segment ${index}: No image URL available (${imageResult?.error || "unknown error"})`,
          );
        }

        // Update audio URL, duration, and word timings
        const audioResult = audioResults.find((r) => r.index === index);
        if (audioResult) {
          updates.audioUrl = audioResult.audioUrl;
          updates.duration = audioResult.duration;
          console.log(
            `[VideoGen] Segment ${index}: Audio URL and duration (${audioResult.duration}s) updated`,
          );

          // Update word timings if available
          if (audioResult.wordTimings && audioResult.wordTimings.length > 0) {
            updates.wordTimings = audioResult.wordTimings;
            console.log(
              `[VideoGen] Segment ${index}: Word timings updated (${audioResult.wordTimings.length} words)`,
            );
          }
        } else {
          console.warn(`[VideoGen] Segment ${index}: No audio result found`);
        }

        if (Object.keys(updates).length > 0) {
          console.log(
            `[VideoGen] Updating segment ${index} with:`,
            Object.keys(updates),
          );
          return ProjectService.updateSegment(segment.id, userId, updates);
        }
        return segment;
      });

      await Promise.all(updatePromises);
      const step5Duration = Date.now() - step5Start;
      console.log(
        `[VideoGen] Step 5 completed in ${step5Duration}ms - Updated all segment records`,
      );

      // Step 6: Calculate total duration and update project status
      console.log("[VideoGen] === STEP 6: Project Finalization ===");
      const step6Start = Date.now();
      const totalDuration = audioResults.reduce(
        (sum, result) => sum + result.duration,
        0,
      );

      console.log(
        `[VideoGen] Calculated total video duration: ${totalDuration}s`,
      );
      console.log(`[VideoGen] Updating project status to 'completed'...`);

      await ProjectService.updateProject(projectId, userId, {
        status: "completed",
        duration: totalDuration,
      });

      const step6Duration = Date.now() - step6Start;
      const pipelineDuration = Date.now() - pipelineStartTime;

      console.log(
        `[VideoGen] Step 6 completed in ${step6Duration}ms - Project finalized`,
      );
      console.log(`[VideoGen] === PIPELINE COMPLETED ===`);
      console.log(
        `[VideoGen] Total pipeline duration: ${pipelineDuration}ms (${(pipelineDuration / 1000).toFixed(2)}s)`,
      );
      console.log(`[VideoGen] Performance breakdown:`);
      console.log(`[VideoGen]   - Script segmentation: ${step1Duration}ms`);
      console.log(`[VideoGen]   - Image prompts: ${step2Duration}ms`);
      console.log(`[VideoGen]   - Database creation: ${step3Duration}ms`);
      console.log(`[VideoGen]   - Media generation: ${step4Duration}ms`);
      console.log(`[VideoGen]   - Database updates: ${step5Duration}ms`);
      console.log(`[VideoGen]   - Project finalization: ${step6Duration}ms`);
    } catch (error) {
      const pipelineDuration = Date.now() - pipelineStartTime;
      console.error(`[VideoGen] === PIPELINE FAILED ===`);
      console.error(
        `[VideoGen] Pipeline failed after ${pipelineDuration}ms:`,
        error,
      );
      console.error(`[VideoGen] Error details:`, {
        projectId,
        userId,
        params,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Update project status to failed
      try {
        await ProjectService.updateProject(projectId, userId, {
          status: "failed",
        });
        console.log(`[VideoGen] Project status updated to 'failed'`);
      } catch (updateError) {
        console.error(
          `[VideoGen] Failed to update project status to 'failed':`,
          updateError,
        );
      }

      throw error;
    }
  }

  /**
   * Generate single audio file (for regeneration use cases) with word-level timestamps
   */
  static async generateSingleAudio(
    text: string,
    voice: string,
    userId: string,
    projectId?: string,
    segmentId?: string,
    index: number = 0,
  ): Promise<{
    audioUrl: string;
    key: string;
    projectId: string;
    duration: number;
    wordTimings?: any[];
  }> {
    // Use the unified SpeechService to generate speech
    const result = await SpeechService.generateSpeech(
      text,
      voice,
      userId,
      projectId,
      segmentId,
      index
    );

    return {
      audioUrl: result.audioUrl,
      key: result.key,
      projectId: result.projectId,
      duration: result.duration,
      wordTimings: result.wordTimings,
    };
  }

  /**
   * Generate single image (for regeneration use cases)
   */
  static async generateSingleImage(
    prompt: string,
    model: string = "flux-schnell",
    style?: string,
    imageSize: string = "portrait_16_9",
    quality?: "low" | "medium" | "high",
    aspectRatio?: "square" | "portrait" | "landscape",
    storeInR2?: boolean,
    userId?: string,
    projectId?: string,
    segmentId?: string,
    index: number = 0,
  ): Promise<{
    success: boolean;
    imageUrl?: string;
    error?: string;
    prompt: string;
  }> {
    try {
      if (storeInR2 && userId && projectId && segmentId) {
        // Use the full image generation with R2 upload
        const result = await this.generateImage(
          prompt,
          model,
          style,
          imageSize,
          userId,
          projectId,
          segmentId,
          index,
        );
        return {
          ...result,
          prompt,
        };
      } else {
        // Simple generation without R2 storage
        if (this.isOpenAIModel(model)) {
          const result = await OpenAIService.generateImage({
            prompt,
            style,
            imageSize,
            quality,
            aspectRatio,
            storeInR2: false,
            userId,
            projectId,
            segmentId,
          });
          return {
            ...result,
            prompt,
          };
        } else {
          const result = await FalAIService.generateImage(
            prompt,
            style,
            imageSize,
            model,
          );
          return {
            ...result,
            prompt,
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate image",
        prompt,
      };
    }
  }

  /**
   * Generate video from image (for image-to-video conversion use cases)
   */
  static async generateVideoFromImage(
    imageUrl: string,
    prompt?: string,
    userId?: string,
    projectId?: string,
    segmentId?: string,
    index: number = 0,
  ): Promise<{
    success: boolean;
    videoUrl?: string;
    error?: string;
    imageUrl: string;
  }> {
    const startTime = Date.now();
    console.log(
      `[VideoGen] Starting image-to-video conversion for segment ${index}`,
    );
    console.log(`[VideoGen] Source image URL: ${imageUrl}`);
    console.log(`[VideoGen] Motion prompt: ${prompt || "default motion"}`);

    try {
      // Use FalAI service to generate video from image
      const falAIResult = await FalAIService.generateVideo(imageUrl, prompt);

      if (falAIResult.success && falAIResult.videoUrl) {
        console.log(
          `[VideoGen] Video generation successful for segment ${index}`,
        );

        // If we have the necessary parameters, store the video in R2 and create database record
        if (userId && projectId && segmentId) {
          try {
            console.log(
              `[VideoGen] Downloading and storing video for segment ${index}...`,
            );

            // Download the video from FalAI
            const videoResponse = await fetch(falAIResult.videoUrl);
            if (!videoResponse.ok) {
              throw new Error(
                `Failed to download video: ${videoResponse.statusText}`,
              );
            }

            const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

            // Upload to R2 storage
            const { key, url } = await R2Storage.uploadVideo(
              videoBuffer,
              userId,
              projectId,
              index,
              segmentId,
            );

            console.log(
              `[VideoGen] Video uploaded to R2 for segment ${index}: ${url}`,
            );

            // Create file record in database
            await ProjectService.createFile({
              projectId: projectId,
              segmentId: segmentId,
              fileType: "generated_video",
              fileName: `video_${segmentId}_${Date.now()}.mp4`,
              originalName: `segment_${index}_video.mp4`,
              mimeType: "video/mp4",
              fileSize: videoBuffer.length,
              r2Key: key,
              r2Url: url,
              uploadStatus: "completed",
              metadata: {
                sourceImageUrl: imageUrl,
                prompt: prompt || "default motion",
                generatedAt: new Date().toISOString(),
                model: "fal-ai/wan/v2.2-a14b/image-to-video",
              },
            });

            const duration = Date.now() - startTime;
            console.log(
              `[VideoGen] Image-to-video conversion completed successfully in ${duration}ms for segment ${index}`,
            );

            return {
              success: true,
              videoUrl: url, // Return R2 URL
              imageUrl,
            };
          } catch (uploadError) {
            console.error(
              `[VideoGen] Failed to upload video to R2 for segment ${index}:`,
              uploadError,
            );
            // Fallback to original FalAI result if R2 upload fails
            const duration = Date.now() - startTime;
            console.log(
              `[VideoGen] Falling back to FalAI URL after ${duration}ms for segment ${index}`,
            );

            return {
              success: true,
              videoUrl: falAIResult.videoUrl, // Return original FalAI URL
              imageUrl,
            };
          }
        } else {
          // No storage parameters provided, return FalAI result directly
          const duration = Date.now() - startTime;
          console.log(
            `[VideoGen] Image-to-video conversion completed in ${duration}ms (no R2 storage) for segment ${index}`,
          );

          return {
            success: true,
            videoUrl: falAIResult.videoUrl,
            imageUrl,
          };
        }
      } else {
        const duration = Date.now() - startTime;
        console.error(
          `[VideoGen] Video generation failed after ${duration}ms for segment ${index}: ${falAIResult.error}`,
        );

        return {
          success: false,
          error: falAIResult.error || "Failed to generate video",
          imageUrl,
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[VideoGen] Image-to-video conversion failed after ${duration}ms for segment ${index}:`,
        error,
      );
      console.error(`[VideoGen] Error details:`, {
        imageUrl,
        prompt,
        userId,
        projectId,
        segmentId,
        index,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to convert image to video",
        imageUrl,
      };
    }
  }

  /**
   * Utility function to determine which service to use based on model
   */
  private static isOpenAIModel(model?: string): boolean {
    return model === "dall-e-3" || model === "gpt-image-1";
  }
}
