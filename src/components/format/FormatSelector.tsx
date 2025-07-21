'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PRESET_FORMATS, Format } from '@/types';

interface FormatSelectorProps {
  selectedFormat: Format | null;
  onFormatSelect: (format: Format) => void;
}

export function FormatSelector({ selectedFormat, onFormatSelect }: FormatSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customWidth, setCustomWidth] = useState('1920');
  const [customHeight, setCustomHeight] = useState('1080');

  const handleCustomFormat = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (width > 0 && height > 0) {
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(width, height);
      const aspectRatio = `${width/divisor}:${height/divisor}`;
      
      onFormatSelect({
        aspectRatio,
        width,
        height,
        name: `Custom (${aspectRatio})`,
        custom: true,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Format</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESET_FORMATS.map((format) => (
            <Card
              key={format.aspectRatio}
              className={cn(
                'p-4 cursor-pointer transition-all hover:border-primary',
                selectedFormat?.aspectRatio === format.aspectRatio &&
                  !selectedFormat.custom &&
                  'border-primary bg-primary/5'
              )}
              onClick={() => onFormatSelect(format)}
            >
              <div className="flex flex-col items-center space-y-2">
                <div
                  className="bg-muted rounded"
                  style={{
                    width: '80px',
                    height: `${(80 * format.height) / format.width}px`,
                  }}
                />
                <div className="text-sm font-medium">{format.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format.width}x{format.height}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustom(!showCustom)}
        >
          {showCustom ? 'Hide' : 'Show'} Custom Size
        </Button>
        
        {showCustom && (
          <Card className="mt-3 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={handleCustomFormat}
              disabled={!customWidth || !customHeight}
            >
              Apply Custom Format
            </Button>
          </Card>
        )}
      </div>

      {selectedFormat && (
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm">
            <span className="font-medium">Selected:</span> {selectedFormat.name} ({selectedFormat.width}x{selectedFormat.height})
          </p>
        </div>
      )}
    </div>
  );
}