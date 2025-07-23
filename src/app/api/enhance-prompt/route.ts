import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface EnhancePromptRequest {
  promptSections: {
    subject?: string;
    style?: string;
    camera?: string;
    details?: string;
  };
  modelInfo?: {
    name: string;
    capabilities: string[];
  };
  animationElements?: Array<{
    type: string;
    enabled: boolean;
    animationType: string;
  }>;
  format?: {
    aspectRatio: string;
  };
  useVeo3Format?: boolean;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function enhanceWithOpenAI(prompt: string, context: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert at creating prompts for AI video generation models. Your task is to enhance user prompts to be more descriptive, specific, and optimized for video generation. Focus on visual details, movement, lighting, and cinematic qualities. Keep the enhanced prompt concise but comprehensive.`
        },
        {
          role: 'user',
          content: `Please enhance this video generation prompt. ${context}\n\nOriginal prompt sections:\n${prompt}\n\nProvide only the enhanced prompt, no explanations.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to enhance prompt with OpenAI');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function enhanceWithAnthropic(prompt: string, context: string, useVeo3Format: boolean = false): Promise<string> {
  let systemPrompt: string;
  let userContent: string;

  if (useVeo3Format) {
    systemPrompt = `You are an expert Veo 3 prompt builder. Your task is to transform a base raw prompt into a flawless, detailed prompt for Veo 3 in the required JSON format. Follow these instructions carefully:

1. Transform the base prompt into a detailed, comprehensive prompt for Veo 3. 

IMPORTANT: Check if the prompt indicates the user wants to animate a static image with minimal changes (words like "replica", "exact", "maintain", "preserve"). If so:
- Focus on subtle, natural movements while preserving the exact appearance
- Use minimal camera movement (static or barely perceptible motion)
- Emphasize faithful recreation of the source image with gentle animation
- Avoid adding new elements or changing the composition

Otherwise, expand on the ideas presented, adding rich details and specific elements that will result in a high-quality video output.

2. Include the following elements in your expanded prompt:
a. Sequence details:
- Composition: Describe the overall visual style and camera techniques
- Camera motion: Specify how the camera moves throughout the scene
- Frame rate: Default to 24fps unless the scenario suggests otherwise
- Film grain: Describe the desired texture of the image

b. For each distinct scene or setting change, create a new scene object with:
- Location: Describe the setting in detail
- Time of day: Specify the lighting conditions
- Environment: Add details about the surroundings

c. Visual details for each scene:
- Action: Describe what's happening in the scene
- Props: List important objects or elements in the scene

d. Audio elements:
- Ambient sounds: Describe background noises or music
- Dialogue: If applicable, include specific lines of dialogue
(Remember to add "(no subtitles!)" after dialogue to prevent unwanted text on screen)

e. Transitions between scenes:
- Description: How one scene changes to the next
- Duration: How long the transition should take
- Style: The visual effect of the transition

3. Structure your output in the following JSON format:
{
"sequence": {
"shot": {},
"subject": {},
"cinematography": {},
"audio": {},
"color_palette": ""
},
"scenes": [
{
"scene": {},
"visual_details": {},
"audio": {
"dialogue": {}
}
}
],
"transitions": [
{}
]
}

4. Your final output should be the complete JSON structure, filled with rich, detailed content based on the base prompt. Do not include any explanation or additional text outside of the JSON structure.`;
    
    userContent = `<base_prompt>\n${prompt}\n</base_prompt>`;
  } else {
    systemPrompt = `You are an expert at creating prompts for AI video generation models. Your task is to enhance user prompts to be more descriptive, specific, and optimized for video generation. 

IMPORTANT: If the user mentions "replica", "exact", "maintain", "preserve", "static with motion", or similar terms, they want to animate their static image with MINIMAL changes. In these cases:
- Emphasize preserving the exact appearance of the source image
- Focus on subtle, natural movements (breathing, blinking, gentle swaying)
- Avoid dramatic camera movements or scene changes
- Keep all visual elements faithful to the original

Focus on visual details, movement, lighting, and cinematic qualities. Keep the enhanced prompt concise but comprehensive.`;
    
    userContent = `Please enhance this video generation prompt. ${context}\n\nOriginal prompt sections:\n${prompt}\n\nProvide only the enhanced prompt, no explanations.`;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      messages: [
        {
          role: 'user',
          content: userContent
        }
      ],
      system: systemPrompt,
      max_tokens: useVeo3Format ? 2000 : 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to enhance prompt with Anthropic');
  }

  const data = await response.json();
  return data.content[0].text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body: EnhancePromptRequest = await request.json();
    const { promptSections, modelInfo, animationElements, format, useVeo3Format = false } = body;

    // Build the current prompt from sections
    const currentPrompt = Object.entries(promptSections)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    if (!currentPrompt.trim()) {
      return NextResponse.json(
        { error: 'No prompt content to enhance' },
        { status: 400 }
      );
    }

    // Build context for the AI
    let context = '';
    
    if (modelInfo) {
      context += `Target model: ${modelInfo.name}. `;
      if (modelInfo.capabilities.includes('Photorealistic')) {
        context += 'The model excels at photorealistic rendering. ';
      }
      if (modelInfo.capabilities.includes('Fast Generation')) {
        context += 'Optimize for clarity and directness. ';
      }
    }

    if (animationElements) {
      const enabledElements = animationElements.filter(el => el.enabled);
      if (enabledElements.length > 0) {
        context += `Animation elements: ${enabledElements.map(el => `${el.type} (${el.animationType})`).join(', ')}. `;
      }
    }

    if (format) {
      context += `Output format: ${format.aspectRatio} aspect ratio. `;
    }

    // Check if this is for Veo 3 model
    const isVeo3 = modelInfo?.name?.toLowerCase().includes('veo') || useVeo3Format;

    // Try to enhance with available AI service
    let enhancedPrompt: string;
    let suggestions: string[] = [];
    let isJsonFormat = false;

    if (ANTHROPIC_API_KEY && isVeo3) {
      // Use Claude with Veo 3 specific prompt
      enhancedPrompt = await enhanceWithAnthropic(currentPrompt, context, true);
      isJsonFormat = true;
    } else if (OPENAI_API_KEY) {
      enhancedPrompt = await enhanceWithOpenAI(currentPrompt, context);
    } else if (ANTHROPIC_API_KEY) {
      enhancedPrompt = await enhanceWithAnthropic(currentPrompt, context, false);
    } else {
      // Fallback to rule-based enhancement
      enhancedPrompt = enhancePromptWithRules(promptSections, context);
      suggestions = generateSuggestions(promptSections);
    }

    // Calculate quality score
    const qualityScore = calculateQualityScore(enhancedPrompt);

    return NextResponse.json({
      original: currentPrompt,
      enhanced: enhancedPrompt,
      suggestions,
      qualityScore,
      enhancedBy: OPENAI_API_KEY ? 'openai' : ANTHROPIC_API_KEY ? 'anthropic' : 'rules',
      isJsonFormat,
      modelName: modelInfo?.name,
    });
  } catch (error) {
    console.error('Enhance prompt error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fallback rule-based enhancement
function enhancePromptWithRules(
  sections: EnhancePromptRequest['promptSections'],
  context: string
): string {
  const enhanced: string[] = [];

  // Enhance subject/action
  if (sections.subject) {
    let subject = sections.subject.trim();
    // Add detail words if missing
    if (!subject.match(/detailed|realistic|high quality|professional/i)) {
      subject = `Highly detailed ${subject}`;
    }
    enhanced.push(subject);
  }

  // Enhance style
  if (sections.style) {
    let style = sections.style.trim();
    // Add quality descriptors
    if (!style.match(/quality|resolution|definition/i)) {
      style = `${style}, ultra high quality`;
    }
    enhanced.push(style);
  }

  // Enhance camera movement
  if (sections.camera) {
    let camera = sections.camera.trim();
    // Add smoothness descriptors
    if (!camera.match(/smooth|steady|professional|cinematic/i)) {
      camera = `Smooth ${camera}`;
    }
    enhanced.push(camera);
  }

  // Enhance details
  if (sections.details) {
    let details = sections.details.trim();
    // Ensure proper lighting mention
    if (!details.match(/lighting|illumination|light/i)) {
      details = `${details}, professional lighting`;
    }
    enhanced.push(details);
  }

  // Add context-specific enhancements
  if (context.includes('photorealistic')) {
    enhanced.push('photorealistic rendering');
  }

  if (context.includes('16:9')) {
    enhanced.push('cinematic widescreen composition');
  }

  return enhanced.join(', ');
}

function generateSuggestions(sections: EnhancePromptRequest['promptSections']): string[] {
  const suggestions: string[] = [];

  if (!sections.subject || sections.subject.length < 20) {
    suggestions.push('Add more detail about the main subject or action');
  }

  if (!sections.style) {
    suggestions.push('Specify a visual style (e.g., cinematic, minimalist, vibrant)');
  }

  if (!sections.camera) {
    suggestions.push('Describe camera movement or angle for dynamic shots');
  }

  if (!sections.details || !sections.details.match(/light/i)) {
    suggestions.push('Include lighting details for better atmosphere');
  }

  return suggestions;
}

function calculateQualityScore(prompt: string): number {
  let score = 0;
  const maxScore = 100;

  // Length check (optimal: 50-200 characters)
  const length = prompt.length;
  if (length >= 50 && length <= 200) {
    score += 20;
  } else if (length >= 30 && length <= 300) {
    score += 10;
  }

  // Descriptive words
  const descriptiveWords = prompt.match(/detailed|realistic|smooth|professional|cinematic|high quality|ultra|vibrant|dramatic/gi);
  if (descriptiveWords) {
    score += Math.min(descriptiveWords.length * 5, 20);
  }

  // Technical terms
  const technicalTerms = prompt.match(/lighting|camera|shot|angle|perspective|composition|depth|focus|motion|movement/gi);
  if (technicalTerms) {
    score += Math.min(technicalTerms.length * 5, 20);
  }

  // Style specification
  if (prompt.match(/style|aesthetic|mood|atmosphere|tone/i)) {
    score += 15;
  }

  // Visual details
  if (prompt.match(/color|texture|material|surface|reflection/i)) {
    score += 15;
  }

  // Clarity (no redundancy)
  const words = prompt.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  if (uniqueWords.size / words.length > 0.7) {
    score += 10;
  }

  return Math.min(score, maxScore);
}