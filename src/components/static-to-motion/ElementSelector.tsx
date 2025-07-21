'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export function ElementSelector({ imageUrl, onElementsChange }: ElementSelectorProps) {
  const [elements, setElements] = useState<CustomElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Predefined animation suggestions based on element type
  const animationSuggestions = {
    'ferris-wheel': { type: 'rotate', intensity: 3, direction: 'clockwise' },
    'logo': { type: 'pulse', intensity: 2 },
    'text': { type: 'float', intensity: 2, direction: 'up' },
    'building': { type: 'sway', intensity: 1, direction: 'right' },
    'lights': { type: 'shimmer', intensity: 4 },
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSelecting || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectionBox({
      startX: x,
      startY: y,
      endX: x,
      endY: y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectionBox || !imageRef.current) return;
    
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
    if (!selectionBox || !imageRef.current) return;
    
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
    }
    
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Element Selection</h3>
        <Button
          variant={isSelecting ? "default" : "outline"}
          size="sm"
          onClick={() => setIsSelecting(!isSelecting)}
        >
          <Icons.target className="mr-2 h-4 w-4" />
          {isSelecting ? 'Selecting...' : 'Select Element'}
        </Button>
      </div>

      {/* Image with selection overlay */}
      <div 
        ref={imageRef}
        className="relative border-2 border-border rounded-lg overflow-hidden cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt="Select elements"
          className="w-full h-auto"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Existing element overlays */}
        {imageLoaded && elements.map(element => (
          <div
            key={element.id}
            className={`absolute border-2 ${
              selectedElement === element.id 
                ? 'border-primary bg-primary/10' 
                : 'border-blue-500 bg-blue-500/10'
            } cursor-pointer transition-all`}
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
            <Badge 
              className="absolute -top-6 left-0 text-xs"
              variant={selectedElement === element.id ? "default" : "secondary"}
            >
              {element.name}
            </Badge>
          </div>
        ))}
        
        {/* Active selection box */}
        {selectionBox && (
          <div
            className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
            style={{
              left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
              top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
              width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`
            }}
          />
        )}
      </div>

      {/* Element list */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Selected Elements</h4>
        {elements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Click &quot;Select Element&quot; and draw a box around elements to animate
          </p>
        ) : (
          <div className="space-y-2">
            {elements.map(element => (
              <div
                key={element.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
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
                      className="h-8 w-32"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {element.animation && (
                      <Badge variant="outline" className="text-xs">
                        {element.animation.type}
                      </Badge>
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
                    <Icons.x className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Animation controls for selected element */}
      {selectedEl && (
        <Card className="p-4 space-y-4">
          <h4 className="font-medium">Animation Settings for {selectedEl.name}</h4>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(animationSuggestions).map(([type, settings]) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => updateElement(selectedEl.id, { 
                      animation: settings,
                      name: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
                    })}
                  >
                    {type.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Animation Type</Label>
              <Select
                value={selectedEl.animation?.type || ''}
                onValueChange={(value) => updateElement(selectedEl.id, {
                  animation: { 
                    type: value,
                    intensity: selectedEl.animation?.intensity || 5,
                    direction: selectedEl.animation?.direction
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select animation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rotate">Rotate</SelectItem>
                  <SelectItem value="pulse">Pulse</SelectItem>
                  <SelectItem value="float">Float</SelectItem>
                  <SelectItem value="sway">Sway</SelectItem>
                  <SelectItem value="shimmer">Shimmer</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="pan">Pan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedEl.animation && (
              <>
                <div className="grid gap-2">
                  <Label>Intensity ({selectedEl.animation.intensity || 5})</Label>
                  <Slider
                    value={[selectedEl.animation.intensity || 5]}
                    onValueChange={([value]) => updateElement(selectedEl.id, {
                      animation: { 
                        type: selectedEl.animation.type,
                        intensity: value,
                        direction: selectedEl.animation.direction
                      }
                    })}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                {(selectedEl.animation.type === 'rotate' || 
                  selectedEl.animation.type === 'pan' || 
                  selectedEl.animation.type === 'float' ||
                  selectedEl.animation.type === 'sway') && (
                  <div className="grid gap-2">
                    <Label>Direction</Label>
                    <Select
                      value={selectedEl.animation.direction || ''}
                      onValueChange={(value) => updateElement(selectedEl.id, {
                        animation: { 
                          type: selectedEl.animation.type,
                          intensity: selectedEl.animation.intensity,
                          direction: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedEl.animation.type === 'rotate' ? (
                          <>
                            <SelectItem value="clockwise">Clockwise</SelectItem>
                            <SelectItem value="counter-clockwise">Counter-clockwise</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="up">Up</SelectItem>
                            <SelectItem value="down">Down</SelectItem>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}