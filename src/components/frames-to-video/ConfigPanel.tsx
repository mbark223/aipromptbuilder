'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Veo2InterpolationConfig, Veo2FrameAsset } from '@/types';

interface ConfigPanelProps {
  config: Veo2InterpolationConfig;
  onConfigChange: (config: Veo2InterpolationConfig) => void;
  onStartProcessing: () => void;
  frameAsset?: Veo2FrameAsset;
}

export function ConfigPanel({ config, onConfigChange, onStartProcessing, frameAsset }: ConfigPanelProps) {
  const handleDurationChange = (value: number[]) => {
    onConfigChange({ ...config, duration: value[0] });
  };

  const handleFpsChange = (value: number[]) => {
    onConfigChange({ ...config, fps: value[0] });
  };

  const totalFrames = Math.round(config.duration * config.fps);

  return (
    <div className="space-y-6">
      {frameAsset && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-2">Start Frame</h4>
            <img 
              src={frameAsset.frame1.originalFile.url} 
              alt="Start frame"
              className="w-full rounded-lg"
            />
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-2">End Frame</h4>
            <img 
              src={frameAsset.frame2.originalFile.url} 
              alt="End frame"
              className="w-full rounded-lg"
            />
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="duration">Video Duration: {config.duration} seconds</Label>
          <Slider
            id="duration"
            min={1}
            max={10}
            step={0.5}
            value={[config.duration]}
            onValueChange={handleDurationChange}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Longer durations create smoother transitions
          </p>
        </div>

        <div>
          <Label htmlFor="fps">Frame Rate: {config.fps} FPS</Label>
          <Slider
            id="fps"
            min={12}
            max={60}
            step={6}
            value={[config.fps]}
            onValueChange={handleFpsChange}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Higher frame rates create smoother motion
          </p>
        </div>

        <div>
          <Label htmlFor="interpolation-type">Interpolation Type</Label>
          <Select 
            value={config.interpolationType} 
            onValueChange={(value) => onConfigChange({ ...config, interpolationType: value as 'linear' | 'smooth' | 'morphing' })}
          >
            <SelectTrigger id="interpolation-type" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear - Simple direct transition</SelectItem>
              <SelectItem value="smooth">Smooth - Natural motion curves</SelectItem>
              <SelectItem value="morphing">Morphing - Advanced shape transformation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="transition-style">Transition Style</Label>
          <Select 
            value={config.transitionStyle} 
            onValueChange={(value) => onConfigChange({ ...config, transitionStyle: value as 'fade' | 'blend' | 'warp' })}
          >
            <SelectTrigger id="transition-style" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fade">Fade - Gradual opacity blend</SelectItem>
              <SelectItem value="blend">Blend - Smart pixel blending</SelectItem>
              <SelectItem value="warp">Warp - Dynamic shape warping</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-4 bg-muted/50">
        <h4 className="font-medium mb-2">Output Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Frames:</span>
            <span>{totalFrames}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span>{config.duration}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Frame Rate:</span>
            <span>{config.fps} FPS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Interpolation:</span>
            <span className="capitalize">{config.interpolationType}</span>
          </div>
        </div>
      </Card>

      <Button 
        onClick={onStartProcessing} 
        className="w-full" 
        size="lg"
        disabled={!frameAsset}
      >
        <Icons.play className="mr-2 h-4 w-4" />
        Generate Video
      </Button>
    </div>
  );
}