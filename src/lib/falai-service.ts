import { fal } from "@fal-ai/client";

interface FalAIImageResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

interface FalAIVideoResponse {
  video: {
    url: string;
  };
}

export class FalAIService {
  private static API_KEY_STORAGE_KEY = process.env.FAL_AI_API_KEY || "";
  private static IMAGE_MODELS = {
    "flux-schnell": "https://fal.run/fal-ai/flux/schnell",
    "flux-dev": "https://fal.run/fal-ai/flux/dev",
    "flux-pro": "https://fal.run/fal-ai/flux-pro",
    "nano-banana": "https://fal.run/fal-ai/nano-banana",
  };
  private static VIDEO_MODEL = "fal-ai/wan/v2.2-a14b/image-to-video";

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    // Set the API key for the fal client
    fal.config({
      credentials: apiKey,
    });
  }

  static getApiKey(): string | null {
    // Server-side, use environment variable
    return process.env.FAL_AI_API_KEY || null;
  }

  static async generateImage(
    prompt: string,
    style?: string,
    imageSize: string = "portrait_16_9",
    model: string = "flux-schnell",
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    const startTime = Date.now();
    console.log(`[FalAI] Starting image generation with model: ${model}`);
    console.log(
      `[FalAI] Image size: ${imageSize}, Style: ${style || "default"}`,
    );
    console.log(`[FalAI] Original prompt: "${prompt}"`);

    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.error("[FalAI] API key validation failed - no API key found");
      return { success: false, error: "Fal.ai API key not found" };
    }
    console.log("[FalAI] API key validated successfully");

    try {
      const fullPrompt = style
        ? `${prompt}, ${style}`
        : `${prompt}, cinematic, high quality, detailed`;
      console.log(`[FalAI] Enhanced prompt: "${fullPrompt}"`);

      const modelUrl =
        this.IMAGE_MODELS[model as keyof typeof this.IMAGE_MODELS] ||
        this.IMAGE_MODELS["flux-schnell"];
      console.log(`[FalAI] Using model URL: ${modelUrl}`);

      const requestPayload = {
        prompt: fullPrompt,
        image_size: imageSize,
        num_inference_steps: 4,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      };
      console.log(
        "[FalAI] Request payload:",
        JSON.stringify(requestPayload, null, 2),
      );

      console.log("[FalAI] Sending API request to Fal.ai...");
      const response = await fetch(modelUrl, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      console.log(
        `[FalAI] API response status: ${response.status} ${response.statusText}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[FalAI] API request failed with status ${response.status}:`,
          errorText,
        );
        throw new Error(`API request failed: ${response.status}`);
      }

      console.log("[FalAI] Parsing API response...");
      const data: FalAIImageResponse = await response.json();
      console.log("[FalAI] Raw API response:", JSON.stringify(data, null, 2));

      const imageUrl = data.images[0]?.url;

      if (!imageUrl) {
        console.error("[FalAI] No image URL found in response");
        throw new Error("No image generated");
      }

      const duration = Date.now() - startTime;
      console.log(
        `[FalAI] Image generation completed successfully in ${duration}ms`,
      );
      console.log(`[FalAI] Generated image URL: ${imageUrl}`);

      return { success: true, imageUrl };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[FalAI] Image generation failed after ${duration}ms:`,
        error,
      );
      console.error("[FalAI] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        prompt,
        style,
        model,
        imageSize,
      });
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate image",
      };
    }
  }

  static async generateVideo(
    imageUrl: string,
    prompt?: string,
  ): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
    const startTime = Date.now();
    console.log(`[FalAI] Starting video generation from image`);
    console.log(`[FalAI] Source image URL: ${imageUrl}`);
    console.log(`[FalAI] Motion prompt: ${prompt || "none"}`);
    console.log(`[FalAI] Using model: ${this.VIDEO_MODEL}`);

    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.error("[FalAI] Video generation failed - no API key found");
      return { success: false, error: "Fal.ai API key not found" };
    }
    console.log("[FalAI] API key validated for video generation");

    try {
      // Configure the fal client with the API key
      console.log("[FalAI] Configuring Fal client...");
      fal.config({
        credentials: apiKey,
      });

      const videoInput = {
        image_url: imageUrl,
        prompt: prompt || "A cinematic scene with subtle movement and natural motion",
        num_frames: 121,
        fps: 24,
        resolution: "720p" as const,
        aspect_ratio: "9:16" as const,
        safety_checker: true,
      };
      console.log(
        "[FalAI] Video generation input:",
        JSON.stringify(videoInput, null, 2),
      );

      // Use the fal client library to generate video
      console.log("[FalAI] Starting video generation subscription...");
      const result = await fal.subscribe(this.VIDEO_MODEL, {
        input: videoInput,
      });

      console.log("[FalAI] Video generation completed, processing result...");
      console.log(
        "[FalAI] Raw video generation result:",
        JSON.stringify(result, null, 2),
      );

      // The result should contain the video URL
      const videoUrl = (result as any).data?.video?.url;

      if (!videoUrl) {
        console.error("[FalAI] No video URL found in generation result");
        console.error("[FalAI] Full result object:", result);
        throw new Error("No video generated");
      }

      const duration = Date.now() - startTime;
      console.log(
        `[FalAI] Video generation completed successfully in ${duration}ms`,
      );
      console.log(`[FalAI] Generated video URL: ${videoUrl}`);

      return { success: true, videoUrl };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[FalAI] Video generation failed after ${duration}ms:`,
        error,
      );
      console.error("[FalAI] Video generation error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        imageUrl,
        prompt,
        model: this.VIDEO_MODEL,
      });
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate video",
      };
    }
  }
}
