import Replicate from 'replicate';
import {
  VideoSegmentationInput,
  VideoSegmentationConfig,
  VideoSegmentationError,
  SegmentationResult,
  VideoSegment,
  TrackedObject,
  ObjectDetection,
  YOLOWorldInput,
  YOLOWorldOutput,
  SAM2Input,
  SAM2Output,
  ProgressCallback,
  SegmentationProgress,
} from '@/types/video-segmentation';

export class VideoSegmentationService {
  private replicate: Replicate;
  private config: VideoSegmentationConfig;

  constructor(config: VideoSegmentationConfig) {
    this.config = {
      maxRetries: 3,
      timeout: 300000, // 5 minutes default
      ...config,
    };

    this.replicate = new Replicate({
      auth: config.replicateApiKey,
    });
  }

  /**
   * Main method to detect objects and split video into segments
   */
  async detectAndSplit(
    input: VideoSegmentationInput,
    progressCallback?: ProgressCallback
  ): Promise<SegmentationResult> {
    try {
      const startTime = Date.now();

      // Step 1: Detect objects using YOLO-World
      progressCallback?.({
        stage: 'detecting',
        progress: 0,
        message: 'Detecting objects in video...',
      });

      const detections = await this.detectObjects(input.videoUrl, input.objectQueries, {
        confidenceThreshold: input.confidenceThreshold,
      });

      progressCallback?.({
        stage: 'detecting',
        progress: 33,
        message: `Found ${detections.length} objects`,
      });

      // Step 2: Track objects using SAM-2
      progressCallback?.({
        stage: 'tracking',
        progress: 33,
        message: 'Tracking objects across frames...',
      });

      const tracks = await this.trackObjects(input.videoUrl, detections);

      progressCallback?.({
        stage: 'tracking',
        progress: 66,
        message: `Tracking ${tracks.length} objects`,
      });

      // Step 3: Generate segments based on strategy
      progressCallback?.({
        stage: 'splitting',
        progress: 66,
        message: 'Generating video segments...',
      });

      const segments = await this.generateSegments(
        tracks,
        input.splitStrategy,
        {
          minDuration: input.minSegmentDuration || 3,
          maxDuration: input.maxSegmentDuration || 30,
        }
      );

      progressCallback?.({
        stage: 'complete',
        progress: 100,
        message: `Generated ${segments.length} segments`,
      });

      const processingTime = Date.now() - startTime;

      return {
        segments,
        totalDuration: this.calculateTotalDuration(segments),
        fps: 30, // This should be extracted from video metadata
        totalFrames: 0, // This should be calculated from video
        processingTime,
      };
    } catch (error) {
      if (error instanceof VideoSegmentationError) {
        throw error;
      }
      throw new VideoSegmentationError(
        'Failed to process video',
        'PROCESSING',
        error
      );
    }
  }

  /**
   * Detect objects in video using YOLO-World
   */
  private async detectObjects(
    videoUrl: string,
    queries: string[],
    options: { confidenceThreshold?: number } = {}
  ): Promise<ObjectDetection[]> {
    try {
      const input: YOLOWorldInput = {
        video: videoUrl,
        prompts: queries,
        confidence_threshold: options.confidenceThreshold || 0.5,
        overlap_threshold: 0.3,
        device: 'cuda',
      };

      // Run YOLO-World model
      // Model: zsxkib/yolo-world:7c58aa7286e2de4e8f379c5e0e4d7bac616b396ab4aec72a6acfd088eb09e9f5
      const output = await this.replicate.run(
        'zsxkib/yolo-world:7c58aa7286e2de4e8f379c5e0e4d7bac616b396ab4aec72a6acfd088eb09e9f5',
        { input }
      ) as YOLOWorldOutput;

      // Convert YOLO output to our format
      const detections: ObjectDetection[] = [];
      
      output.detections.forEach((frameDetection) => {
        frameDetection.objects.forEach((obj) => {
          detections.push({
            label: obj.label,
            confidence: obj.confidence,
            bbox: {
              x: obj.bbox[0],
              y: obj.bbox[1],
              width: obj.bbox[2],
              height: obj.bbox[3],
            },
            frameNumber: frameDetection.frame,
            timestamp: frameDetection.frame / 30, // Assuming 30 fps
          });
        });
      });

      return detections;
    } catch (error) {
      console.error('Object detection error:', error);
      throw new VideoSegmentationError(
        'Failed to detect objects',
        'PROCESSING',
        error
      );
    }
  }

