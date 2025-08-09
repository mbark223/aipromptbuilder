'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Icons } from '@/components/icons';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface VideoFile {
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
}

interface VideoUploadProps {
  onVideoUpload: (video: VideoFile) => void;
}

export function VideoUpload({ onVideoUpload }: VideoUploadProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const getVideoDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight
        });
        URL.revokeObjectURL(video.src);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video dimensions'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (max 4GB)
    if (file.size > 4 * 1024 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a video file smaller than 4GB',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Get video metadata
      const [duration, dimensions] = await Promise.all([
        getVideoDuration(file),
        getVideoDimensions(file)
      ]);

      // Validate duration (max 5 minutes)
      if (duration > 300) {
        clearInterval(progressInterval);
        toast({
          title: 'Video too long',
          description: 'Please upload a video shorter than 5 minutes',
          variant: 'destructive',
        });
        setIsProcessing(false);
        setUploadProgress(0);
        return;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      const videoFile: VideoFile = {
        file,
        url: URL.createObjectURL(file),
        duration,
        width: dimensions.width,
        height: dimensions.height
      };

      onVideoUpload(videoFile);
      
      toast({
        title: 'Video uploaded successfully',
        description: `Duration: ${Math.floor(duration)}s, Resolution: ${dimensions.width}x${dimensions.height}`,
      });
    } catch (_error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to process video file',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }, [onVideoUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Icons.video className="h-8 w-8 text-primary" />
          </div>
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium">Drop your video here</p>
              <p className="text-sm text-muted-foreground">Release to upload</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium">
                {isProcessing ? 'Processing video...' : 'Drag & drop your video here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to select a video file
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: MP4, MOV, AVI, WebM • Max size: 4GB • Max duration: 5 minutes
              </p>
            </div>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Processing video...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
}