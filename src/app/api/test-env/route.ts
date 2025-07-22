import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Get all environment variable keys
  const allKeys = Object.keys(process.env);
  
  // Filter for various patterns
  const replicateKeys = allKeys.filter(key => 
    key.toUpperCase().includes('REPLICATE')
  );
  
  const apiKeys = allKeys.filter(key => 
    key.includes('API') || key.includes('TOKEN') || key.includes('KEY')
  );
  
  // Show all env vars starting with certain prefixes
  const vercelKeys = allKeys.filter(key => key.startsWith('VERCEL'));
  const nextKeys = allKeys.filter(key => key.startsWith('NEXT_'));
  
  // Check various ways the token might be stored
  const checks = {
    direct: !!process.env.REPLICATE_API_TOKEN,
    totalEnvVars: allKeys.length,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    replicateKeys: replicateKeys,
    apiRelatedKeys: apiKeys,
    vercelKeys: vercelKeys,
    nextKeys: nextKeys,
    // Show first 10 env var names (safe system ones)
    sampleKeys: allKeys.filter(k => !k.includes('SECRET') && !k.includes('TOKEN')).slice(0, 10),
    // Check if running on Vercel
    isVercel: !!process.env.VERCEL,
    runtime: process.env.RUNTIME || 'unknown'
  };
  
  return NextResponse.json({
    message: 'Environment variable diagnostic',
    checks,
    timestamp: new Date().toISOString()
  });
}