  /**
   * Track objects across frames using SAM-2
   */
  private async trackObjects(
    videoUrl: string,
    detections: ObjectDetection[]
  ): Promise<TrackedObject[]> {
    try {
      // Group detections by label to create initial boxes for tracking
      const detectionsByLabel = this.groupDetectionsByLabel(detections);
      const tracks: TrackedObject[] = [];

      for (const [label, labelDetections] of Object.entries(detectionsByLabel)) {
        // Get initial bounding boxes from first few frames
        const initialBoxes = labelDetections
          .slice(0, 3)
          .map(d => [d.bbox.x, d.bbox.y, d.bbox.width, d.bbox.height] as [number, number, number, number]);

        const input: SAM2Input = {
          video: videoUrl,
          boxes: initialBoxes,
          mask_threshold: 0.5,
          use_gpu: true,
        };

        // Run SAM-2 model
        // Model: meta/sam-2:fc813c39b61ae3b1e7c48c0e9cc81dc1c8161bba1bcffc0e0d5d5a9e6f21d01a
        const output = await this.replicate.run(
          'meta/sam-2:fc813c39b61ae3b1e7c48c0e9cc81dc1c8161bba1bcffc0e0d5d5a9e6f21d01a',
          { input }
        ) as SAM2Output;

        // Create tracked objects from SAM output
        output.tracks.forEach((track, index) => {
          const trackDetections = labelDetections.filter(d => 
            track.frames.includes(d.frameNumber)
          );

          if (trackDetections.length > 0) {
            tracks.push({
              trackId: `${label}-${index}`,
              label,
              detections: trackDetections,
              firstFrame: Math.min(...track.frames),
              lastFrame: Math.max(...track.frames),
              duration: (Math.max(...track.frames) - Math.min(...track.frames)) / 30,
            });
          }
        });
      }

      return tracks;
    } catch (error) {
      console.error('Object tracking error:', error);
      throw new VideoSegmentationError(
        'Failed to track objects',
        'PROCESSING',
        error
      );
    }
  }

  /**
   * Generate video segments based on tracking data
   */
  private async generateSegments(
    tracks: TrackedObject[],
    strategy: VideoSegmentationInput['splitStrategy'],
    options: { minDuration: number; maxDuration: number }
  ): Promise<VideoSegment[]> {
    const segments: VideoSegment[] = [];

    switch (strategy) {
      case 'object-presence':
        return this.generateObjectPresenceSegments(tracks, options);
      
      case 'object-absence':
        return this.generateObjectAbsenceSegments(tracks, options);
      
      case 'scene-change':
        return this.generateSceneChangeSegments(tracks, options);
      
      default:
        throw new VideoSegmentationError(
          'Invalid split strategy',
          'INVALID_INPUT'
        );
    }
  }

