import { NextRequest, NextResponse } from 'next/server';

// Use Node.js runtime for environment variables
export const runtime = 'nodejs';

// Debug function to check environment
function getReplicateToken(): string | undefined {
  // Try multiple possible env var names
  const token = process.env.REPLICATE_API_TOKEN || 
                process.env.REPLICATEAPITOKEN ||
                process.env.REPLICATE_TOKEN ||
                process.env.REPLICATETOKEN;
  
  // Log for debugging (will appear in Vercel function logs)
  console.log('Token check:', {
    exists: !!token,
    length: token?.length || 0,
    prefix: token?.substring(0, 8) || 'none',
    env: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    tried: ['REPLICATE_API_TOKEN', 'REPLICATEAPITOKEN', 'REPLICATE_TOKEN', 'REPLICATETOKEN']
  });
  
  return token;
}

export async function POST(request: NextRequest) {
  const REPLICATE_API_TOKEN = getReplicateToken();
  
  if (!REPLICATE_API_TOKEN) {
    console.error('REPLICATE_API_TOKEN is not set. Available env vars:', Object.keys(process.env));
    return NextResponse.json(
      { 
        error: 'Replicate API token not configured',
        debug: {
          hasToken: false,
          nodeEnv: process.env.NODE_ENV,
          availableKeys: Object.keys(process.env).length
        }
      },
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
  const REPLICATE_API_TOKEN = getReplicateToken();
  
  if (!REPLICATE_API_TOKEN) {
    console.error('REPLICATE_API_TOKEN is not set in GET handler');
    return NextResponse.json(
      { 
        error: 'Replicate API token not configured',
        debug: {
          hasToken: false,
          nodeEnv: process.env.NODE_ENV
        }
      },
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