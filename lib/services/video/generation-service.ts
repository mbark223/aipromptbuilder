import Replicate from 'replicate';

export interface VideoGenerationOptions {
  prompt: string;
  enhancedPrompt?: string;
  model?: 'veo3' | 'veo2' | 'veo2-fast';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  duration?: number;
  seed?: number;
}

export interface VideoGenerationResult {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string;
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
}

class VideoGenerationService {
  private replicate: Replicate;
  private modelVersions = {
    'veo3': 'google-research/veo:latest',
    'veo2': 'google-research/veo:v2',
    'veo2-fast': 'google-research/veo:v2-fast'
  };

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN || '',
    });
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    const {
      prompt,
      enhancedPrompt,
      model = 'veo3',
      aspectRatio = '16:9',
      duration = 5,
      seed
    } = options;

    try {
      const modelVersion = this.modelVersions[model];
      const finalPrompt = enhancedPrompt || prompt;

      const prediction = await this.replicate.predictions.create({
        version: modelVersion,
        input: {
          prompt: finalPrompt,
          aspect_ratio: aspectRatio,
          duration: duration,
          seed: seed,
          num_inference_steps: model === 'veo2-fast' ? 25 : 50,
          guidance_scale: 7.5,
        }
      });

      return {
        id: prediction.id,
        status: prediction.status,
        output: prediction.output as string,
        error: prediction.error as string | undefined,
        logs: prediction.logs as string | undefined,
        metrics: prediction.metrics
      };
    } catch (error) {
      console.error('Video generation error:', error);
      throw error;
    }
  }

  async checkGenerationStatus(predictionId: string): Promise<VideoGenerationResult> {
    try {
      const prediction = await this.replicate.predictions.get(predictionId);

      return {
        id: prediction.id,
        status: prediction.status,
        output: prediction.output as string,
        error: prediction.error as string | undefined,
        logs: prediction.logs as string | undefined,
        metrics: prediction.metrics
      };
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  async cancelGeneration(predictionId: string): Promise<void> {
    try {
      await this.replicate.predictions.cancel(predictionId);
    } catch (error) {
      console.error('Cancel generation error:', error);
      throw error;
    }
  }

  async regenerateFromEdit(
    editedVideoUrl: string,
    originalPrompt: string,
    editDescription: string
  ): Promise<VideoGenerationResult> {
    const regenerationPrompt = `${originalPrompt}. Make these changes: ${editDescription}`;
    
    return this.generateVideo({
      prompt: regenerationPrompt,
      model: 'veo3',
      aspectRatio: '16:9',
      duration: 5
    });
  }
}

export const videoGenerationService = new VideoGenerationService();