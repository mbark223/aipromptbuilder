'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';

interface AnimationTypeSelectorProps {
  onSelectType: (type: 'ai' | 'generic' | 'preserve') => void;
}

export function AnimationTypeSelector({ onSelectType }: AnimationTypeSelectorProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {/* Preserve & Animate Option - NEW */}
      <Card 
        className="relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2 border-primary/20"
        onClick={() => onSelectType('preserve')}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icons.image className="h-6 w-6 text-primary" />
            </div>
            <Badge>Recommended</Badge>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Preserve & Animate</h3>
            <p className="text-muted-foreground text-sm">
              Add subtle animations to elements while keeping your original image intact. Perfect for bringing static images to life.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icons.check className="h-4 w-4 text-green-500" />
              <span>Preserves original image</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icons.check className="h-4 w-4 text-green-500" />
              <span>Element-specific animations</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icons.check className="h-4 w-4 text-green-500" />
              <span>Real-time preview</span>
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full" variant="default">
              <Icons.image className="mr-2 h-4 w-4" />
              Preserve & Animate
            </Button>
          </div>

          {/* Effect types preview */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Effects:</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">Water Ripple</Badge>
              <Badge variant="outline" className="text-xs">Sky Motion</Badge>
              <Badge variant="outline" className="text-xs">Fabric Sway</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Models Option */}
      <Card 
        className="relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
        onClick={() => onSelectType('ai')}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icons.sparkles className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="secondary">AI Generation</Badge>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Animation</h3>
            <p className="text-muted-foreground text-sm">
              Generate custom animations using state-of-the-art AI models. Build detailed prompts to create unique motion effects tailored to your content.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icons.check className="h-4 w-4 text-green-500" />
              <span>Custom AI-generated motion</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icons.check className="h-4 w-4 text-green-500" />
              <span>Advanced prompt builder</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icons.check className="h-4 w-4 text-green-500" />
              <span>Multiple AI model options</span>
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full" variant="default">
              <Icons.sparkles className="mr-2 h-4 w-4" />
              Choose AI Animation
            </Button>
          </div>

          {/* Model logos preview */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Powered by:</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">Google Veo</Badge>
              <Badge variant="outline" className="text-xs">ByteDance</Badge>
              <Badge variant="outline" className="text-xs">MiniMax</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Generic Templates Option */}
      <Card 
        className="relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
        onClick={() => onSelectType('generic')}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <Icons.layers className="h-6 w-6 text-secondary-foreground" />
            </div>
            <Badge variant="secondary">Quick & Easy</Badge>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Pre-built Templates</h3>
            <p className="text-muted-foreground text-sm">
              Apply professionally designed animation templates. Perfect for quick results with consistent, predictable motion effects.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icons.check className="h-4 w-4 text-green-500" />
              <span>10+ ready-to-use templates</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icons.check className="h-4 w-4 text-green-500" />
              <span>Instant preview</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icons.check className="h-4 w-4 text-green-500" />
              <span>Fast processing</span>
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full" variant="secondary">
              <Icons.layers className="mr-2 h-4 w-4" />
              Choose Templates
            </Button>
          </div>

          {/* Template preview */}
          <div className="grid grid-cols-4 gap-1 pt-2">
            {['Subtle Breathing', 'Ken Burns', 'Parallax', 'Zoom Burst'].map((name, i) => (
              <div 
                key={i} 
                className="aspect-video bg-muted rounded text-[10px] flex items-center justify-center p-1 text-center"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}