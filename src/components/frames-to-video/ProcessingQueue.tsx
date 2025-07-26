'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';
import { Veo2QueueItem } from '@/types';
import { VideoPreview } from '@/components/static-to-motion/VideoPreview';

interface ProcessingQueueProps {
  queue: Veo2QueueItem[];
  onUpdateQueue: (queue: Veo2QueueItem[]) => void;
}

export function ProcessingQueue({ queue, onUpdateQueue }: ProcessingQueueProps) {
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  useEffect(() => {
    // Find next pending item to process
    const pendingItem = queue.find(item => item.status === 'pending');
    if (pendingItem && !processingItem) {
      processItem(pendingItem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, processingItem]);

  const processItem = async (item: Veo2QueueItem) => {
    setProcessingItem(item.id);
    
    // Update status to processing
    updateItemStatus(item.id, 'processing', 0);

    // Simulate processing with progress updates
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      updateItemStatus(item.id, 'processing', progress);
    }

    // Mark as completed with mock video URL
    const updatedQueue = queue.map(qItem => {
      if (qItem.id === item.id) {
        return {
          ...qItem,
          status: 'completed' as const,
          progress: 100,
          outputUrl: 'https://example.com/interpolated-video.mp4', // Mock URL
          completedAt: new Date()
        };
      }
      return qItem;
    });

    onUpdateQueue(updatedQueue);
    setProcessingItem(null);
  };

  const updateItemStatus = (id: string, status: Veo2QueueItem['status'], progress: number) => {
    const updatedQueue = queue.map(item => {
      if (item.id === id) {
        return { ...item, status, progress };
      }
      return item;
    });
    onUpdateQueue(updatedQueue);
  };

  const handleRetry = (item: Veo2QueueItem) => {
    updateItemStatus(item.id, 'pending', 0);
  };

  const handleRemove = (id: string) => {
    onUpdateQueue(queue.filter(item => item.id !== id));
  };

  const pendingCount = queue.filter(item => item.status === 'pending').length;
  const processingCount = queue.filter(item => item.status === 'processing').length;
  const completedCount = queue.filter(item => item.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Processing</p>
            <p className="text-2xl font-bold text-blue-600">{processingCount}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {queue.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">Frame Interpolation</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      item.status === 'completed' ? 'success' :
                      item.status === 'processing' ? 'default' :
                      item.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {item.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {item.config.duration}s @ {item.config.fps}fps
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(item)}
                    >
                      <Icons.refresh className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Icons.x className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                  <img 
                    src={item.frameAsset.frame1.originalFile.url} 
                    alt="Start frame"
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute bottom-2 left-2" variant="secondary">
                    Start
                  </Badge>
                </div>
                <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                  <img 
                    src={item.frameAsset.frame2.originalFile.url} 
                    alt="End frame"
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute bottom-2 left-2" variant="secondary">
                    End
                  </Badge>
                </div>
              </div>

              {item.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing frames...</span>
                    <span>{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} />
                </div>
              )}

              {item.status === 'completed' && item.outputUrl && (
                <VideoPreview
                  url={item.outputUrl}
                  format={{ 
                    aspectRatio: item.frameAsset.frame1.originalFile.dimensions?.aspectRatio || '16:9',
                    width: item.frameAsset.frame1.originalFile.dimensions?.width || 1920,
                    height: item.frameAsset.frame1.originalFile.dimensions?.height || 1080,
                    name: 'Interpolated Video'
                  }}
                  metadata={{
                    duration: item.config.duration,
                    fps: item.config.fps,
                    interpolationType: item.config.interpolationType,
                    transitionStyle: item.config.transitionStyle
                  }}
                />
              )}
            </div>
          </Card>
        ))}

        {queue.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No videos in queue</h3>
            <p className="text-sm text-muted-foreground">
              Upload frames and configure settings to start generating videos
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}