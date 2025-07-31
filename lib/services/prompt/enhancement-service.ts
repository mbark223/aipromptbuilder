import Anthropic from '@anthropic-ai/sdk';

export interface PromptEnhancementOptions {
  originalPrompt: string;
  style?: 'cinematic' | 'realistic' | 'animated' | 'artistic';
  mood?: 'energetic' | 'calm' | 'dramatic' | 'playful';
  platform?: string;
  aspectRatio?: string;
  editContext?: {
    previousEdits?: string[];
    desiredChanges?: string;
  };
}

class PromptEnhancementService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  async enhanceVideoPrompt(options: PromptEnhancementOptions): Promise<string> {
    const {
      originalPrompt,
      style = 'cinematic',
      mood = 'energetic',
      platform,
      aspectRatio,
      editContext
    } = options;

    const systemPrompt = `You are an expert at crafting prompts for the Google Veo3 video generation model. Your task is to enhance user prompts to produce high-quality, engaging videos.

Key guidelines:
- Veo3 excels at motion, cinematography, and visual storytelling
- Include specific camera movements (pan, zoom, tracking shots)
- Specify lighting conditions and color grading
- Add temporal descriptions (beginning, middle, end sequences)
- Include audio/sound descriptions as Veo3 supports native audio
- Keep prompts concise but descriptive
- Focus on visual details and motion dynamics

Style: ${style}
Mood: ${mood}
${platform ? `Platform: ${platform}` : ''}
${aspectRatio ? `Aspect Ratio: ${aspectRatio}` : ''}`;

    try {
      let userMessage = `Enhance this video generation prompt: "${originalPrompt}"`;
      
      if (editContext?.previousEdits) {
        userMessage += `\n\nPrevious edits applied: ${editContext.previousEdits.join(', ')}`;
      }
      
      if (editContext?.desiredChanges) {
        userMessage += `\n\nDesired changes for regeneration: ${editContext.desiredChanges}`;
      }

      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      });

      const enhancedPrompt = response.content[0].type === 'text' 
        ? response.content[0].text 
        : originalPrompt;

      return enhancedPrompt;
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      return originalPrompt;
    }
  }

  async enhanceForRegeneration(
    originalPrompt: string,
    editedVideoDescription: string,
    appliedEdits: string[]
  ): Promise<string> {
    return this.enhanceVideoPrompt({
      originalPrompt,
      editContext: {
        previousEdits: appliedEdits,
        desiredChanges: editedVideoDescription
      }
    });
  }
}

export const promptEnhancementService = new PromptEnhancementService();