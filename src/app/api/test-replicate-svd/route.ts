import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: 'No API token' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { imageUrl } = body;

    // Test with the exact SVD model version
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        input: {
          input_image: imageUrl,
          sizing_strategy: 'maintain_aspect_ratio',
          frames_per_second: 6,
          motion_bucket_id: 127,
          cond_aug: 0.02,
          decoding_t: 14
        }
      }),
    });

    const responseText = await response.text();
    console.log('Replicate response status:', response.status);
    console.log('Replicate response:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: `Replicate error: ${response.status}`,
          details: responseText,
          requestBody: {
            version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
            hasImage: !!imageUrl
          }
        },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}