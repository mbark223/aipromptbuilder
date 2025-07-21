'use client';

import { StaticAsset, AnimationProfile, Format } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormatSelector } from './FormatSelector';
import { AnimationTemplates } from './AnimationTemplates';
import { AssetGrid } from './AssetGrid';
import { PreviewPanel } from './PreviewPanel';
import { Icons } from '@/components/icons';

interface AnimationWorkshopProps {
  assets: StaticAsset[];
  selectedAssets: string[];
  onSelectAssets: (ids: string[]) => void;
  selectedFormats: Format[];
  onSelectFormats: (formats: Format[]) => void;
  selectedAnimation: AnimationProfile;
  onSelectAnimation: (animation: AnimationProfile) => void;
  onStartProcessing: () => void;
}

export function AnimationWorkshop({
  assets,
  selectedAssets,
  onSelectAssets,
  selectedFormats,
  onSelectFormats,
  selectedAnimation,
  onSelectAnimation,
  onStartProcessing
}: AnimationWorkshopProps) {
  const selectedAssetObjects = assets.filter(a => selectedAssets.includes(a.id));
  const primaryAsset = selectedAssetObjects[0];

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
          <Tabs defaultValue="formats" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="formats">Formats</TabsTrigger>
              <TabsTrigger value="animation">Animation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formats" className="space-y-4">
              <FormatSelector
                selectedFormats={selectedFormats}
                onSelectFormats={onSelectFormats}
              />
            </TabsContent>
            
            <TabsContent value="animation" className="space-y-4">
              <AnimationTemplates
                selectedAnimation={selectedAnimation}
                onSelectAnimation={onSelectAnimation}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Right Panel - Preview and Actions */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          {primaryAsset ? (
            <PreviewPanel
              asset={primaryAsset}
              animation={selectedAnimation}
              format={selectedFormats[0]}
            />
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Select an asset to preview</p>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Processing Summary</h3>
          
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

          <div className="pt-2 space-y-2">
            <Button 
              className="w-full" 
              onClick={onStartProcessing}
              disabled={selectedAssets.length === 0 || selectedFormats.length === 0}
            >
              <Icons.play className="mr-2 h-4 w-4" />
              Start Processing
            </Button>
            
            <Button variant="outline" className="w-full">
              <Icons.wand2 className="mr-2 h-4 w-4" />
              Generate AI Prompts
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}