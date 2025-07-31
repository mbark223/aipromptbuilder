import { NextRequest, NextResponse } from 'next/server';
import { ffmpegService } from '@/lib/services/video/ffmpeg-service';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface EffectsRequest {
  videoUrl: string;
  effects: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    speed?: number;
    blur?: number;
    sharpen?: boolean;
    grayscale?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: EffectsRequest = await request.json();
    const { videoUrl, effects } = body;

    if (!videoUrl || !effects) {
      return NextResponse.json(
        { error: 'Video URL and effects are required' },
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

      const filters: string[] = [];

      if (effects.brightness !== undefined || effects.contrast !== undefined || effects.saturation !== undefined) {
        const eqFilters: string[] = [];
        if (effects.brightness !== undefined) eqFilters.push(`brightness=${effects.brightness}`);
        if (effects.contrast !== undefined) eqFilters.push(`contrast=${effects.contrast}`);
        if (effects.saturation !== undefined) eqFilters.push(`saturation=${effects.saturation}`);
        filters.push(`eq=${eqFilters.join(':')}`);
      }

      if (effects.blur !== undefined) {
        filters.push(`boxblur=${effects.blur}`);
      }

      if (effects.sharpen) {
        filters.push('unsharp=5:5:1.0:5:5:0.0');
      }

      if (effects.grayscale) {
        filters.push('colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3');
      }

      if (effects.speed !== undefined && effects.speed !== 1) {
        await ffmpegService.changeSpeed(tempInputPath, tempOutputPath, effects.speed);
      } else if (filters.length > 0) {
        await ffmpegService.applyFilters(tempInputPath, tempOutputPath, filters);
      } else {
        throw new Error('No effects specified');
      }

      const effectsVideoBuffer = await import('fs/promises').then(fs => 
        fs.readFile(tempOutputPath)
      );

      const base64Video = effectsVideoBuffer.toString('base64');
      const dataUrl = `data:video/mp4;base64,${base64Video}`;

      await ffmpegService.cleanupTempFile(tempInputPath);
      await ffmpegService.cleanupTempFile(tempOutputPath);

      return NextResponse.json({
        success: true,
        effectsVideoUrl: dataUrl,
        metadata: {
          appliedEffects: effects,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      await ffmpegService.cleanupTempFile(tempInputPath).catch(() => {});
      await ffmpegService.cleanupTempFile(tempOutputPath).catch(() => {});
      
      throw error;
    }

  } catch (error) {
    console.error('Video effects error:', error);
    return NextResponse.json(
      { error: 'Failed to apply effects to video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}