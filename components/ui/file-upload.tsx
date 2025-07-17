'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image, Video, Clock } from 'lucide-react';
import { cn, formatFileSize, isValidImageType, isValidVideoType } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File, duration?: number) => void;
  onFileRemove: () => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // in MB
  currentFile?: File;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  acceptedFormats = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
  maxFileSize = 100,
  currentFile,
  className,
  disabled = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractVideoInfo = useCallback(async (file: File): Promise<{ duration?: number; thumbnail?: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        
        // Create thumbnail at 1 second or 10% through video
        const seekTime = Math.min(1, duration * 0.1);
        video.currentTime = seekTime;
        
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
            resolve({ duration, thumbnail });
          } else {
            resolve({ duration });
          }
        };
      };
      
      video.onerror = () => resolve({});
      video.src = URL.createObjectURL(file);
    });
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size too large. Maximum size is ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return `Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`;
    }

    return null;
  }, [acceptedFormats, maxFileSize]);

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    
    // Extract video info if it's a video file
    if (isValidVideoType(file)) {
      const videoInfo = await extractVideoInfo(file);
      setVideoDuration(videoInfo.duration || null);
      setVideoThumbnail(videoInfo.thumbnail || null);
      onFileSelect(file, videoInfo.duration);
    } else {
      setVideoDuration(null);
      setVideoThumbnail(null);
      onFileSelect(file);
    }
  }, [validateFile, onFileSelect, extractVideoInfo]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    setVideoDuration(null);
    setVideoThumbnail(null);
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileRemove]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200",
          "hover:border-blue-400 hover:bg-blue-50/50",
          isDragOver && "border-blue-500 bg-blue-50",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-300 bg-red-50",
          currentFile && "border-green-300 bg-green-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFormats.map(f => `.${f}`).join(',')}
          onChange={handleInputChange}
          disabled={disabled}
        />

        {currentFile ? (
          <div className="space-y-3">
            {/* Video thumbnail or icon */}
            <div className="flex items-center justify-center">
              {isValidVideoType(currentFile) && videoThumbnail ? (
                <div className="relative">
                  <img
                    src={videoThumbnail}
                    alt="Video thumbnail"
                    className="w-24 h-16 object-cover rounded border"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : isValidImageType(currentFile) ? (
                <Image className="w-12 h-12 text-green-600" aria-label="Image file" />
              ) : isValidVideoType(currentFile) ? (
                <Video className="w-12 h-12 text-green-600" aria-label="Video file" />
              ) : (
                <Upload className="w-12 h-12 text-green-600" aria-label="File upload" />
              )}
            </div>
            
            {/* File info */}
            <div>
              <p className="font-medium text-gray-900">{currentFile.name}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{formatFileSize(currentFile.size)}</span>
                {isValidVideoType(currentFile) && videoDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(videoDuration)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <Upload className={cn(
                "w-12 h-12",
                error ? "text-red-400" : "text-gray-400"
              )} />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: {acceptedFormats.join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                Maximum size: {maxFileSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 