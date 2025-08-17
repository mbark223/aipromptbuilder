'use client';

import { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useFFmpeg } from '@/hooks/use-ffmpeg';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { downloadVideoWithFallback } from '@/lib/video-download';
import { downloadVideoFromBlob, isBlobUrl } from '@/lib/video-blob-handler';
import { testFFmpeg, getBrowserCompatibility } from '@/lib/ffmpeg-test';

interface VideoFile {
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
}

interface EndCard {
  text: string;
  backgroundColor: string;
  textColor: string;
  duration: number;
}

interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnailUrl?: string;
  endCard?: EndCard;
}

interface VideoClipsPanelProps {
  video: VideoFile;
  clips: VideoClip[];
  selectedClips: Set<string>;
  exportFormat: '1080x1080' | '1080x1920';
  onUpdateClip?: (clipId: string, updates: Partial<VideoClip>) => void;
  onSelectClip: (clipId: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onBatchExport: () => void;
  isExporting: boolean;
  exportProgress: number;
}

export function VideoClipsPanel({
  video,
  clips,
  selectedClips,
  exportFormat,
  onSelectClip,
  onSelectAll,
  onSelectNone,
  onBatchExport,
  isExporting,
  exportProgress
}: VideoClipsPanelProps) {
  const { toast } = useToast();
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [exportingClipId, setExportingClipId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [useClientProcessing, setUseClientProcessing] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const { processVideo, isProcessing, isLoading, progress: ffmpegProgress, preloadFFmpeg } = useFFmpeg();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playClip = (clipId: string) => {
    const videoEl = videoRefs.current[clipId];
    if (!videoEl) return;

    if (playingClipId === clipId) {
      videoEl.pause();
      setPlayingClipId(null);
    } else {
      // Pause any currently playing video
      if (playingClipId && videoRefs.current[playingClipId]) {
        videoRefs.current[playingClipId].pause();
      }
      
      videoEl.play();
      setPlayingClipId(clipId);
    }
  };

  const exportClip = async (clip: VideoClip) => {
    setExportingClipId(clip.id);
    
    try {
      // Auto-enable client processing for blob URLs
      const shouldUseClientProcessing = useClientProcessing || isBlobUrl(video.url);
      
      if (shouldUseClientProcessing) {
        // Ensure FFmpeg is loaded if we're auto-enabling for blob URLs
        if (!useClientProcessing && isBlobUrl(video.url)) {
          await preloadFFmpeg();
        }
        
        // Use client-side FFmpeg processing
        const processedBlob = await processVideo(
          video.url,
          clip.startTime,
          clip.endTime,
          exportFormat
        );

        if (processedBlob) {
          // Create download link for processed video
          const url = URL.createObjectURL(processedBlob);
          const filename = `clip-${clip.id}-${exportFormat.replace('x', '-')}-${clip.startTime}s-${clip.endTime}s.mp4`;
          
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL
          setTimeout(() => URL.revokeObjectURL(url), 100);
          
          toast({
            title: 'Clip exported successfully',
            description: `Downloaded ${filename}`,
          });
        } else {
          // FFmpeg processing failed - offer fallback
          console.error('FFmpeg processing returned null');
          
          // Offer to download the full video as a fallback
          const fallbackResult = await downloadVideoFromBlob(
            video.url, 
            `full-video-${clip.id}-trim-${clip.startTime}s-${clip.endTime}s.mp4`
          );
          
          if (fallbackResult) {
            toast({
              title: 'Processing failed - Downloaded full video',
              description: `Please use video editing software to trim from ${clip.startTime}s to ${clip.endTime}s`,
              variant: 'default',
            });
          } else {
            toast({
              title: 'Export failed',
              description: 'Unable to process video. Please try refreshing the page or using a different browser.',
              variant: 'destructive',
            });
          }
        }
      } else {
        // For regular URLs, use the server-side processing
        const filename = `clip-${clip.id}-${exportFormat.replace('x', '-')}-${clip.startTime}s-${clip.endTime}s.mp4`;
        const response = await fetch('/api/video-export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoUrl: video.url,
            startTime: clip.startTime,
            endTime: clip.endTime,
            format: exportFormat,
            clipId: clip.id
          }),
        });

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const data = await response.json();
        
        if (data.requiresClientProcessing) {
          // Server indicates client processing is needed
          // This should rarely happen since we auto-enable for blob URLs
          setUseClientProcessing(true);
          await preloadFFmpeg();
          
          toast({
            title: 'Switching to client processing',
            description: 'Server processing unavailable. Processing on your device...',
          });
          
          // Retry with client processing
          const processedBlob = await processVideo(
            video.url,
            clip.startTime,
            clip.endTime,
            exportFormat
          );
          
          if (processedBlob) {
            const url = URL.createObjectURL(processedBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            toast({
              title: 'Clip exported successfully',
              description: `Downloaded ${filename}`,
            });
          }
        } else if (data.success && data.downloadUrl) {
          // Server processing succeeded
          const result = await downloadVideoWithFallback(
            data.downloadUrl,
            data.filename || filename,
            true
          );
          
          if (result.success) {
            toast({
              title: 'Clip exported successfully',
              description: `Downloaded ${data.filename}`,
            });
          } else {
            toast({
              title: 'Download started',
              description: result.error || 'Check your downloads folder.',
              variant: 'default',
            });
          }
        } else {
          throw new Error(data.error || 'Export failed');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export clip',
        variant: 'destructive',
      });
    } finally {
      setExportingClipId(null);
    }
  };


  const handleVideoTimeUpdate = (clipId: string, videoEl: HTMLVideoElement) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;
    
