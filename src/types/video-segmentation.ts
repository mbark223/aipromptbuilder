// Video Segmentation Types for Replicate Integration

export interface VideoSegmentationInput {
  videoUrl: string;
  objectQueries: string[]; // e.g., ['person', 'car', 'dog']
  splitStrategy: 'object-presence' | 'object-absence' | 'scene-change';
  minSegmentDuration?: number; // minimum duration in seconds
  maxSegmentDuration?: number; // maximum duration in seconds
  confidenceThreshold?: number; // 0-1, default 0.5
}

export interface ObjectDetection {
  label: string;
  confidence: number;
  bbox: BoundingBox;
  frameNumber: number;
  timestamp: number; // in seconds
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TrackedObject {
  trackId: string;
  label: string;
  detections: ObjectDetection[];
  firstFrame: number;
  lastFrame: number;
  duration: number; // in seconds
}

export interface VideoSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration: number;
  detectedObjects: string[]; // labels of objects in this segment
  tracks: TrackedObject[];
  thumbnailUrl?: string;
  videoUrl?: string; // URL of the split segment
}

export interface SegmentationResult {
  segments: VideoSegment[];
  totalDuration: number;
  fps: number;
  totalFrames: number;
  processingTime: number; // in milliseconds
}

// Replicate Model Specific Types
export interface YOLOWorldInput {
  video: string;
  prompts: string[]; // text queries like "person", "car"
  confidence_threshold?: number;
  overlap_threshold?: number;
  device?: 'cuda' | 'cpu';
}

export interface YOLOWorldOutput {
  detections: {
    frame: number;
    objects: Array<{
      label: string;
      confidence: number;
      bbox: [number, number, number, number]; // [x, y, width, height]
    }>;
  }[];
}

export interface SAM2Input {
  video: string;
  points?: Array<[number, number]>; // initial points to track
  boxes?: Array<[number, number, number, number]>; // initial boxes to track
  mask_threshold?: number;
  use_gpu?: boolean;
}

export interface SAM2Output {
  masks: Array<{
    frame: number;
    mask: string; // base64 encoded mask
    confidence: number;
  }>;
  tracks: Array<{
    id: string;
    frames: number[];
  }>;
}

// Service Configuration
export interface VideoSegmentationConfig {
  replicateApiKey: string;
  maxRetries?: number;
  timeout?: number; // in milliseconds
  webhookUrl?: string; // for async processing
}

// Error Types
export class VideoSegmentationError extends Error {
  constructor(
    message: string,
    public code: 'AUTH' | 'NETWORK' | 'PROCESSING' | 'INVALID_INPUT',
    public details?: unknown
  ) {
    super(message);
    this.name = 'VideoSegmentationError';
  }
}

// Progress Tracking
export interface SegmentationProgress {
  stage: 'detecting' | 'tracking' | 'splitting' | 'complete';
  progress: number; // 0-100
  message: string;
  currentFrame?: number;
  totalFrames?: number;
}

export type ProgressCallback = (progress: SegmentationProgress) => void;