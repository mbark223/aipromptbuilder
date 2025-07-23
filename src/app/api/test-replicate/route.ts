import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.REPLICATE_API_TOKEN || 
                process.env.REPLICATEAPITOKEN ||
                process.env.REPLICATE_TOKEN ||
                process.env.REPLICATETOKEN;

  if (!token) {
    return NextResponse.json({
      success: false,
      error: 'No Replicate API token found',
      checkedVars: ['REPLICATE_API_TOKEN', 'REPLICATEAPITOKEN', 'REPLICATE_TOKEN', 'REPLICATETOKEN'],
      availableEnvVars: Object.keys(process.env).filter(key => key.includes('REPLICATE'))
    });
  }

  try {
    // Test the token by fetching account info
    const response = await fetch('https://api.replicate.com/v1/account', {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({
        success: false,
        error: 'Invalid API token',
        details: error,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 8) + '...'
      });
    }

    const account = await response.json();
    
    // Also test a simple model to ensure predictions work
    const testModelResponse = await fetch('https://api.replicate.com/v1/models/stability-ai/stable-diffusion', {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    return NextResponse.json({
      success: true,
      account: {
        username: account.username,
        type: account.type
      },
      tokenValid: true,
      modelAccessible: testModelResponse.ok,
      tokenPrefix: token.substring(0, 8) + '...'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to verify token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}