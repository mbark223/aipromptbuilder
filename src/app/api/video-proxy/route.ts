import { NextRequest, NextResponse } from 'next/server';

// This endpoint provides a more robust video proxy that handles various edge cases
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, filename } = body;
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    console.log(`Video proxy request for: ${videoUrl}`);

    // Create a simple HTML page that triggers download
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Downloading Video...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #333; margin-bottom: 1rem; }
    p { color: #666; margin-bottom: 1rem; }
    .video-container {
      margin: 2rem 0;
    }
    video {
      max-width: 100%;
      max-height: 400px;
      border-radius: 4px;
    }
    .instructions {
      background: #f0f0f0;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }
    .button {
      background: #0066cc;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      margin-top: 1rem;
    }
    .button:hover {
      background: #0052a3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Download Your Video</h1>
    <p>Your video is ready for download.</p>
    
    <div class="video-container">
      <video controls src="${videoUrl}">
        Your browser does not support the video tag.
      </video>
    </div>
    
    <div class="instructions">
      <p><strong>To download the video:</strong></p>
      <p>Right-click on the video above and select "Save video as..." or "Download video"</p>
    </div>
    
    <a href="${videoUrl}" download="${filename || 'video.mp4'}" class="button">
      Try Direct Download
    </a>
  </div>
  
  <script>
    // Try automatic download
    window.onload = function() {
      const link = document.querySelector('a.button');
      if (link) {
        setTimeout(() => {
          link.click();
        }, 500);
      }
    };
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Video proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to create download page' },
      { status: 500 }
    );
  }
}