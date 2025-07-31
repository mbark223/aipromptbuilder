import { NextRequest, NextResponse } from 'next/server';
import { ffmpegService, VideoEditOptions } from '@/lib/services/video/ffmpeg-service';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface VideoEditRequest {
  videoUrl: string;
  edits: VideoEditOptions;
}

export async function POST(request: NextRequest) {
  try {
    const body: VideoEditRequest = await request.json();
    const { videoUrl, edits } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const tempInputPath = path.join(process.cwd(), 'tmp', `input_${uuidv4()}.mp4`);
    const tempOutputPath = ffmpegService.generateTempFilePath();

    try {
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error('Failed to fetch video');
      }

      const videoBuffer = await videoResponse.arrayBuffer();
      await writeFile(tempInputPath, Buffer.from(videoBuffer));

      await ffmpegService.applyComplexEdit(tempInputPath, tempOutputPath, edits);

      const editedVideoBuffer = await import('fs/promises').then(fs => 
        fs.readFile(tempOutputPath)
      );

      const base64Video = editedVideoBuffer.toString('base64');
      const dataUrl = `data:video/mp4;base64,${base64Video}`;

      await ffmpegService.cleanupTempFile(tempInputPath);
      await ffmpegService.cleanupTempFile(tempOutputPath);

      return NextResponse.json({
        success: true,
        editedVideoUrl: dataUrl,
        metadata: {
          appliedEdits: edits,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      await ffmpegService.cleanupTempFile(tempInputPath).catch(() => {});
      await ffmpegService.cleanupTempFile(tempOutputPath).catch(() => {});
      
      throw error;
    }

  } catch (error) {
    console.error('Video edit error:', error);
    return NextResponse.json(
      { error: 'Failed to edit video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}