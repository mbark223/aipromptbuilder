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
      const modelVersion = await this.getModelVersion(model.replicateId);
      const createResponse = await fetch('/api/replicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelVersion,
          modelId: modelVersion === 'latest' ? model.replicateId : undefined,
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
    // Official models that use the models endpoint (not versions)
    const officialModels = [
      'google/veo-3-fast',
      'google/veo-3',
      'bytedance/seedance-1-pro',
      'minimax/hailuo-02',
    ];

    // Return 'latest' for official models to signal using the models endpoint
    if (officialModels.includes(modelId)) {
      return 'latest';
    }

    // For other models, you would fetch the actual version ID
    // This is a placeholder - in production you'd query the Replicate API
    return 'latest';
  }

  private formatInputsForModel(model: AnimationModel, inputs: ReplicateInput): Record<string, string | number | boolean | null> {
    const formattedInputs: Record<string, string | number | boolean | null> = {};

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
        const tempVideoUrl = prediction.output;
        
        // Upload to permanent storage
        try {
          const storageResponse = await fetch('/api/storage/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tempUrl: tempVideoUrl,
              fileName: `generated_video_${predictionId}.mp4`,
              metadata: {
                predictionId,
                modelId: prediction.model || 'unknown',
                createdAt: new Date().toISOString()
              }
            })
          });

          if (storageResponse.ok) {
            const { data } = await storageResponse.json();
            return data.url; // Return permanent URL
          } else {
            console.warn('Failed to upload to permanent storage, using temporary URL');
            return tempVideoUrl;
          }
        } catch (error) {
          console.error('Storage upload error:', error);
          return tempVideoUrl; // Fallback to temporary URL
        }
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