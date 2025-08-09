'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoUpload } from '@/components/video-cutter/VideoUpload';
import { VideoPreview } from '@/components/video-cutter/VideoPreview';
import { ClipSettings } from '@/components/video-cutter/ClipSettings';
import { VideoClipsPanel } from '@/components/video-cutter/VideoClipsPanel';
import { EndCardEditor } from '@/components/video-cutter/EndCardEditor';

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
  strategy: 'ai' | 'even' | 'manual';
  exportFormat: '1080x1080' | '1080x1920';
}

export default function VideoCutterPage() {
  const [uploadedVideo, setUploadedVideo] = useState<VideoFile | null>(null);
  const [clipSettings, setClipSettings] = useState<ClipSettingsData>({
    clipDuration: 7,
    numberOfClips: 5,
    strategy: 'ai',
    exportFormat: '1080x1080'
  });
  const [generatedClips, setGeneratedClips] = useState<VideoClip[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'configure' | 'results'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVideoUpload = (videoFile: VideoFile) => {
    setUploadedVideo(videoFile);
    setActiveTab('configure');
  };

  const handleGenerateClips = async () => {
    if (!uploadedVideo) return;
    
    setIsProcessing(true);
    
    // Simulate clip generation (in production, this would call an API)
    const clips: VideoClip[] = [];
    const { clipDuration, numberOfClips, strategy } = clipSettings;
    
    if (strategy === 'even') {
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
    setIsProcessing(false);
    setActiveTab('results');
  };

  const handleUpdateClip = (clipId: string, updates: Partial<VideoClip>) => {
    setGeneratedClips(clips => 
      clips.map(clip => 
        clip.id === clipId ? { ...clip, ...updates } : clip
      )
    );
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
                  exportFormat={clipSettings.exportFormat}
                  onUpdateClip={handleUpdateClip}
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