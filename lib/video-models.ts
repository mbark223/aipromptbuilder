// Available image-to-video models
export const IMAGE_TO_VIDEO_MODELS = {
  // ByteDance Models
  "seedance-1-pro": {
    id: "bytedance/seedance-1-pro",
    name: "Seedance 1 Pro",
    description: "ByteDance's pro video generation model. Supports 5s or 10s videos at 480p and 1080p resolution",
    inputSchema: {
      image: { type: "string", description: "Input image URL" },
      prompt: { type: "string", description: "Text prompt to guide video generation" },
      duration: { type: "number", enum: [5, 10], default: 5 },
      resolution: { type: "string", enum: ["480p", "1080p"], default: "480p" },
    }
  },
  "seedance-1-lite": {
    id: "bytedance/seedance-1-lite",
    name: "Seedance 1 Lite",
    description: "ByteDance's lite video generation model. Supports 5s or 10s videos at 480p and 720p resolution",
    inputSchema: {
      image: { type: "string", description: "Input image URL" },
      prompt: { type: "string", description: "Text prompt to guide video generation" },
      duration: { type: "number", enum: [5, 10], default: 5 },
      resolution: { type: "string", enum: ["480p", "720p"], default: "480p" },
    }
  },
  
  // WaveSpeed AI Models
  "wan-2.1-i2v-480p": {
    id: "wavespeedai/wan-2.1-i2v-480p",
    name: "Wan 2.1 I2V 480p",
    description: "Accelerated inference for Wan 2.1 14B image to video at 480p resolution",
    inputSchema: {
      image: { type: "string", description: "Input image URL" },
      prompt: { type: "string", description: "Text prompt to guide video generation" },
      num_frames: { type: "number", default: 24 },
      fps: { type: "number", default: 8 },
    }
  },
  "wan-2.1-i2v-720p": {
    id: "wavespeedai/wan-2.1-i2v-720p",
    name: "Wan 2.1 I2V 720p",
    description: "Accelerated inference for Wan 2.1 14B image to video with high resolution (720p)",
    inputSchema: {
      image: { type: "string", description: "Input image URL" },
      prompt: { type: "string", description: "Text prompt to guide video generation" },
      num_frames: { type: "number", default: 24 },
      fps: { type: "number", default: 8 },
    }
  },
  
  // Stable Video Diffusion
  "stable-video-diffusion": {
    id: "stability-ai/stable-video-diffusion",
    name: "Stable Video Diffusion",
    description: "Stable Video Diffusion image-to-video model. Generates short videos (up to 4s)",
    inputSchema: {
      input_image: { type: "string", description: "Input image URL" },
      sizing_strategy: { type: "string", enum: ["maintain_aspect_ratio", "crop_to_16_9", "use_image_dimensions"], default: "maintain_aspect_ratio" },
      frames_per_second: { type: "number", min: 3, max: 30, default: 6 },
      motion_bucket_id: { type: "number", min: 1, max: 255, default: 127 },
      cond_aug: { type: "number", min: 0, max: 1, default: 0.02 },
      decoding_t: { type: "number", min: 1, max: 25, default: 14 },
    }
  },
  
  // Research Models
  "i2vgen-xl": {
    id: "ali-vilab/i2vgen-xl",
    name: "I2VGen-XL",
    description: "High-Quality Image-to-Video Synthesis via Cascaded Diffusion Models (Research use only)",
    inputSchema: {
      image: { type: "string", description: "Input image URL" },
      prompt: { type: "string", description: "Text prompt to guide video generation" },
      max_frames: { type: "number", default: 16 },
      guidance_scale: { type: "number", default: 9.0 },
    }
  },
  "pia": {
    id: "open-mmlab/pia",
    name: "PIA (Personalized Image Animator)",
    description: "Personalized Image Animator for creating animated videos from images",
    inputSchema: {
      image: { type: "string", description: "Input image URL" },
      prompt: { type: "string", description: "Text prompt to guide animation" },
      guidance_scale: { type: "number", default: 7.5 },
      num_frames: { type: "number", default: 16 },
    }
  },
  
  // Minimax Model
  "video-01-live": {
    id: "minimax/video-01-live",
    name: "Video-01-Live",
    description: "An image-to-video model specifically trained for Live2D and general animation use cases",
    inputSchema: {
      image: { type: "string", description: "Input image URL" },
      prompt: { type: "string", description: "Text prompt to guide animation" },
      duration: { type: "number", default: 5 },
    }
  },
  
  // Hailuo Model
  "hailuo-i2v": {
    id: "hailuo-ai/hailuo",
    name: "Hailuo Image-to-Video",
    description: "Generate 6s or 10s videos at 720p or 1080p from images. Excels at real world physics",
    inputSchema: {
      image: { type: "string", description: "Input image URL" },
      prompt: { type: "string", description: "Text prompt to guide video generation" },
      duration: { type: "number", enum: [6, 10], default: 6 },
      resolution: { type: "string", enum: ["720p", "1080p"], default: "720p" },
    }
  },
  
  // Kling Model
  "kling-v2.1": {
    id: "kling-ai/kling-v2.1",
    name: "Kling v2.1",
    description: "Premium video generation with superb dynamics. Generate 1080p 5s and 10s videos from images",
    inputSchema: {
      image: { type: "string", description: "Input image URL" },
      prompt: { type: "string", description: "Text prompt to guide video generation" },
      duration: { type: "number", enum: [5, 10], default: 5 },
      aspect_ratio: { type: "string", enum: ["16:9", "9:16", "1:1"], default: "16:9" },
    }
  },
  
  // LTX-Video Model
  "ltx-video": {
    id: "lightricks/ltx-video",
    name: "LTX-Video",
    description: "First DiT-based video generation model capable of generating high-quality videos in real-time",
    inputSchema: {
      image: { type: "string", description: "Input image URL" },
      prompt: { type: "string", description: "Text prompt to guide video generation" },
      num_frames: { type: "number", default: 25 },
      frame_rate: { type: "number", default: 25 },
      guidance_scale: { type: "number", default: 7.5 },
    }
  }
} as const;