export interface VideoModelInput {
  image?: string;
  input_image?: string; // For stable-video-diffusion
  prompt?: string;
  duration?: number;
  resolution?: string;
  num_frames?: number;
  fps?: number;
  frame_rate?: number;
  guidance_scale?: number;
  aspect_ratio?: string;
  max_frames?: number;
  sizing_strategy?: string;
  frames_per_second?: number;
  motion_bucket_id?: number;
  cond_aug?: number;
  decoding_t?: number;
}

export interface VideoModel {
  id: string;
  name: string;
  description: string;
  inputSchema: {
    [key: string]: {
      type: string;
      description?: string;
      enum?: any[];
      default?: any;
      min?: number;
      max?: number;
    };
  };
}

export interface VideoGenerationRequest {
  modelId: string;
  imageUrl: string;
  prompt?: string;
  options?: VideoModelInput;
}

export interface VideoGenerationResponse {
  success: boolean;
  output?: string | string[];
  model?: {
    id: string;
    name: string;
    description: string;
  };
  error?: string;
  details?: string;
}

export const VIDEO_MODEL_CATEGORIES = {
  premium: ["seedance-1-pro", "kling-v2.1", "hailuo-i2v"],
  standard: ["seedance-1-lite", "wan-2.1-i2v-720p", "wan-2.1-i2v-480p"],
  research: ["i2vgen-xl", "pia"],
  specialized: ["video-01-live", "ltx-video"],
  classic: ["stable-video-diffusion"]
} as const;

export type VideoModelId = keyof typeof VIDEO_MODEL_CATEGORIES[keyof typeof VIDEO_MODEL_CATEGORIES][number];