'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from '@/components/static-to-motion/ImageUploader';
import { AnimationTypeSelector } from '@/components/static-to-motion/AnimationTypeSelector';
import { AIAnimationWorkshopSimple } from '@/components/static-to-motion/AIAnimationWorkshopSimple';
import { VideoPreviewModal } from '@/components/static-to-motion/VideoPreviewModal';
import { StaticAsset, Format, AnimationModel, QueueItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

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
  const [activeView, setActiveView] = useState<'upload' | 'type-selection' | 'workshop' | 'queue'>('upload');
  const [assets, setAssets] = useState<StaticAsset[]>([]);
  const [animationType, setAnimationType] = useState<'ai' | 'generic' | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<Format[]>([]);
  const [selectedModel, setSelectedModel] = useState<AnimationModel>(DEFAULT_MODEL);
  const [modelInputs, setModelInputs] = useState<Record<string, string | number | boolean | null>>({});
  const [processingQueue, setProcessingQueue] = useState<QueueItem[]>([]);
  const [previewItem, setPreviewItem] = useState<QueueItem | null>(null);
  
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
    const newQueueItems = selectedAssetObjects.map((asset, index) => ({
      id: `${asset.id}-${Date.now()}`,
      assetId: asset.id,
      asset,
      formats: selectedFormats,
      animationType: animationType || 'ai' as const,
      model: animationType === 'ai' ? selectedModel : undefined,
      prompt: animationType === 'ai' ? modelInputs.prompt as string : undefined,
      status: index === 0 ? 'completed' as const : 'pending' as const,
      progress: index === 0 ? 100 : 0,
      // Temporary sample video for testing
      outputs: index === 0 ? [{ format: 'mp4', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }] : undefined
    }));
    
    setProcessingQueue(prev => [...prev, ...newQueueItems]);
    setActiveView('queue');
  };
  
  const handleExport = (item: QueueItem, format: Format) => {
    // TODO: Implement actual export functionality
    console.log('Exporting:', item, format);
  };

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
          <TabsTrigger value="type-selection" disabled={assets.length === 0}>
            Animation Type
          </TabsTrigger>
          <TabsTrigger value="workshop" disabled={assets.length === 0 || !animationType}>
            Workshop
          </TabsTrigger>
          <TabsTrigger value="queue" disabled={processingQueue.length === 0}>
            Queue {processingQueue.length > 0 && `(${processingQueue.length})`}
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
              Select how you&apos;d like to animate your uploaded {assets.length === 1 ? 'image' : 'images'}
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
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Generic Animation Workshop</h2>
              <p className="text-muted-foreground">Template-based animations coming soon</p>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="queue">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Processing Queue</h2>
            {processingQueue.length > 0 ? (
              <div className="space-y-4">
                {processingQueue.map((item) => {
                  const getStatusBadge = () => {
                    switch (item.status) {
                      case 'pending':
                        return <Badge variant="secondary">Pending</Badge>;
                      case 'processing':
                        return <Badge className="bg-blue-500">Processing</Badge>;
                      case 'completed':
                        return <Badge className="bg-green-500">Completed</Badge>;
                      case 'failed':
                        return <Badge className="bg-red-500">Failed</Badge>;
                      default:
                        return <Badge>{item.status}</Badge>;
                    }
                  };

                  return (
                    <Card key={item.id} className="p-4">
                      <div className="space-y-3">
                        {/* Header with status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img 
                                src={item.asset.originalFile.url} 
                                alt={item.asset.originalFile.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{item.asset.originalFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.model?.name || 'N/A'} • {item.formats.length} format{item.formats.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge()}
                        </div>

                        {/* Progress bar */}
                        {item.status === 'processing' && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress || 0}%` }}
                            />
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {item.status === 'completed' && item.outputs && item.outputs.length > 0 && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => {
                                setPreviewItem(item);
                              }}>
                                <Icons.eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button size="sm" onClick={() => {
                                // TODO: Implement export
                                console.log('Export:', item);
                              }}>
                                <Icons.download className="h-4 w-4 mr-1" />
                                Export
                              </Button>
                            </>
                          )}
                          {item.status === 'failed' && (
                            <Button size="sm" variant="outline" onClick={() => {
                              // TODO: Implement retry
                              console.log('Retry:', item);
                            }}>
                              <Icons.rotateCcw className="h-4 w-4 mr-1" />
                              Retry
                            </Button>
                          )}
                          {item.status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => {
                              // TODO: Implement cancel
                              console.log('Cancel:', item);
                            }}>
                              <Icons.x className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No items in queue</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Video Preview Modal */}
      <VideoPreviewModal
        item={previewItem}
        open={!!previewItem}
        onClose={() => setPreviewItem(null)}
        onExport={handleExport}
      />
    </div>
  );
}