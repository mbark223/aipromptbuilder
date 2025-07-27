'use client';

import { useState, useEffect } from 'react';
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

// Default model - Using a verified Replicate model with exact version
const DEFAULT_MODEL: AnimationModel = {
  id: 'stable-video-diffusion',
  name: 'Stable Video Diffusion',
  provider: 'Stability AI',
  description: 'Image-to-video generation with stable diffusion',
  capabilities: ['Image-to-Video', 'High Quality'],
  speed: 'moderate',
  quality: 'high',
  costPerGeneration: 0,
  replicateId: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
  pricing: 'Standard',
  inputs: [
    {
      name: 'input_image',
      type: 'image',
      label: 'Input Image',
      required: true,
      placeholder: 'The image to animate'
    },
    {
      name: 'sizing_strategy',
      type: 'select',
      label: 'Sizing Strategy',
      required: false,
      options: [
        { value: 'maintain_aspect_ratio', label: 'Maintain Aspect Ratio' },
        { value: 'crop_to_16_9', label: 'Crop to 16:9' },
        { value: 'use_image_dimensions', label: 'Use Image Dimensions' }
      ],
      defaultValue: 'maintain_aspect_ratio'
    },
    {
      name: 'frames_per_second',
      type: 'number',
      label: 'FPS',
      required: false,
      defaultValue: 6,
      min: 1,
      max: 30
    },
    {
      name: 'motion_bucket_id',
      type: 'number',
      label: 'Motion Amount',
      required: false,
      defaultValue: 127,
      min: 1,
      max: 255
    },
    {
      name: 'cond_aug',
      type: 'number',
      label: 'Conditioning Augmentation',
      required: false,
      defaultValue: 0.02,
      min: 0,
      max: 1
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
    const newQueueItems = selectedAssetObjects.map((asset) => ({
      id: `${asset.id}-${Date.now()}`,
      assetId: asset.id,
      asset,
      formats: selectedFormats,
      animationType: animationType || 'ai' as const,
      model: animationType === 'ai' ? selectedModel : undefined,
      prompt: animationType === 'ai' ? modelInputs.prompt as string : undefined,
      modelInputs: animationType === 'ai' ? modelInputs : undefined,
      status: 'pending' as const,
      progress: 0
    }));
    
    setProcessingQueue(prev => [...prev, ...newQueueItems]);
    setActiveView('queue');
  };
  
  // Process pending queue items
  useEffect(() => {
    let isProcessing = false;
    
    const processPendingItems = async () => {
      if (isProcessing) return; // Prevent concurrent processing
      
      const pendingItems = processingQueue.filter(item => item.status === 'pending');
      if (pendingItems.length === 0) return;
      
      isProcessing = true;
      
      for (const item of pendingItems) {
        if (!item.model) continue;
        
        // Check if model has required inputs
        const hasRequiredInputs = item.model.inputs?.every(input => {
          if (!input.required) return true;
          if (input.type === 'image') return item.asset.originalFile.url;
          if (input.name === 'prompt') return item.prompt || item.modelInputs?.prompt;
          return item.modelInputs?.[input.name] !== undefined;
        }) ?? true;
        
        try {
          // Update status to processing
          setProcessingQueue(prev => prev.map(q => 
            q.id === item.id ? { ...q, status: 'processing' as const, progress: 10 } : q
          ));
          
          // Prepare the request payload
          const inputData: Record<string, string | number | boolean> = {};
          
          // Add values based on model inputs configuration
          item.model.inputs?.forEach(input => {
            // First check if we have a value from modelInputs
            const userValue = item.modelInputs?.[input.name];
            
            if (userValue !== undefined && userValue !== null && userValue !== '') {
              // Use the user-provided value
              if (input.type === 'number' && typeof userValue === 'string') {
                inputData[input.name] = parseFloat(userValue);
              } else if (input.type === 'select' && input.name === 'duration' && typeof userValue === 'string') {
                // For ByteDance duration field, convert to number
                inputData[input.name] = parseInt(userValue, 10);
              } else {
                inputData[input.name] = userValue;
              }
            } else if (input.type === 'image' && item.asset.originalFile.url) {
              // Use the uploaded image for image inputs
              inputData[input.name] = item.asset.originalFile.url;
            } else if (input.name === 'prompt' && item.prompt) {
              // Use the prompt from the queue item
              inputData[input.name] = item.prompt;
            } else if (input.defaultValue !== undefined) {
              // Fall back to default value
              if (input.type === 'number' && typeof input.defaultValue === 'string') {
                inputData[input.name] = parseInt(input.defaultValue as string, 10);
              } else if (input.type === 'select' && typeof input.defaultValue === 'string') {
                // Some models expect integers for duration even in select fields
                const numValue = parseInt(input.defaultValue as string, 10);
                inputData[input.name] = isNaN(numValue) ? input.defaultValue : numValue;
              } else {
                inputData[input.name] = input.defaultValue;
              }
            }
          });
          
          // For models that don't have prompt in their inputs but support text-to-video
          if (!inputData.prompt && item.prompt && item.model.capabilities.includes('Text-to-Video')) {
            inputData.prompt = item.prompt;
          }
          
          const payload = {
            modelId: item.model.replicateId,
            input: inputData
          };
          
          // Log the payload for debugging
          console.log('Sending to Replicate API:', {
            modelId: payload.modelId,
            inputKeys: Object.keys(payload.input),
            prompt: typeof payload.input.prompt === 'string' ? payload.input.prompt.substring(0, 100) + '...' : payload.input.prompt,
            hasImage: 'image' in payload.input || 'input_image' in payload.input
          });
          
          // Make the API call to Replicate
          const response = await fetch('/api/replicate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Replicate API error:', errorData);
            const errorMessage = errorData.error || errorData.details?.detail || errorData.detail || 'Failed to generate video';
            throw new Error(errorMessage);
          }
          
          const prediction = await response.json();
          
          // Poll for completion
          let result = prediction;
          while (result.status === 'starting' || result.status === 'processing') {
            // Update progress
            const progress = result.status === 'starting' ? 20 : 50;
            setProcessingQueue(prev => prev.map(q => 
              q.id === item.id ? { ...q, progress } : q
            ));
            
            // Wait before polling again
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check prediction status
            const statusResponse = await fetch(`/api/replicate?id=${result.id}`);
            if (!statusResponse.ok) {
              throw new Error('Failed to check prediction status');
            }
            result = await statusResponse.json();
          }
          
          if (result.status === 'succeeded' && result.output) {
            // Update with the output
            const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
            setProcessingQueue(prev => prev.map(q => 
              q.id === item.id ? { 
                ...q, 
                status: 'completed' as const, 
                progress: 100,
                outputs: [{ format: 'mp4', url: outputUrl }]
              } : q
            ));
          } else if (result.status === 'failed') {
            throw new Error(result.error || 'Prediction failed');
          }
          
        } catch (error) {
          console.error('Processing failed:', error);
          setProcessingQueue(prev => prev.map(q => 
            q.id === item.id ? { 
              ...q, 
              status: 'failed' as const, 
              error: error instanceof Error ? error.message : 'Processing failed'
            } : q
          ));
        }
      }
      
      isProcessing = false;
    };
    
    // Check for pending items every 2 seconds
    const interval = setInterval(processPendingItems, 2000);
    processPendingItems(); // Run immediately
    
    return () => clearInterval(interval);
  }, [processingQueue]);

  const handleExport = async (item: QueueItem, format: Format) => {
    if (!item.outputs || item.outputs.length === 0) return;
    
    try {
      // Get the video URL
      const videoUrl = item.outputs[0].url;
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${item.asset.originalFile.name.split('.')[0]}_animated_${format.width}x${format.height}.mp4`;
      link.target = '_blank';
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message (you can add a toast notification here)
      console.log('Export started for:', item.asset.originalFile.name);
    } catch (error) {
      console.error('Export failed:', error);
    }
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
                        
                        {/* Error message */}
                        {item.status === 'failed' && item.error && (
                          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                            {item.error}
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
                              // Reset status to pending for retry
                              setProcessingQueue(prev => prev.map(q => 
                                q.id === item.id ? { ...q, status: 'pending' as const, progress: 0, error: undefined } : q
                              ));
                            }}>
                              <Icons.rotateCcw className="h-4 w-4 mr-1" />
                              Retry
                            </Button>
                          )}
                          {item.status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => {
                              // Remove from queue
                              setProcessingQueue(prev => prev.filter(q => q.id !== item.id));
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