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

    // Run the Nano Banana model
    const output = await replicate.run(
      "google/nano-banana:f0a9d34b12ad1c1cd76269a844b218ff4e64e128ddaba93e15891f47368958a0",
      {
        input: {
          image: dataUrl,
          prompt: fullPrompt,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
          image_size: 1024,
        }
      }
    );

    // The output should be an array of image URLs
    console.log('Replicate output:', output);
    const imageUrls = output as string[];
    
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('No image generated');
    }

    console.log('Returning image URL:', imageUrls[0]);
    
    return NextResponse.json({
      imageUrl: imageUrls[0],
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