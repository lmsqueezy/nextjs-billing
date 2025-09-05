import { NextRequest, NextResponse } from "next/server";
import {
  getFunctions,
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda/client";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(
    `[${requestId}] Starting video export request at ${new Date().toISOString()}`,
  );

  try {
    console.log(`[${requestId}] Parsing request body...`);
    const { videoData, quality = "medium" } = await req.json();
    console.log(
      `[${requestId}] Request parsed successfully. Quality: ${quality}, VideoData ID: ${videoData?._id || "unknown"}`,
    );

    if (!videoData) {
      console.error(
        `[${requestId}] Request validation failed: Video data is required`,
      );
      return NextResponse.json(
        {
          success: false,
          error: "Video data is required",
        },
        { status: 400 },
      );
    }

    console.log(
      `[${requestId}] Starting Remotion Lambda video export process...`,
    );
    console.log(`[${requestId}] Video data structure:`, {
      id: videoData._id,
      segmentsCount: videoData.segments?.length || 0,
      hasTitle: !!videoData.title,
      hasThumbnail: !!videoData.thumbnail,
    });

    // Get compatible functions
    console.log(
      `[${requestId}] Fetching compatible Remotion Lambda functions...`,
    );
    const region = (process.env.AWS_REGION as any) || "us-east-1";
    console.log(`[${requestId}] Using AWS region: ${region}`);

    const functionsFetchStart = Date.now();
    const functions = await getFunctions({
      region,
      compatibleOnly: true,
    });
    const functionsFetchDuration = Date.now() - functionsFetchStart;
    console.log(
      `[${requestId}] Functions fetched in ${functionsFetchDuration}ms. Found ${functions.length} compatible functions`,
    );

    if (functions.length === 0) {
      console.error(
        `[${requestId}] No compatible Remotion Lambda functions found in region ${region}`,
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "No compatible Remotion Lambda functions found. Please deploy a function first.",
        },
        { status: 503 },
      );
    }

    const functionName = functions[0].functionName;
    console.log(`[${requestId}] Selected function: ${functionName}`);

    // Quality settings
    console.log(`[${requestId}] Configuring video quality settings...`);
    const qualitySettings = {
      low: { crf: 28, framesPerLambda: 10 },
      medium: { crf: 23, framesPerLambda: 20 },
      high: { crf: 18, framesPerLambda: 30 },
    };

    const settings =
      qualitySettings[quality as keyof typeof qualitySettings] ||
      qualitySettings.medium;

    console.log(`[${requestId}] Quality settings applied:`, {
      quality,
      crf: settings.crf,
      framesPerLambda: settings.framesPerLambda,
    });

    // Generate unique output key
    const timestamp = Date.now();
    const outputKey = `videos/${videoData._id || "video"}_${timestamp}.mp4`;
    console.log(`[${requestId}] Generated output key: ${outputKey}`);

    // For Remotion Lambda, we need to provide a bundled serve URL
    // In production, this would be a deployed bundle URL
    const serveUrl =
      process.env.REMOTION_SERVE_URL ||
      "https://remotionlambda-eu-west-1-domeydoqt.s3.eu-west-1.amazonaws.com/bundles/hello-world/5y5sjeb";

    console.log(`[${requestId}] Using serve URL: ${serveUrl}`);

    // Render video using Remotion Lambda with R2 storage
    console.log(`[${requestId}] Preparing render parameters...`);
    console.log(`[${requestId}] R2 Configuration:`, {
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      endpoint: process.env.CLOUDFLARE_R2_PUBLIC_URL,
      hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    });

    const renderStartTime = Date.now();
    console.log(`[${requestId}] Initiating Remotion Lambda render...`);

    const { renderId, bucketName } = await renderMediaOnLambda({
      region,
      functionName,
      serveUrl,
      composition: "VideoComposition",
      inputProps: {
        project: videoData,
      },
      codec: "h264",
      imageFormat: "jpeg",
      maxRetries: 1,
      framesPerLambda: settings.framesPerLambda,
      privacy: "public",
      crf: settings.crf,
      // outName: {
      //   bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      //   key: outputKey,
      //   s3OutputProvider: {
      //     endpoint: process.env.CLOUDFLARE_R2_PUBLIC_URL!,
      //     accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      //     secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      //   },
      // },
    });

    const renderInitDuration = Date.now() - renderStartTime;
    console.log(`[${requestId}] Render initiated in ${renderInitDuration}ms:`, {
      renderId,
      bucketName,
      composition: "VideoComposition",
      codec: "h264",
      maxRetries: 1,
    });

    // Poll for render completion
    console.log(`[${requestId}] Starting render progress polling...`);
    let progress;
    let attempts = 0;
    let lastProgressPercent = 0;
    const maxAttempts = 300; // 5 minutes with 1-second intervals
    const pollStartTime = Date.now();

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;

      const progressCheckStart = Date.now();
      progress = await getRenderProgress({
        renderId,
        bucketName,
        functionName,
        region,
      });
      const progressCheckDuration = Date.now() - progressCheckStart;

      // Log progress updates every 10% or significant changes
      const currentProgressPercent = Math.floor(
        (progress.overallProgress || 0) * 100,
      );
      if (
        currentProgressPercent !== lastProgressPercent &&
        (currentProgressPercent % 10 === 0 ||
          currentProgressPercent > lastProgressPercent + 5)
      ) {
        console.log(
          `[${requestId}] Render progress: ${currentProgressPercent}% (attempt ${attempts}/${maxAttempts}, check took ${progressCheckDuration}ms)`,
        );
        lastProgressPercent = currentProgressPercent;
      }

      if (progress.done) {
        const totalRenderTime = Date.now() - pollStartTime;
        console.log(`[${requestId}] Render completed successfully!`, {
          totalTime: `${totalRenderTime}ms`,
          attempts,
          outputFile: progress.outputFile,
          costs: progress.costs,
        });

        // Construct public URL for R2
        const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${outputKey}`;
        console.log(`[${requestId}] Generated public URL: ${publicUrl}`);

        const totalRequestTime = Date.now() - startTime;
        console.log(
          `[${requestId}] Request completed successfully in ${totalRequestTime}ms`,
        );

        return NextResponse.json({
          success: true,
          downloadUrl: progress.outputFile,
          outputFile: progress.outputFile,
          filename: outputKey.split("/").pop(),
          message: "Video exported successfully",
          renderId,
        });
      }

      if (progress.fatalErrorEncountered) {
        console.error(`[${requestId}] Fatal render error encountered:`, {
          renderId,
          errors: progress.errors,
          attempt: attempts,
          elapsedTime: `${Date.now() - pollStartTime}ms`,
        });
        return NextResponse.json(
          {
            success: false,
            error: "Video rendering failed",
            details: progress.errors,
          },
          { status: 500 },
        );
      }
    }

    // Timeout reached
    const timeoutDuration = Date.now() - startTime;
    console.error(
      `[${requestId}] Render timeout reached after ${timeoutDuration}ms (${attempts} attempts)`,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Video rendering timed out after 5 minutes",
        renderId,
      },
      { status: 408 },
    );
  } catch (error) {
    const errorDuration = Date.now() - startTime;
    console.error(
      `[${requestId}] Video export error after ${errorDuration}ms:`,
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Health check endpoint
  console.log("Health check request received for video-export service");

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "video-export",
    environment: {
      hasRemotionServeUrl: !!process.env.REMOTION_SERVE_URL,
      hasR2Config: !!(
        process.env.CLOUDFLARE_R2_BUCKET_NAME &&
        process.env.CLOUDFLARE_R2_PUBLIC_URL
      ),
      awsRegion: process.env.AWS_REGION || "us-east-1",
    },
  });
}
