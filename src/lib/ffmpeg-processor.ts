import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoaded = false;

/**
 * Check if SharedArrayBuffer is available
 */
function isSharedArrayBufferAvailable(): boolean {
  try {
    return typeof SharedArrayBuffer !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Initialize FFmpeg instance
 */
export async function loadFFmpeg(
  onProgress?: (message: string, progress: number) => void
): Promise<FFmpeg> {
  if (ffmpeg && isLoaded) {
    return ffmpeg;
  }

  // Check browser compatibility
  if (!isSharedArrayBufferAvailable()) {
    console.warn('SharedArrayBuffer not available. FFmpeg may not work properly.');
    onProgress?.('Browser compatibility issue detected', 0);
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
    
    // Try loading without toBlobURL first (direct URLs)
    const directSources = [
      {
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm'
      },
      {
        coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm'
      }
    ];
    
    // First try direct loading
    for (const source of directSources) {
      try {
        console.log(`Attempting direct load from ${source.coreURL}`);
        
        await ffmpeg.load({
          coreURL: source.coreURL,
          wasmURL: source.wasmURL,
        });
        
        isLoaded = true;
        onProgress?.('FFmpeg loaded successfully', 100);
        console.log('FFmpeg loaded successfully (direct)');
        return ffmpeg;
      } catch (error) {
        console.warn(`Direct load failed:`, error);
      }
    }
    
    // If direct loading fails, try toBlobURL
    const cdnSources = [
      {
        baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
        coreFile: 'ffmpeg-core.js',
        wasmFile: 'ffmpeg-core.wasm'
      },
      {
        baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm',
        coreFile: 'ffmpeg-core.js',
        wasmFile: 'ffmpeg-core.wasm'
      }
    ];
    
    let loadError: Error | null = null;
    
    // Try each CDN source with toBlobURL
    for (const source of cdnSources) {
      try {
        console.log(`Attempting toBlobURL load from ${source.baseURL}`);
        
        const coreURL = await toBlobURL(
          `${source.baseURL}/${source.coreFile}`,
          'text/javascript'
        );
        const wasmURL = await toBlobURL(
          `${source.baseURL}/${source.wasmFile}`,
          'application/wasm'
        );
        
        await ffmpeg.load({
          coreURL,
          wasmURL,
        });
        
        isLoaded = true;
        onProgress?.('FFmpeg loaded successfully', 100);
        console.log('FFmpeg loaded successfully (toBlobURL)');
        return ffmpeg;
      } catch (error) {
        console.error(`toBlobURL load failed from ${source.baseURL}:`, error);
        loadError = error as Error;
      }
    }
    
    // If all methods failed, throw error
    throw loadError || new Error('Failed to load FFmpeg. This may be due to browser security settings or network issues.');
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    isLoaded = false;
    ffmpeg = null;
    
    // Provide more helpful error message
    if (!isSharedArrayBufferAvailable()) {
      throw new Error('Your browser does not support SharedArrayBuffer, which is required for video processing. Please use Chrome, Firefox, or Edge.');
    } else {
      throw new Error('Failed to load video processing engine. Please check your internet connection and browser security settings.');
    }
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
    if (outputData instanceof Uint8Array) {
      // Create a new ArrayBuffer and copy the data
      const buffer = new ArrayBuffer(outputData.length);
      const view = new Uint8Array(buffer);
      view.set(outputData);
      return new Blob([buffer], { type: 'video/mp4' });
    } else {
      // If it's a string or other type, convert it
      return new Blob([outputData as BlobPart], { type: 'video/mp4' });
    }
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