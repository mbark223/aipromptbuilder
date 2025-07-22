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
  element: 'full' | 'background' | 'foreground' | 'specific' | 'water' | 'sky' | 'vegetation' | 'fabric' | 'hair' | 'smoke' | 'fire' | 'particles' | 'custom';
  type: 'pan' | 'zoom' | 'float' | 'parallax' | 'pulse' | 'sway' | 'ripple' | 'flutter' | 'shimmer' | 'flow' | 'rotate' | 'typewriter' | 'fade-in' | 'slide-in' | 'glow' | 'illuminate' | 'sparkle' | 'bounce' | 'shake' | 'wave' | 'blur-in' | 'flicker';
  intensity: number; // 1-10
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out' | 'radial' | 'circular' | 'clockwise' | 'counter-clockwise';
  timing: 'ease' | 'linear' | 'ease-in' | 'ease-out';
  elementSelector?: string; // AI-detected element selector
  customBounds?: { // For user-selected elements
    x: number;
    y: number;
    width: number;
    height: number;
  };
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

export interface AnimationModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  speed: 'fast' | 'moderate' | 'slow';
  quality: 'good' | 'high' | 'very-high';
  costPerGeneration: number;
  replicateId?: string;
  pricing?: string;
  inputs?: ModelInput[];
}

export interface ModelInput {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'image';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
}

