import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  
  if (!token) {
    return NextResponse.json({
      success: false,
      message: 'Token not found in environment',
      debug: {
        envKeys: Object.keys(process.env).length,
        hasReplicateKeys: Object.keys(process.env).some(k => k.includes('REPLICATE')),
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
  
  // Try to verify the token with Replicate
  try {
    const response = await fetch('https://api.replicate.com/v1/account', {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Token is valid and working',
        account: {
          username: data.username,
          type: data.type
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Token exists but is invalid',
        error: response.statusText,
        status: response.status
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error verifying token',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}