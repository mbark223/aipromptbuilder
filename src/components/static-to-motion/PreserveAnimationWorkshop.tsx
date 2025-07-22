'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { PreserveElementSelector } from './PreserveElementSelector';
import { ElementAnimationPreview } from './ElementAnimationPreview';
import { AnimationEffectPanel } from './AnimationEffectPanel';
import { StaticAsset, Format, ElementAnimation } from '@/types';

interface PreserveAnimationWorkshopProps {
  assets: StaticAsset[];
  selectedAssets: string[];
  selectedFormats: Format[];
  onStartProcessing: (animations: ElementAnimation[]) => void;
  onBack: () => void;
}

export function PreserveAnimationWorkshop({
  assets,
  selectedAssets,
  selectedFormats,
  onStartProcessing,
  onBack
}: PreserveAnimationWorkshopProps) {
  const [elementAnimations, setElementAnimations] = useState<ElementAnimation[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const selectedAsset = assets.find(a => selectedAssets.includes(a.id));

  const handleAddAnimation = (animation: ElementAnimation) => {
    setElementAnimations([...elementAnimations, animation]);
  };

  const handleUpdateAnimation = (id: string, animation: ElementAnimation) => {
    setElementAnimations(elementAnimations.map(a => a.id === id ? animation : a));
  };

  const handleRemoveAnimation = (id: string) => {
    setElementAnimations(elementAnimations.filter(a => a.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const handleStartProcessing = () => {
    if (elementAnimations.length === 0) {
      alert('Please add at least one animation effect');
      return;
    }
    onStartProcessing(elementAnimations);
  };

  if (!selectedAsset) {
    return <div>No asset selected</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <Icons.rotateCcw className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-semibold">Preserve & Animate</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Icons.eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button
            onClick={handleStartProcessing}
            disabled={elementAnimations.length === 0}
          >
            <Icons.play className="mr-2 h-4 w-4" />
            Start Processing
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Canvas */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            {previewMode ? (
              <ElementAnimationPreview
                asset={selectedAsset}
                animations={elementAnimations}
                selectedElement={selectedElement}
              />
            ) : (
              <PreserveElementSelector
                asset={selectedAsset}
                animations={elementAnimations}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                onAddAnimation={handleAddAnimation}
              />
            )}
          </Card>
        </div>

        {/* Animation Controls */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Animation Effects</h3>
            <AnimationEffectPanel
              animations={elementAnimations}
              selectedElement={selectedElement}
              onUpdateAnimation={handleUpdateAnimation}
              onRemoveAnimation={handleRemoveAnimation}
              onSelectElement={setSelectedElement}
            />
          </Card>

          {/* Quick Presets */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Quick Presets</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Auto-detect and add water animation
                  alert('Auto-detect feature coming soon!');
                }}
              >
                <Icons.droplet className="mr-2 h-4 w-4" />
                Auto-detect Water
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Auto-detect and add sky animation
                  alert('Auto-detect feature coming soon!');
                }}
              >
                <Icons.cloud className="mr-2 h-4 w-4" />
                Auto-detect Sky
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Add subtle global animation
                  const globalAnimation: ElementAnimation = {
                    id: `global-${Date.now()}`,
                    type: 'float',
                    element: {
                      type: 'custom',
                      name: 'Full Image',
                      bounds: { x: 0, y: 0, width: 100, height: 100 },
                      shape: 'rectangle'
                    },
                    parameters: {
                      intensity: 20,
                      speed: 0.5,
                      direction: 'vertical'
                    },
                    layer: 0
                  };
                  handleAddAnimation(globalAnimation);
                }}
              >
                <Icons.maximize className="mr-2 h-4 w-4" />
                Subtle Full Animation
              </Button>
            </div>
          </Card>

          {/* Selected Formats */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Output Formats</h3>
            <div className="space-y-1">
              {selectedFormats.map((format, idx) => (
                <div key={idx} className="text-sm text-muted-foreground">
                  {format.name} ({format.width}x{format.height})
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}