'use client';

import { useState } from 'react';
import { AppLayout } from './app-layout';
import { FormatSelector } from '@/components/format/FormatSelector';
import { FormatPreview } from '@/components/format/FormatPreview';
import { PromptBuilder } from '@/components/prompt/PromptBuilder';
import { ConsistencyPanel } from '@/components/consistency/ConsistencyPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePrompts } from '@/hooks/usePrompts';
import type { Format, ConsistencySettings } from '@/types';

export default function Home() {
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [consistencySettings, setConsistencySettings] = useState<ConsistencySettings>({
    lockedParams: [],
    colorPalette: [],
  });
  const { createPrompt } = usePrompts();

  const handlePromptSave = (promptData: any) => {
    const prompt = createPrompt({
      ...promptData,
      consistency: consistencySettings,
    });
    console.log('Prompt saved:', prompt);
    // TODO: Add toast notification
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Prompt</h1>
          <p className="text-muted-foreground">
            Build and customize your AI video generation prompts
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="consistency">Consistency</TabsTrigger>
            <TabsTrigger value="batch">Batch Create</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <FormatSelector
                  selectedFormat={selectedFormat}
                  onFormatSelect={setSelectedFormat}
                />
                <PromptBuilder format={selectedFormat} onSave={handlePromptSave} />
              </div>
              <div>
                <FormatPreview format={selectedFormat} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="consistency" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConsistencyPanel
                settings={consistencySettings}
                onSettingsChange={setConsistencySettings}
              />
              <div>
                <h3 className="text-lg font-semibold mb-3">How Consistency Works</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Consistency settings help maintain visual coherence across multiple
                    prompts and variations. This is essential for creating cohesive
                    video campaigns.
                  </p>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Seed ID</h4>
                    <p>
                      Using the same seed ensures similar visual outputs across different
                      prompts, maintaining style and composition consistency.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Locked Parameters</h4>
                    <p>
                      Parameters marked as locked will remain constant across all
                      variations, while unlocked parameters can be modified for variety.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Color Palette</h4>
                    <p>
                      Define a consistent color scheme that will be applied across all
                      generated videos to maintain brand consistency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Batch Creation Coming Soon</h3>
              <p className="text-muted-foreground">
                Create multiple prompts across different formats simultaneously
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}