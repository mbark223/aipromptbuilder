import { NextRequest, NextResponse } from 'next/server';

const CLAUDE_4_SONNET_MODEL = 'anthropic/claude-4-sonnet:3380fe4ca9cac053c89d1df86a5ba850e61cbef1d474a24abded9516e5a73a04';

const VEO_3_BEST_PRACTICES = `You are an expert at creating video generation prompts following Veo 3 best practices. Your task is to enhance user prompts and create variations that will produce high-quality videos.

Best Practices for Video Prompts:
1. Include ALL of these elements:
   - Subject: Detailed character/object description
   - Context/Location: Specific setting details
   - Action: Clear movement or activity
   - Visual Style: Artistic direction
   - Camera Motion: Specific camera movements
   - Composition: Framing and layout
   - Ambiance/Mood: Atmosphere and feeling

2. Be VERY specific about:
   - Character appearance (clothing, features, expressions)
   - Exact actions and movements
   - Precise environmental details
   - Camera movements (zoom, pan, tracking shot, etc.)

3. For audio (when applicable):
   - Include dialogue in quotes
   - Describe background sounds
   - Mention sound effects
   - Add "(no subtitles)" if needed
   - Keep dialogue concise (around 8 seconds)

4. Style Guidelines:
   - Experiment with styles (cinematic, anime, LEGO, claymation)
   - Use specific lighting descriptions
   - Include time of day/weather when relevant

5. Prompt Structure:
   "[Style]: [Detailed character], [Setting], [Action], [Camera motion], [Audio description] (no subtitles)"

Example:
"Cinematic style: A young woman with flowing red hair wearing a blue dress, in a sunlit forest clearing, dancing gracefully among wildflowers, camera slowly circling around her, soft orchestral music with birds chirping (no subtitles)"`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, variations = 3 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Call Claude 4 Sonnet via Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: CLAUDE_4_SONNET_MODEL,
        input: {
          prompt: `${VEO_3_BEST_PRACTICES}

User's base prompt: "${prompt}"

Task: Create ${variations} enhanced variations of this prompt following the best practices above. Each variation should:
1. Include all recommended elements (subject, context, action, style, camera, composition, mood)
2. Be significantly different from each other while maintaining the core concept
3. Be optimized for high-quality video generation
4. Range from cinematic to creative interpretations

Format your response as a JSON array of strings, with each string being a complete enhanced prompt. Do not include any other text or explanation.`,
          max_tokens: 2000,
          temperature: 0.8,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Replicate API error:', error);
      return NextResponse.json(
        { error: 'Failed to enhance prompt' },
        { status: 500 }
      );
    }

    const prediction = await response.json();

    // Poll for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      );
      
      if (!statusResponse.ok) {
        throw new Error('Failed to check prediction status');
      }
      
      result = await statusResponse.json();
    }

    if (result.status === 'succeeded' && result.output) {
      try {
        // Extract JSON array from Claude's response
        const output = result.output.join('');
        const jsonMatch = output.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const enhancedPrompts = JSON.parse(jsonMatch[0]);
          
          // Also analyze the original prompt to provide feedback
          const analysis = analyzePrompt(prompt);
          
          return NextResponse.json({
            enhancedPrompts,
            originalPrompt: prompt,
            analysis,
          });
        } else {
          // Fallback if JSON parsing fails
          const lines = output.split('\n').filter((line: string) => line.trim().length > 0);
          const enhancedPrompts = lines.slice(0, variations);
          
          return NextResponse.json({
            enhancedPrompts,
            originalPrompt: prompt,
            analysis: analyzePrompt(prompt),
          });
        }
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        return NextResponse.json(
          { error: 'Failed to parse enhanced prompts' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to enhance prompt' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in enhance-video-prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Analyze prompt for quality indicators
function analyzePrompt(prompt: string): {
  score: number;
  elements: {
    hasSubject: boolean;
    hasContext: boolean;
    hasAction: boolean;
    hasStyle: boolean;
    hasCameraMotion: boolean;
    hasComposition: boolean;
    hasMood: boolean;
    hasAudio: boolean;
  };
  suggestions: string[];
} {
  
  const elements = {
    hasSubject: /person|man|woman|character|animal|object|robot|creature/i.test(prompt),
    hasContext: /in |at |on |inside|outside|location|place|scene|environment/i.test(prompt),
    hasAction: /walk|run|jump|move|dance|fly|swim|gesture|motion|ing\b/i.test(prompt),
    hasStyle: /style|cinematic|anime|realistic|cartoon|artistic|aesthetic/i.test(prompt),
    hasCameraMotion: /camera|zoom|pan|track|shot|angle|close-up|wide/i.test(prompt),
    hasComposition: /foreground|background|center|frame|composition/i.test(prompt),
    hasMood: /mood|atmosphere|feeling|dramatic|peaceful|energetic|dark|bright/i.test(prompt),
    hasAudio: /sound|music|audio|voice|noise|silent/i.test(prompt),
  };
  
  const elementCount = Object.values(elements).filter(Boolean).length;
  const score = Math.round((elementCount / 8) * 100);
  
  const suggestions = [];
  if (!elements.hasSubject) suggestions.push('Add a detailed subject description');
  if (!elements.hasContext) suggestions.push('Specify the location or environment');
  if (!elements.hasAction) suggestions.push('Describe what is happening or moving');
  if (!elements.hasStyle) suggestions.push('Include a visual style (e.g., cinematic, anime)');
  if (!elements.hasCameraMotion) suggestions.push('Add camera movement details');
  if (!elements.hasMood) suggestions.push('Describe the mood or atmosphere');
  
  return { score, elements, suggestions };
}