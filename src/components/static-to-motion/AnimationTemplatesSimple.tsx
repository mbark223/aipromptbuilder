'use client';

import { AnimationProfile } from '@/types';
import { Card } from '@/components/ui/card';

interface AnimationTemplatesProps {
  selectedAnimation: AnimationProfile;
  onSelectAnimation: (animation: AnimationProfile) => void;
}

export function AnimationTemplatesSimple({
  selectedAnimation,
  onSelectAnimation
}: AnimationTemplatesProps) {
  // Simple template for testing
  const simpleTemplate: AnimationProfile = {
    id: 'simple-motion',
    name: 'Simple Motion',
    type: 'subtle',
    movements: [],
    duration: 3,
    loop: false,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className={`p-4 cursor-pointer transition-all duration-200 ${
          selectedAnimation.id === simpleTemplate.id 
            ? 'border-primary ring-2 ring-primary/20' 
            : 'hover:border-primary/50'
        }`}
        onClick={() => onSelectAnimation(simpleTemplate)}
      >
        <h3 className="font-semibold">{simpleTemplate.name}</h3>
        <p className="text-sm text-muted-foreground mt-2">
          A simple animation template
        </p>
      </Card>
    </div>
  );
}