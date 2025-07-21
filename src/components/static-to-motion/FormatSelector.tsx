'use client';

import { Format, PRESET_FORMATS } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

interface FormatSelectorProps {
  selectedFormats: Format[];
  onSelectFormats: (formats: Format[]) => void;
  multiSelect?: boolean;
}

export function FormatSelector({
  selectedFormats,
  onSelectFormats,
  multiSelect = true
}: FormatSelectorProps) {
  const handleFormatClick = (format: Format) => {
    if (multiSelect) {
      const isSelected = selectedFormats.some(f => f.aspectRatio === format.aspectRatio);
      if (isSelected) {
        onSelectFormats(selectedFormats.filter(f => f.aspectRatio !== format.aspectRatio));
      } else {
        onSelectFormats([...selectedFormats, format]);
      }
    } else {
      onSelectFormats([format]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Output Formats</h3>
        {multiSelect && (
          <Badge variant="outline">
            {selectedFormats.length} selected
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESET_FORMATS.map((format) => {
          const isSelected = selectedFormats.some(f => f.aspectRatio === format.aspectRatio);
          
          return (
            <Card
              key={format.aspectRatio}
              className={`
                relative p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'hover:border-primary/50'
                }
              `}
              onClick={() => handleFormatClick(format)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{format.name}</span>
                  {isSelected && (
                    <div className="rounded-full bg-primary p-1">
                      <Icons.check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                  <div 
                    className="bg-muted-foreground/20 rounded"
                    style={{
                      width: '60%',
                      aspectRatio: format.aspectRatio,
                    }}
                  />
                </div>
                
                <div className="text-center space-y-1">
                  <p className="text-sm font-mono">{format.aspectRatio}</p>
                  <p className="text-xs text-muted-foreground">
                    {format.width} × {format.height}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}