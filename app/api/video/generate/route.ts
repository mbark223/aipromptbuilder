import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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
};

export async function POST(request: NextRequest) {
  try {
    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "Replicate API token not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { modelId, imageUrl, prompt, options = {} } = body;

    // Validate model ID
    if (!modelId || !IMAGE_TO_VIDEO_MODELS[modelId]) {
      return NextResponse.json(
        { error: "Invalid model ID", availableModels: Object.keys(IMAGE_TO_VIDEO_MODELS) },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const model = IMAGE_TO_VIDEO_MODELS[modelId];
    
    // Prepare input based on model schema
    let input: any = {};
    
    // Map common fields based on model requirements
    switch (modelId) {
      case "stable-video-diffusion":
        input.input_image = imageUrl;
        // Map other fields from options
        if (options.fps) input.frames_per_second = options.fps;
        if (options.motion_bucket_id) input.motion_bucket_id = options.motion_bucket_id;
        if (options.cond_aug) input.cond_aug = options.cond_aug;
        if (options.decoding_t) input.decoding_t = options.decoding_t;
        if (options.sizing_strategy) input.sizing_strategy = options.sizing_strategy;
        break;
        
      default:
        // Most models use 'image' field
        input.image = imageUrl;
        if (prompt) input.prompt = prompt;
        
        // Map common options
        if (options.duration) input.duration = options.duration;
        if (options.resolution) input.resolution = options.resolution;
        if (options.num_frames) input.num_frames = options.num_frames;
        if (options.fps) input.fps = options.fps;
        if (options.frame_rate) input.frame_rate = options.frame_rate;
        if (options.guidance_scale) input.guidance_scale = options.guidance_scale;
        if (options.aspect_ratio) input.aspect_ratio = options.aspect_ratio;
        if (options.max_frames) input.max_frames = options.max_frames;
        break;
    }

    // Run the model
    const output = await replicate.run(model.id as `${string}/${string}`, { input });

    // Return the result
    return NextResponse.json({
      success: true,
      output,
      model: {
        id: modelId,
        name: model.name,
        description: model.description
      }
    });

  } catch (error) {
    console.error("Error generating video:", error);
    return NextResponse.json(
      { error: "Failed to generate video", details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to list available models
export async function GET() {
  return NextResponse.json({
    models: Object.entries(IMAGE_TO_VIDEO_MODELS).map(([id, model]) => ({
      id,
      name: model.name,
      description: model.description,
      inputSchema: model.inputSchema
    }))
  });
}