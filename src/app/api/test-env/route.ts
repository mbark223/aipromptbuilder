import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Get all environment variable keys that contain 'REPLICATE'
  const replicateKeys = Object.keys(process.env).filter(key => 
    key.toUpperCase().includes('REPLICATE')
  );
  
  // Check various ways the token might be stored
  const checks = {
    direct: !!process.env.REPLICATE_API_TOKEN,
    uppercase: !!process.env['REPLICATE_API_TOKEN'],
    lowercase: !!process.env['replicate_api_token'],
    withPrefix: !!process.env['NEXT_PUBLIC_REPLICATE_API_TOKEN'],
    totalEnvVars: Object.keys(process.env).length,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    replicateKeys: replicateKeys,
    hasAnyReplicateKey: replicateKeys.length > 0,
    // Show first few characters of token if it exists (for debugging)
    tokenPreview: process.env.REPLICATE_API_TOKEN 
      ? `${process.env.REPLICATE_API_TOKEN.substring(0, 8)}...` 
      : 'not found'
  };
  
  return NextResponse.json({
    message: 'Environment variable check',
    checks,
    timestamp: new Date().toISOString()
  });
}