import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.1',
    timestamp: new Date().toISOString(),
    hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
    nodeVersion: process.version,
  });
}