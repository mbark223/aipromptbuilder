'use client';

import { Format } from '@/types';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

interface Veo3FormatSelectorProps {
  formats: Format[];
  selectedFormat: Format;
  onSelectFormat: (format: Format) => void;
}

export function Veo3FormatSelector({
  formats,
  selectedFormat,
  onSelectFormat
}: Veo3FormatSelectorProps) {
  // Group formats by resolution
  const formatsByResolution = {
    '720p': formats.filter(f => f.name.includes('720p')),
    '1080p': formats.filter(f => f.name.includes('1080p'))
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Format</h3>
        <p className="text-sm text-muted-foreground">
          Choose your video resolution and aspect ratio
        </p>
      </div>

      <RadioGroup
        value={selectedFormat.name}
        onValueChange={(value) => {
          const format = formats.find(f => f.name === value);
          if (format) onSelectFormat(format);
        }}
      >
        {Object.entries(formatsByResolution).map(([resolution, resFormats]) => (
          <div key={resolution} className="space-y-2">
            <Label className="text-sm font-medium">{resolution}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resFormats.map((format) => (
                <Card
                  key={format.name}
                  className={`cursor-pointer transition-all ${
                    selectedFormat.name === format.name
                      ? 'border-primary ring-2 ring-primary ring-opacity-20'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => onSelectFormat(format)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={format.name} id={format.name} />
                      <div className="flex-1">
                        <Label htmlFor={format.name} className="cursor-pointer">
                          <div className="font-medium">
                            {format.aspectRatio === '16:9' ? 'Horizontal' : 'Vertical'}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {format.width} × {format.height}
                          </div>
                        </Label>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {format.aspectRatio}
                          </Badge>
                          {format.aspectRatio === '9:16' && (
                            <Badge variant="outline" className="text-xs">
                              Stories/Reels
                            </Badge>
                          )}
                          {format.aspectRatio === '16:9' && (
                            <Badge variant="outline" className="text-xs">
                              YouTube/Web
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}