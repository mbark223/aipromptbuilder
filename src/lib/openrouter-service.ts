import { AnimationModel } from '@/types';
import { ReplicateInput } from './replicate';

interface OpenRouterGenerationOptions {
  model: AnimationModel;
  inputs: ReplicateInput | Record<string, string | number | boolean | null>;
  apiKey?: string;
}

interface OpenRouterResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output?: {
    video_url?: string;
    preview_url?: string;
    duration?: number;
    fps?: number;
  };
  error?: string;
}

export class OpenRouterService {
  private apiKey: string | null;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || null;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generateVideo({
    model,
    inputs,
    apiKey
  }: OpenRouterGenerationOptions): Promise<{ videoUrl: string; duration?: number }> {
    const key = apiKey || this.apiKey;
    
    if (!key) {
      throw new Error('OpenRouter API key not configured. Please add your API key in settings.');
    }

    try {
      // OpenRouter uses a unified API for all models
      const response = await fetch(`${this.baseUrl}/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'AI Prompt Builder'
        },
        body: JSON.stringify({
          model: model.replicateId, // OpenRouter uses the same model IDs
          input: this.transformInputsForModel(model, inputs),
          stream: false,
          // Some models support webhooks for async generation
          webhook: model.capabilities.includes('Async Generation') 
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/openrouter/webhook`
            : undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate video');
      }

      const result: OpenRouterResponse = await response.json();

      // Handle async generation
      if (result.status === 'pending' || result.status === 'processing') {
        return this.pollForCompletion(result.id, key);
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Video generation failed');
      }

      if (!result.output?.video_url) {
        throw new Error('No video URL in response');
      }

      return {
        videoUrl: result.output.video_url,
        duration: result.output.duration
      };
    } catch (error) {
      console.error('OpenRouter generation error:', error);
      throw error;
    }
  }

  private async pollForCompletion(
    generationId: string, 
    apiKey: string,
    maxAttempts = 60,
    intervalMs = 2000
  ): Promise<{ videoUrl: string; duration?: number }> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));

      const response = await fetch(`${this.baseUrl}/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check generation status');
      }

      const result: OpenRouterResponse = await response.json();

      if (result.status === 'completed' && result.output?.video_url) {
        return {
          videoUrl: result.output.video_url,
          duration: result.output.duration
        };
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Video generation failed');
      }
    }

    throw new Error('Video generation timed out');
  }

  private transformInputsForModel(
    model: AnimationModel, 
    inputs: ReplicateInput | Record<string, string | number | boolean | null>
  ): Record<string, string | number | boolean | null> {
    // Transform inputs based on model requirements
    const transformed: Record<string, string | number | boolean | null> = {};

    // Convert ReplicateInput to plain object
    const inputObj = inputs as any;
    
    // Handle image inputs - some models need base64
    if (inputObj.image && model.id === 'stability-ai-stable-video-diffusion') {
      // For Stable Video Diffusion, convert image URL to base64 if needed
      transformed.image = inputObj.image; // In production, this would handle base64 conversion
    } else if (inputObj.image) {
      transformed.image = inputObj.image;
    }

    // Map common fields
    Object.entries(inputObj).forEach(([key, value]) => {
      if (key !== 'image' || !transformed.image) {
        transformed[key] = value as string | number | boolean | null;
      }
    });

    // Model-specific transformations
    switch (model.id) {
      case 'pika-labs-1.0':
        // Pika uses different parameter names
        if (transformed.motion_strength) {
          transformed.motion = transformed.motion_strength;
          delete transformed.motion_strength;
        }
        break;
      
      case 'genmo-mochi-1':
        // Genmo expects style as a separate parameter
        if (transformed.prompt && transformed.style_strength !== undefined) {
          transformed.style_weight = transformed.style_strength;
          delete transformed.style_strength;
        }
        break;

      case 'alibaba-i2vgen-xl':
        // I2VGen-XL needs motion description in specific format
        if (transformed.prompt) {
          transformed.text_prompt = transformed.prompt;
          delete transformed.prompt;
        }
        break;
    }

    return transformed;
  }

  // Get available models that can be used through OpenRouter
  async getAvailableModels(): Promise<string[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch OpenRouter models');
        return [];
      }

      const data = await response.json();
      // Filter for video generation models
      interface ModelData {
        id: string;
        capabilities?: string[];
        type?: string;
      }
      return data.models
        .filter((m: ModelData) => m.capabilities?.includes('video') || m.type === 'video')
        .map((m: ModelData) => m.id);
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      return [];
    }
  }
}

// Create singleton instance
let openRouterService: OpenRouterService | null = null;

export function createOpenRouterService(apiKey?: string): OpenRouterService {
  if (!openRouterService || apiKey) {
    openRouterService = new OpenRouterService(apiKey);
  }
  return openRouterService;
}

// Check if OpenRouter is configured
export function isOpenRouterConfigured(): boolean {
  const service = createOpenRouterService();
  return service.isConfigured();
}