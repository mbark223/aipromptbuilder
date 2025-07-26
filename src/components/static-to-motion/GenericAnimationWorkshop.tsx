'use client';

import { StaticAsset, AnimationProfile, Format, AnimationModel } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormatSelector } from './FormatSelector';
import { AnimationTemplatesSimple } from './AnimationTemplatesSimple';
import { AssetGrid } from './AssetGrid';
import { PreviewPanelV2 as PreviewPanel } from './PreviewPanelV2';
import { ElementSelectorV2 as ElementSelector, type CustomElement } from './ElementSelectorV2';
import { Icons } from '@/components/icons';
import { useState } from 'react';

interface AnimationWorkshopProps {
  assets: StaticAsset[];
  selectedAssets: string[];
  onSelectAssets: (ids: string[]) => void;
  selectedFormats: Format[];
  onSelectFormats: (formats: Format[]) => void;
  selectedAnimation: AnimationProfile;
  onSelectAnimation: (animation: AnimationProfile) => void;
  selectedModel: AnimationModel;
  onSelectModel: (model: AnimationModel) => void;
  modelInputs: Record<string, string | number | boolean | null>;
  onModelInputsChange: (inputs: Record<string, string | number | boolean | null>) => void;
  onStartProcessing: () => void;
}

export function GenericAnimationWorkshop({
  assets,
  selectedAssets,
  onSelectAssets,
  selectedFormats,
  onSelectFormats,
  selectedAnimation,
  onSelectAnimation,
  selectedModel: _selectedModel,
  onSelectModel: _onSelectModel,
  modelInputs: _modelInputs,
  onModelInputsChange: _onModelInputsChange,
  onStartProcessing
}: AnimationWorkshopProps) {
  const selectedAssetObjects = assets.filter(a => selectedAssets.includes(a.id));
  const primaryAsset = selectedAssetObjects[0];
  const [customElements, setCustomElements] = useState<CustomElement[]>([]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Asset Selection and Settings */}
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
          <Tabs defaultValue="animation" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="animation">Templates</TabsTrigger>
              <TabsTrigger value="formats">Formats</TabsTrigger>
              <TabsTrigger value="elements" disabled={selectedAnimation.id !== 'custom-elements'}>
                Custom Elements
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="formats" className="space-y-4">
              <FormatSelector
                selectedFormats={selectedFormats}
                onSelectFormats={onSelectFormats}
                selectedAssets={selectedAssetObjects}
              />
            </TabsContent>
            
            <TabsContent value="animation" className="space-y-4">
              <AnimationTemplatesSimple
                selectedAnimation={selectedAnimation}
                onSelectAnimation={onSelectAnimation}
              />
            </TabsContent>
            
            <TabsContent value="elements" className="space-y-4">
              {primaryAsset && (
                <ElementSelector
                  imageUrl={primaryAsset.originalFile.url}
                  onElementsChange={(elements: CustomElement[]) => {
                    setCustomElements(elements);
                    // Update the custom animation with user-selected elements
                    if (selectedAnimation.id === 'custom-elements') {
                      const updatedAnimation = {
                        ...selectedAnimation,
                        movements: elements
                          .filter(el => el.animation)
                          .map(el => {
                            if (!el.animation) return null;
                            return {
                              element: 'custom' as const,
                              type: el.animation.type,
                              intensity: el.animation.intensity,
                              direction: el.animation.direction,
                              timing: 'ease' as const,
                              customBounds: el.bounds
                            };
                          })
                          .filter((m): m is NonNullable<typeof m> => m !== null)
                      };
                      onSelectAnimation(updatedAnimation);
                    }
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Right Panel - Preview and Actions */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Template Preview</h2>
          {primaryAsset && selectedFormats.length > 0 ? (
            <PreviewPanel
              asset={primaryAsset}
              animation={selectedAnimation}
              format={selectedFormats[0]}
              customElements={selectedAnimation.id === 'custom-elements' ? customElements : undefined}
            />
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">
                {!primaryAsset ? 'Select an asset to preview' : 'Select a format to preview'}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Template Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selected Assets</span>
              <Badge variant="secondary">{selectedAssets.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Output Formats</span>
              <Badge variant="secondary">{selectedFormats.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Outputs</span>
              <Badge>{selectedAssets.length * selectedFormats.length}</Badge>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              className="w-full" 
              onClick={onStartProcessing}
              disabled={selectedAssets.length === 0 || selectedFormats.length === 0}
            >
              <Icons.play className="mr-2 h-4 w-4" />
              Apply Template Animation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}