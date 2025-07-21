'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Movement } from '@/types';

interface AnimationControlsProps {
  movement: Movement;
  onUpdate: (movement: Movement) => void;
}

export function AnimationControls({ movement, onUpdate }: AnimationControlsProps) {
  const [intensity, setIntensity] = useState(movement.intensity);
  
  const handleIntensityChange = (value: number[]) => {
    const newIntensity = value[0];
    setIntensity(newIntensity);
    onUpdate({
      ...movement,
      intensity: newIntensity
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium capitalize">
          {movement.element} - {movement.type}
        </h3>
        {movement.direction && (
          <Badge variant="secondary" className="text-xs">
            {movement.direction}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Intensity</Label>
          <span className="text-sm text-muted-foreground">{intensity}/10</span>
        </div>
        <Slider
          value={[intensity]}
          onValueChange={handleIntensityChange}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Subtle</span>
          <span>Moderate</span>
          <span>Dynamic</span>
        </div>
      </div>
    </Card>
  );
}

// Example usage component showing duration and transition controls
export function AnimationTimingControls({ 
  duration, 
  onDurationChange,
  transitionDuration,
  onTransitionDurationChange 
}: {
  duration: number;
  onDurationChange: (duration: number) => void;
  transitionDuration: number;
  onTransitionDurationChange: (duration: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Animation Duration</Label>
          <span className="text-sm text-muted-foreground">{duration}s</span>
        </div>
        <Slider
          value={[duration]}
          onValueChange={(value) => onDurationChange(value[0])}
          min={0.5}
          max={10}
          step={0.5}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Transition Duration</Label>
          <span className="text-sm text-muted-foreground">{transitionDuration}s</span>
        </div>
        <Slider
          value={[transitionDuration]}
          onValueChange={(value) => onTransitionDurationChange(value[0])}
          min={0.1}
          max={2}
          step={0.1}
          className="w-full"
        />
      </div>
    </div>
  );
}