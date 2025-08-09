'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptInput } from '@/components/prompt-to-video/PromptInput';
import { ModelConfiguration } from '@/components/prompt-to-video/ModelConfiguration';
import { VideoGenerationPanel } from '@/components/prompt-to-video/VideoGenerationPanel';
import { ProcessingQueue } from '@/components/static-to-motion/ProcessingQueue';
import { AnimationModel, QueueItem, Format } from '@/types';
import { getTextToVideoModels } from '@/lib/video-models';

// Default formats for video generation - optimized for betting content
const DEFAULT_FORMATS: Format[] = [
  { aspectRatio: '1:1', width: 1080, height: 1080, name: '1:1 Square (Social Feed)', custom: false },
  { aspectRatio: '9:16', width: 1080, height: 1920, name: '9:16 Vertical (Stories/Reels)', custom: false },
  { aspectRatio: '16:9', width: 1920, height: 1080, name: '16:9 Horizontal (Web/Desktop)', custom: false },
  { aspectRatio: '4:5', width: 864, height: 1080, name: '4:5 Portrait (Feed)', custom: false },
];

export default function PromptToVideoPage() {
  const textToVideoModels = getTextToVideoModels();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<AnimationModel>(textToVideoModels[0]);
  // Default to both 1:1 and 9:16 formats for multi-format generation
  const [selectedFormats, setSelectedFormats] = useState<Format[]>([DEFAULT_FORMATS[0], DEFAULT_FORMATS[1]]);
  const [modelInputs, setModelInputs] = useState<Record<string, string | number | boolean | null>>({});
  const [processingQueue, setProcessingQueue] = useState<QueueItem[]>([]);
  const [activeView, setActiveView] = useState<'create' | 'configure' | 'queue'>('create');
  const [videosPerPrompt, setVideosPerPrompt] = useState(1);

  const handlePromptsGenerated = (generatedPrompts: string[]) => {
    setPrompts(generatedPrompts);
    if (generatedPrompts.length > 0) {
      setActiveView('configure');
    }
  };

  const handleStartProcessing = () => {
    const newQueueItems: QueueItem[] = [];
    
    prompts.forEach((prompt, promptIndex) => {
      for (let videoIndex = 0; videoIndex < videosPerPrompt; videoIndex++) {
        const timestamp = Date.now();
        const uniqueId = `prompt-${timestamp}-${promptIndex}-${videoIndex}`;
        
        newQueueItems.push({
          id: uniqueId,
          assetId: `prompt-asset-${timestamp}-${promptIndex}-${videoIndex}`,
          asset: {
            id: `prompt-asset-${timestamp}-${promptIndex}-${videoIndex}`,
            projectId: 'current-project',
            originalFile: {
              url: '',
              name: `prompt-${promptIndex + 1}${videosPerPrompt > 1 ? `-v${videoIndex + 1}` : ''}`,
              size: 0,
              format: 'mp4' as 'jpg' | 'png' | 'webp' | 'svg',
              dimensions: {
                width: 1920,
                height: 1080,
                aspectRatio: '16:9'
              }
            },
            processedVersions: [],
            animationProfile: {
              id: 'prompt-animation',
              name: 'Prompt to Video',
              type: 'ai',
              movements: [],
              duration: 4,
              loop: false,
              transitions: {
                in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
                out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
              }
            },
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
            type: 'ai',
            movements: [],
            duration: 4,
            fps: 30,
            loop: false,
            transitions: {
              in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
              out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
            }
          },
          animationType: 'ai',
          model: selectedModel,
          prompt: prompt,
          status: 'pending',
          progress: 0
        });
      }
    });
    
    setProcessingQueue([...processingQueue, ...newQueueItems]);
    setActiveView('queue');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Prompt → Video</h1>
        <p className="text-muted-foreground">
          Generate videos directly from text prompts using AI models - create multiple formats (1:1, 9:16) from the same prompt
        </p>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'create' | 'configure' | 'queue')}>
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
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              selectedFormats={selectedFormats}
              onSelectFormats={setSelectedFormats}
              modelInputs={modelInputs}
              onModelInputsChange={setModelInputs}
              videosPerPrompt={videosPerPrompt}
              onVideosPerPromptChange={setVideosPerPrompt}
            />
          </Card>

          {prompts.length > 0 && (
            <VideoGenerationPanel
              prompts={prompts}
              onUpdatePrompts={setPrompts}
              selectedModel={selectedModel}
              selectedFormats={selectedFormats}
              videosPerPrompt={videosPerPrompt}
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