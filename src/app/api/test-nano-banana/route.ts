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

    console.log('Running test predictions...');
    
    // Test 1: With image_input as data URL
    const testImageDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    
    let output1;
    try {
      output1 = await replicate.run(
        "google/nano-banana:adfd722f0c8b5abd782eac022a625a14fb812951de19618dfc4979f6651a00b4",
        {
          input: {
            prompt: "Add a red filter to this image",
            image_input: [testImageDataUrl],
            output_format: "png"
          }
        }
      );
    } catch (e) {
      output1 = { error: e instanceof Error ? e.message : 'Failed' };
    }
    
    // Test 2: With image_input as public URL
    const testImageUrl = "https://replicate.delivery/pbxt/JMV5OrIhPSgFykUv0M0SqPsecftEckSGnuLQkeF5qIhNr2tE/out-0.png";
    
    let output2;
    try {
      output2 = await replicate.run(
        "google/nano-banana:adfd722f0c8b5abd782eac022a625a14fb812951de19618dfc4979f6651a00b4",
        {
          input: {
            prompt: "Turn this into a watercolor painting",
            image_input: [testImageUrl],
            output_format: "png"
          }
        }
      );
    } catch (e) {
      output2 = { error: e instanceof Error ? e.message : 'Failed' };
    }
    
    // Test 3: Without image_input (to see if it's text-to-image)
    let output3;
    try {
      output3 = await replicate.run(
        "google/nano-banana:adfd722f0c8b5abd782eac022a625a14fb812951de19618dfc4979f6651a00b4",
        {
          input: {
            prompt: "A beautiful landscape painting",
            output_format: "png"
          }
        }
      );
    } catch (e) {
      output3 = { error: e instanceof Error ? e.message : 'Failed' };
    }

    return NextResponse.json({
      success: true,
      test1: {
        description: 'With image_input',
        outputType: typeof output1,
        outputIsArray: Array.isArray(output1),
        outputKeys: output1 && typeof output1 === 'object' ? Object.keys(output1) : null,
        outputStringified: JSON.stringify(output1),
        rawOutput: output1
      },
      test2: {
        description: 'With image_input as public URL',
        outputType: typeof output2,
        outputIsArray: Array.isArray(output2),
        outputKeys: output2 && typeof output2 === 'object' ? Object.keys(output2) : null,
        outputStringified: JSON.stringify(output2),
        rawOutput: output2
      },
      test3: {
        description: 'Without image_input (text-to-image)',
        outputType: typeof output3,
        outputIsArray: Array.isArray(output3),
        outputKeys: output3 && typeof output3 === 'object' ? Object.keys(output3) : null,
        outputStringified: JSON.stringify(output3),
        rawOutput: output3
      }
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