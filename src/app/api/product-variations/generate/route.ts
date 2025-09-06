import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

// Handle GET request
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'This endpoint only accepts POST requests' }, { status: 405 });
}

export async function POST(request: NextRequest) {
  try {
    // Check if API token is available
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN is not set');
      return NextResponse.json(
        { error: 'API configuration error: Replicate token not found' },
        { status: 500 }
      );
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const feedbackStr = formData.get('feedback') as string;
    const feedback = JSON.parse(feedbackStr || '{}');

    if (!imageFile || !prompt) {
      return NextResponse.json(
        { error: 'Image and prompt are required' },
        { status: 400 }
      );
    }

    // Convert the image file to a base64 data URL
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = imageFile.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Build the full prompt with feedback
    let fullPrompt = prompt;
    if (feedback.style && feedback.style.trim()) {
      fullPrompt += `. Style: ${feedback.style}`;
    }
    if (feedback.colors && feedback.colors.trim()) {
      fullPrompt += `. Colors: ${feedback.colors}`;
    }
    if (feedback.composition && feedback.composition.trim()) {
      fullPrompt += `. Composition: ${feedback.composition}`;
    }
    if (feedback.additional && feedback.additional.trim()) {
      fullPrompt += `. Additional notes: ${feedback.additional}`;
    }

    // Use a simpler image-to-image model
    console.log('Starting Replicate prediction with prompt:', fullPrompt);
    
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: fullPrompt,
          image: dataUrl,
          num_outputs: 1,
          guidance_scale: 7.5,
          prompt_strength: 0.8,
          scheduler: "K_EULER",
          num_inference_steps: 30
        }
      }
    );

    // Log the full output to understand the structure
    console.log('Replicate output:', JSON.stringify(output, null, 2));
    
    // Handle different possible output formats
    let imageUrl: string | undefined;
    
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
    } else if (output && typeof output === 'object' && 'url' in output) {
      imageUrl = (output as any).url;
    } else if (output && typeof output === 'object' && 'output' in output) {
      imageUrl = (output as any).output;
    }
    
    if (!imageUrl) {
      console.error('Could not extract image URL from output:', output);
      throw new Error('No image URL found in response');
    }

    console.log('Returning image URL:', imageUrl);
    
    return NextResponse.json({
      imageUrl,
      prompt: fullPrompt,
      feedback,
    });
  } catch (error) {
    console.error('Error generating variation:', error);
    
    // Provide more detailed error message
    let errorMessage = 'Failed to generate variation';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for common Replicate errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid Replicate API token. Please check your configuration.';
      } else if (error.message.includes('402')) {
        errorMessage = 'Replicate account has insufficient credits.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Model not found. Please check the model ID.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}