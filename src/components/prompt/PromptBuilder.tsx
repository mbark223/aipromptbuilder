'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PromptSection } from './PromptSection';
import { type Prompt, type Format } from '@/types';

const STYLE_SUGGESTIONS = [
  'photorealistic',
  'cinematic',
  'minimalist',
  'vibrant',
  'moody',
  'retro',
  'futuristic',
  'artistic',
];

const LIGHTING_SUGGESTIONS = [
  'golden hour',
  'blue hour',
  'soft diffused',
  'dramatic shadows',
  'neon lights',
  'natural daylight',
  'studio lighting',
  'candlelit',
];

const COMPOSITION_SUGGESTIONS = [
  'wide shot',
  'close-up',
  'aerial view',
  'low angle',
  'rule of thirds',
  'centered',
  'dutch angle',
  'over-the-shoulder',
];

interface PromptBuilderProps {
  format: Format | null;
  onSave?: (prompt: Partial<Prompt>) => void;
}

export function PromptBuilder({ format, onSave }: PromptBuilderProps) {
  const [title, setTitle] = useState('');
  const [promptContent, setPromptContent] = useState({
    subject: '',
    style: '',
    composition: '',
    lighting: '',
    motion: '',
    technical: '',
  });

  const handleSectionChange = (section: keyof typeof promptContent, value: string) => {
    setPromptContent((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  const generateFullPrompt = () => {
    const sections = Object.entries(promptContent)
      .filter(([, value]) => value.trim())
      .map(([, value]) => value.trim());
    
    return sections.join('. ');
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title for your prompt');
      return;
    }

    const prompt: Partial<Prompt> = {
      title,
      content: promptContent,
      format: format || undefined,
    };

    onSave?.(prompt);
  };

  const isValid = title.trim() && promptContent.subject.trim() && format;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Prompt Builder</h2>
          <div className="space-y-2">
            <Label htmlFor="title">Prompt Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your prompt"
            />
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="structured" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="structured">Structured</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="structured" className="space-y-4 mt-4">
            <PromptSection
              label="Subject/Main Elements"
              value={promptContent.subject}
              onChange={(value) => handleSectionChange('subject', value)}
              placeholder="Describe the main subject and key elements of your video"
              required
              maxLength={300}
            />
            
            <PromptSection
              label="Style & Aesthetic"
              value={promptContent.style}
              onChange={(value) => handleSectionChange('style', value)}
              placeholder="Define the visual style and overall aesthetic"
              required
              maxLength={200}
              suggestions={STYLE_SUGGESTIONS}
            />
            
            <PromptSection
              label="Camera/Shot Composition"
              value={promptContent.composition}
              onChange={(value) => handleSectionChange('composition', value)}
              placeholder="Specify camera angles, framing, and composition"
              required
              maxLength={200}
              suggestions={COMPOSITION_SUGGESTIONS}
            />
            
            <PromptSection
              label="Lighting & Mood"
              value={promptContent.lighting}
              onChange={(value) => handleSectionChange('lighting', value)}
              placeholder="Describe the lighting setup and mood"
              required
              maxLength={200}
              suggestions={LIGHTING_SUGGESTIONS}
            />
            
            <PromptSection
              label="Motion/Animation (Optional)"
              value={promptContent.motion}
              onChange={(value) => handleSectionChange('motion', value)}
              placeholder="Add any specific motion or animation details"
              maxLength={200}
            />
            
            <PromptSection
              label="Technical Specifications"
              value={promptContent.technical}
              onChange={(value) => handleSectionChange('technical', value)}
              placeholder="Include any technical requirements or specifications"
              required
              maxLength={200}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Full Prompt</h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {generateFullPrompt() || 'Fill in the sections to see your complete prompt...'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Format:</p>
                  <p>{format ? `${format.name} (${format.width}x${format.height})` : 'Not selected'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Character Count:</p>
                  <p>{generateFullPrompt().length} characters</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">Save as Template</Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Save Prompt
          </Button>
        </div>
      </div>
    </Card>
  );
}