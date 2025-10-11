import { AnimationModel } from '@/types';

export const VIDEO_GENERATION_MODELS: AnimationModel[] = [
  // Google Veo Models
  {
    id: 'veo-3',
    name: 'Veo 3',
    provider: 'Google DeepMind',
    description: 'Latest text-to-video model with native audio, hyperrealism, and superior prompt adherence',
    capabilities: ['Text-to-Video', 'Native Audio', 'Hyperrealism', '720p/1080p', 'Best-in-class Quality'],
    speed: 'moderate',
    quality: 'very-high',
    costPerGeneration: 0.75,
    replicateId: 'google/veo-3',
    pricing: '$0.75/second',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Video Prompt',
        required: true,
        placeholder: 'Describe your video with subject, action, style, camera motion...'
      },
      {
        name: 'negative_prompt',
        type: 'text',
        label: 'Negative Prompt (Optional)',
        required: false,
        placeholder: 'What to avoid in the video...'
      },
      {
        name: 'seed',
        type: 'number',
        label: 'Seed (Optional)',
        required: false,
        placeholder: 'Random seed for reproducibility'
      },
      {
        name: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        required: false,
        defaultValue: 5,
        min: 1,
        max: 30
      },
      {
        name: 'audio_enabled',
        type: 'boolean',
        label: 'Generate Audio',
        required: false,
        defaultValue: true
      }
    ]
  },
  {
    id: 'veo-2',
    name: 'Veo 2',
    provider: 'Google DeepMind',
    description: 'State-of-the-art video generation with realistic physics and wide range of visual styles',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Physics Simulation', 'Style Control'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0.50,
    replicateId: 'google/veo-2',
    pricing: '$0.50/generation',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Video Prompt',
        required: true,
        placeholder: 'Describe your video...'
      },
      {
        name: 'image',
        type: 'image',
        label: 'Starting Image (Optional)',
        required: false,
        placeholder: 'Upload image to start from'
      },
      {
        name: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        required: false,
        defaultValue: 4,
        min: 1,
        max: 16
      },
      {
        name: 'fps',
        type: 'number',
        label: 'Frame Rate',
        required: false,
        defaultValue: 24,
        min: 12,
        max: 30
      },
      {
        name: 'aspect_ratio',
        type: 'select',
        label: 'Aspect Ratio',
        required: false,
        options: [
          { value: '16:9', label: '16:9 (Horizontal)' },
          { value: '9:16', label: '9:16 (Vertical)' },
          { value: '1:1', label: '1:1 (Square)' }
        ],
        defaultValue: '16:9'
      }
    ]
  },
  {
    id: 'veo-2-fast',
    name: 'Veo 2 Fast',
    provider: 'Google DeepMind',
    description: 'Optimized for frame interpolation and quick image-to-video generation',
    capabilities: ['Image-to-Video', 'Frame Interpolation', 'Fast Processing', 'Smooth Transitions'],
    speed: 'fast',
    quality: 'high',
    costPerGeneration: 0.25,
    replicateId: 'google/veo-2-fast',
    pricing: '$0.25/generation',
    inputs: [
      {
        name: 'image',
        type: 'image',
        label: 'First Frame',
        required: true,
        placeholder: 'Upload first frame'
      },
      {
        name: 'image2',
        type: 'image',
        label: 'Second Frame (Optional)',
        required: false,
        placeholder: 'Upload second frame for interpolation'
      },
      {
        name: 'prompt',
        type: 'text',
        label: 'Motion Description (Optional)',
        required: false,
        placeholder: 'Describe the motion between frames...'
      },
      {
        name: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        required: false,
        defaultValue: 3,
        min: 1,
        max: 10
      },
      {
        name: 'fps',
        type: 'number',
        label: 'Frame Rate',
        required: false,
        defaultValue: 30,
        min: 24,
        max: 60
      },
      {
        name: 'interpolation_type',
        type: 'select',
        label: 'Interpolation Type',
        required: false,
        options: [
          { value: 'smooth', label: 'Smooth Motion' },
          { value: 'linear', label: 'Linear Transition' },
          { value: 'ease-in-out', label: 'Ease In/Out' },
          { value: 'morph', label: 'Morphing Effect' }
        ],
        defaultValue: 'smooth'
      }
    ]
  },
  
  // OpenAI Sora 2
  {
    id: 'sora-2',
    name: 'Sora 2',
    provider: 'OpenAI',
    description: 'OpenAI\'s flagship video generation model with synced audio capabilities',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Native Audio', 'HD Quality'],
    speed: 'moderate',
    quality: 'very-high',
    costPerGeneration: 0.014,
    replicateId: 'openai/sora-2',
    pricing: '$0.0001/second',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Video Prompt',
        required: true,
        placeholder: 'Describe your video in detail...'
      },
      {
        name: 'seconds',
        type: 'select',
        label: 'Duration',
        required: false,
        options: [
          { value: '4', label: '4 seconds' },
          { value: '8', label: '8 seconds' },
          { value: '12', label: '12 seconds' }
        ],
        defaultValue: '8'
      },
      {
        name: 'aspect_ratio',
        type: 'select',
        label: 'Aspect Ratio',
        required: false,
        options: [
          { value: 'landscape', label: 'Landscape (1280x720)' },
          { value: 'portrait', label: 'Portrait (720x1280)' }
        ],
        defaultValue: 'landscape'
      },
      {
        name: 'openai_api_key',
        type: 'text',
        label: 'OpenAI API Key',
        required: true,
        placeholder: 'Your OpenAI API key...'
      }
    ]
  },
  
  // ByteDance SeedDance
  {
    id: 'seedance-1-pro',
    name: 'SeedDance-1-Pro',
    provider: 'ByteDance',
    description: 'Professional text-to-video and image-to-video generation with 5s/10s videos at 480p/1080p',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'HD Resolution', 'Long Duration'],
    speed: 'moderate',
    quality: 'very-high',
    costPerGeneration: 0,
    replicateId: 'bytedance/seedance-1-pro:fb4b92e4be45c1ea50c94e71ff51ffd88fd6327e2c55efb431a9d88afdfaeb86',
    pricing: 'Free',
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
        label: 'Input Image (Optional)',
        required: false,
        placeholder: 'Upload image for image-to-video generation'
      },
      {
        name: 'duration',
        type: 'select',
        label: 'Video Duration',
        required: false,
        options: [
          { value: '5', label: '5 seconds' },
          { value: '10', label: '10 seconds' }
        ],
        defaultValue: '5'
      },
      {
        name: 'resolution',
        type: 'select',
        label: 'Resolution',
        required: false,
        options: [
          { value: '480p', label: '480p' },
          { value: '1080p', label: '1080p' }
        ],
        defaultValue: '1080p'
      },
      {
        name: 'aspect_ratio',
        type: 'select',
        label: 'Aspect Ratio',
        required: false,
        options: [
          { value: '16:9', label: '16:9' },
          { value: '9:16', label: '9:16' },
          { value: '1:1', label: '1:1' }
        ],
        defaultValue: '16:9'
      },
      {
        name: 'fps',
        type: 'number',
        label: 'Frame Rate',
        required: false,
        defaultValue: 24,
        min: 1,
        max: 30
      },
      {
        name: 'camera_fixed',
        type: 'boolean',
        label: 'Fixed Camera',
        required: false,
        defaultValue: false
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
  
  // WaveSpeed AI Wan Models (Alternative to "Waver")
  {
    id: 'wan-2.1-t2v-480p',
    name: 'Wan 2.1 Text-to-Video (480p)',
    provider: 'WaveSpeed AI',
    description: 'Fast open-source text-to-video generation with real-world physics accuracy',
    capabilities: ['Text-to-Video', 'Real Physics', 'Fast Generation', '480p'],
    speed: 'fast',
    quality: 'good',
    costPerGeneration: 0,
    replicateId: 'wavespeedai/wan-2.1-t2v-480p',
    pricing: 'Free',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Video Prompt',
        required: true,
        placeholder: 'Describe your video...'
      },
      {
        name: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        required: false,
        defaultValue: 5,
        min: 1,
        max: 10
      },
      {
        name: 'fps',
        type: 'number',
        label: 'Frame Rate',
        required: false,
        defaultValue: 24,
        min: 8,
        max: 30
      },
      {
        name: 'seed',
        type: 'number',
        label: 'Seed',
        required: false,
        placeholder: 'Random seed'
      }
    ]
  },
  {
    id: 'wan-2.1-t2v-720p',
    name: 'Wan 2.1 Text-to-Video (720p)',
    provider: 'WaveSpeed AI',
    description: 'High-quality open-source text-to-video with excellent hand and physics rendering',
    capabilities: ['Text-to-Video', 'HD Quality', 'Hand Details', 'Real Physics'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0,
    replicateId: 'wavespeedai/wan-2.1-t2v-720p',
    pricing: 'Free',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Video Prompt',
        required: true,
        placeholder: 'Describe your video...'
      },
      {
        name: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        required: false,
        defaultValue: 5,
        min: 1,
        max: 10
      },
      {
        name: 'fps',
        type: 'number',
        label: 'Frame Rate',
        required: false,
        defaultValue: 24,
        min: 8,
        max: 30
      },
      {
        name: 'seed',
        type: 'number',
        label: 'Seed',
        required: false,
        placeholder: 'Random seed'
      }
    ]
  },
  {
    id: 'wan-2.1-i2v-480p',
    name: 'Wan 2.1 Image-to-Video (480p)',
    provider: 'WaveSpeed AI',
    description: 'Transform images into videos with coherent motion at 480p',
    capabilities: ['Image-to-Video', 'Coherent Motion', 'Fast Generation'],
    speed: 'fast',
    quality: 'good',
    costPerGeneration: 0,
    replicateId: 'wavespeedai/wan-2.1-i2v-480p',
    pricing: 'Free',
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
        required: false,
        placeholder: 'Describe how the image should move...'
      },
      {
        name: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        required: false,
        defaultValue: 5,
        min: 1,
        max: 10
      },
      {
        name: 'fps',
        type: 'number',
        label: 'Frame Rate',
        required: false,
        defaultValue: 24,
        min: 8,
        max: 30
      }
    ]
  },
  {
    id: 'wan-2.1-i2v-720p',
    name: 'Wan 2.1 Image-to-Video (720p)',
    provider: 'WaveSpeed AI',
    description: 'High-quality image-to-video generation with realistic motion',
    capabilities: ['Image-to-Video', 'HD Quality', 'Realistic Motion'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0,
    replicateId: 'wavespeedai/wan-2.1-i2v-720p',
    pricing: 'Free',
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
        required: false,
        placeholder: 'Describe how the image should move...'
      },
      {
        name: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        required: false,
        defaultValue: 5,
        min: 1,
        max: 10
      },
      {
        name: 'fps',
        type: 'number',
        label: 'Frame Rate',
        required: false,
        defaultValue: 24,
        min: 8,
        max: 30
      }
    ]
  },
  
  // Google Nano-Banana
  {
    id: 'nano-banana',
    name: 'Nano-Banana',
    provider: 'Google',
    description: 'Google\'s latest image editing model in Gemini 2.5 for image-to-video generation',
    capabilities: ['Image-to-Video', 'Image Transformation', 'AI-Powered Effects'],
    speed: 'fast',
    quality: 'high',
    costPerGeneration: 0.039,
    replicateId: 'google/nano-banana:f0a9d34b12ad1c1cd76269a844b218ff4e64e128ddaba93e15891f47368958a0',
    pricing: '$0.039/image',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Transformation Prompt',
        required: true,
        placeholder: 'Describe how to transform the image into a video...'
      },
      {
        name: 'image_input',
        type: 'image',
        label: 'Input Image',
        required: false,
        placeholder: 'Upload image to transform'
      },
      {
        name: 'output_format',
        type: 'select',
        label: 'Output Format',
        required: false,
        options: [
          { value: 'jpg', label: 'JPG' },
          { value: 'png', label: 'PNG' }
        ],
        defaultValue: 'jpg'
      }
    ]
  },
  
  // Existing models
  {
    id: 'stable-video-diffusion',
    name: 'Stable Video Diffusion',
    provider: 'Stability AI',
    description: 'High-quality image-to-video generation',
    capabilities: ['Image-to-Video', 'High Quality', 'Temporal Consistency'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0,
    replicateId: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
    pricing: 'Standard',
    inputs: [
      {
        name: 'input_image',
        type: 'image',
        label: 'Input Image',
        required: true,
        placeholder: 'Upload the image to animate'
      },
      {
        name: 'sizing_strategy',
        type: 'select',
        label: 'Sizing Strategy',
        required: false,
        options: [
          { value: 'maintain_aspect_ratio', label: 'Maintain Aspect Ratio' },
          { value: 'crop_to_16_9', label: 'Crop to 16:9' },
          { value: 'use_image_dimensions', label: 'Use Image Dimensions' }
        ],
        defaultValue: 'maintain_aspect_ratio'
      },
      {
        name: 'frames_per_second',
        type: 'number',
        label: 'FPS',
        required: false,
        defaultValue: 6,
        min: 1,
        max: 30
      },
      {
        name: 'motion_bucket_id',
        type: 'number',
        label: 'Motion Amount',
        required: false,
        defaultValue: 127,
        min: 1,
        max: 255
      }
    ]
  }
];

// Filter models by capability
export function getTextToVideoModels() {
  // Only return Veo-3 and Sora-2 for prompt-to-video feature
  return VIDEO_GENERATION_MODELS.filter(model => 
    (model.id === 'veo-3' || model.id === 'sora-2') && model.capabilities.includes('Text-to-Video')
  );
}

export function getImageToVideoModels() {
  return VIDEO_GENERATION_MODELS.filter(model => 
    model.capabilities.includes('Image-to-Video')
  );
}

export function getFrameInterpolationModels() {
  return VIDEO_GENERATION_MODELS.filter(model => 
    model.capabilities.includes('Frame Interpolation') || 
    (model.capabilities.includes('Image-to-Video') && model.speed === 'fast')
  );
}