export interface BatchProcess {
  assets: StaticAsset[];
  targetFormats: Format[];
  animationProfile: AnimationProfile;
  model: AnimationModel;
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
  animationType: 'ai' | 'generic';
  model?: AnimationModel;
  prompt?: string;
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
  },
  {
    id: 'gentle-drift',
    name: 'Gentle Drift',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'pan',
        intensity: 1,
        direction: 'right',
        timing: 'linear'
      }
    ],
    duration: 8,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 1, easing: 'ease-out' },
      out: { type: 'fade', duration: 1, easing: 'ease-in' }
    }
  },
  {
    id: 'vertical-scroll',
    name: 'Vertical Scroll',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'pan',
        intensity: 5,
        direction: 'up',
        timing: 'linear'
      }
    ],
    duration: 4,
    loop: true,
    transitions: {
      in: { type: 'slide', duration: 0.3, easing: 'ease-out' },
      out: { type: 'slide', duration: 0.3, easing: 'ease-in' }
    }
  },
  {
    id: 'zoom-burst',
    name: 'Zoom Burst',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 8,
        direction: 'in',
        timing: 'ease-out'
      }
    ],
    duration: 1.5,
    loop: false,
    transitions: {
      in: { type: 'zoom', duration: 0.1, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.3, easing: 'ease-in' }
    }
  },
  {
    id: 'pendulum-sway',
    name: 'Pendulum Sway',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'sway',
        intensity: 4,
        timing: 'ease'
      }
    ],
    duration: 4,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'spiral-zoom',
    name: 'Spiral Zoom',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 6,
        direction: 'out',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'sway',
        intensity: 5,
        timing: 'linear'
      }
    ],
    duration: 3,
    loop: true,
    transitions: {
      in: { type: 'zoom', duration: 0.3, easing: 'ease-out' },
      out: { type: 'zoom', duration: 0.3, easing: 'ease-in' }
    }
  },
  {
    id: 'wave-motion',
    name: 'Wave Motion',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'float',
        intensity: 5,
        direction: 'up',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'sway',
        intensity: 3,
        timing: 'ease'
      }
    ],
    duration: 3.5,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.4, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.4, easing: 'ease-in' }
    }
  },
  {
    id: 'elastic-bounce',
    name: 'Elastic Bounce',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'float',
        intensity: 7,
        direction: 'down',
        timing: 'ease-out'
      },
      {
        element: 'full',
        type: 'pulse',
        intensity: 4,
        timing: 'ease'
      }
    ],
    duration: 2,
    loop: true,
    transitions: {
      in: { type: 'slide', duration: 0.2, easing: 'ease-out' },
      out: { type: 'slide', duration: 0.2, easing: 'ease-in' }
    }
  },
  {
    id: 'subtle-rotate',
    name: 'Subtle Rotate',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'sway',
        intensity: 1,
        timing: 'linear'
      }
    ],
    duration: 10,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 1, easing: 'ease-out' },
      out: { type: 'fade', duration: 1, easing: 'ease-in' }
    }
  },
  {
    id: 'heartbeat-pulse',
    name: 'Heartbeat Pulse',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'pulse',
        intensity: 5,
        timing: 'ease'
      }
    ],
    duration: 1.2,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.2, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.2, easing: 'ease-in' }
    }
  },
  {
    id: 'diagonal-slide',
    name: 'Diagonal Slide',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'pan',
        intensity: 4,
        direction: 'right',
        timing: 'linear'
      },
      {
        element: 'full',
        type: 'pan',
        intensity: 4,
        direction: 'down',
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
    id: 'micro-shake',
    name: 'Micro Shake',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'sway',
        intensity: 1,
        timing: 'linear'
      }
    ],
    duration: 0.1,
    loop: true,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'zoom-rotate',
    name: 'Zoom & Rotate',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 4,
        direction: 'in',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'sway',
        intensity: 6,
        timing: 'ease'
      }
    ],
    duration: 4,
    loop: false,
    transitions: {
      in: { type: 'zoom', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'glitch-effect',
    name: 'Glitch Effect',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'sway',
        intensity: 9,
        timing: 'linear'
      },
      {
        element: 'full',
        type: 'pulse',
        intensity: 8,
        timing: 'linear'
      }
    ],
    duration: 0.5,
    loop: true,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'slow-reveal',
    name: 'Slow Reveal',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 2,
        direction: 'out',
        timing: 'linear'
      }
    ],
    duration: 10,
    loop: false,
    transitions: {
      in: { type: 'fade', duration: 2, easing: 'ease-out' },
      out: { type: 'fade', duration: 2, easing: 'ease-in' }
    }
  },
  {
    id: 'butterfly-float',
    name: 'Butterfly Float',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'float',
        intensity: 4,
        direction: 'up',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'sway',
        intensity: 3,
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
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'depth-parallax',
    name: 'Depth Parallax',
    type: 'moderate',
    movements: [
      {
        element: 'background',
        type: 'pan',
        intensity: 1,
        direction: 'right',
        timing: 'linear'
      },
      {
        element: 'foreground',
        type: 'pan',
        intensity: 6,
        direction: 'right',
        timing: 'linear'
      },
      {
        element: 'background',
        type: 'zoom',
        intensity: 1,
        direction: 'out',
        timing: 'linear'
      }
    ],
    duration: 8,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 1, easing: 'ease-out' },
      out: { type: 'fade', duration: 1, easing: 'ease-in' }
    }
  },
  {
    id: 'liquid-morph',
    name: 'Liquid Morph',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'pulse',
        intensity: 6,
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'sway',
        intensity: 4,
        timing: 'ease'
      }
    ],
    duration: 3,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'cinematic-pan',
    name: 'Cinematic Pan',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'pan',
        intensity: 3,
        direction: 'right',
        timing: 'ease'
      }
    ],
    duration: 12,
    loop: false,
    transitions: {
      in: { type: 'fade', duration: 1.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 1.5, easing: 'ease-in' }
    }
  },
  {
    id: 'bounce-zoom',
    name: 'Bounce Zoom',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 7,
        direction: 'in',
        timing: 'ease-out'
      },
      {
        element: 'full',
        type: 'zoom',
        intensity: 3,
        direction: 'out',
        timing: 'ease-in'
      }
    ],
    duration: 1.5,
    loop: true,
    transitions: {
      in: { type: 'zoom', duration: 0.2, easing: 'ease-out' },
      out: { type: 'zoom', duration: 0.2, easing: 'ease-in' }
    }
  },
  {
    id: 'ethereal-float',
    name: 'Ethereal Float',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'float',
        intensity: 2,
        direction: 'up',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'pulse',
        intensity: 1,
        timing: 'ease'
      }
    ],
    duration: 6,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 2, easing: 'ease-out' },
      out: { type: 'fade', duration: 2, easing: 'ease-in' }
    }
  },
  {
    id: 'rapid-pulse',
    name: 'Rapid Pulse',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'pulse',
        intensity: 8,
        timing: 'linear'
      }
    ],
    duration: 0.3,
    loop: true,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'tilt-shift',
    name: 'Tilt Shift',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'sway',
        intensity: 3,
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'zoom',
        intensity: 2,
        direction: 'in',
        timing: 'ease'
      }
    ],
    duration: 5,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'horizon-drift',
    name: 'Horizon Drift',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'pan',
        intensity: 2,
        direction: 'left',
        timing: 'linear'
      },
      {
        element: 'full',
        type: 'float',
        intensity: 1,
        direction: 'down',
        timing: 'ease'
      }
    ],
    duration: 15,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 2, easing: 'ease-out' },
      out: { type: 'fade', duration: 2, easing: 'ease-in' }
    }
  },
  {
    id: 'vortex-spin',
    name: 'Vortex Spin',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'sway',
        intensity: 10,
        timing: 'linear'
      },
      {
        element: 'full',
        type: 'zoom',
        intensity: 5,
        direction: 'in',
        timing: 'linear'
      }
    ],
    duration: 2,
    loop: true,
    transitions: {
      in: { type: 'zoom', duration: 0.3, easing: 'ease-out' },
      out: { type: 'zoom', duration: 0.3, easing: 'ease-in' }
    }
  },
  {
    id: 'gentle-wobble',
    name: 'Gentle Wobble',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'sway',
        intensity: 2,
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'float',
        intensity: 1,
        direction: 'up',
        timing: 'ease'
      }
    ],
    duration: 4,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'strobe-flash',
    name: 'Strobe Flash',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'pulse',
        intensity: 10,
        timing: 'linear'
      }
    ],
    duration: 0.1,
    loop: true,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'infinity-loop',
    name: 'Infinity Loop',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'pan',
        intensity: 4,
        direction: 'right',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'pan',
        intensity: 4,
        direction: 'left',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'float',
        intensity: 3,
        direction: 'up',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'float',
        intensity: 3,
        direction: 'down',
        timing: 'ease'
      }
    ],
    duration: 8,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'dreamy-fade',
    name: 'Dreamy Fade',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'pulse',
        intensity: 3,
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'zoom',
        intensity: 1,
        direction: 'out',
        timing: 'ease'
      }
    ],
    duration: 8,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 3, easing: 'ease-out' },
      out: { type: 'fade', duration: 3, easing: 'ease-in' }
    }
  },
  {
    id: 'earthquake-shake',
    name: 'Earthquake Shake',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'sway',
        intensity: 8,
        timing: 'linear'
      },
      {
        element: 'full',
        type: 'float',
        intensity: 6,
        direction: 'up',
        timing: 'linear'
      },
      {
        element: 'full',
        type: 'float',
        intensity: 6,
        direction: 'down',
        timing: 'linear'
      }
    ],
    duration: 1,
    loop: true,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'smooth-transition',
    name: 'Smooth Transition',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'pan',
        intensity: 5,
        direction: 'right',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'zoom',
        intensity: 3,
        direction: 'in',
        timing: 'ease'
      }
    ],
    duration: 6,
    loop: false,
    transitions: {
      in: { type: 'fade', duration: 1, easing: 'ease-out' },
      out: { type: 'fade', duration: 1, easing: 'ease-in' }
    }
  },
  {
    id: 'hypnotic-spiral',
    name: 'Hypnotic Spiral',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'sway',
        intensity: 7,
        timing: 'linear'
      },
      {
        element: 'full',
        type: 'zoom',
        intensity: 4,
        direction: 'in',
        timing: 'linear'
      },
      {
        element: 'full',
        type: 'pulse',
        intensity: 3,
        timing: 'linear'
      }
    ],
    duration: 5,
    loop: true,
    transitions: {
      in: { type: 'zoom', duration: 0.5, easing: 'ease-out' },
      out: { type: 'zoom', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'ocean-wave',
    name: 'Ocean Wave',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'float',
        intensity: 4,
        direction: 'up',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'pan',
        intensity: 2,
        direction: 'right',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'float',
        intensity: 4,
        direction: 'down',
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
    duration: 7,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 1, easing: 'ease-out' },
      out: { type: 'fade', duration: 1, easing: 'ease-in' }
    }
  },
  {
    id: 'neon-flicker',
    name: 'Neon Flicker',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'pulse',
        intensity: 9,
        timing: 'linear'
      }
    ],
    duration: 0.2,
    loop: true,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'fade', duration: 0.1, easing: 'ease-in' }
    }
  },
  {
    id: 'vintage-film',
    name: 'Vintage Film',
    type: 'subtle',
    movements: [
      {
        element: 'full',
        type: 'sway',
        intensity: 1,
        timing: 'linear'
      },
      {
        element: 'full',
        type: 'pulse',
        intensity: 2,
        timing: 'linear'
      }
    ],
    duration: 1,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.2, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.2, easing: 'ease-in' }
    }
  },
  {
    id: 'living-water',
    name: 'Living Water',
    type: 'subtle',
    movements: [
      {
        element: 'water',
        type: 'ripple',
        intensity: 4,
        direction: 'radial',
        timing: 'ease'
      },
      {
        element: 'water',
        type: 'flow',
        intensity: 2,
        direction: 'right',
        timing: 'linear'
      }
    ],
    duration: 4,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'sky-dynamics',
    name: 'Sky Dynamics',
    type: 'subtle',
    movements: [
      {
        element: 'sky',
        type: 'flow',
        intensity: 3,
        direction: 'right',
        timing: 'linear'
      },
      {
        element: 'sky',
        type: 'shimmer',
        intensity: 2,
        timing: 'ease'
      }
    ],
    duration: 8,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 1, easing: 'ease-out' },
      out: { type: 'fade', duration: 1, easing: 'ease-in' }
    }
  },
  {
    id: 'nature-breath',
    name: 'Nature Breath',
    type: 'subtle',
    movements: [
      {
        element: 'vegetation',
        type: 'sway',
        intensity: 3,
        direction: 'right',
        timing: 'ease'
      },
      {
        element: 'vegetation',
        type: 'flutter',
        intensity: 2,
        timing: 'ease'
      }
    ],
    duration: 5,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'fabric-dance',
    name: 'Fabric Dance',
    type: 'moderate',
    movements: [
      {
        element: 'fabric',
        type: 'flutter',
        intensity: 5,
        direction: 'up',
        timing: 'ease'
      },
      {
        element: 'fabric',
        type: 'sway',
        intensity: 4,
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
    id: 'hair-flow',
    name: 'Hair Flow',
    type: 'subtle',
    movements: [
      {
        element: 'hair',
        type: 'flow',
        intensity: 3,
        direction: 'right',
        timing: 'ease'
      },
      {
        element: 'hair',
        type: 'flutter',
        intensity: 2,
        timing: 'ease'
      }
    ],
    duration: 4,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'smoke-drift',
    name: 'Smoke Drift',
    type: 'moderate',
    movements: [
      {
        element: 'smoke',
        type: 'flow',
        intensity: 4,
        direction: 'up',
        timing: 'ease'
      },
      {
        element: 'smoke',
        type: 'shimmer',
        intensity: 3,
        timing: 'linear'
      }
    ],
    duration: 6,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 1, easing: 'ease-out' },
      out: { type: 'fade', duration: 1, easing: 'ease-in' }
    }
  },
  {
    id: 'fire-flicker',
    name: 'Fire Flicker',
    type: 'dynamic',
    movements: [
      {
        element: 'fire',
        type: 'flutter',
        intensity: 8,
        direction: 'up',
        timing: 'linear'
      },
      {
        element: 'fire',
        type: 'pulse',
        intensity: 6,
        timing: 'ease'
      },
      {
        element: 'fire',
        type: 'shimmer',
        intensity: 7,
        timing: 'linear'
      }
    ],
    duration: 1,
    loop: true,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'particle-float',
    name: 'Particle Float',
    type: 'subtle',
    movements: [
      {
        element: 'particles',
        type: 'float',
        intensity: 3,
        direction: 'up',
        timing: 'linear'
      },
      {
        element: 'particles',
        type: 'shimmer',
        intensity: 2,
        timing: 'ease'
      }
    ],
    duration: 5,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'cinemagraph-master',
    name: 'Cinemagraph Master',
    type: 'moderate',
    movements: [
      {
        element: 'water',
        type: 'ripple',
        intensity: 3,
        direction: 'radial',
        timing: 'ease'
      },
      {
        element: 'vegetation',
        type: 'sway',
        intensity: 2,
        timing: 'ease'
      },
      {
        element: 'sky',
        type: 'flow',
        intensity: 1,
        direction: 'right',
        timing: 'linear'
      }
    ],
    duration: 6,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 1, easing: 'ease-out' },
      out: { type: 'fade', duration: 1, easing: 'ease-in' }
    }
  },
  {
    id: 'selective-motion',
    name: 'Selective Motion',
    type: 'subtle',
    movements: [
      {
        element: 'specific',
        type: 'pulse',
        intensity: 3,
        timing: 'ease',
        elementSelector: 'primary-subject'
      },
      {
        element: 'background',
        type: 'shimmer',
        intensity: 1,
        timing: 'linear'
      }
    ],
    duration: 4,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'custom-elements',
    name: 'Custom Elements',
    type: 'dynamic',
    movements: [], // Will be populated by user selections
    duration: 5,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'ferris-wheel-spin',
    name: 'Ferris Wheel Spin',
    type: 'moderate',
    movements: [
      {
        element: 'custom',
        type: 'rotate',
        intensity: 3,
        direction: 'clockwise',
        timing: 'linear'
      }
    ],
    duration: 10,
    loop: true,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'logo-pulse-glow',
    name: 'Logo Pulse & Glow',
    type: 'subtle',
    movements: [
      {
        element: 'custom',
        type: 'pulse',
        intensity: 3,
        timing: 'ease'
      },
      {
        element: 'custom',
        type: 'shimmer',
        intensity: 2,
        timing: 'ease'
      }
    ],
    duration: 3,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'text-typewriter',
    name: 'Text Typewriter',
    type: 'moderate',
    movements: [
      {
        element: 'custom',
        type: 'typewriter',
        intensity: 5,
        timing: 'linear'
      }
    ],
    duration: 2,
    loop: false,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    type: 'moderate',
    movements: [
      {
        element: 'custom',
        type: 'glow',
        intensity: 7,
        timing: 'ease'
      }
    ],
    duration: 3,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'illuminate-sign',
    name: 'Illuminate Sign',
    type: 'moderate',
    movements: [
      {
        element: 'custom',
        type: 'illuminate',
        intensity: 6,
        timing: 'ease'
      }
    ],
    duration: 2,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.3, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.3, easing: 'ease-in' }
    }
  },
  {
    id: 'sparkle-magic',
    name: 'Sparkle Magic',
    type: 'dynamic',
    movements: [
      {
        element: 'custom',
        type: 'sparkle',
        intensity: 8,
        timing: 'ease'
      }
    ],
    duration: 3,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'candle-flicker',
    name: 'Candle Flicker',
    type: 'subtle',
    movements: [
      {
        element: 'custom',
        type: 'flicker',
        intensity: 4,
        timing: 'linear'
      }
    ],
    duration: 2,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.2, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.2, easing: 'ease-in' }
    }
  },
  {
    id: 'bounce-playful',
    name: 'Playful Bounce',
    type: 'dynamic',
    movements: [
      {
        element: 'custom',
        type: 'bounce',
        intensity: 6,
        direction: 'up',
        timing: 'ease'
      }
    ],
    duration: 2,
    loop: true,
    transitions: {
      in: { type: 'slide', duration: 0.3, easing: 'ease-out' },
      out: { type: 'slide', duration: 0.3, easing: 'ease-in' }
    }
  },
  {
    id: 'shake-alert',
    name: 'Alert Shake',
    type: 'moderate',
    movements: [
      {
        element: 'custom',
        type: 'shake',
        intensity: 5,
        timing: 'linear'
      }
    ],
    duration: 0.5,
    loop: false,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'wave-flag',
    name: 'Flag Wave',
    type: 'moderate',
    movements: [
      {
        element: 'custom',
        type: 'wave',
        intensity: 4,
        direction: 'right',
        timing: 'ease'
      }
    ],
    duration: 3,
    loop: true,
    transitions: {
      in: { type: 'fade', duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'fade-in-elegant',
    name: 'Elegant Fade In',
    type: 'subtle',
    movements: [
      {
        element: 'custom',
        type: 'fade-in',
        intensity: 5,
        timing: 'ease'
      }
    ],
    duration: 1.5,
    loop: false,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'fade', duration: 0.3, easing: 'ease-in' }
    }
  },
  {
    id: 'slide-in-dynamic',
    name: 'Dynamic Slide In',
    type: 'moderate',
    movements: [
      {
        element: 'custom',
        type: 'slide-in',
        intensity: 7,
        direction: 'left',
        timing: 'ease-out'
      }
    ],
    duration: 1,
    loop: false,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'blur-focus',
    name: 'Blur to Focus',
    type: 'moderate',
    movements: [
      {
        element: 'custom',
        type: 'blur-in',
        intensity: 8,
        timing: 'ease-out'
      }
    ],
    duration: 1.5,
    loop: false,
    transitions: {
      in: { type: 'none', duration: 0, easing: 'linear' },
      out: { type: 'none', duration: 0, easing: 'linear' }
    }
  },
  // Model-specific animations
  {
    id: 'veo3-cinematic',
    name: 'Veo3 Cinematic Motion',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 4,
        direction: 'in',
        timing: 'ease-out'
      },
      {
        element: 'full',
        type: 'pan',
        intensity: 3,
        direction: 'right',
        timing: 'ease'
      }
    ],
    duration: 5,
    loop: false,
    transitions: {
      in: { type: 'fade', duration: 0.8, easing: 'ease-out' },
      out: { type: 'fade', duration: 0.8, easing: 'ease-in' }
    }
  },
  {
    id: 'gen3-creative-flow',
    name: 'Gen-3 Creative Flow',
    type: 'dynamic',
    movements: [
      {
        element: 'background',
        type: 'parallax',
        intensity: 3,
        direction: 'left',
        timing: 'linear'
      },
      {
        element: 'foreground',
        type: 'float',
        intensity: 5,
        direction: 'up',
        timing: 'ease'
      },
      {
        element: 'specific',
        type: 'rotate',
        intensity: 2,
        direction: 'clockwise',
        timing: 'ease'
      }
    ],
    duration: 4,
    loop: true,
    transitions: {
      in: { type: 'zoom', duration: 0.6, easing: 'ease-out' },
      out: { type: 'zoom', duration: 0.6, easing: 'ease-in' }
    }
  },
  {
    id: 'luma-smooth-motion',
    name: 'Luma Smooth Motion',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'pan',
        intensity: 2,
        direction: 'right',
        timing: 'linear'
      },
      {
        element: 'full',
        type: 'float',
        intensity: 3,
        direction: 'up',
        timing: 'ease'
      }
    ],
    duration: 5,
    loop: true,
    transitions: {
      in: { type: 'slide', duration: 0.4, easing: 'ease-out' },
      out: { type: 'slide', duration: 0.4, easing: 'ease-in' }
    }
  },
  {
    id: 'veo3-dynamic-zoom',
    name: 'Veo3 Dynamic Zoom',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 6,
        direction: 'in',
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'zoom',
        intensity: 6,
        direction: 'out',
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
    id: 'gen3-artistic-pan',
    name: 'Gen-3 Artistic Pan',
    type: 'moderate',
    movements: [
      {
        element: 'full',
        type: 'pan',
        intensity: 5,
        direction: 'left',
        timing: 'ease-out'
      },
      {
        element: 'specific',
        type: 'glow',
        intensity: 4,
        timing: 'ease'
      }
    ],
    duration: 6,
    loop: false,
    transitions: {
      in: { type: 'fade', duration: 1, easing: 'ease-out' },
      out: { type: 'fade', duration: 1, easing: 'ease-in' }
    }
  },
  {
    id: 'luma-fast-pulse',
    name: 'Luma Fast Pulse',
    type: 'dynamic',
    movements: [
      {
        element: 'full',
        type: 'pulse',
        intensity: 6,
        timing: 'ease'
      },
      {
        element: 'full',
        type: 'shimmer',
        intensity: 4,
        timing: 'linear'
      }
    ],
    duration: 2,
    loop: true,
    transitions: {
      in: { type: 'zoom', duration: 0.2, easing: 'ease-out' },
      out: { type: 'zoom', duration: 0.2, easing: 'ease-in' }
    }
  }
];