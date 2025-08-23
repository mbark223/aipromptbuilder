import { LumaProcessingOptions, LumaJobStatus } from '@/types';
import { config } from './config';

interface LumaAPIResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
  progress?: number;
}

export class LumaAIService {
  private apiKey: string;
  private baseUrl = 'https://api.lumalabs.ai/dream-machine/v1';

  constructor(apiKey?: string) {
    const key = apiKey || config.lumaAI.apiKey;
    if (!key) {
      throw new Error('Luma AI API key not configured. Please add NEXT_PUBLIC_LUMA_AI_API_KEY to your .env.local file.');
    }
    this.apiKey = key;
  }

  /**
   * Process a video through Luma AI Dream Machine
   */
  async processVideo(
    videoUrl: string,
    options: LumaProcessingOptions
  ): Promise<{ jobId: string }> {
    try {
      const response = await fetch('/api/luma/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: options.prompt || 'Enhance this video',
          model: 'ray-2',
          keyframes: {
            frame0: {
              type: 'image',
              url: videoUrl
            }
          },
          aspect_ratio: options.format === '1080x1080' ? '1:1' : '16:9',
          loop: options.loop || false
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Luma AI API error: ${error}`);
      }

      const data = await response.json();
      return { jobId: data.id };
    } catch (error) {
      console.error('Luma AI processing error:', error);
      throw error;
    }
  }

  /**
   * Check the status of a Luma AI processing job
   */
  async checkJobStatus(jobId: string): Promise<LumaJobStatus> {
    try {
      const response = await fetch(`/api/luma/status/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to check job status: ${error}`);
      }

      const data: LumaAPIResponse = await response.json();
      
      return {
        id: data.id,
        status: data.status,
        videoUrl: data.video_url,
        error: data.error,
        progress: data.progress || 0
      };
    } catch (error) {
      console.error('Error checking Luma AI job status:', error);
      throw error;
    }
  }

  /**
   * Cancel a Luma AI processing job
   */
  async cancelJob(jobId: string): Promise<void> {
    try {
      const response = await fetch(`/api/luma/status/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to cancel job: ${error}`);
      }
    } catch (error) {
      console.error('Error canceling Luma AI job:', error);
      throw error;
    }
  }

  /**
   * Poll for job completion
   */
  async waitForCompletion(
    jobId: string,
    onProgress?: (progress: number) => void,
    maxWaitTime = 300000 // 5 minutes
  ): Promise<LumaJobStatus> {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.checkJobStatus(jobId);
      
      if (onProgress && status.progress) {
        onProgress(status.progress);
      }

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Luma AI processing timeout');
  }
}

/**
 * Create a Luma AI service instance
 */
export function createLumaAIService(apiKey?: string): LumaAIService | null {
  try {
    return new LumaAIService(apiKey);
  } catch (error) {
    console.warn('Luma AI service not available:', error);
    return null;
  }
}

/**
 * Check if Luma AI is configured
 */
export function isLumaAIConfigured(): boolean {
  return !!config.lumaAI.apiKey;
}