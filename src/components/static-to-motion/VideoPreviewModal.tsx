'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { QueueItem, Format } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VideoPreviewModalProps {
  item: QueueItem | null;
  open: boolean;
  onClose: () => void;
  onExport: (item: QueueItem, format: Format) => void;
}

export function VideoPreviewModal({ item, open, onClose, onExport }: VideoPreviewModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  if (!item) return null;

  const handleExport = () => {
    if (selectedFormat) {
      onExport(item, selectedFormat);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Preview Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {item.outputs && item.outputs.length > 0 ? (
              <video
                src={item.outputs[0].url}
                controls
                autoPlay={isPlaying}
                loop
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <Icons.loader className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Original Image</p>
              <p className="text-sm text-muted-foreground">{item.asset.originalFile.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Model Used</p>
              <p className="text-sm text-muted-foreground">{item.model?.name || 'N/A'}</p>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Select Export Format</p>
            <Select
              value={selectedFormat?.name || ''}
              onValueChange={(value) => {
                const format = item.formats.find(f => f.name === value);
                setSelectedFormat(format || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a format to export" />
              </SelectTrigger>
              <SelectContent>
                {item.formats.map((format, idx) => (
                  <SelectItem key={idx} value={format.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{format.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {format.width} × {format.height}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Used */}
          {item.prompt && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Prompt Used</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {item.prompt}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={!selectedFormat}
          >
            <Icons.download className="h-4 w-4 mr-2" />
            Export Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}