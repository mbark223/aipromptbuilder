'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AnimationModel, Format } from '@/types';
import { ModelSelector } from '@/components/static-to-motion/ModelSelector';
import { ModelInputFields } from '@/components/static-to-motion/ModelInputFields';
import { FormatSelector } from '@/components/static-to-motion/FormatSelector';
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
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">Select Video Model</Label>
        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
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
        <Label className="text-base font-semibold mb-3 block">Output Formats</Label>
        <FormatSelector
          selectedFormats={selectedFormats}
          onSelectFormats={onSelectFormats}
          multiSelect={true}
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