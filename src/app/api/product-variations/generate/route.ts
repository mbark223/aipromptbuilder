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

    // Build the full prompt with element-specific feedback
    let fullPrompt = prompt;
    
    // Add element-specific instructions first for priority
    if (feedback.elements && feedback.elements.trim()) {
      fullPrompt += `. Focus on these elements: ${feedback.elements}`;
    }
    if (feedback.location && feedback.location.trim()) {
      fullPrompt += `. Located at: ${feedback.location}`;
    }
    if (feedback.changes && feedback.changes.trim()) {
      fullPrompt += `. Apply these specific changes: ${feedback.changes}`;
    }
    
    // Add style and theme options
    if (feedback.style && feedback.style.trim()) {
      fullPrompt += `. Overall style: ${feedback.style}`;
    }
    if (feedback.colors && feedback.colors.trim()) {
      fullPrompt += `. Color theme: ${feedback.colors}`;
    }
    
    // Brand guidelines removed - no longer using authentication
    
    if (feedback.additional && feedback.additional.trim()) {
      fullPrompt += `. Additional notes: ${feedback.additional}`;
    }

    console.log('Starting prediction with prompt:', fullPrompt);
    console.log('Image data URL length:', dataUrl.length);
    console.log('Image MIME type:', mimeType);
    
    try {
      // Use Google Nano-Banana model for image editing (branded as Blendr)
      // Try with a single image string instead of array
      console.log('Calling Blendr (Nano-Banana) with data URL');
      
      const prediction = await replicate.predictions.create({
        version: "adfd722f0c8b5abd782eac022a625a14fb812951de19618dfc4979f6651a00b4",
        input: {
          prompt: fullPrompt,
          image_input: [dataUrl],
          output_format: "png"
        }
      });

      console.log('Created prediction:', prediction);
      
      // Use replicate.wait for proper polling
      const completedPrediction = await replicate.wait(prediction);
      
      console.log('Completed prediction:', completedPrediction);
      
      // Check if the prediction failed
      if (completedPrediction.status === 'failed') {
        console.error('Prediction failed:', completedPrediction.error);
        throw new Error(`Blendr prediction failed: ${completedPrediction.error || 'Unknown error'}`);
      }
      
      const output = completedPrediction.output || completedPrediction;

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
      // If output is an empty object - specific handling for Nano-Banana
      else if (typeof output === 'object' && Object.keys(output).length === 0) {
        console.error('Nano-Banana returned empty object. This might be a model issue.');
        // Try to use the prediction URL if available
        if ((output as any).id || (output as any).urls) {
          console.log('Found prediction data in empty-looking object:', output);
        }
        throw new Error('Nano-Banana returned empty response. The model might be temporarily unavailable or having issues.');
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