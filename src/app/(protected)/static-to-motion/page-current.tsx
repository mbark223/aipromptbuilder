'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from '@/components/static-to-motion/ImageUploader';
import { AnimationTypeSelector } from '@/components/static-to-motion/AnimationTypeSelector';
import { AIAnimationWorkshopSimple } from '@/components/static-to-motion/AIAnimationWorkshopSimple';
import { StaticAsset, Format, QueueItem, AnimationModel } from '@/types';

// Default model (Veo-3)
const DEFAULT_MODEL: AnimationModel = {
  id: 'google-veo-3',
  name: 'Veo-3',
  provider: 'Google',
  description: 'Premium quality video generation with native audio',
  capabilities: ['Text-to-Video', 'Native Audio', 'Premium Quality'],
  speed: 'moderate',
  quality: 'very-high',
  costPerGeneration: 0,
  replicateId: 'google/veo-3',
  pricing: 'Premium Quality',
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
  const [selectedModel, setSelectedModel] = useState<AnimationModel>(DEFAULT_MODEL);
  const [modelInputs, setModelInputs] = useState<Record<string, string | number | boolean | null>>({});
  const [processingQueue, setProcessingQueue] = useState<QueueItem[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'type-selection' | 'workshop' | 'queue'>('upload');
  const [animationType, setAnimationType] = useState<'ai' | 'generic' | null>(null);

  const handleFilesUploaded = (newAssets: StaticAsset[]) => {
    setAssets(prev => [...prev, ...newAssets]);
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
      
      setActiveView('type-selection');
    }
  };

  const handleStartProcessing = () => {
    const selectedAssetObjects = assets.filter(a => selectedAssets.includes(a.id));
    const newQueueItems = selectedAssetObjects.map(asset => ({
      id: `${asset.id}-${Date.now()}`,
      assetId: asset.id,
      asset,
      formats: selectedFormats,
      animationType: animationType || 'ai' as const,
      model: animationType === 'ai' ? selectedModel : undefined,
      prompt: animationType === 'ai' ? modelInputs.prompt as string : undefined,
      status: 'pending' as const,
      progress: 0
    }));
    
    setProcessingQueue(prev => [...prev, ...newQueueItems]);
    setActiveView('queue');
  };

  // Calculate counts safely
  const assetsCount = assets.length;
  const selectedCount = selectedAssets.length;
  const queueCount = processingQueue.length;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Static-to-Motion Converter</h1>
        <p className="text-muted-foreground">
          Transform static images into engaging animated videos with AI-powered motion
        </p>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'upload' | 'type-selection' | 'workshop' | 'queue')}>
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="type-selection" disabled={assetsCount === 0}>
            Animation Type
          </TabsTrigger>
          <TabsTrigger value="workshop" disabled={assetsCount === 0 || !animationType}>
            Workshop {selectedCount > 0 && `(${selectedCount})`}
          </TabsTrigger>
          <TabsTrigger value="queue" disabled={queueCount === 0}>
            Queue {queueCount > 0 && `(${queueCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Static Images</h2>
            <ImageUploader onFilesUploaded={handleFilesUploaded} />
          </Card>
        </TabsContent>

        <TabsContent value="type-selection" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Choose Animation Method</h2>
            <p className="text-muted-foreground">
              Select how you&apos;d like to animate your uploaded {assetsCount === 1 ? 'image' : 'images'}
            </p>
          </div>
          <AnimationTypeSelector 
            onSelectType={(type) => {
              setAnimationType(type);
              setActiveView('workshop');
            }}
          />
        </TabsContent>

        <TabsContent value="workshop" className="space-y-6">
          {animationType === 'ai' ? (
            <AIAnimationWorkshopSimple
              assets={assets}
              selectedAssets={selectedAssets}
              onSelectAssets={setSelectedAssets}
              selectedFormats={selectedFormats}
              onSelectFormats={setSelectedFormats}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              modelInputs={modelInputs}
              onModelInputsChange={setModelInputs}
              onStartProcessing={handleStartProcessing}
              onBack={() => setActiveView('type-selection')}
            />
          ) : animationType === 'generic' ? (
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Generic Animation Workshop</h2>
              <p className="text-muted-foreground">Template-based animations coming soon</p>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="queue">
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Processing Queue</h2>
            <p className="text-muted-foreground">
              {queueCount > 0 ? `${queueCount} items in queue` : 'No items in queue'}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}