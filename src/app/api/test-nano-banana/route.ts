import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'No Replicate token' }, { status: 500 });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Test with a simple prompt and a small test image
    const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    
    console.log('Running test prediction...');
    
    const output = await replicate.run(
      "google/nano-banana:adfd722f0c8b5abd782eac022a625a14fb812951de19618dfc4979f6651a00b4",
      {
        input: {
          prompt: "A beautiful landscape",
          image_input: [testImage],
          output_format: "png"
        }
      }
    );

    return NextResponse.json({
      success: true,
      outputType: typeof output,
      outputIsArray: Array.isArray(output),
      outputKeys: output && typeof output === 'object' ? Object.keys(output) : null,
      outputStringified: JSON.stringify(output),
      rawOutput: output
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorStack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}