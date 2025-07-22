import { NextRequest, NextResponse } from 'next/server';
import { createVideoStorageService } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tempUrl, fileName, metadata } = body;

    if (!tempUrl || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields: tempUrl and fileName' },
        { status: 400 }
      );
    }

    const storageService = createVideoStorageService();
    
    // Upload video from temporary URL to permanent storage
    const result = await storageService.uploadFromUrl(
      tempUrl,
      fileName,
      metadata
    );

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Storage upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload to storage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}