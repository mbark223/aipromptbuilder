'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from '@/components/static-to-motion/ImageUploader';
import { AnimationTemplates } from '@/components/static-to-motion/AnimationTemplates';
import { AnimationWorkshop } from '@/components/static-to-motion/AnimationWorkshop';
import { ProcessingQueue } from '@/components/static-to-motion/ProcessingQueue';
import { StaticAsset, AnimationProfile, Format, QueueItem } from '@/types';
import { PRESET_FORMATS, ANIMATION_TEMPLATES } from '@/types';

export default function StaticToMotionPage() {
  const [assets, setAssets] = useState<StaticAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<Format[]>([PRESET_FORMATS[0]]);
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationProfile>(ANIMATION_TEMPLATES[0]);
  const [processingQueue, setProcessingQueue] = useState<QueueItem[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'workshop' | 'queue'>('upload');

  const handleFilesUploaded = (newAssets: StaticAsset[]) => {
    setAssets([...assets, ...newAssets]);
    if (newAssets.length > 0) {
      setSelectedAssets([newAssets[0].id]);
      setActiveView('workshop');
    }
  };

  const handleStartProcessing = () => {
    const selectedAssetObjects = assets.filter(a => selectedAssets.includes(a.id));
    const newQueueItems = selectedAssetObjects.map(asset => ({
      id: `${asset.id}-${Date.now()}`,
      assetId: asset.id,
      asset,
      formats: selectedFormats,
      animation: selectedAnimation,
      status: 'pending' as const,
      progress: 0
    }));
    
    setProcessingQueue([...processingQueue, ...newQueueItems]);
    setActiveView('queue');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Static-to-Motion Converter</h1>
        <p className="text-muted-foreground">
          Transform static images into engaging animated videos with AI-powered motion
        </p>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'upload' | 'workshop' | 'queue')}>
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="workshop" disabled={assets.length === 0}>
            Workshop ({selectedAssets.length})
          </TabsTrigger>
          <TabsTrigger value="queue" disabled={processingQueue.length === 0}>
            Queue ({processingQueue.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Static Images</h2>
            <ImageUploader onFilesUploaded={handleFilesUploaded} />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Animation Templates</h2>
            <AnimationTemplates
              selectedAnimation={selectedAnimation}
              onSelectAnimation={setSelectedAnimation}
            />
          </Card>
        </TabsContent>

        <TabsContent value="workshop" className="space-y-6">
          <AnimationWorkshop
            assets={assets}
            selectedAssets={selectedAssets}
            onSelectAssets={setSelectedAssets}
            selectedFormats={selectedFormats}
            onSelectFormats={setSelectedFormats}
            selectedAnimation={selectedAnimation}
            onSelectAnimation={setSelectedAnimation}
            onStartProcessing={handleStartProcessing}
          />
        </TabsContent>

        <TabsContent value="queue">
          <ProcessingQueue
            queue={processingQueue}
            onUpdateQueue={setProcessingQueue}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}