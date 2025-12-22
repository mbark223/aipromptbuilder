import { NextRequest, NextResponse } from 'next/server';

interface TestSuggestionsRequest {
  imageUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: TestSuggestionsRequest = await request.json();
    
    if (!data.imageUrl) {
      return NextResponse.json(
        { error: 'Missing image URL' },
        { status: 400 }
      );
    }

    // Use OpenAI's GPT-4V to analyze the image and suggest testing scenarios
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4-vision-preview',
            messages: [
              {
                role: 'system',
                content: 'You are an expert at suggesting creative variations for images used in digital marketing. Analyze the provided image and suggest 6-8 specific testing scenarios that would help marketers understand how the design performs in different contexts.'
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Based on this image, suggest specific testing scenarios for different backgrounds, lighting, colors, seasonal themes, and marketing contexts. Each suggestion should be a concrete, actionable description that can be used to create variations.'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: data.imageUrl,
                      detail: 'low'
                    }
                  }
                ]
              }
            ],
            max_tokens: 500,
            temperature: 0.8,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const suggestions = result.choices[0]?.message?.content;
          
          // Parse the suggestions into an array
          const prompts = suggestions
            .split('\n')
            .filter((line: string) => line.trim().length > 0)
            .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
            .filter((line: string) => line.length > 10)
            .slice(0, 8);

          return NextResponse.json({ prompts });
        }
      } catch (error) {
        console.error('Error with OpenAI API:', error);
      }
    }

    // Fallback prompts if OpenAI API is not available
    const defaultPrompts = [
      'Add a bright summer background with beach elements and warm sunlight',
      'Create a dark, moody atmosphere with dramatic lighting and shadows',
      'Apply a festive holiday theme with snow, decorations, and warm colors',
      'Use vibrant neon colors and cyberpunk aesthetic with glowing effects',
      'Add subtle bokeh effect with warm golden hour lighting',
      'Create a minimalist look with plenty of white space and clean lines',
      'Apply vintage film grain, sepia tones, and retro styling',
      'Add dynamic motion blur and energy lines for action feel',
      'Create a luxury feel with gold accents and elegant typography',
      'Use pastel colors for a soft, dreamy, ethereal appearance'
    ];

    // Return a random selection of 6 prompts
    const shuffled = [...defaultPrompts].sort(() => 0.5 - Math.random());
    return NextResponse.json({ prompts: shuffled.slice(0, 6) });

  } catch (error) {
    console.error('Error generating test suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate test suggestions' },
      { status: 500 }
    );
  }
}