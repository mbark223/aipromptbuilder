'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';
import { useEffect } from 'react';
import { createReplicateService } from '@/lib/replicate';
import { QueueItem, AnimationModel } from '@/types';

interface ProcessingQueueProps {
  queue: QueueItem[];
  onUpdateQueue: (queue: QueueItem[]) => void;
  model: AnimationModel;
  modelInputs: Record<string, string | number | boolean | null>;
}

export function ProcessingQueue({ queue, onUpdateQueue, model, modelInputs }: ProcessingQueueProps) {
  // Process queue items with Replicate API
  useEffect(() => {
    const processingItem = queue.find(item => item.status === 'processing');
    
    if (!processingItem) {
      const pendingItem = queue.find(item => item.status === 'pending');
      if (pendingItem) {
        // Start processing next item
        onUpdateQueue(
          queue.map(item => 
            item.id === pendingItem.id 
              ? { ...item, status: 'processing' as const, startTime: new Date() }
              : item
          )
        );
      }
      return;
    }

    // Process with Replicate API
    const processItem = async () => {
      const replicateService = createReplicateService();
      
      if (!replicateService || !model.replicateId) {
        // Fallback to simulation if no API key or model doesn't support Replicate
        simulateProcessing();
        return;
      }

      try {
        // Process the video generation
        const result = await replicateService.generateVideo(model, {
          prompt: (modelInputs.prompt as string) || 'Generate a video',
          ...modelInputs,
          image: processingItem.asset.originalFile.url
        });

        // Update queue with success
        onUpdateQueue(
          queue.map(item => {
            if (item.id === processingItem.id) {
              return {
                ...item,
                progress: 100,
                status: 'completed' as const,
                endTime: new Date(),
                outputs: [{
                  format: 'Generated Video',
                  url: result.videoUrl
                }]
              };
            }
            return item;
          })
        );
      } catch (error) {
        // Update queue with error
        onUpdateQueue(
          queue.map(item => {
            if (item.id === processingItem.id) {
              return {
                ...item,
                status: 'failed' as const,
                error: error instanceof Error ? error.message : 'Processing failed',
                endTime: new Date()
              };
            }
            return item;
          })
        );
      }
    };

    // Simulate progress for demo purposes
    const simulateProcessing = () => {
      const interval = setInterval(() => {
        onUpdateQueue(
          queue.map(item => {
            if (item.id === processingItem.id && item.status === 'processing') {
              const newProgress = Math.min(item.progress + 10, 100);
              
              if (newProgress >= 100) {
                // Complete processing
                return {
                  ...item,
                  progress: 100,
                  status: 'completed' as const,
                  outputs: item.formats.map(format => ({
                    format: format.name,
                    url: '#demo-video-url' // Demo URL
                  }))
                };
              }
              
              return { ...item, progress: newProgress };
            }
            return item;
          })
        );
      }, 500);

      return () => clearInterval(interval);
    };

    processItem();
  }, [queue, onUpdateQueue, model, modelInputs]);

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return <Icons.clock className="h-4 w-4" />;
      case 'processing':
        return <Icons.loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <Icons.checkCircle2 className="h-4 w-4" />;
      case 'failed':
        return <Icons.xCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
    }
  };

  const handleRemove = (id: string) => {
    onUpdateQueue(queue.filter(item => item.id !== id));
  };

  const handleRetry = (id: string) => {
    onUpdateQueue(
      queue.map(item => 
        item.id === id 
          ? { ...item, status: 'pending' as const, progress: 0, error: undefined }
          : item
      )
    );
  };

  const completedCount = queue.filter(item => item.status === 'completed').length;
  const failedCount = queue.filter(item => item.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Processing Queue</h3>
            <p className="text-sm text-muted-foreground">
              {completedCount} completed, {failedCount} failed, {queue.length - completedCount - failedCount} remaining
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Icons.pauseCircle className="mr-2 h-4 w-4" />
              Pause All
            </Button>
            <Button variant="default" size="sm">
              <Icons.download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
        </div>
      </Card>

      {/* Queue items */}
      <div className="space-y-3">
        {queue.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-muted">
                  <img
                    src={item.asset.originalFile.url}
                    alt={item.asset.originalFile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{item.asset.originalFile.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getStatusColor(item.status) as 'secondary' | 'default' | 'destructive' | 'outline'}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {item.status}
                        </span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {item.animation.name} • {item.formats.length} formats
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    {item.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetry(item.id)}
                      >
                        <Icons.playCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Icons.trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress */}
                {item.status === 'processing' && (
                  <div className="space-y-1">
                    <Progress value={item.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{item.progress}% complete</p>
                  </div>
                )}

                {/* Error */}
                {item.error && (
                  <p className="text-sm text-destructive">{item.error}</p>
                )}

                {/* Outputs */}
                {item.outputs && (
                  <div className="flex gap-2 pt-2">
                    {item.outputs.map((output, idx) => (
                      <Button key={idx} variant="outline" size="sm">
                        <Icons.download className="mr-2 h-3 w-3" />
                        {output.format}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {queue.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No items in processing queue</p>
        </Card>
      )}
    </div>
  );
}