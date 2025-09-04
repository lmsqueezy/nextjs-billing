import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { VideoGenerationService } from "@/lib/video-generation-service";

interface SingleImageRequest {
  type: "single";
  prompt: string;
  style?: string;
  imageSize?: string;
  model?: string;
  quality?: "low" | "medium" | "high";
  aspectRatio?: "square" | "portrait" | "landscape";
  storeInR2?: boolean;
  projectId?: string;
  segmentId?: string;
}

interface BatchImageRequest {
  type: "batch";
  storeInR2?: boolean;
  projectId?: string;
  prompts: Array<{
    prompt: string;
    style?: string;
    imageSize?: string;
    model?: string;
    quality?: "low" | "medium" | "high";
    aspectRatio?: "square" | "portrait" | "landscape";
    segmentId?: string;
  }>;
}

type ImageGenerationRequest = SingleImageRequest | BatchImageRequest;

interface ImageResult {
  success: boolean;
  imageUrl?: string;
  r2Key?: string;
  r2Url?: string;
  tempUrl?: string;
  fileRecord?: any;
  error?: string;
  prompt?: string;
}

// Helper function to generate single image using VideoGenerationService
async function generateImageWithService(
  prompt: string,
  style?: string,
  imageSize?: string,
  model?: string,
  quality?: "low" | "medium" | "high",
  aspectRatio?: "square" | "portrait" | "landscape",
  storeInR2?: boolean,
  userId?: string,
  projectId?: string,
  segmentId?: string,
  index: number = 0,
): Promise<ImageResult> {
  const result = await VideoGenerationService.generateSingleImage(
    prompt,
    model || "flux-schnell",
    style,
    imageSize || "portrait_16_9",
    quality,
    aspectRatio,
    storeInR2,
    userId,
    projectId,
    segmentId,
    index,
  );

  return {
    success: result.success,
    imageUrl: result.imageUrl,
    error: result.error,
    prompt: result.prompt,
  };
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  const requestId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  console.log(`[API:GenerateImages] === REQUEST START === (${requestId})`);
  console.log(
    `[API:GenerateImages] Request received at ${new Date().toISOString()}`,
  );

  try {
    // Step 1: Parse request body
    console.log(`[API:GenerateImages] ${requestId} - Parsing request body...`);
    const parseStartTime = Date.now();
    const body: ImageGenerationRequest = await request.json();
    const parseDuration = Date.now() - parseStartTime;

    console.log(
      `[API:GenerateImages] ${requestId} - Request parsed (${parseDuration}ms):`,
    );
    console.log(`[API:GenerateImages] ${requestId} - Type: ${body.type}`);
    console.log(
      `[API:GenerateImages] ${requestId} - Store in R2: ${body.storeInR2 || false}`,
    );

    if (body.type === "single") {
      console.log(
        `[API:GenerateImages] ${requestId} - Single image request: "${body.prompt?.substring(0, 80)}..."`,
      );
    } else if (body.type === "batch") {
      console.log(
        `[API:GenerateImages] ${requestId} - Batch request: ${body.prompts?.length || 0} images`,
      );
    }

    // Step 2: Authentication (if R2 storage requested)
    let userId: string | undefined;
    if (
      (body.type === "single" && body.storeInR2) ||
      (body.type === "batch" && body.storeInR2)
    ) {
      console.log(
        `[API:GenerateImages] ${requestId} - R2 storage requested, checking authentication...`,
      );
      const authStartTime = Date.now();
      const session = await auth();
      const authDuration = Date.now() - authStartTime;

      if (!session?.user?.id) {
        console.warn(
          `[API:GenerateImages] ${requestId} - Authentication failed after ${authDuration}ms`,
        );
        return NextResponse.json(
          { success: false, error: "Authentication required for R2 storage" },
          { status: 401 },
        );
      }
      userId = session.user.id;
      console.log(
        `[API:GenerateImages] ${requestId} - Authentication successful for user ${userId} (${authDuration}ms)`,
      );
    } else {
      console.log(
        `[API:GenerateImages] ${requestId} - No R2 storage requested, skipping authentication`,
      );
    }

    if (body.type === "single") {
      // Step 3a: Single image generation
      console.log(
        `[API:GenerateImages] ${requestId} - Starting single image generation...`,
      );
      const singleStartTime = Date.now();

      const result = await generateImageWithService(
        body.prompt,
        body.style,
        body.imageSize,
        body.model,
        body.quality,
        body.aspectRatio,
        body.storeInR2,
        userId,
        body.projectId,
        body.segmentId,
      );

      const singleDuration = Date.now() - singleStartTime;
      const totalDuration = Date.now() - requestStartTime;

      console.log(
        `[API:GenerateImages] ${requestId} - Single image generation ${result.success ? "completed" : "failed"} (${singleDuration}ms)`,
      );
      console.log(
        `[API:GenerateImages] === REQUEST COMPLETED === (${requestId})`,
      );
      console.log(
        `[API:GenerateImages] ${requestId} - Total request duration: ${totalDuration}ms`,
      );

      return NextResponse.json(result);
    } else if (body.type === "batch") {
      // Step 3b: Batch image generation
      console.log(
        `[API:GenerateImages] ${requestId} - Starting batch image generation for ${body.prompts.length} images...`,
      );
      const batchStartTime = Date.now();
      const results: ImageResult[] = [];

      // Process images sequentially with detailed logging
      for (let i = 0; i < body.prompts.length; i++) {
        const promptData = body.prompts[i];

        const imageStartTime = Date.now();
        try {
          const result = await generateImageWithService(
            promptData.prompt,
            promptData.style,
            promptData.imageSize,
            promptData.model,
            promptData.quality,
            promptData.aspectRatio,
            body.storeInR2,
            userId,
            body.projectId,
            promptData.segmentId,
            i, // Pass the index
          );

          const imageDuration = Date.now() - imageStartTime;
          console.log(
            `[API:GenerateImages] ${requestId} - Image ${i + 1} ${result.success ? "completed" : "failed"} (${imageDuration}ms)`,
          );
          results.push(result);
        } catch (error) {
          const imageDuration = Date.now() - imageStartTime;
          console.error(
            `[API:GenerateImages] ${requestId} - Image ${i + 1} failed after ${imageDuration}ms:`,
            error,
          );
          console.error(
            `[API:GenerateImages] ${requestId} - Failed prompt: "${promptData.prompt}"`,
          );

          results.push({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to generate image",
            prompt: promptData.prompt,
          });
        }
      }

      const batchDuration = Date.now() - batchStartTime;
      const totalDuration = Date.now() - requestStartTime;
      const successCount = results.filter((r) => r.success).length;

      console.log(
        `[API:GenerateImages] ${requestId} - Batch generation completed (${batchDuration}ms)`,
      );
      console.log(
        `[API:GenerateImages] ${requestId} - Results: ${successCount}/${body.prompts.length} successful`,
      );
      console.log(
        `[API:GenerateImages] === REQUEST COMPLETED === (${requestId})`,
      );
      console.log(
        `[API:GenerateImages] ${requestId} - Total request duration: ${totalDuration}ms`,
      );

      return NextResponse.json({
        success: true,
        results,
        totalGenerated: successCount,
        totalRequested: body.prompts.length,
      });
    } else {
      console.warn(
        `[API:GenerateImages] ${requestId} - Invalid request type: ${body.type}`,
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request type. Must be 'single' or 'batch'",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    const totalDuration = Date.now() - requestStartTime;
    console.error(`[API:GenerateImages] === REQUEST FAILED === (${requestId})`);
    console.error(
      `[API:GenerateImages] ${requestId} - Request failed after ${totalDuration}ms:`,
      error,
    );
    console.error(`[API:GenerateImages] ${requestId} - Error details:`, {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
