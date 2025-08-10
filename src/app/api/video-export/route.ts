import { NextRequest, NextResponse } from 'next/server';
import { processVideoOnServer, isServerProcessingAvailable } from '@/lib/server-video-processor';

export interface VideoExportRequest {
  videoUrl: string;
  startTime: number;
  endTime: number;
  format: '1080x1080' | '1080x1920';
  clipId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VideoExportRequest = await request.json();
    const { videoUrl, startTime, endTime, format, clipId } = body;

    // Check if server processing is available
    if (!isServerProcessingAvailable()) {
      // Return a clear message about server processing not being available
      return NextResponse.json({
        success: false,
        error: 'Server-side video processing is not available. Please use client-side processing instead.',
        requiresClientProcessing: true
      });
    }

    // Attempt server-side processing
    const result = await processVideoOnServer(
      videoUrl,
      startTime,
      endTime,
      format,
      clipId
    );

    if (result.success && result.downloadUrl) {
      // Log successful export
      console.log('Video export successful:', {
        clipId,
        startTime,
        endTime,
        format,
        filename: result.filename
      });

      return NextResponse.json({
        success: true,
        downloadUrl: result.downloadUrl,
        filename: result.filename,
        clipInfo: {
          clipId,
          startTime,
          endTime,
          duration: endTime - startTime,
          format,
          exportedAt: new Date().toISOString()
        }
      });
    } else {
      // Server processing failed
      return NextResponse.json({
        success: false,
        error: result.error || 'Server-side processing failed',
        requiresClientProcessing: true
      });
    }
  } catch (error) {
    console.error('Video export error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export video clip',
        requiresClientProcessing: true
      },
      { status: 500 }
    );
  }
}