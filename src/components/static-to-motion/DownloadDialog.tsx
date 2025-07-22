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

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  fileName: string;
  onDownload?: (format: string, quality: string) => void;
}

const VIDEO_FORMATS = [
  { value: 'mp4', label: 'MP4', description: 'Best compatibility' },
  { value: 'webm', label: 'WebM', description: 'Smaller file size' },
  { value: 'mov', label: 'MOV', description: 'Apple devices' },
  { value: 'gif', label: 'GIF', description: 'Animated image' },
];

const QUALITY_OPTIONS = [
  { value: 'high', label: 'High Quality', description: '1080p, larger file' },
  { value: 'medium', label: 'Medium Quality', description: '720p, balanced' },
  { value: 'low', label: 'Low Quality', description: '480p, smaller file' },
];

export function DownloadDialog({
  open,
  onOpenChange,
  videoUrl,
  fileName,
  onDownload
}: DownloadDialogProps) {
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('high');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Call the onDownload callback if provided
      if (onDownload) {
        onDownload(format, quality);
      }

      // Handle actual download
      const isDemoUrl = videoUrl.startsWith('#') || videoUrl.includes('demo.blob.core.windows.net');
      
      if (videoUrl && !isDemoUrl) {
        // Real URL - initiate download
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Demo mode - show message
        console.log(`Demo mode: Would download ${fileName}.${format} in ${quality} quality`);
      }

      // Wait for progress to complete
      await new Promise(resolve => setTimeout(resolve, 2200));
      
      setIsDownloading(false);
      setDownloadProgress(0);
      onOpenChange(false);
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Download Video</DialogTitle>
          <DialogDescription>
            Choose your preferred format and quality for the download.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Format</Label>
            <RadioGroup value={format} onValueChange={setFormat}>
              {VIDEO_FORMATS.map((fmt) => (
                <div key={fmt.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent">
                  <RadioGroupItem value={fmt.value} id={fmt.value} />
                  <Label htmlFor={fmt.value} className="flex-1 cursor-pointer">
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
                <span>Downloading...</span>
                <span>{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
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
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Icons.download className="mr-2 h-4 w-4" />
                Download {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}