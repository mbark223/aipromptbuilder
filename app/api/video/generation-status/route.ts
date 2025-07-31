import { NextRequest, NextResponse } from 'next/server';
import { videoGenerationService } from '@/lib/services/video/generation-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const predictionId = searchParams.get('id');

    if (!predictionId) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    const status = await videoGenerationService.checkGenerationStatus(predictionId);

    return NextResponse.json({
      success: true,
      generation: status,
      isComplete: status.status === 'succeeded' || status.status === 'failed' || status.status === 'canceled',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generation status error:', error);
    return NextResponse.json(
      { error: 'Failed to check generation status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}