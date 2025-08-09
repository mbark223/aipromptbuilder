import { NextRequest, NextResponse } from 'next/server';
import { createVideoSegmentationService } from '@/lib/video-segmentation';
import {
  VideoSegmentationInput,
  VideoSegmentationError,
  SegmentationProgress,
} from '@/types/video-segmentation';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for long video processing

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as VideoSegmentationInput;

    // Validate input
    if (!body.videoUrl || !body.objectQueries || body.objectQueries.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: videoUrl and objectQueries' },
        { status: 400 }
      );
    }

    // Create segmentation service
    const segmentationService = createVideoSegmentationService();

    // Track progress (in production, this could use WebSockets or Server-Sent Events)
    const progressUpdates: SegmentationProgress[] = [];
    const progressCallback = (progress: SegmentationProgress) => {
      progressUpdates.push(progress);
      console.log(`Segmentation progress: ${progress.stage} - ${progress.progress}%`);
    };

    // Process video
    const result = await segmentationService.detectAndSplit(body, progressCallback);

    // Return results with progress updates
    return NextResponse.json({
      success: true,
      data: result,
      progress: progressUpdates,
    });
  } catch (error) {
    console.error('Video segmentation error:', error);

    if (error instanceof VideoSegmentationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: error.code === 'AUTH' ? 401 : 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process video segmentation' },
      { status: 500 }
    );
  }
}

// GET endpoint to check status of async processing (if using webhooks)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Missing jobId parameter' },
      { status: 400 }
    );
  }

  // In a production implementation, this would check the status of an async job
  // For now, return a placeholder response
  return NextResponse.json({
    jobId,
    status: 'processing',
    progress: 50,
    message: 'Video segmentation in progress...',
  });
}