  /**
   * Generate segments where specified objects are present
   */
  private generateObjectPresenceSegments(
    tracks: TrackedObject[],
    options: { minDuration: number; maxDuration: number }
  ): VideoSegment[] {
    const segments: VideoSegment[] = [];
    const timelineEvents: Array<{ time: number; type: 'start' | 'end'; track: TrackedObject }> = [];

    // Create timeline events
    tracks.forEach(track => {
      const startTime = track.firstFrame / 30;
      const endTime = track.lastFrame / 30;
      
      timelineEvents.push({ time: startTime, type: 'start', track });
      timelineEvents.push({ time: endTime, type: 'end', track });
    });

    // Sort events by time
    timelineEvents.sort((a, b) => a.time - b.time);

    // Generate segments
    let activeTraces = new Set<TrackedObject>();
    let segmentStart: number | null = null;

    for (const event of timelineEvents) {
      if (event.type === 'start') {
        activeTraces.add(event.track);
        if (segmentStart === null) {
          segmentStart = event.time;
        }
      } else {
        activeTraces.delete(event.track);
        
        if (activeTraces.size === 0 && segmentStart !== null) {
          const duration = event.time - segmentStart;
          
          if (duration >= options.minDuration) {
            // Split long segments if needed
            if (duration > options.maxDuration) {
              const numSegments = Math.ceil(duration / options.maxDuration);
              const segmentDuration = duration / numSegments;
              
              for (let i = 0; i < numSegments; i++) {
                segments.push({
                  id: `segment-${segments.length}`,
                  startTime: segmentStart + (i * segmentDuration),
                  endTime: segmentStart + ((i + 1) * segmentDuration),
                  duration: segmentDuration,
                  detectedObjects: [...new Set(tracks.map(t => t.label))],
                  tracks: tracks.filter(t => 
                    t.firstFrame / 30 <= segmentStart + ((i + 1) * segmentDuration) &&
                    t.lastFrame / 30 >= segmentStart + (i * segmentDuration)
                  ),
                });
              }
            } else {
              segments.push({
                id: `segment-${segments.length}`,
                startTime: segmentStart,
                endTime: event.time,
                duration,
                detectedObjects: [...new Set(tracks.map(t => t.label))],
                tracks: tracks.filter(t => 
                  t.firstFrame / 30 <= event.time && t.lastFrame / 30 >= segmentStart
                ),
              });
            }
          }
          
          segmentStart = null;
        }
      }
    }

    return segments;
  }

  /**
   * Generate segments where specified objects are absent
   */
  private generateObjectAbsenceSegments(
    tracks: TrackedObject[],
    options: { minDuration: number; maxDuration: number }
  ): VideoSegment[] {
    // This would be the inverse of object presence
    // Implementation would identify gaps between object appearances
    // For brevity, returning empty array
    return [];
  }

  /**
   * Generate segments based on scene changes
   */
  private generateSceneChangeSegments(
    tracks: TrackedObject[],
    options: { minDuration: number; maxDuration: number }
  ): VideoSegment[] {
    // This would analyze when the set of visible objects changes significantly
    // For brevity, returning empty array
    return [];
  }

  /**
   * Helper method to group detections by label
   */
  private groupDetectionsByLabel(
    detections: ObjectDetection[]
  ): Record<string, ObjectDetection[]> {
    const grouped: Record<string, ObjectDetection[]> = {};
    
    detections.forEach(detection => {
      if (!grouped[detection.label]) {
        grouped[detection.label] = [];
      }
      grouped[detection.label].push(detection);
    });

    return grouped;
  }

  /**
   * Calculate total duration from segments
   */
  private calculateTotalDuration(segments: VideoSegment[]): number {
    if (segments.length === 0) return 0;
    
    const lastSegment = segments.reduce((latest, segment) => 
      segment.endTime > latest.endTime ? segment : latest
    );
    
    return lastSegment.endTime;
  }

  /**
   * Split video file into segments (returns URLs of split videos)
   */
  async splitVideo(
    videoUrl: string,
    segments: VideoSegment[]
  ): Promise<string[]> {
    // This would use a video processing service to actually split the video
    // For now, returning placeholder URLs
    return segments.map((segment, index) => 
      `${videoUrl}#segment-${index}-${segment.startTime}-${segment.endTime}`
    );
  }
}

/**
 * Factory function to create a video segmentation service
 */
export function createVideoSegmentationService(
  apiKey?: string
): VideoSegmentationService {
  const key = apiKey || process.env.REPLICATE_API_TOKEN;
  
  if (!key) {
    throw new VideoSegmentationError(
      'Replicate API key not configured',
      'AUTH'
    );
  }

  return new VideoSegmentationService({
    replicateApiKey: key,
  });
}