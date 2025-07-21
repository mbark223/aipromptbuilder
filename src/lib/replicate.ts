import { AnimationModel } from '@/types';

export interface ReplicateInput {
  prompt: string;
  negative_prompt?: string;
  seed?: number;
  image?: string;
  first_frame_image?: string;
  duration?: string | number;
  resolution?: string;
  aspect_ratio?: string;
  fps?: number;
  camera_fixed?: boolean;
  prompt_optimizer?: boolean;
}

export interface ReplicateOutput {
  videoUrl: string;
  generationTime: number;
  cost: number;
}

export class ReplicateService {
  async generateVideo(
    model: AnimationModel,
    inputs: ReplicateInput
  ): Promise<ReplicateOutput> {
    if (!model.replicateId) {
      throw new Error('Model does not support Replicate API');
    }

    const startTime = Date.now();

    try {
      // Create prediction using API route
      const createResponse = await fetch('/api/replicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: await this.getModelVersion(model.replicateId),
          input: this.formatInputsForModel(model, inputs),
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || 'Failed to create prediction');
      }

      const prediction = await createResponse.json();

      // Poll for completion
      const output = await this.pollForCompletion(prediction.id);

      const generationTime = (Date.now() - startTime) / 1000;
      const cost = this.calculateCost(model, generationTime, inputs);

      return {
        videoUrl: output,
        generationTime,
        cost,
      };
    } catch (error) {
      console.error('Replicate API error:', error);
      throw error;
    }
  }

  private async getModelVersion(modelId: string): Promise<string> {
    // In production, you would fetch the latest version from Replicate API
    // For now, we'll use hardcoded versions
    const versions: Record<string, string> = {
      'google/veo-3-fast': 'latest',
      'google/veo-3': 'latest',
      'bytedance/seedance-1-pro': 'latest',
      'minimax/hailuo-02': 'latest',
    };

    return versions[modelId] || 'latest';
  }

  private formatInputsForModel(model: AnimationModel, inputs: ReplicateInput): any {
    const formattedInputs: any = {};

    // Map inputs based on model requirements
    if (model.inputs) {
      model.inputs.forEach(input => {
        const value = inputs[input.name as keyof ReplicateInput];
        if (value !== undefined) {
          formattedInputs[input.name] = value;
        } else if (input.defaultValue !== undefined) {
          formattedInputs[input.name] = input.defaultValue;
        }
      });
    }

    return formattedInputs;
  }

  private async pollForCompletion(predictionId: string): Promise<string> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`/api/replicate?id=${predictionId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get prediction status');
      }

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        return prediction.output;
      } else if (prediction.status === 'failed') {
        throw new Error(`Prediction failed: ${prediction.error}`);
      }

      // Wait 5 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Prediction timed out');
  }

  private calculateCost(model: AnimationModel, generationTime: number, inputs: ReplicateInput): number {
    // Calculate cost based on model pricing
    if (model.id === 'bytedance-seedance-1-pro') {
      // $0.40/second based on video duration
      const duration = parseInt(inputs.duration as string || '5');
      return 0.40 * duration;
    }

    // For other models, use the base cost
    return model.costPerGeneration || 0;
  }
}

// Factory function to create a Replicate service instance
export function createReplicateService(): ReplicateService {
  return new ReplicateService();
}