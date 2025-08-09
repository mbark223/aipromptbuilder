'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoUpload } from '@/components/video-cutter/VideoUpload';
import { VideoPreview } from '@/components/video-cutter/VideoPreview';
import { ClipSettings } from '@/components/video-cutter/ClipSettings';
import { VideoClipsPanel } from '@/components/video-cutter/VideoClipsPanel';
import { EndCardEditor } from '@/components/video-cutter/EndCardEditor';
import type { VideoSegment } from '@/types/video-segmentation';

interface VideoFile {
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
}

interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnailUrl?: string;
  endCard?: EndCard;
}

interface EndCard {
  text: string;
  backgroundColor: string;
  textColor: string;
  duration: number;
}

interface ClipSettingsData {
  clipDuration: number;
  numberOfClips: number;
  strategy: 'ai' | 'even' | 'manual' | 'object';
  exportFormat: '1080x1080' | '1080x1920';
  objectQueries?: string[];
}

export default function VideoCutterPage() {
  const [uploadedVideo, setUploadedVideo] = useState<VideoFile | null>(null);
  const [clipSettings, setClipSettings] = useState<ClipSettingsData>({
    clipDuration: 7,
    numberOfClips: 5,
    strategy: 'ai',
    exportFormat: '1080x1080',
    objectQueries: []
  });
  const [generatedClips, setGeneratedClips] = useState<VideoClip[]>([]);
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'upload' | 'configure' | 'results'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleVideoUpload = (videoFile: VideoFile) => {
    setUploadedVideo(videoFile);
    setActiveTab('configure');
  };

  const handleGenerateClips = async () => {
    if (!uploadedVideo) return;
    
    setIsProcessing(true);
    
    try {
      const clips: VideoClip[] = [];
      const { clipDuration, numberOfClips, strategy, objectQueries } = clipSettings;
      
      if (strategy === 'object' && objectQueries && objectQueries.length > 0) {
        // Object detection strategy
        const response = await fetch('/api/video-segmentation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: uploadedVideo.url,
            objectQueries,
            splitStrategy: 'object-presence',
            minSegmentDuration: clipDuration - 1,
            maxSegmentDuration: clipDuration + 1,
            confidenceThreshold: 0.6
          })
        });

        if (response.ok) {
          const { data } = await response.json();
          
          // Convert segments to clips, limiting to requested number
          data.segments.slice(0, numberOfClips).forEach((segment: VideoSegment, index: number) => {
            clips.push({
              id: `clip-${index}`,
              startTime: segment.startTime,
              endTime: segment.endTime,
              duration: segment.duration,
              thumbnailUrl: segment.thumbnailUrl
            });
          });
        }
      } else if (strategy === 'even') {
        // Even distribution
        const totalDuration = uploadedVideo.duration;
        const interval = (totalDuration - clipDuration) / (numberOfClips - 1);
        
        for (let i = 0; i < numberOfClips; i++) {
          const startTime = i * interval;
          clips.push({
            id: `clip-${i}`,
            startTime,
            endTime: startTime + clipDuration,
            duration: clipDuration
          });
        }
      } else {
        // AI strategy - simulate AI-detected interesting moments
        const interestingMoments = [5, 15, 30, 45, 60, 75, 90, 105, 120, 135];
        for (let i = 0; i < Math.min(numberOfClips, interestingMoments.length); i++) {
          const startTime = interestingMoments[i];
          clips.push({
            id: `clip-${i}`,
            startTime,
            endTime: startTime + clipDuration,
            duration: clipDuration
          });
        }
      }
      
      setGeneratedClips(clips);
      setActiveTab('results');
    } catch (error) {
      console.error('Error generating clips:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateClip = (clipId: string, updates: Partial<VideoClip>) => {
    setGeneratedClips(clips => 
      clips.map(clip => 
        clip.id === clipId ? { ...clip, ...updates } : clip
      )
    );
  };

  const handleSelectClip = (clipId: string) => {
    setSelectedClips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clipId)) {
        newSet.delete(clipId);
      } else {
        newSet.add(clipId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedClips(new Set(generatedClips.map(clip => clip.id)));
  };

  const handleSelectNone = () => {
    setSelectedClips(new Set());
  };

  const handleBatchExport = async () => {
    if (selectedClips.size === 0 || !uploadedVideo) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const clipsToExport = generatedClips.filter(clip => selectedClips.has(clip.id));
      const totalClips = clipsToExport.length;

      // Simulate batch export (in production, this would call an API)
      for (let i = 0; i < totalClips; i++) {
        const clip = clipsToExport[i];
        
        // Simulate export processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update progress
        setExportProgress(((i + 1) / totalClips) * 100);
        
        // In production, you would:
        // 1. Call an API to process the video segment
        // 2. Generate the export URL
        // 3. Download or provide download links
        console.log(`Exporting clip ${clip.id}: ${clip.startTime}s - ${clip.endTime}s`);
      }

      // Reset selection after export
      setSelectedClips(new Set());
    } catch (error) {
      console.error('Batch export failed:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Video Cutter</h1>
        <p className="text-muted-foreground">
          Upload a video and automatically cut it into 6-8 second clips perfect for social media ads
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'configure' | 'results')}>
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
          <TabsTrigger value="configure" disabled={!uploadedVideo}>
            Configure Clips
          </TabsTrigger>
          <TabsTrigger value="results" disabled={generatedClips.length === 0}>
            Results ({generatedClips.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card className="p-6">
            <VideoUpload onVideoUpload={handleVideoUpload} />
          </Card>
        </TabsContent>

        <TabsContent value="configure" className="space-y-6">
          {uploadedVideo && (
            <>
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Video Preview</h2>
                <VideoPreview video={uploadedVideo} />
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Clip Settings</h2>
                <ClipSettings
                  settings={clipSettings}
                  onSettingsChange={setClipSettings}
                  videoDuration={uploadedVideo.duration}
                  onGenerateClips={handleGenerateClips}
                  isProcessing={isProcessing}
                />
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {uploadedVideo && generatedClips.length > 0 && (
            <>
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Generated Clips</h2>
                <VideoClipsPanel
                  video={uploadedVideo}
                  clips={generatedClips}
                  selectedClips={selectedClips}
                  exportFormat={clipSettings.exportFormat}
                  onUpdateClip={handleUpdateClip}
                  onSelectClip={handleSelectClip}
                  onSelectAll={handleSelectAll}
                  onSelectNone={handleSelectNone}
                  onBatchExport={handleBatchExport}
                  isExporting={isExporting}
                  exportProgress={exportProgress}
                />
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">End Card Editor</h2>
                <EndCardEditor
                  clips={generatedClips}
                  onUpdateClip={handleUpdateClip}
                />
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}