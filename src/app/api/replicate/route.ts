import { NextRequest, NextResponse } from 'next/server';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export async function POST(request: NextRequest) {
  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: 'Replicate API token not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { model, input } = body;

    // Create prediction
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model,
        input,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      return NextResponse.json(
        { error: `Failed to create prediction: ${error}` },
        { status: createResponse.status }
      );
    }

    const prediction = await createResponse.json();
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Replicate API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: 'Replicate API token not configured' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const predictionId = searchParams.get('id');

  if (!predictionId) {
    return NextResponse.json(
      { error: 'Prediction ID required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to get prediction: ${error}` },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Replicate API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}