import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Force fresh read of environment
  const directCheck = process.env.REPLICATE_API_TOKEN;
  const bracketCheck = process.env['REPLICATE_API_TOKEN'];
  
  // Try to list all env vars that might contain the token
  const allEnvVars = Object.entries(process.env)
    .filter(([key]) => {
      const k = key.toUpperCase();
      return k.includes('REPLICATE') || 
             k.includes('API') || 
             k.includes('TOKEN') ||
             k.includes('KEY');
    })
    .map(([key, value]) => ({
      key,
      hasValue: !!value,
      length: value?.length || 0,
      preview: value && value.length > 10 ? `${value.substring(0, 8)}...` : 'short/empty'
    }));
  
  return NextResponse.json({
    checks: {
      directAccess: !!directCheck,
      bracketAccess: !!bracketCheck,
      envVarsWithApiOrToken: allEnvVars,
      processEnvType: typeof process.env,
      isVercelDeployment: !!process.env.VERCEL,
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'none',
      region: process.env.VERCEL_REGION || 'none',
    },
    recommendation: !directCheck ? 
      'Token not found. Try: 1) Delete and re-add the env var in Vercel, 2) Ensure no spaces in key/value, 3) Try a different env var name like REPLICATE_TOKEN' 
      : 'Token found!'
  });
}