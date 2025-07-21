'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from '@/components/static-to-motion/ImageUploader';
import { AnimationTemplates } from '@/components/static-to-motion/AnimationTemplates';
import { AnimationWorkshop } from '@/components/static-to-motion/AnimationWorkshop';
import { ProcessingQueue } from '@/components/static-to-motion/ProcessingQueue';
import { StaticAsset, AnimationProfile, Format, QueueItem, AnimationModel } from '@/types';
import { PRESET_FORMATS, ANIMATION_TEMPLATES } from '@/types';

// Default model (Veo-3-Fast)
const DEFAULT_MODEL: AnimationModel = {
  id: 'google-veo-3-fast',
  name: 'Veo-3-Fast',
  provider: 'Google',
  description: 'Faster/cheaper option with native audio support',
  capabilities: ['Text-to-Video', 'Native Audio', 'Fast Generation'],
  speed: 'fast',
  quality: 'high',
  costPerGeneration: 0,
  replicateId: 'google/veo-3-fast',
  pricing: 'Faster/Cheaper',
  inputs: [
    {
      name: 'prompt',
      type: 'text',
      label: 'Prompt',
      required: true,
      placeholder: 'Describe the video you want to generate...'
    },
    {
      name: 'negative_prompt',
      type: 'text',
      label: 'Negative Prompt',
      required: false,
      placeholder: 'What to avoid in the generation...'
    },
    {
      name: 'seed',
      type: 'number',
      label: 'Seed',
      required: false,
      placeholder: 'Random seed for reproducibility'
    }
  ]
};

export default function StaticToMotionPage() {
  const [assets, setAssets] = useState<StaticAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<Format[]>([]);
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationProfile>(ANIMATION_TEMPLATES[0]);
  const [selectedModel, setSelectedModel] = useState<AnimationModel>(DEFAULT_MODEL);
  const [modelInputs, setModelInputs] = useState<Record<string, any>>({});
  const [processingQueue, setProcessingQueue] = useState<QueueItem[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'workshop' | 'queue'>('upload');

  const handleFilesUploaded = (newAssets: StaticAsset[]) => {
    setAssets([...assets, ...newAssets]);
    if (newAssets.length > 0) {
      setSelectedAssets([newAssets[0].id]);
      
      // Set the original format as default
      const firstAsset = newAssets[0];
      if (firstAsset.originalFile.dimensions) {
        const originalFormat: Format = {
          aspectRatio: firstAsset.originalFile.dimensions.aspectRatio || '16:9',
          width: firstAsset.originalFile.dimensions.width || 1920,
          height: firstAsset.originalFile.dimensions.height || 1080,
          name: 'Original',
          custom: true
        };
        setSelectedFormats([originalFormat]);
      }
      
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
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            modelInputs={modelInputs}
            onModelInputsChange={setModelInputs}
            onStartProcessing={handleStartProcessing}
          />
        </TabsContent>

        <TabsContent value="queue">
          <ProcessingQueue
            queue={processingQueue}
            onUpdateQueue={setProcessingQueue}
            model={selectedModel}
            modelInputs={modelInputs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}