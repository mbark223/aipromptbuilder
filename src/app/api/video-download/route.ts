import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'video.mp4';
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    console.log(`Attempting to download video from: ${videoUrl}`);

    // Try to fetch the video with various headers
    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': request.headers.get('referer') || request.url,
        'Origin': request.headers.get('origin') || new URL(request.url).origin,
      },
      cache: 'no-store',
      redirect: 'follow',
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      console.error(`URL: ${videoUrl}`);
      
      // Try to get more error details
      const errorText = await response.text().catch(() => '');
      console.error(`Error response: ${errorText}`);
      
      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    
    console.log(`Video fetch successful. Content-Type: ${contentType}, Size: ${contentLength}`);
    
    // Stream the response instead of loading it all into memory
    const stream = response.body;
    
    if (!stream) {
      throw new Error('No response body available');
    }
    
    // Return the video with proper headers for download
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        ...(contentLength ? { 'Content-Length': contentLength } : {}),
      },
    });
  } catch (error) {
    console.error('Video download error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to download video';
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        error: errorMessage,
        details: 'The video could not be downloaded. This might be due to CORS restrictions or the video URL being invalid.',
        suggestion: 'Try using the client-side processing option instead.'
      },
      { status: 500 }
    );
  }
}