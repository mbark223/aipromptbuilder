'use client';

import { useState } from 'react';
import { StaticAsset, Format, AnimationModel } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { AssetGrid } from './AssetGrid';
import { FormatSelector } from './FormatSelector';
import { ModelSelector } from './ModelSelector';
import { ModelInputFields } from './ModelInputFields';
import { PromptBuilderSection } from './PromptBuilderSection';
import { PreviewPanelV2 as PreviewPanel } from './PreviewPanelV2';

interface AIAnimationWorkshopProps {
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
}

export function AIAnimationWorkshop({
  assets,
  selectedAssets,
  onSelectAssets,
  selectedFormats,
  onSelectFormats,
  selectedModel,
  onSelectModel,
  modelInputs,
  onModelInputsChange,
  onStartProcessing
}: AIAnimationWorkshopProps) {
  const selectedAssetObjects = assets.filter(a => selectedAssets.includes(a.id));
  const primaryAsset = selectedAssetObjects[0];
  const [activeTab, setActiveTab] = useState('prompt');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Update model inputs when prompt changes
  const handlePromptChange = (prompt: string) => {
    setGeneratedPrompt(prompt);
    onModelInputsChange({
      ...modelInputs,
      prompt
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Select Assets</h2>
          <AssetGrid
            assets={assets}
            selectedAssets={selectedAssets}
            onSelectAssets={onSelectAssets}
          />
        </Card>

        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="prompt">
                <Icons.sparkles className="mr-2 h-4 w-4" />
                Prompt
              </TabsTrigger>
              <TabsTrigger value="model">
                <Icons.zap className="mr-2 h-4 w-4" />
                Model
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Icons.zap className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="formats">
                <Icons.layers className="mr-2 h-4 w-4" />
                Formats
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="prompt" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Build Your Animation Prompt</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a detailed prompt to guide the AI in generating your animation
                </p>
                <PromptBuilderSection
                  imageUrl={primaryAsset?.originalFile.url}
                  onPromptChange={handlePromptChange}
                  value={generatedPrompt}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="model" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Select AI Model</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose the AI model that best fits your needs
                </p>
                <ModelSelector
                  selectedModel={selectedModel}
                  onSelectModel={onSelectModel}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Model Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Fine-tune the model parameters for your animation
                </p>
                <ModelInputFields
                  model={selectedModel}
                  values={modelInputs}
                  onChange={onModelInputsChange}
                  imageUrl={primaryAsset?.originalFile.url}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="formats" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Output Formats</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the formats and resolutions for your animated videos
                </p>
                <FormatSelector
                  selectedFormats={selectedFormats}
                  onSelectFormats={onSelectFormats}
                  selectedAssets={selectedAssetObjects}
                />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Right Panel - Preview and Actions */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI Animation Preview</h2>
          {primaryAsset && selectedFormats.length > 0 ? (
            <div className="space-y-4">
              {/* Static preview with AI indicators */}
              <div className="relative">
                <PreviewPanel
                  asset={primaryAsset}
                  animation={{
                    id: 'ai-generated',
                    name: 'AI Generated',
                    type: 'ai',
                    movements: [],
                    duration: 5,
                    loop: false
                  }}
                  format={selectedFormats[0]}
                />
                <Badge className="absolute top-2 right-2" variant="secondary">
                  <Icons.sparkles className="mr-1 h-3 w-3" />
                  AI Preview
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>The AI will generate unique motion based on your prompt.</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">
                {!primaryAsset ? 'Select an asset to preview' : 'Select a format to preview'}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">AI Generation Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selected Assets</span>
              <Badge variant="secondary">{selectedAssets.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Model</span>
              <Badge variant="secondary">{selectedModel.name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Output Formats</span>
              <Badge variant="secondary">{selectedFormats.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prompt Length</span>
              <Badge variant="secondary">{generatedPrompt.length} chars</Badge>
            </div>
            {selectedModel.costPerGeneration > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Cost</span>
                <Badge>
                  ${(selectedModel.costPerGeneration * selectedAssets.length * selectedFormats.length).toFixed(2)}
                </Badge>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-2">
            <Button 
              className="w-full" 
              onClick={onStartProcessing}
              disabled={
                selectedAssets.length === 0 || 
                selectedFormats.length === 0 || 
                !generatedPrompt.trim()
              }
            >
              <Icons.sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
            
            <Button variant="outline" className="w-full">
              <Icons.download className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
          </div>

          {(!generatedPrompt.trim() && selectedAssets.length > 0) && (
            <p className="text-xs text-destructive text-center">
              Please create a prompt before generating
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}