    // Loop the clip within its time range
    if (videoEl.currentTime >= clip.endTime || videoEl.currentTime < clip.startTime) {
      videoEl.currentTime = clip.startTime;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">Generated Clips</h3>
          <Badge variant="secondary">{clips.length} clips</Badge>
          {selectedClips.size > 0 && (
            <Badge variant="default">{selectedClips.size} selected</Badge>
          )}
          <Badge variant="outline">{exportFormat}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <>
                <Icons.volumeX className="mr-2 h-4 w-4" />
                Unmute
              </>
            ) : (
              <>
                <Icons.volume2 className="mr-2 h-4 w-4" />
                Mute
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            disabled={isExporting}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectNone}
            disabled={isExporting || selectedClips.size === 0}
          >
            Select None
          </Button>
          <Button
            onClick={onBatchExport}
            disabled={isExporting || selectedClips.size === 0}
          >
            {isExporting ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                Exporting {selectedClips.size} Clips...
              </>
            ) : (
              <>
                <Icons.download className="mr-2 h-4 w-4" />
                Export Selected ({selectedClips.size})
              </>
            )}
          </Button>
        </div>
      </div>

      {isExporting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Exporting clips...</span>
            <span>{Math.round(exportProgress)}%</span>
          </div>
          <Progress value={exportProgress} className="h-2" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clips.map((clip, index) => (
          <Card key={clip.id} className={`overflow-hidden ${selectedClips.has(clip.id) ? 'ring-2 ring-primary' : ''}`}>
            <div className="relative bg-black aspect-square">
              <video
                ref={(el) => {
                  if (el) videoRefs.current[clip.id] = el;
                }}
                src={video.url}
                className="w-full h-full object-cover"
                onTimeUpdate={(e) => handleVideoTimeUpdate(clip.id, e.currentTarget)}
                onEnded={() => setPlayingClipId(null)}
                muted={isMuted}
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/80 hover:bg-white"
                  onClick={() => playClip(clip.id)}
                >
                  {playingClipId === clip.id ? (
                    <Icons.pause className="h-6 w-6" />
                  ) : (
                    <Icons.play className="h-6 w-6" />
                  )}
                </Button>
              </div>
              
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <Checkbox
                  checked={selectedClips.has(clip.id)}
                  onCheckedChange={() => onSelectClip(clip.id)}
                  className="bg-white/80 border-white"
                />
                <Badge variant="secondary" className="bg-black/80 text-white">
                  Clip {index + 1}
                </Badge>
              </div>

              {clip.endCard && (
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className="bg-green-600">
                    Has End Card
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                </span>
                <Badge variant="outline">{clip.duration}s</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => exportClip(clip)}
                  disabled={exportingClipId === clip.id || isExporting || isProcessing}
                >
                  {exportingClipId === clip.id ? (
                    <>
                      <Icons.loader className="mr-2 h-3 w-3 animate-spin" />
                      {isProcessing ? 'Processing...' : 'Exporting...'}
                    </>
                  ) : (
                    <>
                      <Icons.download className="mr-2 h-3 w-3" />
                      Export
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // This would open an end card editor modal
                    toast({
                      title: 'End Card Editor',
                      description: 'Edit end card in the section below',
                    });
                  }}
                >
                  <Icons.edit className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icons.loader2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Processing Options</span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="client-processing" className="text-sm">
                Client-side processing
              </Label>
              <Switch
                id="client-processing"
                checked={useClientProcessing}
                onCheckedChange={(checked) => {
                  setUseClientProcessing(checked);
                  if (checked) {
                    preloadFFmpeg();
                  }
                }}
              />
            </div>
          </div>
          {useClientProcessing && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Videos will be processed directly in your browser. This may take longer but ensures privacy.
              </p>
            </div>
          )}
          {(isProcessing || isLoading) && ffmpegProgress.message && (
            <div className="space-y-1 mt-2">
              <p className="text-xs font-medium">{ffmpegProgress.message}</p>
              <Progress value={ffmpegProgress.progress} className="h-2" />
              {ffmpegProgress.progress > 0 && (
                <p className="text-xs text-muted-foreground text-right">{ffmpegProgress.progress}%</p>
              )}
            </div>
          )}
          {!useClientProcessing && video && isBlobUrl(video.url) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
              <div className="flex items-start gap-2">
                <Icons.info className="h-4 w-4 text-blue-600 dark:text-blue-500 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Client processing will be used automatically
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Your video is stored locally in the browser. Clips will be processed on your device to ensure proper trimming.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icons.info className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Export Information</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Clips will be exported in {exportFormat} format. Each clip includes the selected video segment
            {clips.some(c => c.endCard) && ' and any configured end cards'}.
            {useClientProcessing && ' Videos are trimmed and formatted in your browser.'}
          </p>
        </div>
        
        {/* Debug section - only shown in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icons.wand2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Debug Tools</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const result = await testFFmpeg();
                  const compatibility = getBrowserCompatibility();
                  console.log('FFmpeg Test Result:', result);
                  console.log('Browser Compatibility:', compatibility);
                  toast({
                    title: result.success ? 'FFmpeg Test Passed' : 'FFmpeg Test Failed',
                    description: result.message,
                    variant: result.success ? 'default' : 'destructive',
                  });
                }}
              >
                Test FFmpeg
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Browser: {getBrowserCompatibility().browser} {getBrowserCompatibility().version}</p>
              <p>SharedArrayBuffer: {getBrowserCompatibility().hasSharedArrayBuffer ? '✓' : '✗'}</p>
              <p>CrossOriginIsolated: {getBrowserCompatibility().hasCrossOriginIsolated ? '✓' : '✗'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}