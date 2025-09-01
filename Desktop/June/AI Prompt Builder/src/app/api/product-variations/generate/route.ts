import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const parametersStr = formData.get('parameters') as string;
    const parameters = JSON.parse(parametersStr || '{}');

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

    // Build the full prompt based on parameters
    let fullPrompt = prompt;
    if (parameters.backgroundColor) {
      fullPrompt += `, background color: ${parameters.backgroundColor}`;
    }
    if (parameters.lighting) {
      fullPrompt += `, ${parameters.lighting} lighting`;
    }
    if (parameters.angle) {
      fullPrompt += `, ${parameters.angle} angle view`;
    }
    if (parameters.season) {
      fullPrompt += `, ${parameters.season} season theme`;
    }
    if (parameters.environment) {
      fullPrompt += `, ${parameters.environment} environment`;
    }

    // Run the Nano Banana model
    const output = await replicate.run(
      "google/nano-banana:latest",
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
    const imageUrls = output as string[];
    
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('No image generated');
    }

    return NextResponse.json({
      imageUrl: imageUrls[0],
      prompt: fullPrompt,
      parameters,
    });
  } catch (error) {
    console.error('Error generating variation:', error);
    return NextResponse.json(
      { error: 'Failed to generate variation' },
      { status: 500 }
    );
  }
}