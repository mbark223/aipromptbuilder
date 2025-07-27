import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { IMAGE_TO_VIDEO_MODELS } from "@/lib/video-models";

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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
    const input: Record<string, unknown> = {};
    
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