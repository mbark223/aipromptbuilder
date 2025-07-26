'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AnimationModel, Format } from '@/types';
import { ModelSelector } from '@/components/static-to-motion/ModelSelector';
import { ModelInputFields } from '@/components/static-to-motion/ModelInputFields';
import { FormatSelector } from '@/components/static-to-motion/FormatSelector';

interface ModelConfigurationProps {
  models: AnimationModel[];
  selectedModel: AnimationModel;
  onSelectModel: (model: AnimationModel) => void;
  selectedFormats: Format[];
  onSelectFormats: (formats: Format[]) => void;
  modelInputs: Record<string, string | number | boolean | null>;
  onModelInputsChange: (inputs: Record<string, string | number | boolean | null>) => void;
}

export function ModelConfiguration({
  models,
  selectedModel,
  onSelectModel,
  selectedFormats,
  onSelectFormats,
  modelInputs,
  onModelInputsChange,
}: ModelConfigurationProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">Select Video Model</Label>
        <ModelSelector
          models={models}
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
            inputs={modelInputs}
            onInputsChange={onModelInputsChange}
          />
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
          {selectedModel.pricing && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Cost:</span>
              <span>{selectedModel.pricing}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}