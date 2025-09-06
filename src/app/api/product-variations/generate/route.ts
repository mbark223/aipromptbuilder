import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Handle GET request
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'This endpoint only accepts POST requests' }, { status: 405 });
}

export async function POST(request: NextRequest) {
  try {
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

    // Run FLUX Image-to-Image model (since nano-banana doesn't exist)
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: fullPrompt,
          image: dataUrl,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 90,
          safety_tolerance: 2,
          prompt_upsampling: true
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
    return NextResponse.json(
      { error: 'Failed to generate variation' },
      { status: 500 }
    );
  }
}