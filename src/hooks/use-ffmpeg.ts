'use client';

import { useState, useCallback, useRef } from 'react';
import { processVideoFromUrl, trimVideo, loadFFmpeg, cleanupFFmpeg } from '@/lib/ffmpeg-processor';
import { useToast } from '@/hooks/use-toast';

interface FFmpegProgress {
  message: string;
  progress: number;
}

export function useFFmpeg() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<FFmpegProgress>({ message: '', progress: 0 });
  const { toast } = useToast();
  const ffmpegLoadedRef = useRef(false);

  // Preload FFmpeg with retry logic
  const preloadFFmpeg = useCallback(async () => {
    if (ffmpegLoadedRef.current) return;
    
    setIsLoading(true);
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        await loadFFmpeg((message, progress) => {
          setProgress({ message, progress });
        });
        ffmpegLoadedRef.current = true;
        toast({
          title: 'FFmpeg loaded',
          description: 'Video processing engine ready',
        });
        break; // Success, exit the loop
      } catch (error) {
        console.error(`Failed to load FFmpeg (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount > maxRetries) {
          toast({
            title: 'Failed to load video processor',
            description: 'Please check your internet connection and refresh the page',
            variant: 'destructive',
          });
          break;
        } else {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          setProgress({ message: `Retrying... (attempt ${retryCount + 1})`, progress: 0 });
        }
      }
    }
    
    setIsLoading(false);
    setProgress({ message: '', progress: 0 });
  }, [toast]);

  // Process video from URL
  const processVideo = useCallback(async (
    videoUrl: string,
    startTime: number,
    endTime: number,
    format: '1080x1080' | '1080x1920'
  ): Promise<Blob | null> => {
    setIsProcessing(true);
    setProgress({ message: 'Starting video processing...', progress: 0 });

    try {
      // Ensure FFmpeg is loaded
      if (!ffmpegLoadedRef.current) {
        await preloadFFmpeg();
      }

      // Process the video
      const processedBlob = await processVideoFromUrl(
        videoUrl,
        startTime,
        endTime,
        format,
        (message, progress) => {
          setProgress({ message, progress });
        }
      );

      toast({
        title: 'Video processed successfully',
        description: `Trimmed from ${startTime}s to ${endTime}s`,
      });

      return processedBlob;
    } catch (error) {
      console.error('Video processing error:', error);
      toast({
        title: 'Video processing failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
      setProgress({ message: '', progress: 0 });
    }
  }, [preloadFFmpeg, toast]);

  // Process video from Blob
  const processVideoBlob = useCallback(async (
    videoBlob: Blob,
    startTime: number,
    endTime: number,
    format: '1080x1080' | '1080x1920'
  ): Promise<Blob | null> => {
    setIsProcessing(true);
    setProgress({ message: 'Starting video processing...', progress: 0 });

    try {
      // Ensure FFmpeg is loaded
      if (!ffmpegLoadedRef.current) {
        await preloadFFmpeg();
      }

      // Process the video
      const processedBlob = await trimVideo(
        videoBlob,
        startTime,
        endTime,
        format,
        (message, progress) => {
          setProgress({ message, progress });
        }
      );

      toast({
        title: 'Video processed successfully',
        description: `Trimmed from ${startTime}s to ${endTime}s`,
      });

      return processedBlob;
    } catch (error) {
      console.error('Video processing error:', error);
      toast({
        title: 'Video processing failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
      setProgress({ message: '', progress: 0 });
    }
  }, [preloadFFmpeg, toast]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    cleanupFFmpeg();
    ffmpegLoadedRef.current = false;
  }, []);

  return {
    isLoading,
    isProcessing,
    progress,
    preloadFFmpeg,
    processVideo,
    processVideoBlob,
    cleanup,
  };
}