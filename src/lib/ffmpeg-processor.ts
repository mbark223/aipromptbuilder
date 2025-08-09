import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoaded = false;

/**
 * Initialize FFmpeg instance
 */
export async function loadFFmpeg(
  onProgress?: (message: string, progress: number) => void
): Promise<FFmpeg> {
  if (ffmpeg && isLoaded) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  // Set up progress logging
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  ffmpeg.on('progress', ({ progress, time }) => {
    const progressPercent = Math.round(progress * 100);
    onProgress?.(`Processing video...`, progressPercent);
    console.log(`[FFmpeg Progress] ${progressPercent}% (time: ${time})`);
  });

  try {
    onProgress?.('Loading FFmpeg...', 0);
    
    // Load FFmpeg with the correct URLs for the WASM files
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    isLoaded = true;
    onProgress?.('FFmpeg loaded successfully', 100);
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw new Error('Failed to load FFmpeg. Please refresh and try again.');
  }
}

/**
 * Trim a video segment using FFmpeg
 */
export async function trimVideo(
  videoBlob: Blob,
  startTime: number,
  endTime: number,
  format: '1080x1080' | '1080x1920',
  onProgress?: (message: string, progress: number) => void
): Promise<Blob> {
  const ffmpegInstance = await loadFFmpeg(onProgress);
  
  try {
    onProgress?.('Preparing video...', 10);
    
    // Write input video to FFmpeg filesystem
    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';
    
    await ffmpegInstance.writeFile(
      inputFileName,
      await fetchFile(videoBlob)
    );
    
    onProgress?.('Trimming video...', 20);
    
    // Calculate duration
    const duration = endTime - startTime;
    
    // Build FFmpeg command based on format
    const ffmpegArgs = [
      '-i', inputFileName,
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-preset', 'fast'
    ];
    
    // Add format-specific scaling
    if (format === '1080x1080') {
      // Square format - crop to center square
      ffmpegArgs.push(
        '-vf', 'crop=min(iw\\,ih):min(iw\\,ih),scale=1080:1080'
      );
    } else if (format === '1080x1920') {
      // Portrait format - scale and pad if needed
      ffmpegArgs.push(
        '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2'
      );
    }
    
    ffmpegArgs.push(outputFileName);
    
    // Execute FFmpeg command
    await ffmpegInstance.exec(ffmpegArgs);
    
    onProgress?.('Finalizing video...', 90);
    
    // Read the output file
    const outputData = await ffmpegInstance.readFile(outputFileName);
    
    // Clean up
    await ffmpegInstance.deleteFile(inputFileName);
    await ffmpegInstance.deleteFile(outputFileName);
    
    onProgress?.('Video processed successfully', 100);
    
    // Convert to Blob
    return new Blob([outputData], { type: 'video/mp4' });
  } catch (error) {
    console.error('FFmpeg processing error:', error);
    throw new Error('Failed to process video. Please try again.');
  }
}

/**
 * Process video from URL
 */
export async function processVideoFromUrl(
  videoUrl: string,
  startTime: number,
  endTime: number,
  format: '1080x1080' | '1080x1920',
  onProgress?: (message: string, progress: number) => void
): Promise<Blob> {
  try {
    onProgress?.('Fetching video...', 5);
    
    // Fetch video from URL
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }
    
    const videoBlob = await response.blob();
    
    // Process with FFmpeg
    return await trimVideo(videoBlob, startTime, endTime, format, onProgress);
  } catch (error) {
    console.error('Video processing error:', error);
    throw error;
  }
}

/**
 * Clean up FFmpeg instance
 */
export function cleanupFFmpeg() {
  if (ffmpeg) {
    ffmpeg = null;
    isLoaded = false;
  }
}