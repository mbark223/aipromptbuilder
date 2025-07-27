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
        name: 'decoding_t',
        type: 'number',
        label: 'Decoding Timesteps',
        required: false,
        defaultValue: 14,
        min: 1,
        max: 50
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
    id: 'animate-diff',
    name: 'AnimateDiff',
    provider: 'LucaTaco',
    description: 'Text-to-video generation with motion styles',
    capabilities: ['Text-to-Video', 'Motion Styles', 'High Quality'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0,
    replicateId: 'lucataco/animate-diff:1531004ee4c98894ab11f8a4ce6206099e732c1da15121987a8eef54828f0663',
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
        name: 'n_prompt',
        type: 'text',
        label: 'Negative Prompt',
        required: false,
        placeholder: 'What to avoid in the generation...',
        defaultValue: 'badhandv5-neg, easynegative, ng_deepnegative_v1_75t, verybadimagenegative_v1.3, bad-artist, bad_prompt_version2-neg, teeth'
      },
      {
        name: 'num_inference_steps',
        type: 'number',
        label: 'Inference Steps',
        required: false,
        defaultValue: 25,
        min: 1,
        max: 50
      },
      {
        name: 'guidance_scale',
        type: 'number',
        label: 'Guidance Scale',
        required: false,
        defaultValue: 7.5,
        min: 1,
        max: 20
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
    id: 'i2vgen-xl',
    name: 'I2VGen-XL',
    provider: 'Ali-ViLab',
    description: 'Advanced image-to-video with semantic understanding',
    capabilities: ['Image-to-Video', 'Semantic Control', 'High Resolution'],
    speed: 'moderate',
    quality: 'high',
    costPerGeneration: 0,
    replicateId: 'ali-vilab/i2vgen-xl:5821a338d00033abaaba89080a17eb8783d9a17ed710a6b4246a18e0900ccad4',
    pricing: 'Standard',
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
        name: 'num_inference_steps',
        type: 'number',
        label: 'Inference Steps',
        required: false,
        defaultValue: 50,
        min: 1,
        max: 100
      },
      {
        name: 'guidance_scale',
        type: 'number',
        label: 'Guidance Scale',
        required: false,
        defaultValue: 9.0,
        min: 1,
        max: 20
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
    id: 'genmo-mochi-1',
    name: 'Mochi 1 Preview',
    provider: 'Genmo',
    description: 'Fast, creative video generation',
    capabilities: ['Text-to-Video', 'Artistic Styles', 'Fast Generation'],
    speed: 'fast',
    quality: 'high',
    costPerGeneration: 0,
    replicateId: 'genmo/mochi-1-preview:961cd6665b811d0c43c0b9488b6dfa85ff5c7bfb875e93b4533e4c7f54c7551a',
    pricing: 'Standard',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Describe your video...'
      },
      {
        name: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        required: false,
        defaultValue: 5.4,
        min: 1,
        max: 10
      },
      {
        name: 'cfg_scale',
        type: 'number',
        label: 'CFG Scale',
        required: false,
        defaultValue: 4.5,
        min: 1,
        max: 20
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
    id: 'hotshot-xl',
    name: 'Hotshot-XL',
    provider: 'LucaTaco',
    description: 'GIF-style animations with character consistency',
    capabilities: ['Text-to-Video', 'GIF Animation', 'Character Consistency'],
    speed: 'fast',
    quality: 'good',
    costPerGeneration: 0,
    replicateId: 'lucataco/hotshot-xl:78b3a6257e16e4b241245d65c8b2b81ea2e1ff7ed4c55306b511509ddbfd327a',
    pricing: 'Standard',
    inputs: [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        placeholder: 'Describe the animation...'
      },
      {
        name: 'negative_prompt',
        type: 'text',
        label: 'Negative Prompt',
        required: false,
        placeholder: 'What to avoid...',
        defaultValue: ''
      },
      {
        name: 'mp4',
        type: 'boolean',
        label: 'Output as MP4',
        required: false,
        defaultValue: true
      },
      {
        name: 'steps',
        type: 'number',
        label: 'Sampling Steps',
        required: false,
        defaultValue: 30,
        min: 1,
        max: 100
      },
      {
        name: 'width',
        type: 'number',
        label: 'Width',
        required: false,
        defaultValue: 672,
        min: 64,
        max: 1024
      },
      {
        name: 'height',
        type: 'number',
        label: 'Height',
        required: false,
        defaultValue: 384,
        min: 64,
        max: 1024
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
            {filteredModels.length} models available
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