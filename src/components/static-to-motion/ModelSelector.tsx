'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { AnimationModel } from '@/types';
import { getAllVideoModels } from '@/lib/openrouter-models';

interface ModelSelectorProps {
  selectedModel: AnimationModel;
  onSelectModel: (model: AnimationModel) => void;
}

const BASE_MODELS: AnimationModel[] = [
  {
    id: 'google-veo-3-fast',
    name: 'Veo-3-Fast',
    provider: 'Google',
    description: 'Faster/cheaper option with native audio support',
    capabilities: ['Text-to-Video', 'Native Audio', 'Fast Generation'],
    speed: 'fast',
    quality: 'high',
    costPerGeneration: 0,
    replicateId: 'google/veo-3-fast',
    pricing: 'Faster/Cheaper',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Describe the video you want to generate...'
      },
      {
        name: 'negative_prompt',
        type: 'text',
        label: 'Negative Prompt',
        required: false,
        placeholder: 'What to avoid in the generation...'
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
  {
    id: 'google-veo-3',
    name: 'Veo-3',
    provider: 'Google',
    description: 'Premium quality video generation with native audio',
    capabilities: ['Text-to-Video', 'Native Audio', 'Premium Quality'],
    speed: 'moderate',
    quality: 'very-high',
    costPerGeneration: 0,
    replicateId: 'google/veo-3',
    pricing: 'Premium Quality',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Describe the video you want to generate...'
      },
      {
        name: 'negative_prompt',
        type: 'text',
        label: 'Negative Prompt',
        required: false,
        placeholder: 'What to avoid in the generation...'
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
  {
    id: 'bytedance-seedance-1-pro',
    name: 'Seedance-1-Pro',
    provider: 'ByteDance',
    description: 'Professional video generation with image-to-video support',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Multiple Resolutions'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0.40,
    replicateId: 'bytedance/seedance-1-pro',
    pricing: '$0.40/second',
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
        label: 'First Frame Image (Optional)',
        required: false,
        placeholder: 'Upload an image for image-to-video'
      },
      {
        name: 'duration',
        type: 'select',
        label: 'Duration',
        required: true,
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
        required: true,
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
        required: true,
        options: [
          { value: '16:9', label: '16:9' },
          { value: '9:16', label: '9:16' },
          { value: '1:1', label: '1:1' },
          { value: '4:3', label: '4:3' }
        ],
        defaultValue: '16:9'
      },
      {
        name: 'fps',
        type: 'number',
        label: 'FPS',
        required: false,
        defaultValue: 24,
        min: 12,
        max: 60
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
  {
    id: 'minimax-hailuo-02',
    name: 'Hailuo-02',
    provider: 'MiniMax',
    description: 'Excellent physics simulation for realistic motion',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Physics Simulation'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0,
    replicateId: 'minimax/hailuo-02',
    pricing: 'Standard',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Describe the video you want to generate...'
      },
      {
        name: 'first_frame_image',
        type: 'image',
        label: 'First Frame Image (Optional)',
        required: false,
        placeholder: 'Upload an image for image-to-video'
      },
      {
        name: 'duration',
        type: 'select',
        label: 'Duration',
        required: true,
        options: [
          { value: '6', label: '6 seconds' },
          { value: '10', label: '10 seconds' }
        ],
        defaultValue: '6'
      },
      {
        name: 'resolution',
        type: 'select',
        label: 'Resolution',
        required: true,
        options: [
          { value: '768p', label: '768p' },
          { value: '1080p', label: '1080p' }
        ],
        defaultValue: '1080p'
      },
      {
        name: 'prompt_optimizer',
        type: 'boolean',
        label: 'Prompt Optimizer',
        required: false,
        defaultValue: true
      }
    ]
  },
  {
    id: 'runway-gen-3',
    name: 'Gen-3',
    provider: 'Runway',
    description: 'High-fidelity video generation with advanced creative control',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Creative Control', 'High Fidelity'],
    speed: 'moderate',
    quality: 'very-high',
    costPerGeneration: 0.75,
    replicateId: 'runway/gen-3',
    pricing: '$0.75/generation',
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
        label: 'First Frame Image (Optional)',
        required: false,
        placeholder: 'Upload an image for image-to-video'
      },
      {
        name: 'duration',
        type: 'select',
        label: 'Duration',
        required: true,
        options: [
          { value: '5', label: '5 seconds' },
          { value: '10', label: '10 seconds' }
        ],
        defaultValue: '5'
      },
      {
        name: 'motion_amount',
        type: 'select',
        label: 'Motion Amount',
        required: false,
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ],
        defaultValue: 'medium'
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
  {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    provider: 'Luma AI',
    description: 'Fast, high-quality video generation with consistent motion',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Fast Generation', 'Consistent Motion'],
    speed: 'fast',
    quality: 'high',
    costPerGeneration: 0.50,
    replicateId: 'luma/dream-machine',
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
        label: 'First Frame Image (Optional)',
        required: false,
        placeholder: 'Upload an image for image-to-video'
      },
      {
        name: 'duration',
        type: 'select',
        label: 'Duration',
        required: true,
        options: [
          { value: '5', label: '5 seconds' }
        ],
        defaultValue: '5'
      },
      {
        name: 'enhance_prompt',
        type: 'boolean',
        label: 'Enhance Prompt',
        required: false,
        defaultValue: true
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
  {
    id: 'black-forest-labs-flux-kontext-max',
    name: 'Flux Kontext Max',
    provider: 'Black Forest Labs',
    description: 'Advanced image-to-video generation with precise context control',
    capabilities: ['Image-to-Video', 'Context Control', 'High Quality', 'Motion Guidance'],
    speed: 'moderate',
    quality: 'very-high',
    costPerGeneration: 0.60,
    replicateId: 'black-forest-labs/flux-kontext-max',
    pricing: '$0.60/generation',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Describe the motion and transformation you want...'
      },
      {
        name: 'image',
        type: 'image',
        label: 'Input Image',
        required: true,
        placeholder: 'Upload the image to animate'
      },
      {
        name: 'num_frames',
        type: 'number',
        label: 'Number of Frames',
        required: false,
        defaultValue: 25,
        min: 10,
        max: 50,
        placeholder: 'Number of frames in the output video'
      },
      {
        name: 'guidance_scale',
        type: 'number',
        label: 'Guidance Scale',
        required: false,
        defaultValue: 7.5,
        min: 1,
        max: 20,
        placeholder: 'How closely to follow the prompt (higher = more adherence)'
      },
      {
        name: 'motion_bucket_id',
        type: 'number',
        label: 'Motion Intensity',
        required: false,
        defaultValue: 127,
        min: 1,
        max: 255,
        placeholder: 'Controls the amount of motion (higher = more motion)'
      },
      {
        name: 'fps',
        type: 'number',
        label: 'FPS',
        required: false,
        defaultValue: 8,
        min: 4,
        max: 30,
        placeholder: 'Frames per second'
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
  {
    id: 'google-gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Ultra-fast multimodal AI with enhanced reasoning and video understanding',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Multimodal', 'Fast Generation', 'Enhanced Reasoning'],
    speed: 'fast',
    quality: 'high',
    costPerGeneration: 0,
    replicateId: 'google/gemini-2.0-flash',
    pricing: 'Free',
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
        label: 'Input Image (Optional)',
        required: false,
        placeholder: 'Upload an image for image-to-video generation'
      },
      {
        name: 'temperature',
        type: 'number',
        label: 'Temperature',
        required: false,
        defaultValue: 0.7,
        min: 0,
        max: 2,
        placeholder: 'Controls randomness (0 = deterministic, 2 = very random)'
      },
      {
        name: 'max_tokens',
        type: 'number',
        label: 'Max Tokens',
        required: false,
        defaultValue: 8192,
        min: 1,
        max: 8192,
        placeholder: 'Maximum number of tokens to generate'
      }
    ]
  },
  {
    id: 'google-gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: 'Advanced multimodal model with 2M token context window',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Long Context', 'Multimodal', 'High Quality'],
    speed: 'moderate',
    quality: 'very-high',
    costPerGeneration: 0.35,
    replicateId: 'google/gemini-1.5-pro',
    pricing: '$0.35/generation',
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
        label: 'Input Image (Optional)',
        required: false,
        placeholder: 'Upload an image for image-to-video generation'
      },
      {
        name: 'temperature',
        type: 'number',
        label: 'Temperature',
        required: false,
        defaultValue: 0.7,
        min: 0,
        max: 2,
        placeholder: 'Controls randomness (0 = deterministic, 2 = very random)'
      },
      {
        name: 'max_tokens',
        type: 'number',
        label: 'Max Tokens',
        required: false,
        defaultValue: 8192,
        min: 1,
        max: 8192,
        placeholder: 'Maximum number of tokens to generate'
      },
      {
        name: 'top_p',
        type: 'number',
        label: 'Top P',
        required: false,
        defaultValue: 0.95,
        min: 0,
        max: 1,
        placeholder: 'Nucleus sampling threshold'
      }
    ]
  },
  {
    id: 'google-gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    description: 'Fast and efficient multimodal model for quick generations',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Fast Generation', 'Multimodal', 'Cost-Effective'],
    speed: 'fast',
    quality: 'good',
    costPerGeneration: 0.075,
    replicateId: 'google/gemini-1.5-flash',
    pricing: '$0.075/generation',
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
        label: 'Input Image (Optional)',
        required: false,
        placeholder: 'Upload an image for image-to-video generation'
      },
      {
        name: 'temperature',
        type: 'number',
        label: 'Temperature',
        required: false,
        defaultValue: 0.7,
        min: 0,
        max: 2,
        placeholder: 'Controls randomness (0 = deterministic, 2 = very random)'
      },
      {
        name: 'max_tokens',
        type: 'number',
        label: 'Max Tokens',
        required: false,
        defaultValue: 8192,
        min: 1,
        max: 8192,
        placeholder: 'Maximum number of tokens to generate'
      }
    ]
  },
  {
    id: 'google-gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash-8B',
    provider: 'Google',
    description: 'Lightweight version optimized for edge deployment and speed',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Ultra-Fast', 'Edge Computing', 'Low Latency'],
    speed: 'fast',
    quality: 'good',
    costPerGeneration: 0.037,
    replicateId: 'google/gemini-1.5-flash-8b',
    pricing: '$0.037/generation',
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
        label: 'Input Image (Optional)',
        required: false,
        placeholder: 'Upload an image for image-to-video generation'
      },
      {
        name: 'temperature',
        type: 'number',
        label: 'Temperature',
        required: false,
        defaultValue: 0.7,
        min: 0,
        max: 2,
        placeholder: 'Controls randomness (0 = deterministic, 2 = very random)'
      },
      {
        name: 'max_tokens',
        type: 'number',
        label: 'Max Tokens',
        required: false,
        defaultValue: 8192,
        min: 1,
        max: 8192,
        placeholder: 'Maximum number of tokens to generate'
      }
    ]
  },
  {
    id: 'google-gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    provider: 'Google',
    description: 'Stable production-ready model for reliable video generation',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Stable', 'Production-Ready'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0.125,
    replicateId: 'google/gemini-1.0-pro',
    pricing: '$0.125/generation',
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
        label: 'Input Image (Optional)',
        required: false,
        placeholder: 'Upload an image for image-to-video generation'
      },
      {
        name: 'temperature',
        type: 'number',
        label: 'Temperature',
        required: false,
        defaultValue: 0.7,
        min: 0,
        max: 1,
        placeholder: 'Controls randomness (0 = deterministic, 1 = very random)'
      },
      {
        name: 'max_tokens',
        type: 'number',
        label: 'Max Tokens',
        required: false,
        defaultValue: 2048,
        min: 1,
        max: 2048,
        placeholder: 'Maximum number of tokens to generate'
      }
    ]
  },
  {
    id: 'google-gemini-experimental',
    name: 'Gemini Experimental',
    provider: 'Google',
    description: 'Cutting-edge experimental features for advanced video generation',
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Experimental', 'Advanced Features', 'Research'],
    speed: 'slow',
    quality: 'very-high',
    costPerGeneration: 0,
    replicateId: 'google/gemini-experimental',
    pricing: 'Free (Beta)',
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
        label: 'Input Image (Optional)',
        required: false,
        placeholder: 'Upload an image for image-to-video generation'
      },
      {
        name: 'experimental_features',
        type: 'select',
        label: 'Experimental Features',
        required: false,
        options: [
          { value: 'default', label: 'Default' },
          { value: 'enhanced_physics', label: 'Enhanced Physics' },
          { value: 'style_transfer', label: 'Style Transfer' },
          { value: 'temporal_consistency', label: 'Temporal Consistency' }
        ],
        defaultValue: 'default'
      },
      {
        name: 'temperature',
        type: 'number',
        label: 'Temperature',
        required: false,
        defaultValue: 0.7,
        min: 0,
        max: 2,
        placeholder: 'Controls randomness (0 = deterministic, 2 = very random)'
      },
      {
        name: 'seed',
        type: 'number',
        label: 'Seed',
        required: false,
        placeholder: 'Random seed for reproducibility'
      }
    ]
  }
];

