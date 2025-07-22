'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { enhancePrompt } from '@/lib/promptGenerator';
import { 
  SUBJECT_SUGGESTIONS, 
  MOTION_SUGGESTIONS, 
  TECHNICAL_SUGGESTIONS
} from '@/lib/bettingSuggestions';

interface PromptBuilderSectionProps {
  imageUrl?: string;
  onPromptChange: (prompt: string) => void;
  value?: string;
}

const STYLE_SUGGESTIONS = [
  'photorealistic',
  'cinematic',
  'minimalist',
  'vibrant',
  'moody',
  'retro',
  'futuristic',
  'artistic',
  'dramatic lighting',
  'soft focus',
  'high contrast',
  'documentary style'
];

const LIGHTING_SUGGESTIONS = [
  'golden hour',
  'blue hour',
  'soft diffused',
  'dramatic shadows',
  'neon lights',
  'studio lighting',
  'natural light',
  'moody atmosphere',
  'backlit',
  'rim lighting'
];

const CAMERA_MOVEMENT_SUGGESTIONS = [
  'slow zoom in',
  'gentle pan',
  'orbital movement',
  'dolly forward',
  'tracking shot',
  'static camera',
  'handheld shake',
  'crane shot',
  'pull focus',
  'tilt up/down'
];

export function PromptBuilderSection({ imageUrl, onPromptChange, value = '' }: PromptBuilderSectionProps) {
  const [sections, setSections] = useState({
    subject: '',
    motion: '',
    style: '',
    lighting: '',
    camera: '',
    technical: ''
  });

  const updateSection = (key: keyof typeof sections, value: string) => {
    const newSections = { ...sections, [key]: value };
    setSections(newSections);
    
    // Combine all sections into a full prompt
    const fullPrompt = Object.entries(newSections)
      .filter(([, v]) => v.trim())
      .map(([, v]) => v.trim())
      .join(', ');
    
    onPromptChange(fullPrompt);
  };

  const addSuggestion = (section: keyof typeof sections, suggestion: string) => {
    const currentValue = sections[section];
    const newValue = currentValue ? `${currentValue}, ${suggestion}` : suggestion;
    updateSection(section, newValue);
  };

  const generateAIPrompt = async () => {
    const basePrompt = Object.entries(sections)
      .filter(([, v]) => v.trim())
      .map(([, v]) => v.trim())
      .join(', ');
    
    const enhanced = await enhancePrompt(basePrompt);
    onPromptChange(enhanced);
  };

  const clearAll = () => {
    setSections({
      subject: '',
      motion: '',
      style: '',
      lighting: '',
      camera: '',
      technical: ''
    });
    onPromptChange('');
  };

  return (
    <div className="space-y-6">
      {/* Context from uploaded image */}
      {imageUrl && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-4">
            <img 
              src={imageUrl} 
              alt="Reference" 
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Reference Image</p>
              <p className="text-xs text-muted-foreground">
                The AI will use this image as a starting point for animation
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Prompt sections */}
      <div className="space-y-4">
        {/* Subject/Main Elements */}
        <div className="space-y-2">
          <Label>Subject & Main Elements</Label>
          <Textarea
            placeholder="Describe the main subject and key elements..."
            value={sections.subject}
            onChange={(e) => updateSection('subject', e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex flex-wrap gap-1">
            {SUBJECT_SUGGESTIONS.slice(0, 5).map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => addSuggestion('subject', suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Motion & Animation */}
        <div className="space-y-2">
          <Label>Motion & Animation</Label>
          <Textarea
            placeholder="Describe the movement and animation style..."
            value={sections.motion}
            onChange={(e) => updateSection('motion', e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex flex-wrap gap-1">
            {MOTION_SUGGESTIONS.slice(0, 5).map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => addSuggestion('motion', suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Style & Aesthetics */}
        <div className="space-y-2">
          <Label>Style & Aesthetics</Label>
          <Textarea
            placeholder="Visual style and aesthetic choices..."
            value={sections.style}
            onChange={(e) => updateSection('style', e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex flex-wrap gap-1">
            {STYLE_SUGGESTIONS.slice(0, 5).map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => addSuggestion('style', suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Lighting */}
        <div className="space-y-2">
          <Label>Lighting</Label>
          <Textarea
            placeholder="Lighting conditions and atmosphere..."
            value={sections.lighting}
            onChange={(e) => updateSection('lighting', e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex flex-wrap gap-1">
            {LIGHTING_SUGGESTIONS.slice(0, 5).map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => addSuggestion('lighting', suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Camera Movement */}
        <div className="space-y-2">
          <Label>Camera Movement</Label>
          <Textarea
            placeholder="Camera angles and movement..."
            value={sections.camera}
            onChange={(e) => updateSection('camera', e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex flex-wrap gap-1">
            {CAMERA_MOVEMENT_SUGGESTIONS.slice(0, 5).map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => addSuggestion('camera', suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="space-y-2">
          <Label>Technical Details</Label>
          <Textarea
            placeholder="Frame rate, resolution, duration..."
            value={sections.technical}
            onChange={(e) => updateSection('technical', e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex flex-wrap gap-1">
            {TECHNICAL_SUGGESTIONS.slice(0, 5).map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => addSuggestion('technical', suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="default"
          onClick={generateAIPrompt}
          className="flex-1"
        >
          <Icons.sparkles className="mr-2 h-4 w-4" />
          Enhance with AI
        </Button>
        <Button
          variant="outline"
          onClick={clearAll}
        >
          Clear All
        </Button>
      </div>

      {/* Final prompt preview */}
      {value && (
        <Card className="p-4 bg-muted/30">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Generated Prompt</Label>
              <Badge variant="secondary">{value.length} chars</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{value}</p>
          </div>
        </Card>
      )}
    </div>
  );
}