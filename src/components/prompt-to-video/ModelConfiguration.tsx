'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AnimationModel, Format } from '@/types';
import { ModelInputFields } from '@/components/static-to-motion/ModelInputFields';
import { Veo3FormatSelector } from './Veo3FormatSelector';
import { NumberInput } from '@/components/ui/number-input';

interface ModelConfigurationProps {
  selectedModel: AnimationModel;
  onSelectModel: (model: AnimationModel) => void;
  selectedFormats: Format[];
  onSelectFormats: (formats: Format[]) => void;
  modelInputs: Record<string, string | number | boolean | null>;
  onModelInputsChange: (inputs: Record<string, string | number | boolean | null>) => void;
  videosPerPrompt: number;
  onVideosPerPromptChange: (value: number) => void;
}

export function ModelConfiguration({
  selectedModel,
  onSelectModel,
  selectedFormats,
  onSelectFormats,
  modelInputs,
  onModelInputsChange,
  videosPerPrompt,
  onVideosPerPromptChange,
}: ModelConfigurationProps) {
  // For Veo-3 specific UI
  const veo3Formats = [
    { aspectRatio: '16:9', width: 1280, height: 720, name: '720p Horizontal (16:9)', custom: false },
    { aspectRatio: '9:16', width: 720, height: 1280, name: '720p Vertical (9:16)', custom: false },
    { aspectRatio: '16:9', width: 1920, height: 1080, name: '1080p Horizontal (16:9)', custom: false },
    { aspectRatio: '9:16', width: 1080, height: 1920, name: '1080p Vertical (9:16)', custom: false },
  ];

  return (
    <div className="space-y-6">
      {/* Veo-3 Model Badge */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Video Model</Label>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{selectedModel.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedModel.provider}</p>
            </div>
            <Badge variant="default">Selected</Badge>
          </div>
          <p className="text-sm mt-2">{selectedModel.description}</p>
        </Card>
      </div>

      <Separator />

      <div>
        <Label className="text-base font-semibold mb-3 block">Model Parameters</Label>
        <Card className="p-4">
          <ModelInputFields
            model={selectedModel}
            values={modelInputs}
            onChange={onModelInputsChange}
          />
        </Card>
      </div>

      <Separator />

      <div>
        <Label className="text-base font-semibold mb-3 block">Videos per Prompt</Label>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Number of Videos</p>
              <p className="text-xs text-muted-foreground mt-1">Generate multiple variations of each prompt (up to 5)</p>
            </div>
            <NumberInput
              value={videosPerPrompt}
              onChange={onVideosPerPromptChange}
              min={1}
              max={5}
              step={1}
            />
          </div>
        </Card>
      </div>

      <Separator />

      <div>
        <Veo3FormatSelector
          formats={veo3Formats}
          selectedFormat={selectedFormats[0] || veo3Formats[3]} // Default to 1080p Vertical
          onSelectFormat={(format) => onSelectFormats([format])}
        />
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Configuration Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Model:</span>
            <Badge variant="secondary">{selectedModel.name}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Provider:</span>
            <span>{selectedModel.provider}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Formats:</span>
            <div className="flex gap-1 flex-wrap">
              {selectedFormats.map((format, idx) => (
                <Badge key={idx} variant="outline">
                  {format.name || format.aspectRatio}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Videos per prompt:</span>
            <Badge variant="secondary">{videosPerPrompt}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}