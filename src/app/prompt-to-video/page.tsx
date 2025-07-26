'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptInput } from '@/components/prompt-to-video/PromptInput';
import { ModelConfiguration } from '@/components/prompt-to-video/ModelConfiguration';
import { VideoGenerationPanel } from '@/components/prompt-to-video/VideoGenerationPanel';
import { ProcessingQueue } from '@/components/static-to-motion/ProcessingQueue';
import { AnimationModel, QueueItem, Format } from '@/types';
import { OPENROUTER_VIDEO_MODELS } from '@/lib/openrouter-models';

// Default formats for video generation
const DEFAULT_FORMATS: Format[] = [
  { aspectRatio: '16:9', width: 1920, height: 1080, name: '16:9 (1920x1080)' },
  { aspectRatio: '9:16', width: 1080, height: 1920, name: '9:16 (1080x1920)' },
  { aspectRatio: '1:1', width: 1080, height: 1080, name: '1:1 (1080x1080)' },
  { aspectRatio: '4:5', width: 864, height: 1080, name: '4:5 (864x1080)' },
];

export default function PromptToVideoPage() {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<AnimationModel>(OPENROUTER_VIDEO_MODELS[0]);
  const [selectedFormats, setSelectedFormats] = useState<Format[]>([DEFAULT_FORMATS[0]]);
  const [modelInputs, setModelInputs] = useState<Record<string, string | number | boolean | null>>({});
  const [processingQueue, setProcessingQueue] = useState<QueueItem[]>([]);
  const [activeView, setActiveView] = useState<'create' | 'configure' | 'queue'>('create');

  const handlePromptsGenerated = (generatedPrompts: string[]) => {
    setPrompts(generatedPrompts);
    if (generatedPrompts.length > 0) {
      setActiveView('configure');
    }
  };

  const handleStartProcessing = () => {
    const newQueueItems: QueueItem[] = prompts.map((prompt, index) => ({
      id: `prompt-${Date.now()}-${index}`,
      assetId: `prompt-asset-${Date.now()}-${index}`,
      asset: {
        id: `prompt-asset-${Date.now()}-${index}`,
        projectId: 'current-project',
        originalFile: {
          url: '',
          name: `prompt-${index + 1}`,
          size: 0,
          format: 'mp4' as any,
        },
        processedVersions: [],
        metadata: {
          uploaded: new Date(),
          author: 'current-user',
          tags: ['prompt-to-video'],
        }
      },
      formats: selectedFormats,
      animation: {
        id: 'prompt-animation',
        name: 'Prompt to Video',
        type: 'generated',
        parameters: {},
        duration: 4,
        fps: 30,
      },
      animationType: 'ai',
      model: selectedModel,
      prompt: prompt,
      status: 'pending',
      progress: 0
    }));
    
    setProcessingQueue([...processingQueue, ...newQueueItems]);
    setActiveView('queue');
  };

  const textToVideoModels = OPENROUTER_VIDEO_MODELS.filter(model => 
    model.capabilities.includes('Text-to-Video')
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Prompt → Video</h1>
        <p className="text-muted-foreground">
          Generate videos directly from text prompts using AI models
        </p>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="create">Create Prompts</TabsTrigger>
          <TabsTrigger value="configure" disabled={prompts.length === 0}>
            Configure ({prompts.length})
          </TabsTrigger>
          <TabsTrigger value="queue" disabled={processingQueue.length === 0}>
            Queue ({processingQueue.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Generate Video Prompts</h2>
            <PromptInput onPromptsGenerated={handlePromptsGenerated} />
          </Card>
        </TabsContent>

        <TabsContent value="configure" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Model & Format Configuration</h2>
            <ModelConfiguration
              models={textToVideoModels}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              selectedFormats={selectedFormats}
              onSelectFormats={setSelectedFormats}
              modelInputs={modelInputs}
              onModelInputsChange={setModelInputs}
            />
          </Card>

          {prompts.length > 0 && (
            <VideoGenerationPanel
              prompts={prompts}
              onUpdatePrompts={setPrompts}
              selectedModel={selectedModel}
              selectedFormats={selectedFormats}
              onStartProcessing={handleStartProcessing}
            />
          )}
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