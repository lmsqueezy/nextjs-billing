import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ProjectService } from '@/lib/project-service';
import { z } from 'zod';

// WordTiming validation schema
const WordTimingSchema = z.object({
  word: z.string(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
});

// Request validation schemas
const CreateSegmentSchema = z.object({
  order: z.number().int().nonnegative(),
  text: z.string().min(1, 'Text is required'),
  imagePrompt: z.string().min(1, 'Image prompt is required'),
  videoPrompt: z.string().optional(),
  duration: z.number().positive().optional(),
  audioVolume: z.number().min(0).max(2).optional(),
  playBackRate: z.number().min(0.5).max(2).optional(),
  withBlur: z.boolean().optional(),
  backgroundMinimized: z.boolean().optional(),
  wordTimings: z.array(WordTimingSchema).optional(),
});

// Batch creation schema
const CreateBatchSegmentsSchema = z.object({
  segments: z.array(CreateSegmentSchema).min(1, 'At least one segment is required'),
});

type CreateSegmentRequest = z.infer<typeof CreateSegmentSchema>;
type CreateBatchSegmentsRequest = z.infer<typeof CreateBatchSegmentsSchema>;

/**
 * GET /api/projects/[id]/segments
 * Get all segments for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const projectId = params.id;
    const segments = await ProjectService.getProjectSegments(projectId, session.user.id);

    return NextResponse.json({
      success: true,
      data: segments,
      count: segments.length,
    });
  } catch (error) {
    console.error(`GET /api/projects/${params.id}/segments error:`, error);
    
    if (error instanceof Error && (
      error.message.includes('not found') || 
      error.message.includes('access denied')
    )) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch segments' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/segments
 * Create new segment(s) for a project. Supports both single segment and batch creation.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const projectId = params.id;

    // Check if this is a batch creation request
    const batchValidation = CreateBatchSegmentsSchema.safeParse(body);
    
    if (batchValidation.success) {
      // Batch creation
      const { segments } = batchValidation.data;
      
      const createdSegments = await ProjectService.createSegmentsBatch(
        projectId, 
        session.user.id, 
        segments.map(segment => ({
          order: segment.order,
          text: segment.text,
          imagePrompt: segment.imagePrompt,
          duration: segment.duration || undefined,
          audioVolume: segment.audioVolume || 1.0,
          playBackRate: segment.playBackRate || 1.0,
          withBlur: segment.withBlur || false,
          backgroundMinimized: segment.backgroundMinimized || false,
          wordTimings: segment.wordTimings || undefined,
        }))
      );

      return NextResponse.json({
        success: true,
        data: createdSegments,
        count: createdSegments.length,
        message: `${createdSegments.length} segments created successfully`,
      }, { status: 201 });
    }

    // Single segment creation
    const singleValidation = CreateSegmentSchema.safeParse(body);
    
    if (!singleValidation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: singleValidation.error.issues,
        },
        { status: 400 }
      );
    }

    const segmentData: CreateSegmentRequest = singleValidation.data;

    // Create single segment
    const newSegment = await ProjectService.createSegment(projectId, session.user.id, {
      order: segmentData.order,
      text: segmentData.text,
      imagePrompt: segmentData.imagePrompt,
      duration: segmentData.duration || undefined,
      audioVolume: segmentData.audioVolume || 1.0,
      playBackRate: segmentData.playBackRate || 1.0,
      withBlur: segmentData.withBlur || false,
      backgroundMinimized: segmentData.backgroundMinimized || false,
      wordTimings: segmentData.wordTimings || undefined,
    });

    return NextResponse.json({
      success: true,
      data: newSegment,
      message: 'Segment created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/projects/${params.id}/segments error:`, error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('required')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create segment(s)' 
      },
      { status: 500 }
    );
  }
}