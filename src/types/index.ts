export interface Prompt {
  id: string;
  projectId: string;
  title: string;
  content: {
    subject: string;
    style: string;
    composition: string;
    lighting: string;
    motion?: string;
    technical: string;
  };
  format: Format;
  consistency: {
    seedId?: string;
    lockedParams: string[];
    colorPalette?: string[];
  };
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    version: number;
    tags: string[];
  };
}

export interface Format {
  aspectRatio: string;
  width: number;
  height: number;
  name: string;
  custom: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created: Date;
  modified: Date;
  prompts: string[]; // Array of prompt IDs
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  content: Partial<Prompt['content']>;
  format?: Format;
  tags: string[];
  isPublic: boolean;
  author: string;
  created: Date;
}

export interface ExportConfig {
  platform: 'veo' | 'flows' | 'generic';
  format: 'json' | 'csv' | 'txt';
  includeMetadata: boolean;
  options?: Record<string, unknown>;
}

export interface ConsistencySettings {
  seedId?: string;
  lockedParams: string[];
  colorPalette?: string[];
  styleReference?: string;
  characterIds?: string[];
}

export const PRESET_FORMATS: Format[] = [
  { aspectRatio: '1:1', width: 1080, height: 1080, name: 'Square', custom: false },
  { aspectRatio: '9:16', width: 1080, height: 1920, name: 'Vertical', custom: false },
  { aspectRatio: '16:9', width: 1920, height: 1080, name: 'Horizontal', custom: false },
  { aspectRatio: '4:5', width: 1080, height: 1350, name: 'Portrait', custom: false },
];

export const PROMPT_SECTIONS = [
  { key: 'subject', label: 'Subject/Main Elements', required: true },
  { key: 'style', label: 'Style & Aesthetic', required: true },
  { key: 'composition', label: 'Camera/Shot Composition', required: true },
  { key: 'lighting', label: 'Lighting & Mood', required: true },
  { key: 'motion', label: 'Motion/Animation', required: false },
  { key: 'technical', label: 'Technical Specifications', required: true },
] as const;

export type PromptSection = typeof PROMPT_SECTIONS[number]['key'];

// Static-to-Motion Types
export interface StaticAsset {
  id: string;
  projectId: string;
  originalFile: {
    url: string;
    name: string;
    size: number;
    format: 'jpg' | 'png' | 'webp' | 'svg';
    dimensions: {
      width: number;
      height: number;
      aspectRatio: string;
    };
  };
  processedVersions: ProcessedAsset[];
  animationProfile: AnimationProfile;
  metadata: {
    uploaded: Date;
    author: string;
    tags: string[];
    brand?: BrandGuidelines;
  };
}

export interface ProcessedAsset {
  format: Format;
  url: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  animationPrompt?: string;
}

export interface AnimationProfile {
  id: string;
  name: string;
  type: 'subtle' | 'moderate' | 'dynamic' | 'custom';
  movements: Movement[];
  duration: number; // in seconds
  loop: boolean;
  transitions: {
    in: TransitionEffect;
    out: TransitionEffect;
  };
}

export interface Movement {
  element: 'full' | 'background' | 'foreground' | 'specific';
  type: 'pan' | 'zoom' | 'float' | 'parallax' | 'pulse' | 'sway';
  intensity: number; // 1-10
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  timing: 'ease' | 'linear' | 'ease-in' | 'ease-out';
}

export interface TransitionEffect {
  type: 'fade' | 'slide' | 'zoom' | 'none';
  duration: number;
  easing: string;
}

export interface BrandGuidelines {
  colors: string[];
  fonts: string[];
  logoUrl?: string;
  styleGuide?: string;
}

export interface BatchProcess {
  assets: StaticAsset[];
  targetFormats: Format[];
  animationProfile: AnimationProfile;
  options: {
    preserveFocalPoint: boolean;
    aiEdgeExtension: boolean;
    qualityPreset: 'draft' | 'standard' | 'high';
    estimatedCredits: number;
  };
}

export interface AnimationPrompt {
  baseImage: string; // reference to static
  motionDescription: string;
  preserveElements: string[];
  animationStyle: string;
  technicalParams: {
    fps: number;
    duration: number;
    resolution: string;
    codec: string;
  };
}

export interface ExportFormat {
  aspectRatio: string;
  resolution: string;
  fileType: 'mp4' | 'webm' | 'gif';
  compression: 'standard' | 'optimized' | 'lossless';
}

export interface StaticToMotionExportConfig {
  platforms: ('veo' | 'flows')[];
  formats: ExportFormat[];
  naming: {
    pattern: string;
    includeFormat: boolean;
    includeAnimation: boolean;
  };
  delivery: {
    method: 'download' | 'cloudStorage' | 'direct';
    webhook?: string;
  };
}

export interface QueueItem {
  id: string;
  assetId: string;
  asset: StaticAsset;
  formats: Format[];
  animation: AnimationProfile;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  outputs?: { format: string; url: string }[];
}

export interface ProcessingResult {
  successful: string[];
  failed: { assetId: string; error: string }[];
  totalTime: number;
}

// Animation Templates
export const ANIMATION_TEMPLATES: AnimationProfile[] = [
  {
    id: 'subtle-breathing',
    name: 'Subtle Breathing',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'pulse',
        intensity: 2,
        timing: 'ease'
      }
    ],
    duration: 3,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.3, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.3, easing: 'ease-in' }
    }
  },
  {
    id: 'ambient-float',
    name: 'Ambient Float',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'float',
        intensity: 3,
        direction: 'up',
        timing: 'ease'
      }
    ],
    duration: 4,
    loop: true,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'parallax-layers',
    name: 'Parallax Layers',
    type: 'moderate',
    movements: [
      {
        element: 'background',
        type: 'pan',
        intensity: 2,
        direction: 'right',
        timing: 'linear'
      },
      {
        element: 'foreground',
        type: 'pan',
        intensity: 4,
        direction: 'right',
        timing: 'linear'
      }
    ],
    duration: 5,
    loop: true,
    transitions: {
      in: { type: 'slide', duration: 0.5, easing: 'ease-out' },
      out: { type: 'slide', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'ken-burns',
    name: 'Ken Burns',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 3,
        direction: 'in',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'pan',
        intensity: 2,
        direction: 'left',
        timing: 'ease'
      }
    ],
    duration: 6,
    loop: false,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'cinemagraph-loop',
    name: 'Cinemagraph Loop',
    type: 'subtle',
    movements: [
      {
        element: 'specific',
        type: 'sway',
        intensity: 2,
        timing: 'ease'
      }
    ],
    duration: 3,
    loop: true,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'social-media-optimized',
    name: 'Social Media Optimized',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 5,
        direction: 'in',
        timing: 'ease-out'
      },
      {
        element: 'full',
        type: 'pulse',
        intensity: 3,
        timing: 'ease'
      }
    ],
    duration: 2,
    loop: true,
    transitions: {
      in: { type: 'zoom', duration: 0.2, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.2, easing: 'ease-in' }
    }
  }
];