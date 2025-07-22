import { AnimationModel } from '@/types';

// OpenRouter API models for video generation
// These models can be accessed through OpenRouter's unified API
export const OPENROUTER_VIDEO_MODELS: AnimationModel[] = [
  // Stability AI Models
  {
    id: 'stability-ai-stable-video-diffusion',
    name: 'Stable Video Diffusion',
    provider: 'Stability AI',
    description: 'High-quality video generation from images with temporal consistency',
    capabilities: ['Image-to-Video', 'Temporal Consistency', 'High Quality', '4-second videos'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0.25,
    replicateId: 'stability-ai/stable-video-diffusion',
    pricing: '$0.25/generation',
    inputs: [
      {
        name: 'image',
        type: 'image',
        label: 'Input Image',
        required: true,
        placeholder: 'Upload image to animate'
      },
      {
        name: 'num_frames',
        type: 'number',
        label: 'Number of Frames',
        required: false,
        defaultValue: 25,
        min: 14,
        max: 25
      },
      {
        name: 'fps',
        type: 'number',
        label: 'Frames Per Second',
        required: false,
        defaultValue: 6,
        min: 3,
        max: 30
      },
      {
        name: 'motion_bucket_id',
        type: 'number',
        label: 'Motion Amount',
        required: false,
        defaultValue: 127,
        min: 1,
        max: 255,
        placeholder: 'Controls motion intensity'
      },
      {
        name: 'cond_aug',
        type: 'number',
        label: 'Conditioning Augmentation',
        required: false,
        defaultValue: 0.02,
        min: 0,
        max: 1
      },
      {
        name: 'seed',
        type: 'number',
        label: 'Seed',
        required: false,
        placeholder: 'Random seed for reproducibility'
      }
    ]
  },

  // Pika Labs
  {
    id: 'pika-labs-1.0',
    name: 'Pika 1.0',
    provider: 'Pika Labs',
    description: 'Creative video generation with advanced motion control and effects',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Motion Control', 'Creative Effects'],
    speed: 'moderate',
    quality: 'very-high',
    costPerGeneration: 0.50,
    replicateId: 'pika-labs/pika-1.0',
    pricing: '$0.50/generation',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Describe the video you want to generate...'
      },
      {
        name: 'image',
        type: 'image',
        label: 'Reference Image (Optional)',
        required: false,
        placeholder: 'Upload image for image-to-video'
      },
      {
        name: 'motion_strength',
        type: 'select',
        label: 'Motion Strength',
        required: false,
        options: [
          { value: 'auto', label: 'Auto' },
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ],
        defaultValue: 'auto'
      },
      {
        name: 'camera_motion',
        type: 'select',
        label: 'Camera Motion',
        required: false,
        options: [
          { value: 'none', label: 'None' },
          { value: 'pan_left', label: 'Pan Left' },
          { value: 'pan_right', label: 'Pan Right' },
          { value: 'zoom_in', label: 'Zoom In' },
          { value: 'zoom_out', label: 'Zoom Out' },
          { value: 'rotate', label: 'Rotate' }
        ],
        defaultValue: 'none'
      },
      {
        name: 'duration',
        type: 'select',
        label: 'Duration',
        required: false,
        options: [
          { value: '3', label: '3 seconds' },
          { value: '4', label: '4 seconds' },
          { value: '5', label: '5 seconds' }
        ],
        defaultValue: '3'
      }
    ]
  },

  // Genmo AI
  {
    id: 'genmo-mochi-1',
    name: 'Mochi 1',
    provider: 'Genmo',
    description: 'Fast, creative video generation with unique artistic styles',
    capabilities: ['Text-to-Video', 'Artistic Styles', 'Fast Generation', 'Creative Control'],
    speed: 'fast',
    quality: 'high',
    costPerGeneration: 0.30,
    replicateId: 'genmo/mochi-1',
    pricing: '$0.30/generation',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Describe your video...'
      },
      {
        name: 'num_frames',
        type: 'number',
        label: 'Number of Frames',
        required: false,
        defaultValue: 30,
        min: 16,
        max: 48
      },
      {
        name: 'fps',
        type: 'number',
        label: 'FPS',
        required: false,
        defaultValue: 8,
        min: 4,
        max: 24
      },
      {
        name: 'style_strength',
        type: 'number',
        label: 'Style Strength',
        required: false,
        defaultValue: 0.5,
        min: 0,
        max: 1
      }
    ]
  },

  // Meta's Emu Video
  {
    id: 'meta-emu-video',
    name: 'Emu Video',
    provider: 'Meta',
    description: 'High-quality video generation with excellent temporal coherence',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'High Quality', 'Temporal Coherence'],
    speed: 'moderate',
    quality: 'very-high',
    costPerGeneration: 0.40,
    replicateId: 'meta/emu-video',
    pricing: '$0.40/generation',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Describe the video content...'
      },
      {
        name: 'image',
        type: 'image',
        label: 'Reference Image (Optional)',
        required: false
      },
      {
        name: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        required: false,
        defaultValue: 4,
        min: 2,
        max: 8
      },
      {
        name: 'quality',
        type: 'select',
        label: 'Quality',
        required: false,
        options: [
          { value: 'standard', label: 'Standard' },
          { value: 'high', label: 'High' },
          { value: 'ultra', label: 'Ultra' }
        ],
        defaultValue: 'high'
      }
    ]
  },

  // Alibaba's I2VGen-XL
  {
    id: 'alibaba-i2vgen-xl',
    name: 'I2VGen-XL',
    provider: 'Alibaba',
    description: 'Advanced image-to-video generation with semantic understanding',
    capabilities: ['Image-to-Video', 'Semantic Control', 'High Resolution', 'Stable Motion'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0.35,
    replicateId: 'alibaba/i2vgen-xl',
    pricing: '$0.35/generation',
    inputs: [
      {
        name: 'image',
        type: 'image',
        label: 'Input Image',
        required: true,
        placeholder: 'Upload image to animate'
      },
      {
        name: 'prompt',
        type: 'text',
        label: 'Motion Description',
        required: true,
        placeholder: 'Describe how the image should move...'
      },
      {
        name: 'num_frames',
        type: 'number',
        label: 'Number of Frames',
        required: false,
        defaultValue: 32,
        min: 16,
        max: 64
      },
      {
        name: 'guidance_scale',
        type: 'number',
        label: 'Guidance Scale',
        required: false,
        defaultValue: 7.5,
        min: 1,
        max: 20
      }
    ]
  },

  // Hotshot-XL
  {
    id: 'hotshot-xl',
    name: 'Hotshot-XL',
    provider: 'Hotshot',
    description: 'Fast GIF-style animations with character consistency',
    capabilities: ['Text-to-Video', 'GIF Animation', 'Character Consistency', 'Fast'],
    speed: 'fast',
    quality: 'good',
    costPerGeneration: 0.15,
    replicateId: 'hotshot/hotshot-xl',
    pricing: '$0.15/generation',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Describe the animation...'
      },
      {
        name: 'num_frames',
        type: 'number',
        label: 'Number of Frames',
        required: false,
        defaultValue: 8,
        min: 4,
        max: 16
      },
      {
        name: 'fps',
        type: 'number',
        label: 'FPS',
        required: false,
        defaultValue: 8,
        min: 4,
        max: 12
      }
    ]
  },

  // LCM Video Models
  {
    id: 'lcm-video-stable',
    name: 'LCM Video',
    provider: 'LCM',
    description: 'Ultra-fast video generation using latent consistency models',
    capabilities: ['Text-to-Video', 'Ultra Fast', 'Real-time', 'Consistent Motion'],
    speed: 'fast',
    quality: 'good',
    costPerGeneration: 0.10,
    replicateId: 'lcm/video-stable',
    pricing: '$0.10/generation',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Quick video description...'
      },
      {
        name: 'num_inference_steps',
        type: 'number',
        label: 'Inference Steps',
        required: false,
        defaultValue: 4,
        min: 1,
        max: 8
      },
      {
        name: 'guidance_scale',
        type: 'number',
        label: 'Guidance Scale',
        required: false,
        defaultValue: 1.0,
        min: 0,
        max: 2
      }
    ]
  },

  // CogVideo Models
  {
    id: 'thudm-cogvideo',
    name: 'CogVideo',
    provider: 'THUDM',
    description: 'Large-scale Chinese-English bilingual video generation',
    capabilities: ['Text-to-Video', 'Bilingual', 'Long Videos', 'Story Generation'],
    speed: 'slow',
    quality: 'high',
    costPerGeneration: 0.60,
    replicateId: 'thudm/cogvideo',
    pricing: '$0.60/generation',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt (English or Chinese)',
        required: true,
        placeholder: 'Describe your video story...'
      },
      {
        name: 'duration',
        type: 'select',
        label: 'Duration',
        required: false,
        options: [
          { value: '4', label: '4 seconds' },
          { value: '8', label: '8 seconds' },
          { value: '16', label: '16 seconds' }
        ],
        defaultValue: '4'
      },
      {
        name: 'resolution',
        type: 'select',
        label: 'Resolution',
        required: false,
        options: [
          { value: '480p', label: '480p' },
          { value: '720p', label: '720p' },
          { value: '1080p', label: '1080p' }
        ],
        defaultValue: '720p'
      }
    ]
  },

  // Make-A-Video (Research Preview)
  {
    id: 'meta-make-a-video',
    name: 'Make-A-Video',
    provider: 'Meta Research',
    description: 'Research preview of Meta\'s advanced text-to-video model',
    capabilities: ['Text-to-Video', 'Research Preview', 'No Watermark', 'High Quality'],
    speed: 'slow',
    quality: 'very-high',
    costPerGeneration: 0.80,
    replicateId: 'meta/make-a-video',
    pricing: '$0.80/generation',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Detailed video description...'
      },
      {
        name: 'quality_preset',
        type: 'select',
        label: 'Quality Preset',
        required: false,
        options: [
          { value: 'fast', label: 'Fast (Lower Quality)' },
          { value: 'balanced', label: 'Balanced' },
          { value: 'quality', label: 'High Quality' }
        ],
        defaultValue: 'balanced'
      }
    ]
  },

  // AnimateDiff Models
  {
    id: 'animatediff-motion',
    name: 'AnimateDiff Motion',
    provider: 'AnimateDiff',
    description: 'Animate existing images with motion LoRAs',
    capabilities: ['Image-to-Video', 'Motion LoRA', 'Style Transfer', 'Custom Motion'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0.30,
    replicateId: 'animatediff/motion',
    pricing: '$0.30/generation',
    inputs: [
      {
        name: 'image',
        type: 'image',
        label: 'Input Image',
        required: true,
        placeholder: 'Upload image to animate'
      },
      {
        name: 'motion_module',
        type: 'select',
        label: 'Motion Type',
        required: true,
        options: [
          { value: 'zoom_in', label: 'Zoom In' },
          { value: 'zoom_out', label: 'Zoom Out' },
          { value: 'pan_left', label: 'Pan Left' },
          { value: 'pan_right', label: 'Pan Right' },
          { value: 'tilt_up', label: 'Tilt Up' },
          { value: 'tilt_down', label: 'Tilt Down' },
          { value: 'rolling', label: 'Rolling' },
          { value: 'custom', label: 'Custom Motion' }
        ],
        defaultValue: 'zoom_in'
      },
      {
        name: 'num_frames',
        type: 'number',
        label: 'Number of Frames',
        required: false,
        defaultValue: 16,
        min: 8,
        max: 32
      }
    ]
  }
];

// Helper function to get all available models including OpenRouter ones
export function getAllVideoModels(existingModels: AnimationModel[]): AnimationModel[] {
  // Combine existing models with OpenRouter models
  // Remove duplicates based on ID
  const modelMap = new Map<string, AnimationModel>();
  
  // Add existing models first
  existingModels.forEach(model => {
    modelMap.set(model.id, model);
  });
  
  // Add OpenRouter models (they won't override existing ones)
  OPENROUTER_VIDEO_MODELS.forEach(model => {
    if (!modelMap.has(model.id)) {
      modelMap.set(model.id, model);
    }
  });
  
  return Array.from(modelMap.values());
}

// Configuration for OpenRouter API
export const OPENROUTER_CONFIG = {
  apiEndpoint: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'AI Prompt Builder'
  },
  // Models that require special handling
  specialHandling: {
    'stability-ai-stable-video-diffusion': {
      requiresBase64: true,
      maxImageSize: 1024
    },
    'pika-labs-1.0': {
      asyncGeneration: true,
      webhookSupport: true
    }
  }
};