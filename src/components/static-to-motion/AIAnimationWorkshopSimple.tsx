'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { ModelSelector } from './ModelSelector';
import { AssetGrid } from './AssetGrid';
import { FormatSelector } from './FormatSelector';
import { StaticAsset, AnimationModel, Format } from '@/types';

interface AIAnimationWorkshopSimpleProps {
  assets: StaticAsset[];
  selectedAssets: string[];
  onSelectAssets: (ids: string[]) => void;
  selectedFormats: Format[];
  onSelectFormats: (formats: Format[]) => void;
  selectedModel: AnimationModel;
  onSelectModel: (model: AnimationModel) => void;
  modelInputs: Record<string, string | number | boolean | null>;
  onModelInputsChange: (inputs: Record<string, string | number | boolean | null>) => void;
  onStartProcessing: () => void;
  onBack: () => void;
}

// Quick preset prompts for common use cases
const PRESET_PROMPTS = [
  {
    label: 'Subtle Motion',
    icon: Icons.sparkles,
    prompt: 'Add subtle, natural movement while preserving the exact appearance of the static image. Apply gentle breathing motion, slight fabric movement, or minimal environmental effects.'
  },
  {
    label: 'Product Float',
    icon: Icons.box,
    prompt: 'Make the product float gently with slow rotation, maintaining its exact appearance. Add subtle lighting effects and dust particles in the background.'
  },
  {
    label: 'Portrait Life',
    icon: Icons.user,
    prompt: 'Bring the portrait to life with natural eye blinks, subtle facial expressions, and gentle hair movement. Keep the overall pose and composition unchanged.'
  },
  {
    label: 'Dynamic Scene',
    icon: Icons.zap,
    prompt: 'Create dynamic movement throughout the scene with camera motion, environmental effects, and subject animation while maintaining the visual style.'
  }
];

export function AIAnimationWorkshopSimple({
  assets,
  selectedAssets,
  onSelectAssets,
  selectedFormats,
  onSelectFormats,
  selectedModel,
  onSelectModel,
  modelInputs,
  onModelInputsChange,
  onStartProcessing,
  onBack
}: AIAnimationWorkshopSimpleProps) {
  const [prompt, setPrompt] = useState('');

  // Update model inputs when prompt changes
  useEffect(() => {
    onModelInputsChange({
      ...modelInputs,
      prompt: prompt
    });
  }, [prompt, modelInputs, onModelInputsChange]);

  // Check if ready to process
  const isReadyToProcess = selectedAssets.length > 0 && 
    prompt.trim().length > 0 &&
    selectedFormats.length > 0;

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icons.rotateCcw className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-semibold">AI Video Generation</h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Asset Selection and Model */}
        <div className="space-y-6">
          {/* Asset Selection */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Select Images</h3>
            <AssetGrid
              assets={assets}
              selectedAssets={selectedAssets}
              onSelectAssets={onSelectAssets}
            />
          </Card>

          {/* Model Selection */}
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
          />
        </div>

        {/* Middle Column - Prompt Input */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Describe the Motion</h3>
                <p className="text-sm text-muted-foreground">
                  Tell the AI how to animate your static image
                </p>
              </div>

              <Separator />

              {/* Quick Presets */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_PROMPTS.map((preset, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="justify-start h-auto py-2 px-3"
                      onClick={() => handlePresetClick(preset.prompt)}
                    >
                      <preset.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="text-xs text-left">{preset.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Animation Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe how you want to animate the image. Be specific about movement, camera motion, effects, and what should remain static..."
                  className="min-h-32 resize-none"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{prompt.length} characters</span>
                  {selectedModel.name.toLowerCase().includes('veo') && (
                    <span className="flex items-center gap-1">
                      <Icons.volume2 className="h-3 w-3" />
                      Supports audio descriptions
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Format Selection and Generate Button */}
        <div className="space-y-6">
          {/* Format Selection */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Output Formats</h3>
            <FormatSelector
              selectedFormats={selectedFormats}
              onSelectFormats={onSelectFormats}
            />
          </Card>

          {/* Model Info */}
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Model</span>
                <Badge variant="secondary">{selectedModel.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Provider</span>
                <span className="text-sm">{selectedModel.provider}</span>
              </div>
              {selectedModel.pricing && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cost</span>
                  <span className="text-sm">{selectedModel.pricing}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Generate Button */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Ready to Generate</h3>
                <p className="text-sm text-muted-foreground">
                  Your video will be generated with AI motion
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <div>{selectedAssets.length} image{selectedAssets.length !== 1 ? 's' : ''} selected</div>
                  <div>{selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''}</div>
                </div>
                <Button
                  onClick={onStartProcessing}
                  disabled={!isReadyToProcess}
                  size="lg"
                >
                  <Icons.play className="mr-2 h-4 w-4" />
                  Generate Video{selectedAssets.length > 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}