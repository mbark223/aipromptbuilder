'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { Slider } from '@/components/ui/slider';
import type { Movement } from '@/types';

interface AnimationConfig {
  type: Movement['type'];
  intensity: number;
  direction?: Movement['direction'];
}

export interface CustomElement {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  animation?: AnimationConfig;
}

interface ElementSelectorProps {
  imageUrl: string;
  onElementsChange: (elements: CustomElement[]) => void;
}

// Animation descriptions for beginners
type AnimationType = {
  value: string;
  label: string;
  icon: string;
  description: string;
  hasDirection: boolean;
  directions?: string[];
};

const ANIMATION_TYPES: AnimationType[] = [
  // Motion animations
  { 
    value: 'rotate', 
    label: 'Rotate', 
    icon: '🔄', 
    description: 'Spin in a circle (perfect for wheels, fans)',
    hasDirection: true,
    directions: ['clockwise', 'counter-clockwise']
  },
  { 
    value: 'pulse', 
    label: 'Pulse', 
    icon: '💗', 
    description: 'Grow and shrink rhythmically (logos, hearts)',
    hasDirection: false
  },
  { 
    value: 'float', 
    label: 'Float', 
    icon: '🎈', 
    description: 'Gentle up/down movement (balloons, text)',
    hasDirection: true,
    directions: ['up', 'down', 'left', 'right']
  },
  { 
    value: 'sway', 
    label: 'Sway', 
    icon: '🌳', 
    description: 'Rock back and forth (trees, buildings)',
    hasDirection: true,
    directions: ['left', 'right']
  },
  { 
    value: 'bounce', 
    label: 'Bounce', 
    icon: '⚡', 
    description: 'Bouncy motion (balls, playful elements)',
    hasDirection: true,
    directions: ['up', 'down']
  },
  { 
    value: 'shake', 
    label: 'Shake', 
    icon: '📳', 
    description: 'Vibrate/shake effect (alerts, emphasis)',
    hasDirection: false
  },
  { 
    value: 'wave', 
    label: 'Wave', 
    icon: '🌊', 
    description: 'Wavy motion (flags, water, fabric)',
    hasDirection: true,
    directions: ['left', 'right', 'up', 'down']
  },
  // Text animations
  { 
    value: 'typewriter', 
    label: 'Typewriter', 
    icon: '⌨️', 
    description: 'Type text letter by letter',
    hasDirection: false
  },
  { 
    value: 'fade-in', 
    label: 'Fade In', 
    icon: '🌅', 
    description: 'Gradually appear (text, logos)',
    hasDirection: false
  },
  { 
    value: 'slide-in', 
    label: 'Slide In', 
    icon: '➡️', 
    description: 'Slide into view (titles, captions)',
    hasDirection: true,
    directions: ['left', 'right', 'up', 'down']
  },
  { 
    value: 'blur-in', 
    label: 'Blur In', 
    icon: '🔮', 
    description: 'Focus from blur (dramatic reveals)',
    hasDirection: false
  },
  // Illumination animations
  { 
    value: 'glow', 
    label: 'Glow', 
    icon: '🔥', 
    description: 'Soft glowing effect (neon, lights)',
    hasDirection: false
  },
  { 
    value: 'illuminate', 
    label: 'Illuminate', 
    icon: '💡', 
    description: 'Light up effect (signs, buttons)',
    hasDirection: false
  },
  { 
    value: 'sparkle', 
    label: 'Sparkle', 
    icon: '⭐', 
    description: 'Twinkling stars effect (jewelry, magic)',
    hasDirection: false
  },
  { 
    value: 'shimmer', 
    label: 'Shimmer', 
    icon: '✨', 
    description: 'Shimmering light (water, metal)',
    hasDirection: false
  },
  { 
    value: 'flicker', 
    label: 'Flicker', 
    icon: '🕯️', 
    description: 'Flickering light (candles, old signs)',
    hasDirection: false
  },
  // View animations
  { 
    value: 'zoom', 
    label: 'Zoom', 
    icon: '🔍', 
    description: 'Get closer or further (focus effects)',
    hasDirection: true,
    directions: ['in', 'out']
  },
  { 
    value: 'pan', 
    label: 'Pan', 
    icon: '↔️', 
    description: 'Slide across screen (moving objects)',
    hasDirection: true,
    directions: ['up', 'down', 'left', 'right']
  }
];

