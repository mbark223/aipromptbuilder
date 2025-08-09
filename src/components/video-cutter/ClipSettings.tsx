'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ClipSettingsData {
  clipDuration: number;
  numberOfClips: number;
  strategy: 'ai' | 'even' | 'manual' | 'object';
  exportFormat: '1080x1080' | '1080x1920';
  objectQueries?: string[];
}

interface ClipSettingsProps {
  settings: ClipSettingsData;
  onSettingsChange: (settings: ClipSettingsData) => void;
  videoDuration: number;
  onGenerateClips: () => void;
  isProcessing: boolean;
}

export function ClipSettings({
  settings,
  onSettingsChange,
  videoDuration,
  onGenerateClips,
  isProcessing
}: ClipSettingsProps) {
  const maxClips = Math.floor(videoDuration / 6);

  const updateSetting = <K extends keyof ClipSettingsData>(
    key: K,
    value: ClipSettingsData[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="clip-duration" className="text-base font-medium">
            Clip Duration
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Set the duration for each clip (6-8 seconds recommended)
          </p>
          <div className="flex items-center gap-4">
            <Slider
              id="clip-duration"
              value={[settings.clipDuration]}
              onValueChange={(value) => updateSetting('clipDuration', value[0])}
              min={6}
              max={8}
              step={0.5}
              className="flex-1"
            />
            <Badge variant="secondary" className="min-w-[60px] justify-center">
              {settings.clipDuration}s
            </Badge>
          </div>
        </div>

        <div>
          <Label htmlFor="number-of-clips" className="text-base font-medium">
            Number of Clips
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            How many clips to generate (max {maxClips} based on video duration)
          </p>
          <NumberInput
            value={settings.numberOfClips}
            onChange={(value) => updateSetting('numberOfClips', value)}
            min={1}
            max={maxClips}
            step={1}
          />
        </div>

        <div>
          <Label className="text-base font-medium">Clip Selection Strategy</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Choose how clips are selected from the video
          </p>
          <RadioGroup
            value={settings.strategy}
            onValueChange={(value) => updateSetting('strategy', value as 'ai' | 'even' | 'manual' | 'object')}
          >
            <Card className="p-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="ai" id="ai" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="ai" className="font-medium cursor-pointer">
                    AI-Powered Selection
                    <Badge variant="default" className="ml-2">Recommended</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically detect the most engaging moments using AI
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="even" id="even" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="even" className="font-medium cursor-pointer">
                    Even Distribution
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Split clips evenly across the video timeline
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="object" id="object" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="object" className="font-medium cursor-pointer">
                    Object Detection
                    <Badge variant="secondary" className="ml-2">New</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Detect and split by objects (person, car, etc.)
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 opacity-50">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="manual" id="manual" disabled className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="manual" className="font-medium cursor-pointer">
                    Manual Selection
                    <Badge variant="outline" className="ml-2">Coming Soon</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose specific moments from the timeline
                  </p>
                </div>
              </div>
            </Card>
          </RadioGroup>

          {settings.strategy === 'object' && (
            <Card className="p-4 mt-4 border-primary/20">
              <Label htmlFor="object-queries" className="text-sm font-medium">
                Objects to Detect
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter objects separated by commas (e.g., person, car, dog)
              </p>
              <Input
                id="object-queries"
                value={settings.objectQueries?.join(', ') || ''}
                onChange={(e) => {
                  const queries = e.target.value
                    .split(',')
                    .map(q => q.trim())
                    .filter(q => q.length > 0);
                  updateSetting('objectQueries', queries);
                }}
                placeholder="person, car, dog"
              />
            </Card>
          )}
        </div>

        <div>
          <Label htmlFor="export-format" className="text-base font-medium">
            Export Format
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Choose the aspect ratio for your clips
          </p>
          <Select
            value={settings.exportFormat}
            onValueChange={(value) => updateSetting('exportFormat', value as '1080x1080' | '1080x1920')}
          >
            <SelectTrigger id="export-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1080x1080">
                1080x1080 (Square - Instagram Feed, Facebook)
              </SelectItem>
              <SelectItem value="1080x1920">
                1080x1920 (Vertical - Stories, Reels, TikTok)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-primary/10 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icons.info className="h-4 w-4 text-primary" />
          <span className="font-medium">Summary</span>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• {settings.numberOfClips} clips × {settings.clipDuration}s each</li>
          <li>• Total output duration: {(settings.numberOfClips * settings.clipDuration).toFixed(1)}s</li>
          <li>• Export format: {settings.exportFormat}</li>
          <li>• Selection: {settings.strategy === 'ai' ? 'AI-powered' : 'Even distribution'}</li>
        </ul>
      </div>

      <Button
        onClick={onGenerateClips}
        disabled={isProcessing}
        size="lg"
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
            Generating Clips...
          </>
        ) : (
          <>
            <Icons.scissors className="mr-2 h-4 w-4" />
            Generate {settings.numberOfClips} Clips
          </>
        )}
      </Button>
    </div>
  );
}