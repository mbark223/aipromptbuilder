import { NextRequest, NextResponse } from 'next/server';
import { ffmpegService } from '@/lib/services/video/ffmpeg-service';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface OverlayRequest {
  videoUrl: string;
  overlay: {
    type: 'text' | 'image';
    text?: {
      content: string;
      x: number;
      y: number;
      fontSize?: number;
      color?: string;
      backgroundColor?: string;
      padding?: number;
    };
    image?: {
      url: string;
      x: number;
      y: number;
      width?: number;
      height?: number;
      opacity?: number;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: OverlayRequest = await request.json();
    const { videoUrl, overlay } = body;

    if (!videoUrl || !overlay) {
      return NextResponse.json(
        { error: 'Video URL and overlay configuration are required' },
        { status: 400 }
      );
    }

    const tempInputPath = path.join(process.cwd(), 'tmp', `input_${uuidv4()}.mp4`);
    const tempOutputPath = ffmpegService.generateTempFilePath();
    let tempOverlayPath: string | undefined;

    try {
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error('Failed to fetch video');
      }

      const videoBuffer = await videoResponse.arrayBuffer();
      await writeFile(tempInputPath, Buffer.from(videoBuffer));

      if (overlay.type === 'text' && overlay.text) {
        const { content, x, y, fontSize = 24, color = 'white' } = overlay.text;
        
        await ffmpegService.addTextOverlay(
          tempInputPath,
          tempOutputPath,
          content,
          x,
          y,
          fontSize,
          color
        );
      } else if (overlay.type === 'image' && overlay.image) {
        const { url, x, y, width, height } = overlay.image;
        
        tempOverlayPath = path.join(process.cwd(), 'tmp', `overlay_${uuidv4()}.png`);
        
        const overlayResponse = await fetch(url);
        if (!overlayResponse.ok) {
          throw new Error('Failed to fetch overlay image');
        }
        
        const overlayBuffer = await overlayResponse.arrayBuffer();
        await writeFile(tempOverlayPath, Buffer.from(overlayBuffer));
        
        await ffmpegService.addImageOverlay(
          tempInputPath,
          tempOutputPath,
          tempOverlayPath,
          x,
          y,
          width,
          height
        );
      } else {
        throw new Error('Invalid overlay configuration');
      }

      const overlayVideoBuffer = await import('fs/promises').then(fs => 
        fs.readFile(tempOutputPath)
      );

      const base64Video = overlayVideoBuffer.toString('base64');
      const dataUrl = `data:video/mp4;base64,${base64Video}`;

      await ffmpegService.cleanupTempFile(tempInputPath);
      await ffmpegService.cleanupTempFile(tempOutputPath);
      if (tempOverlayPath) {
        await ffmpegService.cleanupTempFile(tempOverlayPath);
      }

      return NextResponse.json({
        success: true,
        overlayVideoUrl: dataUrl,
        metadata: {
          overlayType: overlay.type,
          overlayConfig: overlay,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      await ffmpegService.cleanupTempFile(tempInputPath).catch(() => {});
      await ffmpegService.cleanupTempFile(tempOutputPath).catch(() => {});
      if (tempOverlayPath) {
        await ffmpegService.cleanupTempFile(tempOverlayPath).catch(() => {});
      }
      
      throw error;
    }

  } catch (error) {
    console.error('Video overlay error:', error);
    return NextResponse.json(
      { error: 'Failed to add overlay to video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}