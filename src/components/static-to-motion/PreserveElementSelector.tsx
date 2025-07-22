'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { StaticAsset, ElementAnimation, CustomElement, ElementBounds } from '@/types';

interface PreserveElementSelectorProps {
  asset: StaticAsset;
  animations: ElementAnimation[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onAddAnimation: (animation: ElementAnimation) => void;
}

type DrawingMode = 'rectangle' | 'ellipse' | null;

export function PreserveElementSelector({
  asset,
  animations,
  selectedElement,
  onSelectElement,
  onAddAnimation
}: PreserveElementSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentBounds, setCurrentBounds] = useState<ElementBounds | null>(null);

  // Load and display image
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match container
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Draw image maintaining aspect ratio
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Draw existing animations
      drawAnimations(ctx, animations, selectedElement);
    };
    img.src = asset.originalFile.url;
  }, [asset.originalFile.url, animations, selectedElement]);

  const drawAnimations = (
    ctx: CanvasRenderingContext2D,
    anims: ElementAnimation[],
    selected: string | null
  ) => {
    anims.forEach(anim => {
      ctx.save();
      
      if (anim.element.type === 'custom') {
        const elem = anim.element as CustomElement;
        const bounds = elem.bounds;
        
        ctx.strokeStyle = anim.id === selected ? '#3b82f6' : '#10b981';
        ctx.lineWidth = anim.id === selected ? 3 : 2;
        ctx.setLineDash([5, 5]);
        
        // Convert percentage bounds to pixel coordinates
        const x = (bounds.x / 100) * ctx.canvas.width;
        const y = (bounds.y / 100) * ctx.canvas.height;
        const width = (bounds.width / 100) * ctx.canvas.width;
        const height = (bounds.height / 100) * ctx.canvas.height;
        
        if (elem.shape === 'rectangle') {
          ctx.strokeRect(x, y, width, height);
        } else if (elem.shape === 'ellipse') {
          ctx.beginPath();
          ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Draw label
        ctx.fillStyle = anim.id === selected ? '#3b82f6' : '#10b981';
        ctx.font = '12px sans-serif';
        ctx.fillText(elem.name, x + 5, y - 5);
      }
      
      ctx.restore();
    });
  };

  const getRelativeCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode) return;
    
    const coords = getRelativeCoords(e);
    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentBounds({
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode) return;
    
    const coords = getRelativeCoords(e);
    const bounds: ElementBounds = {
      x: Math.min(startPoint.x, coords.x),
      y: Math.min(startPoint.y, coords.y),
      width: Math.abs(coords.x - startPoint.x),
      height: Math.abs(coords.y - startPoint.y)
    };
    
    setCurrentBounds(bounds);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBounds || !drawingMode) return;
    
    setIsDrawing(false);
    
    if (currentBounds.width > 5 && currentBounds.height > 5) {
      const elementName = prompt('Name this element:', 'Element ' + (animations.length + 1));
      if (elementName) {
        const newElement: CustomElement = {
          type: 'custom',
          name: elementName,
          bounds: currentBounds,
          shape: drawingMode
        };
        
        const newAnimation: ElementAnimation = {
          id: `elem-${Date.now()}`,
          type: 'float', // Default animation type
          element: newElement,
          parameters: {
            intensity: 50,
            speed: 1,
            direction: 'vertical'
          },
          layer: animations.length
        };
        
        onAddAnimation(newAnimation);
        setDrawingMode(null);
      }
    }
    
    setCurrentBounds(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingMode) return;
    
    const coords = getRelativeCoords(e);
    
    // Check if click is inside any animation bounds
    const clickedAnimation = animations.find(anim => {
      if (anim.element.type === 'custom') {
        const elem = anim.element as CustomElement;
        const bounds = elem.bounds;
        return coords.x >= bounds.x && 
               coords.x <= bounds.x + bounds.width &&
               coords.y >= bounds.y && 
               coords.y <= bounds.y + bounds.height;
      }
      return false;
    });
    
    onSelectElement(clickedAnimation ? clickedAnimation.id : null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={drawingMode === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode(drawingMode === 'rectangle' ? null : 'rectangle')}
          >
            <Icons.square className="mr-2 h-4 w-4" />
            Rectangle
          </Button>
          <Button
            variant={drawingMode === 'ellipse' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode(drawingMode === 'ellipse' ? null : 'ellipse')}
          >
            <Icons.circle className="mr-2 h-4 w-4" />
            Ellipse
          </Button>
        </div>
        
        {drawingMode && (
          <Badge variant="secondary">
            Drawing Mode: {drawingMode}
          </Badge>
        )}
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
        />
      </div>

      {/* Instructions */}
      <div className="text-sm text-muted-foreground">
        {drawingMode ? (
          <p>Click and drag to draw a {drawingMode} around the element you want to animate.</p>
        ) : (
          <p>Select a drawing tool above to mark areas for animation, or click on existing elements to edit them.</p>
        )}
      </div>
    </div>
  );
}