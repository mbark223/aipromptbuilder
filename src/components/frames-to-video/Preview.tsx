'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Veo2FrameAsset } from '@/types';

interface PreviewProps {
  frameAsset: Veo2FrameAsset;
}

export function Preview({ frameAsset }: PreviewProps) {
  const { frame1, frame2, interpolationSettings } = frameAsset;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Frame Preview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Start Frame</h3>
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={frame1.originalFile.url} 
                  alt="Start frame"
                  className="w-full"
                />
                <Badge className="absolute top-2 left-2" variant="secondary">
                  Frame 1
                </Badge>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>{frame1.originalFile.name}</p>
                <p>{frame1.originalFile.dimensions?.width} × {frame1.originalFile.dimensions?.height}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">End Frame</h3>
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={frame2.originalFile.url} 
                  alt="End frame"
                  className="w-full"
                />
                <Badge className="absolute top-2 left-2" variant="secondary">
                  Frame 2
                </Badge>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>{frame2.originalFile.name}</p>
                <p>{frame2.originalFile.dimensions?.width} × {frame2.originalFile.dimensions?.height}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center">
          <Icons.arrowDown className="h-8 w-8 text-muted-foreground animate-bounce" />
        </div>

        <Card className="mt-6 p-4 bg-muted/50">
          <h3 className="font-medium mb-3">Interpolation Settings</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-medium">{interpolationSettings.duration} seconds</span>
            </div>
            <div>
              <span className="text-muted-foreground">Frame Rate:</span>
              <span className="ml-2 font-medium">{interpolationSettings.fps} FPS</span>
            </div>
            <div>
              <span className="text-muted-foreground">Interpolation:</span>
              <span className="ml-2 font-medium capitalize">{interpolationSettings.interpolationType}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Transition:</span>
              <span className="ml-2 font-medium capitalize">{interpolationSettings.transitionStyle}</span>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex justify-center">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center">
              <Icons.video className="h-12 w-12 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Ready to generate a {interpolationSettings.duration}s video with {Math.round(interpolationSettings.duration * interpolationSettings.fps)} frames
            </p>
            <Button size="lg">
              <Icons.play className="mr-2 h-4 w-4" />
              Process Video
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}