export function ElementSelectorV2({ imageUrl, onElementsChange }: ElementSelectorProps) {
  const [elements, setElements] = useState<CustomElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSelecting || !imageRef.current) return;
    
    e.preventDefault();
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setSelectionBox({
      startX: x,
      startY: y,
      endX: x,
      endY: y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectionBox || !imageRef.current) return;
    
    e.preventDefault();
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectionBox({
      ...selectionBox,
      endX: x,
      endY: y
    });
  };

  const handleMouseUp = () => {
    if (!isDragging || !selectionBox || !imageRef.current) return;
    
    const bounds = {
      x: Math.min(selectionBox.startX, selectionBox.endX),
      y: Math.min(selectionBox.startY, selectionBox.endY),
      width: Math.abs(selectionBox.endX - selectionBox.startX),
      height: Math.abs(selectionBox.endY - selectionBox.startY)
    };
    
    if (bounds.width > 10 && bounds.height > 10) {
      const newElement: CustomElement = {
        id: `element-${Date.now()}`,
        name: `Element ${elements.length + 1}`,
        bounds
      };
      
      const newElements = [...elements, newElement];
      setElements(newElements);
      onElementsChange(newElements);
      setSelectedElement(newElement.id);
      setShowGuide(false);
    }
    
    setIsDragging(false);
    setSelectionBox(null);
    setIsSelecting(false);
  };

  const updateElement = (id: string, updates: Partial<CustomElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    onElementsChange(newElements);
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    onElementsChange(newElements);
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElement);
  const selectedAnimationType = selectedEl?.animation ? 
    ANIMATION_TYPES.find(t => t.value === selectedEl.animation?.type) : null;

  return (
    <div className="space-y-4">
      {/* Header with Instructions */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Animate Specific Elements</h3>
        <p className="text-sm text-muted-foreground">
          Select parts of your image to animate individually - like a ferris wheel, logo, or text
        </p>
      </div>

      {/* Step 1: Selection */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Step 1: Select Elements</h4>
              <p className="text-xs text-muted-foreground">Click the button, then draw a box around what you want to animate</p>
            </div>
            <Button
              variant={isSelecting ? "default" : "outline"}
              size="sm"
              onClick={() => setIsSelecting(!isSelecting)}
            >
              {isSelecting ? (
                <>
                  <Icons.target className="mr-2 h-4 w-4 animate-pulse" />
                  Click & Drag on Image
                </>
              ) : (
                <>
                  <Icons.zap className="mr-2 h-4 w-4" />
                  Add Element
                </>
              )}
            </Button>
          </div>

          {showGuide && elements.length === 0 && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">💡 Quick Tips:</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• For a ferris wheel: Draw a box around the entire wheel</li>
                <li>• For logos: Select just the logo area</li>
                <li>• For text: Draw around the text you want to animate</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Image with selection overlay */}
      <div 
        ref={imageRef}
        className={`relative border-2 rounded-lg overflow-hidden ${
          isSelecting ? 'cursor-crosshair border-primary border-dashed' : 'border-border'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Selection mode indicator */}
        {isSelecting && (
          <div className="absolute top-2 left-2 z-20 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium animate-pulse">
            Selection Mode Active - Click and drag to select
          </div>
        )}
        <img
          src={imageUrl}
          alt="Select elements"
          className="w-full h-auto select-none"
          draggable={false}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Existing element overlays */}
        {imageLoaded && elements.map(element => (
          <div
            key={element.id}
            className={`absolute border-2 transition-all cursor-pointer ${
              selectedElement === element.id 
                ? 'border-primary bg-primary/20 shadow-lg' 
                : 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20'
            }`}
            style={{
              left: `${element.bounds.x}px`,
              top: `${element.bounds.y}px`,
              width: `${element.bounds.width}px`,
              height: `${element.bounds.height}px`
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element.id);
            }}
          >
            <div className="absolute -top-7 left-0 flex items-center gap-1">
              <Badge 
                variant={selectedElement === element.id ? "default" : "secondary"}
                className="text-xs"
              >
                {element.name}
              </Badge>
              {element.animation && (
                <Badge variant="outline" className="text-xs">
                  {ANIMATION_TYPES.find(t => t.value === element.animation?.type)?.icon}
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        {/* Active selection box */}
        {selectionBox && isDragging && (
          <div
            className="absolute border-2 border-primary bg-primary/20 pointer-events-none animate-pulse z-30"
            style={{
              left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
              top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
              width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`
            }}
          />
        )}
      </div>

      {/* Step 2: Element List */}
      {elements.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Step 2: Your Selected Elements</h4>
          <div className="space-y-2">
            {elements.map(element => (
              <div
                key={element.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedElement === element.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedElement(element.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Input
                      value={element.name}
                      onChange={(e) => updateElement(element.id, { name: e.target.value })}
                      className="h-8 w-40"
                      placeholder="Name this element"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {element.animation && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">
                          {ANIMATION_TYPES.find(t => t.value === element.animation?.type)?.icon}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {ANIMATION_TYPES.find(t => t.value === element.animation?.type)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                  >
                    <Icons.trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Step 3: Animation Settings */}
      {selectedEl && (
        <Card className="p-4 space-y-4">
          <div>
            <h4 className="font-medium mb-1">Step 3: Choose Animation for {selectedEl.name}</h4>
            <p className="text-xs text-muted-foreground">Select how this element should move</p>
          </div>
          
          {/* Animation Categories */}
          <div className="space-y-4">
            {/* Motion Animations */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Motion Effects</h5>
              <div className="grid grid-cols-2 gap-2">
                {ANIMATION_TYPES.filter(anim => 
                  ['rotate', 'pulse', 'float', 'sway', 'bounce', 'shake', 'wave'].includes(anim.value)
                ).map(anim => (
                  <Button
                    key={anim.value}
                    variant={selectedEl.animation?.type === anim.value ? "default" : "outline"}
                    className="h-auto flex-col items-start justify-start p-3 text-left"
                onClick={() => updateElement(selectedEl.id, {
                  animation: {
                    type: anim.value as Movement['type'],
                    intensity: selectedEl.animation?.intensity || 5,
                    direction: anim.hasDirection && anim.directions && anim.directions.length > 0 ? 
                      (anim.directions[0] as Movement['direction']) : undefined
                  }
                })}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{anim.icon}</span>
                      <span className="font-medium">{anim.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{anim.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Text Animations */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Text Effects</h5>
              <div className="grid grid-cols-2 gap-2">
                {ANIMATION_TYPES.filter(anim => 
                  ['typewriter', 'fade-in', 'slide-in', 'blur-in'].includes(anim.value)
                ).map(anim => (
                  <Button
                    key={anim.value}
                    variant={selectedEl.animation?.type === anim.value ? "default" : "outline"}
                    className="h-auto flex-col items-start justify-start p-3 text-left"
                    onClick={() => updateElement(selectedEl.id, {
                      animation: {
                        type: anim.value as Movement['type'],
                        intensity: selectedEl.animation?.intensity || 5,
                        direction: anim.hasDirection && anim.directions && anim.directions.length > 0 ? 
                          (anim.directions[0] as Movement['direction']) : undefined
                      }
                    })}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{anim.icon}</span>
                      <span className="font-medium">{anim.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{anim.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Illumination Animations */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Illumination Effects</h5>
              <div className="grid grid-cols-2 gap-2">
                {ANIMATION_TYPES.filter(anim => 
                  ['glow', 'illuminate', 'sparkle', 'shimmer', 'flicker'].includes(anim.value)
                ).map(anim => (
                  <Button
                    key={anim.value}
                    variant={selectedEl.animation?.type === anim.value ? "default" : "outline"}
                    className="h-auto flex-col items-start justify-start p-3 text-left"
                    onClick={() => updateElement(selectedEl.id, {
                      animation: {
                        type: anim.value as Movement['type'],
                        intensity: selectedEl.animation?.intensity || 5,
                        direction: anim.hasDirection && anim.directions && anim.directions.length > 0 ? 
                          (anim.directions[0] as Movement['direction']) : undefined
                      }
                    })}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{anim.icon}</span>
                      <span className="font-medium">{anim.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{anim.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* View Animations */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">View Effects</h5>
              <div className="grid grid-cols-2 gap-2">
                {ANIMATION_TYPES.filter(anim => 
                  ['zoom', 'pan'].includes(anim.value)
                ).map(anim => (
                  <Button
                    key={anim.value}
                    variant={selectedEl.animation?.type === anim.value ? "default" : "outline"}
                    className="h-auto flex-col items-start justify-start p-3 text-left"
                    onClick={() => updateElement(selectedEl.id, {
                      animation: {
                        type: anim.value as Movement['type'],
                        intensity: selectedEl.animation?.intensity || 5,
                        direction: anim.hasDirection && anim.directions && anim.directions.length > 0 ? 
                          (anim.directions[0] as Movement['direction']) : undefined
                      }
                    })}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{anim.icon}</span>
                      <span className="font-medium">{anim.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{anim.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Animation Controls */}
          {selectedEl.animation && (
            <div className="space-y-4 pt-2">
              {/* Intensity Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Speed/Intensity</Label>
                  <span className="text-sm text-muted-foreground">
                    {selectedEl.animation.intensity}/10
                  </span>
                </div>
                <Slider
                  value={[selectedEl.animation.intensity || 5]}
                  onValueChange={([value]) => updateElement(selectedEl.id, {
                    animation: { 
                      type: selectedEl.animation!.type,
                      intensity: value,
                      direction: selectedEl.animation!.direction
                    }
                  })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Direction Buttons */}
              {selectedAnimationType?.hasDirection && selectedAnimationType.directions && (
                <div className="space-y-2">
                  <Label>Direction</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedAnimationType.directions.map(dir => (
                      <Button
                        key={dir}
                        variant={selectedEl.animation?.direction === dir ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateElement(selectedEl.id, {
                          animation: { 
                            type: selectedEl.animation!.type,
                            intensity: selectedEl.animation!.intensity,
                            direction: dir as Movement['direction']
                          }
                        })}
                      >
                        {dir.charAt(0).toUpperCase() + dir.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}