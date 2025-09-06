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
    // Image is optional now since Nano-Banana is text-to-image
    const imageFile = formData.get('image') as File | null;
    const prompt = formData.get('prompt') as string;
    const feedbackStr = formData.get('feedback') as string;
    const feedback = JSON.parse(feedbackStr || '{}');

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

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

    console.log('Starting prediction with prompt:', fullPrompt);
    
    try {
      // Use the simpler run method which handles polling automatically
      // Note: Nano-Banana appears to be text-to-image only, not image-to-image
      const output = await replicate.run(
        "google/nano-banana:adfd722f0c8b5abd782eac022a625a14fb812951de19618dfc4979f6651a00b4",
        {
          input: {
            prompt: fullPrompt,
            // Removed image_input as Nano-Banana doesn't support it
            output_format: "png"
          }
        }
      );

      console.log('Replicate output:', output);
      console.log('Output type:', typeof output);
      console.log('Output stringified:', JSON.stringify(output));

      // Handle different output formats
      let imageUrl = '';
      
      // If output is a string URL
      if (typeof output === 'string') {
        imageUrl = output;
      }
      // If output is an array of URLs
      else if (Array.isArray(output) && output.length > 0) {
        imageUrl = String(output[0]);
      }
      // If output is null or undefined
      else if (!output) {
        throw new Error('No output received from model');
      }
      // If output is an empty object
      else if (typeof output === 'object' && Object.keys(output).length === 0) {
        throw new Error('Model returned empty response - it may not support image_input parameter');
      }
      // Try to extract URL from object
      else {
        const outputStr = JSON.stringify(output);
        const urlMatch = outputStr.match(/https?:\/\/[^\s"'}]+/);
        if (urlMatch) {
          imageUrl = urlMatch[0];
        }
      }

      if (!imageUrl) {
        // Return debugging info
        return NextResponse.json({
          error: 'No image URL found in model output',
          debugInfo: {
            outputType: typeof output,
            outputKeys: output && typeof output === 'object' ? Object.keys(output) : null,
            outputSample: JSON.stringify(output).substring(0, 200),
            isEmptyObject: typeof output === 'object' && Object.keys(output).length === 0
          }
        }, { status: 500 });
      }

      return NextResponse.json({
        imageUrl,
        prompt: fullPrompt,
        feedback,
      });

    } catch (modelError) {
      console.error('Model execution error:', modelError);
      
      // Check if it's a specific error we can handle
      const errorMessage = modelError instanceof Error ? modelError.message : String(modelError);
      
      if (errorMessage.includes('401')) {
        return NextResponse.json({
          error: 'Authentication failed - check your Replicate API token'
        }, { status: 500 });
      }
      
      if (errorMessage.includes('422')) {
        return NextResponse.json({
          error: 'Invalid input parameters - the model may not accept image_input',
          debugInfo: {
            error: errorMessage,
            hint: 'Try using a different image-to-image model'
          }
        }, { status: 500 });
      }
      
      return NextResponse.json({
        error: 'Failed to run model',
        details: errorMessage
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}