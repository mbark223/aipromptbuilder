'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { createLumaAIService, isLumaAIConfigured } from '@/lib/luma-ai';
import { LumaProcessingOptions } from '@/types';

interface LumaProcessingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  videoName: string;
  onProcessingComplete: (outputUrl: string, format: string) => void;
}

export function LumaProcessingDialog({
  open,
  onOpenChange,
  videoUrl,
  videoName: _videoName,
  onProcessingComplete
}: LumaProcessingDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'1080x1080' | '1080x1920'>('1080x1080');
  const [prompt, setPrompt] = useState('');
  const [enableLoop, setEnableLoop] = useState(false);
  const [duration, setDuration] = useState(5);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [completedUrl, setCompletedUrl] = useState<string | null>(null);

  const isConfigured = isLumaAIConfigured();

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setProcessing(false);
      setProgress(0);
      setError(null);
      setJobId(null);
      setCompletedUrl(null);
    }
  }, [open]);

  const handleStartProcessing = async () => {
    if (!isConfigured) {
      setError('Luma AI API key not configured. Please add NEXT_PUBLIC_LUMA_AI_API_KEY to your environment.');
      return;
    }

    setProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const lumaService = createLumaAIService();
      if (!lumaService) {
        throw new Error('Failed to initialize Luma AI service');
      }

      const options: LumaProcessingOptions = {
        format: selectedFormat,
        prompt: prompt || undefined,
        loop: enableLoop,
        duration
      };

      // Start processing
      const { jobId: newJobId } = await lumaService.processVideo(videoUrl, options);
      setJobId(newJobId);
      setProgress(10);

      // Poll for completion
      const result = await lumaService.waitForCompletion(
        newJobId,
        (progressValue) => {
          setProgress(Math.min(progressValue, 95));
        }
      );

      if (result.status === 'completed' && result.videoUrl) {
        setProgress(100);
        setCompletedUrl(result.videoUrl);
        onProcessingComplete(result.videoUrl, selectedFormat);
      } else if (result.status === 'failed') {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (err) {
      console.error('Luma AI processing error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during processing');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (jobId && processing) {
      try {
        const lumaService = createLumaAIService();
        if (lumaService) {
          await lumaService.cancelJob(jobId);
        }
      } catch (err) {
        console.error('Error canceling job:', err);
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process with Luma AI Dream Machine</DialogTitle>
          <DialogDescription>
            Enhance your video with Luma AI&apos;s advanced processing. Choose your output format and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!isConfigured && (
            <Alert>
              <Icons.alertCircle className="h-4 w-4" />
              <AlertDescription>
                Luma AI API key not configured. Please add NEXT_PUBLIC_LUMA_AI_API_KEY to your .env.local file.
              </AlertDescription>
            </Alert>
          )}

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Output Format</Label>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as '1080x1080' | '1080x1920')}
              disabled={processing}
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <RadioGroupItem value="1080x1080" id="square" className="sr-only" />
                  <Label
                    htmlFor="square"
                    className="flex flex-col items-center space-y-3 cursor-pointer"
                  >
                    <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                      <Icons.square className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">1080x1080</p>
                      <p className="text-sm text-muted-foreground">Square (1:1)</p>
                      <p className="text-xs text-muted-foreground mt-1">Instagram Feed, Facebook</p>
                    </div>
                  </Label>
                </Card>

                <Card className="p-4">
                  <RadioGroupItem value="1080x1920" id="vertical" className="sr-only" />
                  <Label
                    htmlFor="vertical"
                    className="flex flex-col items-center space-y-3 cursor-pointer"
                  >
                    <div className="w-16 h-24 bg-muted rounded-md flex items-center justify-center">
                      <Icons.smartphone className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">1080x1920</p>
                      <p className="text-sm text-muted-foreground">Vertical (9:16)</p>
                      <p className="text-xs text-muted-foreground mt-1">Stories, Reels, TikTok</p>
                    </div>
                  </Label>
                </Card>
              </div>
            </RadioGroup>
          </div>

          {/* Enhancement Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Enhancement Prompt (Optional)</Label>
            <Textarea
              id="prompt"
              placeholder="Add any specific instructions for video enhancement..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={processing}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Describe how you want the video to be enhanced or transformed
            </p>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="loop">Loop Video</Label>
                <p className="text-xs text-muted-foreground">Create a seamless loop</p>
              </div>
              <Switch
                id="loop"
                checked={enableLoop}
                onCheckedChange={setEnableLoop}
                disabled={processing}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="duration">Duration: {duration}s</Label>
                <Badge variant="secondary">{duration} seconds</Badge>
              </div>
              <Slider
                id="duration"
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
                max={10}
                min={1}
                step={1}
                disabled={processing}
              />
            </div>
          </div>

          {/* Processing Status */}
          {processing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing video...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
              {jobId && (
                <p className="text-xs text-muted-foreground">Job ID: {jobId}</p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <Icons.alertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {completedUrl && (
            <Alert>
              <Icons.checkCircle2 className="h-4 w-4" />
              <AlertDescription>
                Video processed successfully! The enhanced video is ready for download.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={processing && !jobId}
          >
            {processing ? 'Close' : 'Cancel'}
          </Button>
          {!completedUrl && (
            <Button
              onClick={handleStartProcessing}
              disabled={processing || !isConfigured}
            >
              {processing ? (
                <>
                  <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Icons.sparkles className="mr-2 h-4 w-4" />
                  Start Processing
                </>
              )}
            </Button>
          )}
          {completedUrl && (
            <Button
              onClick={() => onOpenChange(false)}
              variant="default"
            >
              <Icons.check className="mr-2 h-4 w-4" />
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}