'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

interface VideoPreviewProps {
  videoUrl: string;
  format?: {
    name: string;
    aspectRatio: string;
    width: number;
    height: number;
  };
  duration?: number;
  modelName?: string;
  onDownload?: () => void;
  onClose?: () => void;
}

export function VideoPreview({
  videoUrl,
  format,
  duration,
  modelName,
  onDownload,
  onClose
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setError('Failed to load video');
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = value[0];
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Video Preview</h3>
          <p className="text-sm text-muted-foreground">
            Review your generated video before downloading
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icons.close className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icons.loader className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Icons.alertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-white">{error}</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-auto max-h-[500px]"
          style={{ display: isLoading || error ? 'none' : 'block' }}
        />

        {/* Format badge */}
        {format && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2"
          >
            {format.name} ({format.aspectRatio})
          </Badge>
        )}

        {/* Model badge */}
        {modelName && (
          <Badge 
            variant="outline" 
            className="absolute top-2 right-2 bg-black/50 text-white border-white/20"
          >
            {modelName}
          </Badge>
        )}
      </div>

      {/* Video Controls */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={videoDuration}
            step={0.1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(videoDuration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlayPause}
              disabled={isLoading || !!error}
            >
              {isPlaying ? (
                <Icons.pause className="h-4 w-4" />
              ) : (
                <Icons.play className="h-4 w-4" />
              )}
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                disabled={isLoading || !!error}
              >
                {isMuted || volume === 0 ? (
                  <Icons.volumeX className="h-4 w-4" />
                ) : volume < 0.5 ? (
                  <Icons.volume1 className="h-4 w-4" />
                ) : (
                  <Icons.volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-24"
                disabled={isLoading || !!error}
              />
            </div>
          </div>

          {/* Download Button */}
          {onDownload && (
            <Button
              onClick={onDownload}
              disabled={isLoading || !!error}
            >
              <Icons.download className="mr-2 h-4 w-4" />
              Download Video
            </Button>
          )}
        </div>
      </div>

      {/* Video Info */}
      {format && (
        <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Resolution</span>
            <p className="font-medium">{format.width} × {format.height}</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Duration</span>
            <p className="font-medium">{formatTime(videoDuration)}</p>
          </div>
        </div>
      )}
    </Card>
  );
}