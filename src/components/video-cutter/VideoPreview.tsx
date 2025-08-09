'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Slider } from '@/components/ui/slider';

interface VideoFile {
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
}

interface VideoPreviewProps {
  video: VideoFile;
}

export function VideoPreview({ video }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-auto max-h-[400px] object-contain"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={video.duration}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Icons.pause className="h-4 w-4" />
                  ) : (
                    <Icons.play className="h-4 w-4" />
                  )}
                </Button>
                
                <span className="text-sm text-white">
                  {formatTime(currentTime)} / {formatTime(video.duration)}
                </span>
                
                <div className="flex items-center gap-2 ml-4">
                  <Icons.volume2 className="h-4 w-4 text-white" />
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="font-medium">{formatTime(video.duration)}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Resolution</p>
          <p className="font-medium">{video.width}x{video.height}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">File Size</p>
          <p className="font-medium">{formatFileSize(video.file.size)}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Format</p>
          <Badge variant="secondary">{video.file.type.split('/')[1].toUpperCase()}</Badge>
        </div>
      </div>
    </div>
  );
}