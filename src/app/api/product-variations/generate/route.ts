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

    // Use Google Nano-Banana model
    console.log('Starting Nano-Banana prediction with prompt:', fullPrompt);
    console.log('Image data URL length:', dataUrl.length);
    
    let output;
    try {
      output = await replicate.run(
        "google/nano-banana:adfd722f0c8b5abd782eac022a625a14fb812951de19618dfc4979f6651a00b4",
        {
          input: {
            prompt: fullPrompt,
            image_input: [dataUrl],
            output_format: "png"
          }
        }
      );
    } catch (replicateError) {
      console.error('Replicate API error:', replicateError);
      throw new Error(`Replicate API error: ${replicateError instanceof Error ? replicateError.message : 'Unknown error'}`);
    }

    // Log the full output to understand the structure
    console.log('Replicate raw output type:', typeof output);
    console.log('Replicate output:', JSON.stringify(output, null, 2));
    
    // Handle different possible output formats
    let imageUrl: any = null;
    
    // First check if output is already a string URL
    if (typeof output === 'string') {
      imageUrl = output;
      console.log('Output is a string:', imageUrl);
    } 
    // Check if it's an array (common for image models)
    else if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
      console.log('Output is an array, first element:', imageUrl);
    } 
    // Check if it's an object with common properties
    else if (output && typeof output === 'object') {
      const outputObj = output as Record<string, any>;
      
      // Try different common property names
      imageUrl = outputObj.url || outputObj.output || outputObj.image || outputObj.imageUrl || outputObj.uri;
      console.log('Output is an object, extracted URL:', imageUrl);
      
      // If still not found, check if it has a data property
      if (!imageUrl && outputObj.data) {
        imageUrl = outputObj.data;
        console.log('Found in data property:', imageUrl);
      }
      
      // If still not found, log all properties
      if (!imageUrl) {
        console.log('Object properties:', Object.keys(outputObj));
        console.log('Full object:', outputObj);
        
        // Try to get the first string value from the object
        for (const key of Object.keys(outputObj)) {
          const value = outputObj[key];
          if (typeof value === 'string' && value.includes && (value.includes('http') || value.includes('//'))) {
            imageUrl = value;
            console.log(`Found URL in property ${key}:`, imageUrl);
            break;
          }
        }
      }
    }
    
    if (!imageUrl) {
      console.error('Could not extract image URL from output:', output);
      // Return the raw output for debugging
      return NextResponse.json({
        error: 'Could not extract image URL',
        rawOutput: output,
        outputType: typeof output,
        outputKeys: output && typeof output === 'object' ? Object.keys(output) : null
      }, { status: 500 });
    }

    // Ensure imageUrl is a string before any string operations
    if (typeof imageUrl !== 'string') {
      console.error('Image URL is not a string, it is:', typeof imageUrl, imageUrl);
      return NextResponse.json({
        error: 'Image URL is not a string',
        imageUrlType: typeof imageUrl,
        imageUrlValue: imageUrl
      }, { status: 500 });
    }
    
    // Now we know imageUrl is definitely a string
    // Ensure the URL is properly formatted
    if (!imageUrl.includes('http')) {
      // If it's a relative URL, it might be from Replicate's CDN
      if (imageUrl.indexOf('//') === 0) {
        imageUrl = `https:${imageUrl}`;
      } else if (imageUrl.indexOf('/') === 0) {
        imageUrl = `https://replicate.delivery${imageUrl}`;
      } else {
        imageUrl = `https://${imageUrl}`;
      }
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
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.message;
      
      // Check for common Replicate errors
      if (error.message && error.message.includes && error.message.includes('401') || (error.message && error.message.includes && error.message.includes('Unauthorized'))) {
        errorMessage = 'Invalid Replicate API token. Please check your configuration.';
      } else if (error.message && error.message.includes && error.message.includes('402')) {
        errorMessage = 'Replicate account has insufficient credits.';
      } else if (error.message && error.message.includes && error.message.includes('404')) {
        errorMessage = 'Model not found. Please check the model ID.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}