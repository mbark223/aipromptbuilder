'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Icons } from '@/components/icons';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface AnimationElement {
  id: string;
  name: string;
  type: 'text' | 'object' | 'background' | 'foreground' | 'character';
  enabled: boolean;
  animationType: 'motion' | 'fade' | 'scale' | 'rotate' | 'bounce' | 'float';
  intensity: number;
  delay: number;
  duration: number;
}

interface AnimationElementsProps {
  elements: AnimationElement[];
  onElementsChange: (elements: AnimationElement[]) => void;
}

const ELEMENT_TYPES = [
  { value: 'text', label: 'Text Elements', icon: Icons.type },
  { value: 'object', label: 'Objects', icon: Icons.box },
  { value: 'background', label: 'Background', icon: Icons.image },
  { value: 'foreground', label: 'Foreground', icon: Icons.layers },
  { value: 'character', label: 'Characters', icon: Icons.user },
];

const ANIMATION_TYPES = [
  { value: 'motion', label: 'Motion', description: 'Move across the scene' },
  { value: 'fade', label: 'Fade', description: 'Fade in or out' },
  { value: 'scale', label: 'Scale', description: 'Grow or shrink' },
  { value: 'rotate', label: 'Rotate', description: 'Spin or turn' },
  { value: 'bounce', label: 'Bounce', description: 'Bouncing effect' },
  { value: 'float', label: 'Float', description: 'Floating movement' },
];

const DEFAULT_ELEMENTS: AnimationElement[] = [
  {
    id: 'text-1',
    name: 'Text Elements',
    type: 'text',
    enabled: false,
    animationType: 'fade',
    intensity: 5,
    delay: 0,
    duration: 1,
  },
  {
    id: 'object-1',
    name: 'Main Objects',
    type: 'object',
    enabled: false,
    animationType: 'motion',
    intensity: 5,
    delay: 0,
    duration: 2,
  },
  {
    id: 'bg-1',
    name: 'Background',
    type: 'background',
    enabled: false,
    animationType: 'scale',
    intensity: 3,
    delay: 0,
    duration: 3,
  },
  {
    id: 'fg-1',
    name: 'Foreground Elements',
    type: 'foreground',
    enabled: false,
    animationType: 'float',
    intensity: 4,
    delay: 0.5,
    duration: 2,
  },
  {
    id: 'char-1',
    name: 'Characters',
    type: 'character',
    enabled: false,
    animationType: 'bounce',
    intensity: 6,
    delay: 0,
    duration: 1.5,
  },
];

export function AnimationElements({ elements = DEFAULT_ELEMENTS, onElementsChange }: AnimationElementsProps) {
  const [expandedElement, setExpandedElement] = useState<string | null>(null);

  const toggleElement = (elementId: string) => {
    const updatedElements = elements.map(el =>
      el.id === elementId ? { ...el, enabled: !el.enabled } : el
    );
    onElementsChange(updatedElements);
  };

  const updateElement = (elementId: string, updates: Partial<AnimationElement>) => {
    const updatedElements = elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    );
    onElementsChange(updatedElements);
  };

  const enabledCount = elements.filter(el => el.enabled).length;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icons.sparkles className="h-5 w-5" />
            Animation Elements
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select which elements to animate in your video
          </p>
        </div>

        {enabledCount > 0 && (
          <Badge variant="secondary" className="w-fit">
            {enabledCount} element{enabledCount !== 1 ? 's' : ''} selected
          </Badge>
        )}

        <div className="space-y-3">
          {elements.map((element) => {
            const ElementIcon = ELEMENT_TYPES.find(t => t.value === element.type)?.icon || Icons.box;
            const isExpanded = expandedElement === element.id;

            return (
              <div
                key={element.id}
                className={`border rounded-lg transition-all ${
                  element.enabled ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={element.enabled}
                        onCheckedChange={() => toggleElement(element.id)}
                      />
                      <ElementIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{element.name}</p>
                        {element.enabled && (
                          <p className="text-sm text-muted-foreground">
                            {ANIMATION_TYPES.find(t => t.value === element.animationType)?.label} animation
                          </p>
                        )}
                      </div>
                    </div>
                    {element.enabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedElement(isExpanded ? null : element.id)}
                      >
                        {isExpanded ? (
                          <Icons.chevronUp className="h-4 w-4" />
                        ) : (
                          <Icons.chevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {element.enabled && isExpanded && (
                    <div className="mt-4 space-y-4 pt-4 border-t">
                      {/* Animation Type */}
                      <div className="space-y-2">
                        <Label className="text-sm">Animation Type</Label>
                        <Select
                          value={element.animationType}
                          onValueChange={(value) => updateElement(element.id, { animationType: value as AnimationElement['animationType'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ANIMATION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div>
                                  <p className="font-medium">{type.label}</p>
                                  <p className="text-xs text-muted-foreground">{type.description}</p>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Intensity</Label>
                          <span className="text-sm text-muted-foreground">{element.intensity}</span>
                        </div>
                        <Slider
                          value={[element.intensity]}
                          onValueChange={(value) => updateElement(element.id, { intensity: value[0] })}
                          min={1}
                          max={10}
                          step={1}
                        />
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Duration</Label>
                          <span className="text-sm text-muted-foreground">{element.duration}s</span>
                        </div>
                        <Slider
                          value={[element.duration]}
                          onValueChange={(value) => updateElement(element.id, { duration: value[0] })}
                          min={0.5}
                          max={5}
                          step={0.5}
                        />
                      </div>

                      {/* Delay */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Delay</Label>
                          <span className="text-sm text-muted-foreground">{element.delay}s</span>
                        </div>
                        <Slider
                          value={[element.delay]}
                          onValueChange={(value) => updateElement(element.id, { delay: value[0] })}
                          min={0}
                          max={3}
                          step={0.1}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {enabledCount === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Enable elements above to add animations to your video
          </div>
        )}
      </div>
    </Card>
  );
}