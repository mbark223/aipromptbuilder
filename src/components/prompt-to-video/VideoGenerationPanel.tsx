'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { AnimationModel, Format } from '@/types';

interface VideoGenerationPanelProps {
  prompts: string[];
  onUpdatePrompts: (prompts: string[]) => void;
  selectedModel: AnimationModel;
  selectedFormats: Format[];
  onStartProcessing: () => void;
}

export function VideoGenerationPanel({
  prompts,
  onUpdatePrompts,
  selectedModel,
  selectedFormats,
  onStartProcessing,
}: VideoGenerationPanelProps) {
  const totalVideos = prompts.length * selectedFormats.length;
  const estimatedCost = totalVideos * (selectedModel.costPerGeneration || 0);

  const handleRemovePrompt = (index: number) => {
    const newPrompts = prompts.filter((_, i) => i !== index);
    onUpdatePrompts(newPrompts);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generation Summary</h3>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {totalVideos} videos
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-muted/50">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Prompts</p>
              <p className="text-2xl font-bold">{prompts.length}</p>
            </div>
          </Card>
          <Card className="p-4 bg-muted/50">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Formats</p>
              <p className="text-2xl font-bold">{selectedFormats.length}</p>
            </div>
          </Card>
          <Card className="p-4 bg-muted/50">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Est. Cost</p>
              <p className="text-2xl font-bold">${estimatedCost.toFixed(2)}</p>
            </div>
          </Card>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-3">Prompts to Generate</h4>
          <div className="h-[300px] overflow-y-auto rounded-lg border p-4">
            <div className="space-y-3">
              {prompts.map((prompt, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Prompt {index + 1}</p>
                      <p className="text-sm text-muted-foreground">{prompt}</p>
                      <div className="flex gap-1 mt-2">
                        {selectedFormats.map((format, fIdx) => (
                          <Badge key={fIdx} variant="outline" className="text-xs">
                            {format.name || format.aspectRatio}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePrompt(index)}
                    >
                      <Icons.x className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icons.info className="h-4 w-4 text-primary" />
            <span className="font-medium">Generation Details</span>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Each prompt will be generated in {selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''}</li>
            <li>• Using {selectedModel.name} by {selectedModel.provider}</li>
            <li>• Estimated generation time: {totalVideos * 2}-{totalVideos * 5} minutes</li>
            {selectedModel.capabilities.includes('Native Audio') && (
              <li>• Audio will be included in generated videos</li>
            )}
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onUpdatePrompts([])}>
            Clear All
          </Button>
          <Button onClick={onStartProcessing} size="lg">
            <Icons.play className="mr-2 h-4 w-4" />
            Start Generation ({totalVideos} videos)
          </Button>
        </div>
      </div>
    </Card>
  );
}