export function ModelSelector({
  selectedModel,
  onSelectModel
}: ModelSelectorProps) {
  // Get all available models including OpenRouter models
  const AVAILABLE_MODELS = getAllVideoModels(BASE_MODELS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  // Get unique providers
  const providers = useMemo(() => {
    const uniqueProviders = [...new Set(AVAILABLE_MODELS.map(m => m.provider))];
    return ['all', ...uniqueProviders.sort()];
  }, [AVAILABLE_MODELS]);

  // Filter models based on search and provider
  const filteredModels = useMemo(() => {
    return AVAILABLE_MODELS.filter(model => {
      const matchesSearch = searchQuery === '' || 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesProvider = selectedProvider === 'all' || model.provider === selectedProvider;
      
      return matchesSearch && matchesProvider;
    });
  }, [searchQuery, selectedProvider, AVAILABLE_MODELS]);

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast':
        return <Icons.zap className="h-3 w-3" />;
      case 'moderate':
        return <Icons.clock className="h-3 w-3" />;
      case 'slow':
        return <Icons.clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getQualityBadge = (quality: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      'good': 'secondary',
      'high': 'default',
      'very-high': 'default'
    };
    return (
      <Badge variant={variants[quality] || 'secondary'} className="text-xs">
        {quality.replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="model-search">Search Models</Label>
          <Input
            id="model-search"
            type="search"
            placeholder="Search by name, feature, or capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider === 'all' ? 'All Providers' : provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Badge variant="secondary" className="px-3 py-1">
            {filteredModels.length} models available (Total: {AVAILABLE_MODELS.length})
          </Badge>
        </div>
      </div>

      <div>
        <Label htmlFor="model-select">Select Model</Label>
        <Select
          value={selectedModel.id}
          onValueChange={(value) => {
            const model = AVAILABLE_MODELS.find(m => m.id === value);
            if (model) onSelectModel(model);
          }}
        >
          <SelectTrigger id="model-select" className="w-full">
            <SelectValue placeholder="Choose a video generation model" />
          </SelectTrigger>
          <SelectContent>
            {filteredModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                    {model.costPerGeneration === 0 && (
                      <Badge variant="secondary" className="text-xs">Free</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {model.provider}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4 space-y-3">
        <div>
          <h4 className="font-medium">{selectedModel.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedModel.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Provider:</span>
            <span className="text-sm font-medium">{selectedModel.provider}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Speed:</span>
            <div className="flex items-center gap-1">
              {getSpeedIcon(selectedModel.speed)}
              <span className="text-sm capitalize">{selectedModel.speed}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Quality:</span>
            {getQualityBadge(selectedModel.quality)}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Cost:</span>
            <span className="text-sm font-medium">
              {selectedModel.pricing || (selectedModel.costPerGeneration === 0 
                ? 'Free' 
                : `$${selectedModel.costPerGeneration.toFixed(2)}/generation`)
              }
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Capabilities:</p>
          <div className="flex flex-wrap gap-1">
            {selectedModel.capabilities.map((capability, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {capability}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}