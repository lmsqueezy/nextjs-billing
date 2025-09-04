import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ProjectService } from "@/lib/project-service";
import { z } from "zod";

const WordsSchema = z.object({
  text: z.string(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
});

// WordTiming validation schema - matches the actual WordTiming interface
const WordTimingSchema = z.object({
  text: z.string(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  words: z.array(WordsSchema),
});

// Request validation schemas
const UpdateSegmentSchema = z.object({
  order: z.number().int().nonnegative().optional(),
  text: z.string().min(1, "Text is required").optional(),
  imagePrompt: z.string().min(1, "Image prompt is required").optional(),
  videoPrompt: z.string().optional(),
  duration: z.number().positive().optional(),
  audioVolume: z.number().min(0).max(2).optional(),
  playBackRate: z.number().min(0.5).max(2).optional(),
  withBlur: z.boolean().optional(),
  backgroundMinimized: z.boolean().optional(),
  wordTimings: z.array(WordTimingSchema).optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

type UpdateSegmentRequest = z.infer<typeof UpdateSegmentSchema>;

/**
 * PUT /api/projects/[id]/segments/[segmentId]
 * Update a specific segment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; segmentId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = UpdateSegmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const updateData: UpdateSegmentRequest = validationResult.data;
    const segmentId = params.segmentId;

    // Update segment
    const updatedSegment = await ProjectService.updateSegment(
      segmentId,
      session.user.id,
      updateData,
    );

    return NextResponse.json({
      success: true,
      data: updatedSegment,
      message: "Segment updated successfully",
    });
  } catch (error) {
    console.error(
      `PUT /api/projects/${params.id}/segments/${params.segmentId} error:`,
      error,
    );

    if (error instanceof Error) {
      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        return NextResponse.json(
          { success: false, error: "Segment not found" },
          { status: 404 },
        );
      }

      if (
        error.message.includes("required") ||
        error.message.includes("validation")
      ) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update segment",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/projects/[id]/segments/[segmentId]
 * Delete a specific segment and its associated files
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; segmentId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const segmentId = params.segmentId;

    // Delete segment (this will also cleanup files from R2)
    await ProjectService.deleteSegment(segmentId, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Segment deleted successfully",
    });
  } catch (error) {
    console.error(
      `DELETE /api/projects/${params.id}/segments/${params.segmentId} error:`,
      error,
    );

    if (error instanceof Error) {
      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        return NextResponse.json(
          { success: false, error: "Segment not found" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete segment",
      },
      { status: 500 },
    );
  }
}
