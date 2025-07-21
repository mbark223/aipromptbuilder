'use client';

import { StaticAsset, AnimationProfile, Format, Movement } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';

interface PreviewPanelProps {
  asset: StaticAsset;
  animation: AnimationProfile;
  format: Format;
  customElements?: Array<{
    id: string;
    name: string;
    bounds: { x: number; y: number; width: number; height: number };
    animation?: {
      type: Movement['type'];
      intensity: number;
      direction?: Movement['direction'];
    };
  }>;
}

export function PreviewPanelV2({ asset, animation, format, customElements = [] }: PreviewPanelProps) {
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

  // Check if we're using custom elements animation
  const isCustomElementAnimation = animation.id === 'custom-elements' && customElements.length > 0;

  return (
    <div className="space-y-4">
      {/* Preview window */}
      <div className="relative rounded-lg overflow-hidden bg-black">
        <div 
          className="relative mx-auto"
          style={getPreviewStyle()}
        >
          {isCustomElementAnimation ? (
            // Custom elements preview with individual animations
            <div className="relative w-full h-full">
              {/* Base image - no animation */}
              <img
                src={asset.originalFile.url}
                alt={asset.originalFile.name}
                className="w-full h-full object-contain"
              />
              
              {/* Animated element overlays */}
              {customElements.map(element => {
                if (!element.animation) return null;
                
                return (
                  <div
                    key={element.id}
                    className="absolute overflow-hidden"
                    style={{
                      left: `${element.bounds.x}px`,
                      top: `${element.bounds.y}px`,
                      width: `${element.bounds.width}px`,
                      height: `${element.bounds.height}px`,
                    }}
                  >
                    <div
                      className="w-full h-full relative"
                      style={{
                        backgroundImage: `url(${asset.originalFile.url})`,
                        backgroundPosition: `-${element.bounds.x}px -${element.bounds.y}px`,
                        backgroundSize: asset.originalFile.dimensions 
                          ? `${asset.originalFile.dimensions.width}px ${asset.originalFile.dimensions.height}px`
                          : 'cover',
                        transform: isPlaying ? getElementTransform(element.animation, progress) : 'none',
                        transition: 'transform 0.1s linear',
                        transformOrigin: 'center center'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            // Regular full image animation
            <img
              src={asset.originalFile.url}
              alt={asset.originalFile.name}
              className="w-full h-full object-contain"
              style={{
                transform: isPlaying ? getAnimationTransform(animation, progress) : 'none',
                transition: 'transform 0.1s linear'
              }}
            />
          )}
          
          {/* Format overlay */}
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2"
          >
            {format?.name || 'Unknown'} ({format?.aspectRatio || 'N/A'})
          </Badge>
          
          {/* Element count badge for custom animations */}
          {isCustomElementAnimation && (
            <Badge 
              variant="outline" 
              className="absolute top-2 right-2"
            >
              {customElements.filter(el => el.animation).length} animated elements
            </Badge>
          )}
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
        {isCustomElementAnimation && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Elements</span>
            <span className="font-medium">{customElements.filter(el => el.animation).length} animated</span>
          </div>
        )}
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

// Helper function for individual element animations
function getElementTransform(animation: { type: Movement['type']; intensity: number; direction?: Movement['direction'] }, progress: number): string {
  const intensity = animation.intensity;
  const progressFactor = progress / 100;
  
  switch (animation.type) {
    // Motion animations
    case 'rotate':
      const rotation = animation.direction === 'counter-clockwise' 
        ? -progressFactor * 360 * (intensity / 10)
        : progressFactor * 360 * (intensity / 10);
      return `rotate(${rotation}deg)`;
      
    case 'pulse':
      const pulseScale = 1 + (intensity * 0.05 * Math.sin(progressFactor * Math.PI * 2));
      return `scale(${pulseScale})`;
      
    case 'float':
      const floatY = intensity * 2 * Math.sin(progressFactor * Math.PI * 2);
      return `translateY(${floatY}px)`;
      
    case 'sway':
      const swayAngle = intensity * 2 * Math.sin(progressFactor * Math.PI * 2);
      return `rotate(${swayAngle}deg)`;
      
    case 'bounce':
      const bounceY = Math.abs(Math.sin(progressFactor * Math.PI * 2)) * intensity * 3;
      return `translateY(${animation.direction === 'down' ? bounceY : -bounceY}px)`;
      
    case 'shake':
      const shakeX = Math.sin(progressFactor * Math.PI * 10) * intensity * 0.5;
      return `translateX(${shakeX}px)`;
      
    case 'wave':
      const wavePhase = progressFactor * Math.PI * 2;
      const waveX = animation.direction === 'left' || animation.direction === 'right' 
        ? Math.sin(wavePhase) * intensity * 2 : 0;
      const waveY = animation.direction === 'up' || animation.direction === 'down'
        ? Math.sin(wavePhase) * intensity * 2 : 0;
      return `translate(${waveX}px, ${waveY}px)`;
      
    // Text animations
    case 'typewriter':
      const clipPercent = progressFactor * 100;
      return `clipPath(inset(0 ${100 - clipPercent}% 0 0))`;
      
    case 'fade-in':
      const fadeOpacity = progressFactor;
      return `opacity(${fadeOpacity})`;
      
    case 'slide-in':
      const slideDistance = intensity * 10;
      let slideX = 0, slideY = 0;
      switch (animation.direction) {
        case 'left': slideX = slideDistance * (1 - progressFactor); break;
        case 'right': slideX = -slideDistance * (1 - progressFactor); break;
        case 'up': slideY = slideDistance * (1 - progressFactor); break;
        case 'down': slideY = -slideDistance * (1 - progressFactor); break;
      }
      return `translate(${slideX}px, ${slideY}px) opacity(${progressFactor})`;
      
    case 'blur-in':
      const blurAmount = intensity * (1 - progressFactor);
      return `blur(${blurAmount}px) opacity(${progressFactor})`;
      
    // Illumination animations
    case 'glow':
      const glowIntensity = 0.5 + 0.5 * Math.sin(progressFactor * Math.PI * 2);
      return `filter(drop-shadow(0 0 ${intensity * glowIntensity}px rgba(255, 255, 150, 0.8)))`;
      
    case 'illuminate':
      const brightness = 1 + (intensity * 0.1 * Math.sin(progressFactor * Math.PI * 2));
      return `filter(brightness(${brightness}))`;
      
    case 'sparkle':
      const sparkleScale = 1 + (0.1 * Math.sin(progressFactor * Math.PI * 8));
      const sparkleBrightness = 1 + (0.3 * Math.sin(progressFactor * Math.PI * 12));
      return `scale(${sparkleScale}) filter(brightness(${sparkleBrightness}))`;
      
    case 'shimmer':
      const shimmerOpacity = 0.7 + 0.3 * Math.sin(progressFactor * Math.PI * 4);
      return `scale(1.02) opacity(${shimmerOpacity})`;
      
    case 'flicker':
      const flickerOpacity = 0.5 + 0.5 * (Math.random() > 0.9 ? Math.random() : 1);
      return `opacity(${flickerOpacity})`;
      
    // View animations  
    case 'zoom':
      const scale = animation.direction === 'in' 
        ? 1 + (intensity * 0.02 * progressFactor)
        : 1 - (intensity * 0.02 * progressFactor);
      return `scale(${scale})`;
      
    case 'pan':
      const distance = intensity * 3;
      let x = 0, y = 0;
      switch (animation.direction) {
        case 'left': x = -distance * progressFactor; break;
        case 'right': x = distance * progressFactor; break;
        case 'up': y = -distance * progressFactor; break;
        case 'down': y = distance * progressFactor; break;
      }
      return `translate(${x}px, ${y}px)`;
      
    default:
      return 'none';
  }
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
        
      case 'rotate':
        const rotation = movement.direction === 'counter-clockwise' 
          ? -progressFactor * 360 * (intensity / 10)
          : progressFactor * 360 * (intensity / 10);
        transforms.push(`rotate(${rotation}deg)`);
        break;
        
      case 'sway':
        const swayAngle = intensity * Math.sin(progressFactor * Math.PI * 2);
        transforms.push(`rotate(${swayAngle}deg)`);
        break;
        
      case 'shimmer':
        const shimmerOpacity = 0.8 + 0.2 * Math.sin(progressFactor * Math.PI * 4);
        transforms.push(`opacity(${shimmerOpacity})`);
        break;
    }
  });
  
  return transforms.join(' ');
}