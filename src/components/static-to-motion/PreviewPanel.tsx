'use client';

import { StaticAsset, AnimationProfile, Format } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';

interface PreviewPanelProps {
  asset: StaticAsset;
  animation: AnimationProfile;
  format: Format;
}

export function PreviewPanel({ asset, animation, format }: PreviewPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (animation.loop) {
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + (100 / (animation.duration * 10));
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying, animation.duration, animation.loop]);

  const handlePlayPause = () => {
    if (!isPlaying && progress >= 100) {
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Calculate preview dimensions based on format
  const getPreviewStyle = () => {
    if (!format || !format.aspectRatio) {
      return {
        aspectRatio: '16 / 9',
        maxHeight: '400px'
      };
    }
    const parts = format.aspectRatio.split(':');
    const widthRatio = Number(parts[0]) || 16;
    const heightRatio = Number(parts[1]) || 9;
    return {
      aspectRatio: `${widthRatio} / ${heightRatio}`,
      maxHeight: '400px'
    };
  };

  return (
    <div className="space-y-4">
      {/* Preview window */}
      <div className="relative rounded-lg overflow-hidden bg-black">
        <div 
          className="relative mx-auto"
          style={getPreviewStyle()}
        >
          <img
            src={asset.originalFile.url}
            alt={asset.originalFile.name}
            className="w-full h-full object-contain"
            style={{
              transform: isPlaying ? getAnimationTransform(animation, progress) : 'none',
              transition: 'transform 0.1s linear'
            }}
          />
          
          {/* Format overlay */}
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2"
          >
            {format?.name || 'Unknown'} ({format?.aspectRatio || 'N/A'})
          </Badge>
        </div>
      </div>

      {/* Animation info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Animation</span>
          <span className="font-medium">{animation.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium">{animation.duration}s</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{(progress * animation.duration / 100).toFixed(1)}s</span>
          <span>{animation.duration}s</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <>
              <Icons.pause className="mr-2 h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Icons.play className="mr-2 h-4 w-4" />
              Play Preview
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          <Icons.rotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Helper function to generate animation transform based on type and progress
function getAnimationTransform(animation: AnimationProfile, progress: number): string {
  const transforms: string[] = [];
  
  animation.movements.forEach(movement => {
    const intensity = movement.intensity;
    const progressFactor = progress / 100;
    
    switch (movement.type) {
      case 'zoom':
        const scale = movement.direction === 'in' 
          ? 1 + (intensity * 0.01 * progressFactor)
          : 1 - (intensity * 0.01 * progressFactor);
        transforms.push(`scale(${scale})`);
        break;
        
      case 'pan':
        const distance = intensity * 2;
        let x = 0, y = 0;
        switch (movement.direction) {
          case 'left': x = -distance * progressFactor; break;
          case 'right': x = distance * progressFactor; break;
          case 'up': y = -distance * progressFactor; break;
          case 'down': y = distance * progressFactor; break;
        }
        transforms.push(`translate(${x}px, ${y}px)`);
        break;
        
      case 'pulse':
        const pulseScale = 1 + (intensity * 0.01 * Math.sin(progressFactor * Math.PI * 2));
        transforms.push(`scale(${pulseScale})`);
        break;
        
      case 'float':
        const floatY = intensity * Math.sin(progressFactor * Math.PI * 2);
        transforms.push(`translateY(${floatY}px)`);
        break;
    }
  });
  
  return transforms.join(' ');
}