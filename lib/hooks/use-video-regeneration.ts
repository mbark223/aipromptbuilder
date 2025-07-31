import { useState, useCallback } from 'react';
import { VideoEditOptions } from '@/lib/services/video/ffmpeg-service';

interface RegenerationOptions {
  originalPrompt: string;
  style?: 'cinematic' | 'realistic' | 'animated' | 'artistic';
  mood?: 'energetic' | 'calm' | 'dramatic' | 'playful';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  duration?: number;
}

interface RegenerationState {
  isEditing: boolean;
  isRegenerating: boolean;
  editProgress: number;
  regenerationId: string | null;
  regenerationStatus: 'idle' | 'starting' | 'processing' | 'succeeded' | 'failed';
  regeneratedVideoUrl: string | null;
  error: string | null;
}

export function useVideoRegeneration() {
  const [state, setState] = useState<RegenerationState>({
    isEditing: false,
    isRegenerating: false,
    editProgress: 0,
    regenerationId: null,
    regenerationStatus: 'idle',
    regeneratedVideoUrl: null,
    error: null
  });

  const editAndRegenerate = useCallback(async (
    videoUrl: string,
    edits: VideoEditOptions,
    regenerationOptions: RegenerationOptions
  ) => {
    setState(prev => ({
      ...prev,
      isEditing: true,
      isRegenerating: false,
      editProgress: 0,
      error: null
    }));

    try {
      const response = await fetch('/api/video/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          edits,
          regenerationOptions
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to process video');
      }

      const result = await response.json();
      
      setState(prev => ({
        ...prev,
        isEditing: false,
        isRegenerating: true,
        regenerationId: result.regeneration.id,
        regenerationStatus: 'processing'
      }));

      pollGenerationStatus(result.regeneration.id);

    } catch (error) {
      setState(prev => ({
        ...prev,
        isEditing: false,
        isRegenerating: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  const pollGenerationStatus = useCallback(async (predictionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video/generation-status?id=${predictionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const result = await response.json();
        const { generation, isComplete } = result;

        if (isComplete) {
          clearInterval(pollInterval);
          
          setState(prev => ({
            ...prev,
            isRegenerating: false,
            regenerationStatus: generation.status,
            regeneratedVideoUrl: generation.output || null,
            error: generation.error || null
          }));
        }
      } catch (error) {
        clearInterval(pollInterval);
        setState(prev => ({
          ...prev,
          isRegenerating: false,
          regenerationStatus: 'failed',
          error: error instanceof Error ? error.message : 'Status check failed'
        }));
      }
    }, 2000);
  }, []);

  const reset = useCallback(() => {
    setState({
      isEditing: false,
      isRegenerating: false,
      editProgress: 0,
      regenerationId: null,
      regenerationStatus: 'idle',
      regeneratedVideoUrl: null,
      error: null
    });
  }, []);

  return {
    ...state,
    editAndRegenerate,
    reset
  };
}