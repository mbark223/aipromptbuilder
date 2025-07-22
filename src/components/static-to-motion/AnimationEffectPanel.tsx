'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { ElementAnimation, CustomElement, AnimationParameters } from '@/types';

interface AnimationEffectPanelProps {
  animations: ElementAnimation[];
  selectedElement: string | null;
  onUpdateAnimation: (id: string, animation: ElementAnimation) => void;
  onRemoveAnimation: (id: string) => void;
  onSelectElement: (id: string) => void;
}

const ANIMATION_TYPES = [
  { value: 'ripple', label: 'Water Ripple', icon: Icons.droplet },
  { value: 'sway', label: 'Sway', icon: Icons.wind },
  { value: 'float', label: 'Float', icon: Icons.arrowUp },
  { value: 'parallax', label: 'Parallax', icon: Icons.layers },
  { value: 'shimmer', label: 'Shimmer', icon: Icons.sparkles },
  { value: 'glow', label: 'Glow', icon: Icons.sun },
  { value: 'particle', label: 'Particles', icon: Icons.stars },
  { value: 'distortion', label: 'Distortion', icon: Icons.waves }
];

export function AnimationEffectPanel({
  animations,
  selectedElement,
  onUpdateAnimation,
  onRemoveAnimation,
  onSelectElement
}: AnimationEffectPanelProps) {
  const selectedAnimation = animations.find(a => a.id === selectedElement);

  if (animations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icons.layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No animations added yet</p>
        <p className="text-sm mt-2">Use the drawing tools to select areas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Animation List */}
      <div className="space-y-2">
        {animations.map((animation) => {
          const isSelected = animation.id === selectedElement;
          const element = animation.element.type === 'custom' ? animation.element as CustomElement : null;
          const AnimIcon = ANIMATION_TYPES.find(t => t.value === animation.type)?.icon || Icons.layers;
          
          return (
            <Card
              key={animation.id}
              className={`p-3 cursor-pointer transition-all ${
                isSelected ? 'border-primary shadow-sm' : 'hover:border-primary/50'
              }`}
              onClick={() => onSelectElement(animation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AnimIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{element?.name || 'Unknown'}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAnimation(animation.id);
                  }}
                >
                  <Icons.trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Animation Controls */}
      {selectedAnimation && (
        <Card className="p-4 space-y-4 border-primary">
          <h4 className="font-semibold">Animation Settings</h4>
          
          {/* Animation Type */}
          <div className="space-y-2">
            <Label>Animation Type</Label>
            <Select
              value={selectedAnimation.type}
              onValueChange={(value) => {
                onUpdateAnimation(selectedAnimation.id, {
                  ...selectedAnimation,
                  type: value as ElementAnimation['type']
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANIMATION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Intensity</Label>
              <span className="text-sm text-muted-foreground">
                {selectedAnimation.parameters.intensity}%
              </span>
            </div>
            <Slider
              value={[selectedAnimation.parameters.intensity]}
              onValueChange={([value]) => {
                onUpdateAnimation(selectedAnimation.id, {
                  ...selectedAnimation,
                  parameters: {
                    ...selectedAnimation.parameters,
                    intensity: value
                  }
                });
              }}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Speed</Label>
              <span className="text-sm text-muted-foreground">
                {selectedAnimation.parameters.speed}x
              </span>
            </div>
            <Slider
              value={[selectedAnimation.parameters.speed]}
              onValueChange={([value]) => {
                onUpdateAnimation(selectedAnimation.id, {
                  ...selectedAnimation,
                  parameters: {
                    ...selectedAnimation.parameters,
                    speed: value
                  }
                });
              }}
              min={0.1}
              max={5}
              step={0.1}
            />
          </div>

          {/* Direction (for applicable types) */}
          {['sway', 'float', 'parallax', 'distortion'].includes(selectedAnimation.type) && (
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={selectedAnimation.parameters.direction || 'vertical'}
                onValueChange={(value) => {
                  onUpdateAnimation(selectedAnimation.id, {
                    ...selectedAnimation,
                    parameters: {
                      ...selectedAnimation.parameters,
                      direction: value as AnimationParameters['direction']
                    }
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                  <SelectItem value="circular">Circular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Blend Mode */}
          <div className="space-y-2">
            <Label>Blend Mode</Label>
            <Select
              value={selectedAnimation.parameters.blendMode || 'normal'}
              onValueChange={(value) => {
                onUpdateAnimation(selectedAnimation.id, {
                  ...selectedAnimation,
                  parameters: {
                    ...selectedAnimation.parameters,
                    blendMode: value as AnimationParameters['blendMode']
                  }
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="multiply">Multiply</SelectItem>
                <SelectItem value="screen">Screen</SelectItem>
                <SelectItem value="overlay">Overlay</SelectItem>
                <SelectItem value="soft-light">Soft Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      )}
    </div>
  );
}