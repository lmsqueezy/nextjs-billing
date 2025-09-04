import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { VideoGenerationService } from "@/lib/video-generation-service";

interface ImageToVideoRequest {
  imageUrl: string;
  prompt?: string;
  projectId?: string;
  segmentId?: string;
  index?: number;
}

interface VideoResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
  imageUrl: string;
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  const requestId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  console.log(`[API:ImageToVideo] === REQUEST START === (${requestId})`);
  console.log(
    `[API:ImageToVideo] Request received at ${new Date().toISOString()}`,
  );

  try {
    // Step 1: Parse request body
    console.log(`[API:ImageToVideo] ${requestId} - Parsing request body...`);
    const parseStartTime = Date.now();
    const body: ImageToVideoRequest = await request.json();
    const parseDuration = Date.now() - parseStartTime;

    console.log(
      `[API:ImageToVideo] ${requestId} - Request parsed (${parseDuration}ms):`,
    );
    console.log(`[API:ImageToVideo] ${requestId} - Image URL: ${body.imageUrl}`);
    console.log(
      `[API:ImageToVideo] ${requestId} - Motion prompt: ${body.prompt || "default"}`,
    );
    console.log(
      `[API:ImageToVideo] ${requestId} - Project ID: ${body.projectId || "none"}`,
    );
    console.log(
      `[API:ImageToVideo] ${requestId} - Segment ID: ${body.segmentId || "none"}`,
    );

    // Step 2: Validate required fields
    if (!body.imageUrl) {
      console.warn(
        `[API:ImageToVideo] ${requestId} - Missing required field: imageUrl`,
      );
      return NextResponse.json(
        { success: false, error: "imageUrl is required" },
        { status: 400 },
      );
    }

    // Step 3: Authentication (required for R2 storage if project/segment provided)
    let userId: string | undefined;
    if (body.projectId && body.segmentId) {
      console.log(
        `[API:ImageToVideo] ${requestId} - Project data provided, checking authentication...`,
      );
      const authStartTime = Date.now();
      const session = await auth();
      const authDuration = Date.now() - authStartTime;

      if (!session?.user?.id) {
        console.warn(
          `[API:ImageToVideo] ${requestId} - Authentication failed after ${authDuration}ms`,
        );
        return NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 },
        );
      }
      userId = session.user.id;
      console.log(
        `[API:ImageToVideo] ${requestId} - Authentication successful for user ${userId} (${authDuration}ms)`,
      );
    } else {
      console.log(
        `[API:ImageToVideo] ${requestId} - No project data provided, skipping authentication`,
      );
    }

    // Step 4: Generate video from image
    console.log(
      `[API:ImageToVideo] ${requestId} - Starting image-to-video conversion...`,
    );
    const conversionStartTime = Date.now();

    const result = await VideoGenerationService.generateVideoFromImage(
      body.imageUrl,
      body.prompt,
      userId,
      body.projectId,
      body.segmentId,
      body.index || 0,
    );

    const conversionDuration = Date.now() - conversionStartTime;
    const totalDuration = Date.now() - requestStartTime;

    console.log(
      `[API:ImageToVideo] ${requestId} - Image-to-video conversion ${
        result.success ? "completed" : "failed"
      } (${conversionDuration}ms)`,
    );

    if (result.success) {
      console.log(
        `[API:ImageToVideo] ${requestId} - Generated video URL: ${result.videoUrl}`,
      );
    } else {
      console.error(
        `[API:ImageToVideo] ${requestId} - Conversion error: ${result.error}`,
      );
    }

    console.log(
      `[API:ImageToVideo] === REQUEST COMPLETED === (${requestId})`,
    );
    console.log(
      `[API:ImageToVideo] ${requestId} - Total request duration: ${totalDuration}ms`,
    );

    const response: VideoResult = {
      success: result.success,
      videoUrl: result.videoUrl,
      error: result.error,
      imageUrl: result.imageUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    const totalDuration = Date.now() - requestStartTime;
    console.error(`[API:ImageToVideo] === REQUEST FAILED === (${requestId})`);
    console.error(
      `[API:ImageToVideo] ${requestId} - Request failed after ${totalDuration}ms:`,
      error,
    );
    console.error(`[API:ImageToVideo] ${requestId} - Error details:`, {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        imageUrl: "",
      },
      { status: 500 },
    );
  }
}