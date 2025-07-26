'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface PromptInputProps {
  onPromptsGenerated: (prompts: string[]) => void;
}

const PROMPT_TEMPLATES = [
  {
    category: 'Action',
    templates: [
      'A high-speed chase through neon-lit city streets at night',
      'Epic battle scene with dynamic camera movements',
      'Parkour athlete jumping between buildings at sunset',
      'Racing cars drifting around mountain curves',
    ]
  },
  {
    category: 'Nature',
    templates: [
      'Timelapse of clouds moving over mountain peaks',
      'Ocean waves crashing against rocky cliffs during storm',
      'Forest canopy swaying in gentle breeze with sunlight',
      'Aurora borealis dancing across starry night sky',
    ]
  },
  {
    category: 'Abstract',
    templates: [
      'Colorful liquid paint mixing and swirling in slow motion',
      'Geometric shapes morphing and transforming seamlessly',
      'Particles of light forming and dispersing in space',
      'Kaleidoscope patterns evolving with vibrant colors',
    ]
  },
  {
    category: 'Cinematic',
    templates: [
      'Cinematic reveal of futuristic cityscape at dawn',
      'Dramatic close-up with shallow depth of field',
      'Sweeping drone shot over misty mountains',
      'Slow motion explosion with debris and particles',
    ]
  }
];

export function PromptInput({ onPromptsGenerated }: PromptInputProps) {
  const { toast } = useToast();
  const [basePrompt, setBasePrompt] = useState('');
  const [variations, setVariations] = useState(3);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (template: string) => {
    setBasePrompt(template);
    setSelectedTemplate(template);
  };

  const handleGeneratePrompts = async () => {
    if (!basePrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a base prompt',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    const prompts: string[] = [basePrompt];

    try {
      // Generate variations by adding different style modifiers
      const styleVariations = [
        'cinematic, dramatic lighting',
        'vibrant colors, dynamic motion',
        'moody atmosphere, high contrast',
        'soft lighting, smooth transitions',
        'energetic, fast-paced action'
      ];

      for (let i = 0; i < Math.min(variations - 1, styleVariations.length); i++) {
        const variation = `${basePrompt}, ${styleVariations[i]}`;
        prompts.push(variation);
      }

      setGeneratedPrompts(prompts);
      onPromptsGenerated(prompts);
      
      toast({
        title: 'Success',
        description: `Generated ${prompts.length} prompt variations`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate prompt variations',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemovePrompt = (index: number) => {
    const newPrompts = generatedPrompts.filter((_, i) => i !== index);
    setGeneratedPrompts(newPrompts);
    onPromptsGenerated(newPrompts);
  };

  const handleEditPrompt = (index: number, newText: string) => {
    const newPrompts = [...generatedPrompts];
    newPrompts[index] = newText;
    setGeneratedPrompts(newPrompts);
    onPromptsGenerated(newPrompts);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="base-prompt">Base Prompt</Label>
          <Textarea
            id="base-prompt"
            placeholder="Enter your video description..."
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            className="mt-2 min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Quick Templates</Label>
          <div className="space-y-4">
            {PROMPT_TEMPLATES.map((category) => (
              <div key={category.category}>
                <h4 className="text-sm font-medium mb-2">{category.category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.templates.map((template) => (
                    <button
                      key={template}
                      onClick={() => handleTemplateSelect(template)}
                      className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                        selectedTemplate === template
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="variations">Number of Variations</Label>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVariations(Math.max(1, variations - 1))}
                disabled={variations <= 1}
              >
                <Icons.minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{variations}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVariations(Math.min(10, variations + 1))}
                disabled={variations >= 10}
              >
                <Icons.plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleGeneratePrompts}
            disabled={!basePrompt.trim() || isGenerating}
            className="mt-6"
          >
            {isGenerating ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Icons.sparkles className="mr-2 h-4 w-4" />
                Generate Prompts
              </>
            )}
          </Button>
        </div>
      </div>

      {generatedPrompts.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Prompts</h3>
              <Badge variant="secondary">{generatedPrompts.length} prompts</Badge>
            </div>
            
            <div className="space-y-3">
              {generatedPrompts.map((prompt, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Label className="text-sm">Prompt {index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePrompt(index)}
                      >
                        <Icons.x className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={prompt}
                      onChange={(e) => handleEditPrompt(index, e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}