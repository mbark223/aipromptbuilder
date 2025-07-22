'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { QueueItem } from '@/types';

interface BatchDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: QueueItem[];
  onDownload?: (format: string, quality: string) => void;
}

const VIDEO_FORMATS = [
  { value: 'mp4', label: 'MP4', description: 'Best compatibility' },
  { value: 'webm', label: 'WebM', description: 'Smaller file size' },
  { value: 'mov', label: 'MOV', description: 'Apple devices' },
  { value: 'gif', label: 'GIF', description: 'Animated image' },
];

const QUALITY_OPTIONS = [
  { value: 'high', label: 'High Quality', description: '1080p, larger files' },
  { value: 'medium', label: 'Medium Quality', description: '720p, balanced' },
  { value: 'low', label: 'Low Quality', description: '480p, smaller files' },
];

export function BatchDownloadDialog({
  open,
  onOpenChange,
  items,
  onDownload
}: BatchDownloadDialogProps) {
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('high');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(0);

  const completedItems = items.filter(item => item.status === 'completed' && item.outputs);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setCurrentFile(0);

    try {
      // Call the onDownload callback if provided
      if (onDownload) {
        onDownload(format, quality);
      }

      // Download each file
      for (let i = 0; i < completedItems.length; i++) {
        setCurrentFile(i + 1);
        const item = completedItems[i];
        
        if (item.outputs && item.outputs[0]) {
          const output = item.outputs[0];
          
          // Update progress
          setDownloadProgress(Math.round(((i + 1) / completedItems.length) * 100));

          // Handle actual download
          if (output.url && !output.url.startsWith('#')) {
            try {
              const response = await fetch(output.url);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${item.asset.originalFile.name.replace(/\.[^/.]+$/, '')}_${i + 1}.${format}`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } catch (error) {
              console.error(`Failed to download file ${i + 1}:`, error);
            }
          }

          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setIsDownloading(false);
      setDownloadProgress(100);
      
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setDownloadProgress(0);
        setCurrentFile(0);
      }, 1000);
    } catch (error) {
      console.error('Batch download failed:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      alert('Batch download failed. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Download All Videos</DialogTitle>
          <DialogDescription>
            Download {completedItems.length} completed videos in your preferred format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Summary */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Icons.layers className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="font-medium">{completedItems.length} Videos Ready</div>
              <div className="text-sm text-muted-foreground">
                Total size will vary based on format and quality
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Format</Label>
            <RadioGroup value={format} onValueChange={setFormat}>
              {VIDEO_FORMATS.map((fmt) => (
                <div key={fmt.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent">
                  <RadioGroupItem value={fmt.value} id={`batch-${fmt.value}`} />
                  <Label htmlFor={`batch-${fmt.value}`} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{fmt.label}</div>
                        <div className="text-sm text-muted-foreground">{fmt.description}</div>
                      </div>
                      {fmt.value === 'mp4' && <Badge variant="secondary">Recommended</Badge>}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Quality Selection (not for GIF) */}
          {format !== 'gif' && (
            <div className="space-y-3">
              <Label>Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-sm text-muted-foreground">{opt.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Download Progress */}
          {isDownloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Downloading file {currentFile} of {completedItems.length}...</span>
                <span>{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Please don&apos;t close this dialog until all downloads complete
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDownloading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading || completedItems.length === 0}
          >
            {isDownloading ? (
              <>
                <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading {currentFile}/{completedItems.length}...
              </>
            ) : (
              <>
                <Icons.download className="mr-2 h-4 w-4" />
                Download All ({completedItems.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}