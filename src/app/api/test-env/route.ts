import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_LUMA_AI_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    firstChars: apiKey ? apiKey.substring(0, 10) + '...' : 'not set',
    nodeEnv: process.env.NODE_ENV,
  });
}