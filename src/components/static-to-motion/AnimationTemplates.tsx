'use client';

import { AnimationProfile, ANIMATION_TEMPLATES } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

interface AnimationTemplatesProps {
  selectedAnimation: AnimationProfile;
  onSelectAnimation: (animation: AnimationProfile) => void;
}

const getAnimationIcon = (type: string) => {
  switch (type) {
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
};

export function AnimationTemplates({
  selectedAnimation,
  onSelectAnimation
}: AnimationTemplatesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ANIMATION_TEMPLATES.map((template) => (
        <Card
          key={template.id}
          className={`
            p-4 cursor-pointer transition-all duration-200
            ${selectedAnimation.id === template.id 
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
                variant={template.type === 'subtle' ? 'secondary' : 
                        template.type === 'moderate' ? 'default' : 'destructive'}
              >
                {template.type}
              </Badge>
            </div>

            <div className="space-y-2">
              {template.movements.map((movement, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getAnimationIcon(movement.type)}
                  <span className="capitalize">
                    {movement.type} {movement.direction ? `(${movement.direction})` : ''}
                  </span>
                  <span className="text-xs">• {movement.intensity}/10</span>
                </div>
              ))}
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
      ))}
    </div>
  );
}