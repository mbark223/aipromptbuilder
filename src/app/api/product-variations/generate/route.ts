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

    console.log('Starting Nano-Banana prediction with prompt:', fullPrompt);
    
    // Run the model and handle the response
    const output = await replicate.run(
      "google/nano-banana:adfd722f0c8b5abd782eac022a625a14fb812951de19618dfc4979f6651a00b4",
      {
        input: {
          prompt: fullPrompt,
          image_input: [dataUrl],
          output_format: "png"
        }
      }
    );

    console.log('Raw Replicate output:', JSON.stringify(output, null, 2));

    // Extract image URL from the output
    let imageUrl: string = '';
    
    if (!output) {
      throw new Error('No output from Replicate');
    }
    
    // Convert output to string if needed
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      imageUrl = String(output[0]);
    } else if (output && typeof output === 'object') {
      // Try to find a URL in the object
      const outputStr = JSON.stringify(output);
      console.log('Output as string:', outputStr);
      
      // Extract any URL-like string from the stringified output
      const urlMatch = outputStr.match(/https?:\/\/[^\s"'}]+/);
      if (urlMatch) {
        imageUrl = urlMatch[0];
        console.log('Extracted URL from output:', imageUrl);
      } else {
        // If no URL found, return the whole output for debugging
        return NextResponse.json({
          error: 'Could not find image URL in output',
          rawOutput: output,
          outputString: outputStr
        }, { status: 500 });
      }
    } else {
      throw new Error(`Unexpected output type: ${typeof output}`);
    }

    // Ensure we have a valid URL
    if (!imageUrl) {
      throw new Error('No image URL extracted');
    }

    // Clean up the URL if needed
    imageUrl = String(imageUrl).trim();
    
    console.log('Final image URL:', imageUrl);

    return NextResponse.json({
      imageUrl,
      prompt: fullPrompt,
      feedback,
    });

  } catch (error) {
    console.error('Error in generate route:', error);
    
    let errorMessage = 'Failed to generate image';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for common Replicate errors
      if (errorMessage.includes('401')) {
        errorMessage = 'Invalid Replicate API token';
      } else if (errorMessage.includes('402')) {
        errorMessage = 'Insufficient Replicate credits';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Model not found';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}