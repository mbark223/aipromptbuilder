'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FramesUploader } from '@/components/frames-to-video/FramesUploader';
import { ConfigPanel } from '@/components/frames-to-video/ConfigPanel';
import { ProcessingQueue } from '@/components/frames-to-video/ProcessingQueue';
import { Preview } from '@/components/frames-to-video/Preview';
import { StaticAsset, Veo2FrameAsset, Veo2InterpolationConfig, Veo2QueueItem, AnimationModel } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { getFrameInterpolationModels } from '@/lib/video-models';
import { ModelSelector } from '@/components/static-to-motion/ModelSelector';
import { Label } from '@/components/ui/label';

export default function FramesToVideoPage() {
  const frameInterpolationModels = getFrameInterpolationModels();
  const defaultModel = frameInterpolationModels.find(m => m.id === 'veo-2-fast') || frameInterpolationModels[0];
  const [frameAssets, setFrameAssets] = useState<Veo2FrameAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [interpolationConfig, setInterpolationConfig] = useState<Veo2InterpolationConfig>({
    duration: 3,
    fps: 30,
    interpolationType: 'smooth',
    transitionStyle: 'blend'
  });
  const [processingQueue, setProcessingQueue] = useState<Veo2QueueItem[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'configure' | 'process' | 'preview'>('upload');
  const [selectedModel, setSelectedModel] = useState<AnimationModel>(defaultModel);

  const handleFramesUploaded = (frame1: StaticAsset, frame2: StaticAsset) => {
    const newFrameAsset: Veo2FrameAsset = {
      id: `veo2-${Date.now()}`,
      frame1,
      frame2,
      interpolationSettings: interpolationConfig
    };
    
    setFrameAssets([...frameAssets, newFrameAsset]);
    setSelectedAsset(newFrameAsset.id);
    setActiveView('configure');
  };

  const handleStartProcessing = () => {
    const selectedFrameAsset = frameAssets.find(fa => fa.id === selectedAsset);
    if (!selectedFrameAsset) return;

    const newQueueItem: Veo2QueueItem = {
      id: `queue-${Date.now()}`,
      frameAsset: selectedFrameAsset,
      config: interpolationConfig,
      status: 'pending',
      progress: 0
    };
    
    setProcessingQueue([...processingQueue, newQueueItem]);
    setActiveView('process');
  };

  const selectedFrameAsset = frameAssets.find(fa => fa.id === selectedAsset);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Frames → Video</h1>
        <p className="text-muted-foreground">
          Create smooth videos by interpolating between two frames of the same size
        </p>
      </div>

      <Alert className="border-green-500/50 bg-green-500/10">
        <Icons.info className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong>Veo-2 Fast is now available!</strong> This model is optimized specifically for frame interpolation, 
          providing smooth transitions between your uploaded frames. It offers faster processing times while maintaining 
          high quality output. Select your model below to get started.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Video Model</Label>
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>{selectedModel.name}</strong> - {selectedModel.description}
          </div>
        </div>
      </Card>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'upload' | 'configure' | 'process' | 'preview')}>
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="upload">Upload Frames</TabsTrigger>
          <TabsTrigger value="configure" disabled={!selectedAsset}>
            Configure
          </TabsTrigger>
          <TabsTrigger value="process" disabled={processingQueue.length === 0}>
            Process ({processingQueue.length})
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedAsset}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Two Frames</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload two images of the same dimensions to create an interpolated video
            </p>
            <FramesUploader onFramesUploaded={handleFramesUploaded} />
          </Card>
        </TabsContent>

        <TabsContent value="configure" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Interpolation Settings</h2>
            <ConfigPanel
              config={interpolationConfig}
              onConfigChange={setInterpolationConfig}
              onStartProcessing={handleStartProcessing}
              frameAsset={selectedFrameAsset}
            />
          </Card>
        </TabsContent>

        <TabsContent value="process">
          <ProcessingQueue
            queue={processingQueue}
            onUpdateQueue={setProcessingQueue}
          />
        </TabsContent>

        <TabsContent value="preview">
          {selectedFrameAsset && (
            <Preview frameAsset={selectedFrameAsset} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}