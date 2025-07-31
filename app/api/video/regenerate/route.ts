import { NextRequest, NextResponse } from 'next/server';
import { ffmpegService, VideoEditOptions } from '@/lib/services/video/ffmpeg-service';
import { videoGenerationService } from '@/lib/services/video/generation-service';
import { promptEnhancementService } from '@/lib/services/prompt/enhancement-service';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface RegenerateRequest {
  videoUrl: string;
  edits: VideoEditOptions;
  regenerationOptions: {
    originalPrompt: string;
    style?: 'cinematic' | 'realistic' | 'animated' | 'artistic';
    mood?: 'energetic' | 'calm' | 'dramatic' | 'playful';
    aspectRatio?: '16:9' | '9:16' | '1:1';
    duration?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RegenerateRequest = await request.json();
    const { videoUrl, edits, regenerationOptions } = body;

    if (!videoUrl || !regenerationOptions?.originalPrompt) {
      return NextResponse.json(
        { error: 'Video URL and original prompt are required' },
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

      console.log('Applying video edits...');
      await ffmpegService.applyComplexEdit(tempInputPath, tempOutputPath, edits);

      const appliedEdits: string[] = [];
      if (edits.trimStart !== undefined || edits.trimEnd !== undefined) {
        appliedEdits.push('trimmed');
      }
      if (edits.brightness !== undefined || edits.contrast !== undefined || edits.saturation !== undefined) {
        appliedEdits.push('color adjusted');
      }
      if (edits.speed !== undefined && edits.speed !== 1) {
        appliedEdits.push(`speed ${edits.speed}x`);
      }
      if (edits.overlayText) {
        appliedEdits.push('text overlay added');
      }
      if (edits.overlayImage) {
        appliedEdits.push('image overlay added');
      }

      console.log('Enhancing prompt for regeneration...');
      const enhancedPrompt = await promptEnhancementService.enhanceForRegeneration(
        regenerationOptions.originalPrompt,
        `Video with ${appliedEdits.join(', ')}`,
        appliedEdits
      );

      console.log('Starting Veo3 regeneration...');
      const generationResult = await videoGenerationService.generateVideo({
        prompt: regenerationOptions.originalPrompt,
        enhancedPrompt: enhancedPrompt,
        model: 'veo3',
        aspectRatio: regenerationOptions.aspectRatio || '16:9',
        duration: regenerationOptions.duration || 5
      });

      await ffmpegService.cleanupTempFile(tempInputPath);
      await ffmpegService.cleanupTempFile(tempOutputPath);

      return NextResponse.json({
        success: true,
        editedVideo: {
          appliedEdits: appliedEdits,
          editCount: appliedEdits.length
        },
        regeneration: {
          id: generationResult.id,
          status: generationResult.status,
          enhancedPrompt: enhancedPrompt,
          model: 'veo3'
        },
        metadata: {
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      await ffmpegService.cleanupTempFile(tempInputPath).catch(() => {});
      await ffmpegService.cleanupTempFile(tempOutputPath).catch(() => {});
      
      throw error;
    }

  } catch (error) {
    console.error('Video regeneration error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}