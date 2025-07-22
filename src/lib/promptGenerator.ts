import { Prompt, Format, ConsistencySettings } from '@/types';

interface GeneratePromptOptions {
  content: Prompt['content'];
  format: Format;
  consistency?: ConsistencySettings;
  platform?: 'veo' | 'flows' | 'generic';
}

export function generateOptimizedPrompt({
  content,
  format,
  consistency,
  platform = 'generic'
}: GeneratePromptOptions): string {
  const parts: string[] = [];

  // Format-specific instructions
  const formatInstructions = getFormatInstructions(format);
  if (formatInstructions) {
    parts.push(formatInstructions);
  }

  // Main subject - most important, goes first
  if (content.subject) {
    parts.push(content.subject.trim());
  }

  // Style and aesthetic
  if (content.style) {
    parts.push(`Style: ${content.style.trim()}`);
  }

  // Camera and composition
  if (content.composition) {
    parts.push(`Shot: ${content.composition.trim()}`);
  }

  // Lighting
  if (content.lighting) {
    parts.push(`Lighting: ${content.lighting.trim()}`);
  }

  // Motion (if specified)
  if (content.motion) {
    parts.push(`Motion: ${content.motion.trim()}`);
  }

  // Technical specifications
  if (content.technical) {
    parts.push(content.technical.trim());
  }

  // Audio (for Veo-3 and supported models)
  if ((content as any).audio && platform === 'veo') {
    parts.push((content as any).audio.trim());
  }

  // Consistency parameters
  if (consistency) {
    const consistencyParts = buildConsistencyInstructions(consistency);
    if (consistencyParts) {
      parts.push(consistencyParts);
    }
  }

  // Platform-specific optimizations
  const platformOptimizations = getPlatformOptimizations(platform);
  if (platformOptimizations) {
    parts.push(platformOptimizations);
  }

  // Join with proper punctuation
  return parts.join('. ').replace(/\.\./g, '.') + '.';
}

function getFormatInstructions(format: Format): string {
  const instructions: Record<string, string> = {
    '1:1': 'Square format, centered composition',
    '9:16': 'Vertical format, optimized for mobile viewing',
    '16:9': 'Cinematic widescreen format',
    '4:5': 'Portrait format, slightly taller than square'
  };

  return instructions[format.aspectRatio] || `${format.aspectRatio} aspect ratio`;
}

function buildConsistencyInstructions(consistency: ConsistencySettings): string {
  const parts: string[] = [];

  if (consistency.seedId) {
    parts.push(`Seed: ${consistency.seedId}`);
  }

  if (consistency.colorPalette && consistency.colorPalette.length > 0) {
    parts.push(`Color palette: ${consistency.colorPalette.join(', ')}`);
  }

  if (consistency.lockedParams && consistency.lockedParams.length > 0) {
    parts.push(`Maintain consistent: ${consistency.lockedParams.join(', ').toLowerCase()}`);
  }

  if (consistency.styleReference) {
    parts.push(`Style reference: ${consistency.styleReference}`);
  }

  return parts.join(', ');
}

function getPlatformOptimizations(platform: string): string {
  const optimizations: Record<string, string> = {
    veo: 'High quality, photorealistic rendering',
    flows: 'Smooth transitions, dynamic movement',
    generic: ''
  };

  return optimizations[platform] || '';
}

// Best practices and tips for different prompt types
export const PROMPT_BEST_PRACTICES = {
  general: [
    'Be specific about visual details',
    'Use descriptive adjectives for style',
    'Specify camera angles and movement',
    'Include lighting and mood details',
    'Mention color grading preferences'
  ],
  veo: [
    'Emphasize photorealistic qualities',
    'Include material and texture details',
    'Specify depth of field preferences',
    'Use cinematic terminology'
  ],
  flows: [
    'Focus on motion and transitions',
    'Describe timing and pacing',
    'Include dynamic elements',
    'Specify animation style'
  ]
};

// Enhanced prompt templates
export const ENHANCED_TEMPLATES = {
  productHero: {
    structure: 'Floating [PRODUCT] in [ENVIRONMENT], [LIGHTING] illumination, [CAMERA] shot, [STYLE] aesthetic',
    example: 'Floating smartphone in minimalist white space, soft studio illumination, slow rotating shot, ultra-modern aesthetic'
  },
  lifestyle: {
    structure: '[SUBJECT] [ACTION] with [PRODUCT], [SETTING] environment, [MOOD] atmosphere, [CAMERA] perspective',
    example: 'Young professional using laptop, modern coffee shop environment, warm productive atmosphere, handheld perspective'
  },
  brand: {
    structure: '[BRAND ELEMENT] transitioning through [SCENES], [STYLE] treatment, [COLOR] palette, [MOTION] progression',
    example: 'Logo transitioning through abstract scenes, premium cinematic treatment, blue and silver palette, smooth morphing progression'
  }
};

// Prompt enhancement suggestions
export function enhancePrompt(basicPrompt: string): string[] {
  const suggestions: string[] = [];
  
  // Check for missing elements
  if (!basicPrompt.toLowerCase().includes('light')) {
    suggestions.push('Consider adding lighting details (e.g., "golden hour", "studio lighting")');
  }
  
  if (!basicPrompt.toLowerCase().includes('shot') && !basicPrompt.toLowerCase().includes('angle')) {
    suggestions.push('Specify camera angle or shot type (e.g., "wide shot", "close-up")');
  }
  
  if (!basicPrompt.toLowerCase().includes('style') && !basicPrompt.toLowerCase().includes('aesthetic')) {
    suggestions.push('Define visual style (e.g., "cinematic", "minimalist", "vibrant")');
  }
  
  if (!basicPrompt.toLowerCase().includes('color')) {
    suggestions.push('Add color information (e.g., "warm tones", "monochromatic")');
  }
  
  return suggestions;
}

// Simple prompt generator for the new builder
interface SimplePromptOptions {
  platform?: 'generic' | 'veo' | 'flows';
  aspectRatio?: string;
  modelVersion?: string;
  includeAudio?: boolean;
}

export function generatePrompt(
  sections: Record<string, string>,
  options: SimplePromptOptions = {}
): string {
  const parts: string[] = [];
  
  // Add main content sections in order
  if (sections.subject) parts.push(sections.subject);
  if (sections.action) parts.push(sections.action);
  if (sections.location) parts.push(sections.location);
  if (sections.style) parts.push(sections.style);
  if (sections.camera) parts.push(sections.camera);
  if (sections.lighting) parts.push(sections.lighting);
  if (sections.motion) parts.push(sections.motion);
  if (sections.technical) parts.push(sections.technical);
  
  // Add audio for supported platforms
  if (sections.audio && options.includeAudio) {
    parts.push(sections.audio);
  }
  
  // Platform-specific enhancements
  if (options.platform === 'veo') {
    if (options.modelVersion === 'pro') {
      parts.push('ultra high quality');
    }
  }
  
  // Join parts with commas and clean up
  return parts
    .filter(p => p && p.trim())
    .join(', ')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}