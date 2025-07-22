'use client';

import { useEffect, useRef } from 'react';
import { StaticAsset, ElementAnimation, CustomElement } from '@/types';

interface ElementAnimationPreviewProps {
  asset: StaticAsset;
  animations: ElementAnimation[];
  selectedElement: string | null;
}

export function ElementAnimationPreview({
  asset,
  animations,
  selectedElement
}: ElementAnimationPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    let imageLoaded = false;
    let imageScale = 1;
    let imageX = 0;
    let imageY = 0;

    img.onload = () => {
      imageLoaded = true;
      // Set canvas size
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Calculate image position and scale
        imageScale = Math.min(canvas.width / img.width, canvas.height / img.height);
        imageX = (canvas.width - img.width * imageScale) / 2;
        imageY = (canvas.height - img.height * imageScale) / 2;
      }
    };
    img.src = asset.originalFile.url;

    const animate = () => {
      if (!imageLoaded) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const currentTime = Date.now() - startTimeRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw base image
      ctx.drawImage(img, imageX, imageY, img.width * imageScale, img.height * imageScale);
      
      // Apply animations
      animations.forEach((animation) => {
        if (animation.element.type === 'custom') {
          const element = animation.element as CustomElement;
          const bounds = element.bounds;
          
          // Convert percentage to pixels
          const x = imageX + (bounds.x / 100) * (img.width * imageScale);
          const y = imageY + (bounds.y / 100) * (img.height * imageScale);
          const width = (bounds.width / 100) * (img.width * imageScale);
          const height = (bounds.height / 100) * (img.height * imageScale);
          
          ctx.save();
          
          // Apply animation based on type
          const { intensity, speed } = animation.parameters;
          const time = currentTime * speed * 0.001;
          
          switch (animation.type) {
            case 'float':
              const floatOffset = Math.sin(time) * (intensity / 10);
              ctx.translate(0, floatOffset);
              break;
              
            case 'sway':
              const swayAngle = Math.sin(time) * (intensity / 100) * 0.1;
              ctx.translate(x + width/2, y + height);
              ctx.rotate(swayAngle);
              ctx.translate(-(x + width/2), -(y + height));
              break;
              
            case 'shimmer':
              ctx.globalAlpha = 0.5 + Math.sin(time * 2) * 0.5 * (intensity / 100);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
              ctx.fillRect(x, y, width, height);
              break;
              
            case 'glow':
              const glowIntensity = 0.5 + Math.sin(time) * 0.5;
              ctx.shadowColor = animation.parameters.color || '#ffffff';
              ctx.shadowBlur = 20 * glowIntensity * (intensity / 100);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
              ctx.fillRect(x, y, width, height);
              break;
          }
          
          // Draw selection outline if selected
          if (animation.id === selectedElement) {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x, y, width, height);
          }
          
          ctx.restore();
        }
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [asset, animations, selectedElement]);

  return (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
        Preview Mode
      </div>
    </div>
  );
}