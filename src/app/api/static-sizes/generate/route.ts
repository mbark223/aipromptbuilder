import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  imageUrl: string;
  sizes: string[];
}

const PREDEFINED_SIZES: Record<string, { width: number; height: number }> = {
  'square-1080': { width: 1080, height: 1080 },
  'square-500': { width: 500, height: 500 },
  'landscape-1920': { width: 1920, height: 1080 },
  'landscape-1200': { width: 1200, height: 675 },
  'fb-link': { width: 1200, height: 630 },
  'story-1080': { width: 1080, height: 1920 },
  'portrait-1080': { width: 1080, height: 1350 },
  'pinterest': { width: 1000, height: 1500 },
  'twitter-post': { width: 1200, height: 675 },
  'linkedin': { width: 1200, height: 627 },
  'fb-cover': { width: 820, height: 312 },
};

export async function POST(request: NextRequest) {
  try {
    const data: GenerateRequest = await request.json();
    
    if (!data.imageUrl || !data.sizes || data.sizes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Since we're sending base64 from client, we'll process it there
    // For now, just return the same image for all sizes
    // In a real implementation, you might use OpenAI's image generation API here
    const generatedImages: Record<string, string> = {};

    // Process each requested size
    for (const sizeId of data.sizes) {
      let dimensions = PREDEFINED_SIZES[sizeId];
      
      // Handle custom sizes
      if (!dimensions && sizeId.startsWith('custom-')) {
        const match = sizeId.match(/custom-(\d+)x(\d+)/);
        if (match) {
          dimensions = { width: parseInt(match[1]), height: parseInt(match[2]) };
        }
      }
      
      if (!dimensions) continue;

      // For now, return the original image
      // In production, you would use OpenAI's API to generate properly sized images
      generatedImages[sizeId] = data.imageUrl;
    }

    return NextResponse.json({ images: generatedImages });
  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    );
  }
}