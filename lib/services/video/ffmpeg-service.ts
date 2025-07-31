import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegPath);

export interface VideoEditOptions {
  trimStart?: number;
  trimEnd?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  speed?: number;
  overlayText?: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
  };
  overlayImage?: {
    path: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
}

class FFmpegService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'tmp', 'video-edits');
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  async trimVideo(inputPath: string, outputPath: string, startTime: number, duration: number): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async applyFilters(inputPath: string, outputPath: string, filters: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath);
      
      if (filters.length > 0) {
        command.videoFilters(filters);
      }

      command
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async addTextOverlay(
    inputPath: string, 
    outputPath: string, 
    text: string, 
    x: number, 
    y: number, 
    fontSize: number = 24, 
    color: string = 'white'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const drawtext = `drawtext=text='${text}':fontsize=${fontSize}:fontcolor=${color}:x=${x}:y=${y}`;
      
      ffmpeg(inputPath)
        .videoFilters(drawtext)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async addImageOverlay(
    inputPath: string,
    outputPath: string,
    overlayPath: string,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .input(overlayPath);

      const overlay = `overlay=${x}:${y}`;
      if (width && height) {
        command.complexFilter([
          `[1:v]scale=${width}:${height}[overlay]`,
          `[0:v][overlay]${overlay}[out]`
        ], 'out');
      } else {
        command.complexFilter(`[0:v][1:v]${overlay}`);
      }

      command
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async changeSpeed(inputPath: string, outputPath: string, speed: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const videoFilter = `setpts=${1/speed}*PTS`;
      const audioFilter = speed > 1 ? `atempo=${speed}` : `atempo=${speed}`;

      ffmpeg(inputPath)
        .videoFilters(videoFilter)
        .audioFilters(audioFilter)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async applyComplexEdit(inputPath: string, outputPath: string, options: VideoEditOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath);
      const filters: string[] = [];

      if (options.trimStart !== undefined || options.trimEnd !== undefined) {
        if (options.trimStart !== undefined) {
          command.setStartTime(options.trimStart);
        }
        if (options.trimEnd !== undefined && options.trimStart !== undefined) {
          command.setDuration(options.trimEnd - options.trimStart);
        }
      }

      if (options.brightness !== undefined) {
        filters.push(`eq=brightness=${options.brightness}`);
      }
      if (options.contrast !== undefined) {
        filters.push(`eq=contrast=${options.contrast}`);
      }
      if (options.saturation !== undefined) {
        filters.push(`eq=saturation=${options.saturation}`);
      }

      if (options.speed !== undefined && options.speed !== 1) {
        filters.push(`setpts=${1/options.speed}*PTS`);
        command.audioFilters(`atempo=${options.speed}`);
      }

      if (options.overlayText) {
        const { text, x, y, fontSize, color } = options.overlayText;
        filters.push(`drawtext=text='${text}':fontsize=${fontSize}:fontcolor=${color}:x=${x}:y=${y}`);
      }

      if (filters.length > 0) {
        command.videoFilters(filters);
      }

      if (options.overlayImage) {
        command.input(options.overlayImage.path);
        const overlay = `overlay=${options.overlayImage.x}:${options.overlayImage.y}`;
        if (options.overlayImage.width && options.overlayImage.height) {
          command.complexFilter([
            `[1:v]scale=${options.overlayImage.width}:${options.overlayImage.height}[overlay]`,
            `[0:v][overlay]${overlay}[out]`
          ], 'out');
        } else {
          command.complexFilter(`[0:v][1:v]${overlay}`);
        }
      }

      command
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async getVideoInfo(inputPath: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  generateTempFilePath(extension: string = 'mp4'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return path.join(this.tempDir, `edit_${timestamp}_${random}.${extension}`);
  }

  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to cleanup temp file:', error);
    }
  }
}

export const ffmpegService = new FFmpegService();