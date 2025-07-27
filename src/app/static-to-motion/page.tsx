'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from '@/components/static-to-motion/ImageUploader';
import { StaticAsset } from '@/types';

export default function StaticToMotionPage() {
  const [activeView, setActiveView] = useState<'upload' | 'type-selection' | 'workshop' | 'queue'>('upload');
  const [assets, setAssets] = useState<StaticAsset[]>([]);
  
  const handleFilesUploaded = (newAssets: StaticAsset[]) => {
    setAssets(prev => [...prev, ...newAssets]);
    if (newAssets.length > 0) {
      setActiveView('type-selection');
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
          <TabsTrigger value="workshop" disabled={true}>
            Workshop
          </TabsTrigger>
          <TabsTrigger value="queue" disabled={true}>
            Queue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Static Images</h2>
            <ImageUploader onFilesUploaded={handleFilesUploaded} />
          </Card>
        </TabsContent>

        <TabsContent value="type-selection" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Choose Animation Method</h2>
            <p>AnimationTypeSelector will go here</p>
          </Card>
        </TabsContent>

        <TabsContent value="workshop" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Workshop</h2>
            <p>Workshop content will go here</p>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Processing Queue</h2>
            <p>Queue content will go here</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}