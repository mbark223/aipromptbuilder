'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { AnimationModel } from '@/types';

interface ModelSelectorProps {
  selectedModel: AnimationModel;
  onSelectModel: (model: AnimationModel) => void;
}

const AVAILABLE_MODELS: AnimationModel[] = [
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
  }
];

export function ModelSelector({
  selectedModel,
  onSelectModel
}: ModelSelectorProps) {
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
      <div>
        <Label htmlFor="model-select">AI Model</Label>
        <Select
          value={selectedModel.id}
          onValueChange={(value) => {
            const model = AVAILABLE_MODELS.find(m => m.id === value);
            if (model) onSelectModel(model);
          }}
        >
          <SelectTrigger id="model-select" className="w-full">
            <SelectValue placeholder="Select an AI model" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{model.name}</span>
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