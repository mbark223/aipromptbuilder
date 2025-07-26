'use client';

import { useState, useMemo } from 'react';
import { AnimationProfile, Movement } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';

interface AnimationTemplatesProps {
  selectedAnimation: AnimationProfile;
  onSelectAnimation: (animation: AnimationProfile) => void;
}

// Built-in animation templates
const BUILT_IN_TEMPLATES: AnimationProfile[] = [
  {
    id: 'subtle-breathing',
    name: 'Subtle Breathing',
    type: 'subtle' as const,
    movements: [
      {
        element: 'full' as const,
        type: 'pulse' as const,
        intensity: 2,
        timing: 'ease' as const
      }
    ],
    duration: 3,
    loop: true,
    transitions: {
      in: { type: 'fade' as const, duration: 0.3, easing: 'ease-out' },
      out: { type: 'fade' as const, duration: 0.3, easing: 'ease-in' }
    }
  },
  {
    id: 'ken-burns',
    name: 'Ken Burns',
    type: 'moderate' as const,
    movements: [
      {
        element: 'full' as const,
        type: 'zoom' as const,
        intensity: 3,
        direction: 'in' as const,
        timing: 'ease' as const
      },
      {
        element: 'full' as const,
        type: 'pan' as const,
        intensity: 2,
        direction: 'left' as const,
        timing: 'ease' as const
      }
    ],
    duration: 6,
    loop: false,
    transitions: {
      in: { type: 'fade' as const, duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade' as const, duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'dynamic-zoom',
    name: 'Dynamic Zoom',
    type: 'dynamic' as const,
    movements: [
      {
        element: 'full' as const,
        type: 'zoom' as const,
        intensity: 6,
        direction: 'in' as const,
        timing: 'ease-out' as const
      }
    ],
    duration: 2,
    loop: true,
    transitions: {
      in: { type: 'zoom' as const, duration: 0.2, easing: 'ease-out' },
      out: { type: 'fade' as const, duration: 0.2, easing: 'ease-in' }
    }
  }
];

const getAnimationIcon = (movement: Movement) => {
  // First check for element-specific icons
  switch (movement.element) {
    case 'water':
      return <Icons.droplet className="h-4 w-4" />;
    case 'sky':
      return <Icons.cloud className="h-4 w-4" />;
    case 'vegetation':
      return <Icons.leaf className="h-4 w-4" />;
    case 'fire':
      return <Icons.flame className="h-4 w-4" />;
    case 'particles':
      return <Icons.sparkles className="h-4 w-4" />;
    case 'specific':
      return <Icons.target className="h-4 w-4" />;
    default:
      // Fall back to movement type icons
      switch (movement.type) {
        case 'pulse':
        case 'sway':
          return <Icons.wind className="h-4 w-4" />;
        case 'zoom':
        case 'pan':
          return <Icons.camera className="h-4 w-4" />;
        case 'parallax':
          return <Icons.layers className="h-4 w-4" />;
        default:
          return <Icons.zap className="h-4 w-4" />;
      }
  }
};

export function AnimationTemplates({
  selectedAnimation,
  onSelectAnimation
}: AnimationTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'subtle' | 'moderate' | 'dynamic'>('all');

  const filteredTemplates = useMemo(() => {
    return BUILT_IN_TEMPLATES.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || template.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType]);

  const templateCounts = useMemo(() => {
    return {
      all: BUILT_IN_TEMPLATES.length,
      subtle: BUILT_IN_TEMPLATES.filter(t => t.type === 'subtle').length,
      moderate: BUILT_IN_TEMPLATES.filter(t => t.type === 'moderate').length,
      dynamic: BUILT_IN_TEMPLATES.filter(t => t.type === 'dynamic').length
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Search animations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as 'all' | 'subtle' | 'moderate' | 'dynamic')}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">All ({String(templateCounts.all)})</TabsTrigger>
          <TabsTrigger value="subtle">Subtle ({String(templateCounts.subtle)})</TabsTrigger>
          <TabsTrigger value="moderate">Moderate ({String(templateCounts.moderate)})</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic ({String(templateCounts.dynamic)})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No animations found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredTemplates.map((template) => (
        <Card
          key={template.id}
          className={`
            p-4 cursor-pointer transition-all duration-200
            ${selectedAnimation && selectedAnimation.id === template.id 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'hover:border-primary/50'
            }
          `}
          onClick={() => onSelectAnimation(template)}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{template.name}</h3>
              <Badge 
                variant={
                  template.type === 'subtle' ? 'secondary' : 
                  template.type === 'moderate' ? 'default' : 
                  'destructive'
                }
              >
                {template.type}
              </Badge>
            </div>

            <div className="space-y-2">
              {template.movements && template.movements.length > 0 ? (
                template.movements.map((movement, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getAnimationIcon(movement)}
                    <span className="capitalize">
                      {movement.element !== 'full' && movement.element !== 'background' && movement.element !== 'foreground' 
                        ? `${movement.element} ` 
                        : ''
                      }
                      {movement.type} {movement.direction ? `(${movement.direction})` : ''}
                    </span>
                    <span className="text-xs">• {movement.intensity}/10</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No movements defined</div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icons.clock className="h-3 w-3" />
                <span>{template.duration}s</span>
              </div>
              {template.loop && (
                <div className="flex items-center gap-1">
                  <Icons.repeat className="h-3 w-3" />
                  <span>Loop</span>
                </div>
              )}
            </div>
          </div>
        </Card>
          ))
        )}
      </div>
    </div>
  );
}