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


export function PromptInput({ onPromptsGenerated }: PromptInputProps) {
  const { toast } = useToast();
  const [basePrompt, setBasePrompt] = useState('');
  const [variations, setVariations] = useState(1);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [promptAnalysis, setPromptAnalysis] = useState<{
    score: number;
    elements: Record<string, boolean>;
    suggestions: string[];
  } | null>(null);


  const handleEnhanceWithAI = async () => {
    if (!basePrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a base prompt',
        variant: 'destructive',
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-video-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: basePrompt, variations }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const data = await response.json();
      
      setGeneratedPrompts(data.enhancedPrompts);
      setPromptAnalysis(data.analysis);
      onPromptsGenerated(data.enhancedPrompts);
      
      toast({
        title: 'Success',
        description: `Enhanced and generated ${data.enhancedPrompts.length} AI-optimized prompts`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enhance prompts with AI',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
    }
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
          {promptAnalysis && basePrompt && (
            <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Prompt Quality Score</span>
                <Badge variant={promptAnalysis.score >= 75 ? "default" : promptAnalysis.score >= 50 ? "secondary" : "destructive"}>
                  {promptAnalysis.score}%
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {Object.entries({
                  'Subject': promptAnalysis.elements.hasSubject,
                  'Context': promptAnalysis.elements.hasContext,
                  'Action': promptAnalysis.elements.hasAction,
                  'Style': promptAnalysis.elements.hasStyle,
                  'Camera': promptAnalysis.elements.hasCameraMotion,
                  'Mood': promptAnalysis.elements.hasMood,
                  'Audio': promptAnalysis.elements.hasAudio,
                  'Composition': promptAnalysis.elements.hasComposition,
                }).map(([label, has]) => (
                  <div key={label} className={`flex items-center gap-1 ${has ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {has ? <Icons.check className="h-3 w-3" /> : <Icons.x className="h-3 w-3" />}
                    {label}
                  </div>
                ))}
              </div>
              {promptAnalysis.suggestions.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Suggestions:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {promptAnalysis.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleEnhanceWithAI}
              disabled={!basePrompt.trim() || isEnhancing}
              variant="default"
            >
              {isEnhancing ? (
                <>
                  <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Icons.wand2 className="mr-2 h-4 w-4" />
                  Enhance with AI
                </>
              )}
            </Button>
            <Button
              onClick={handleGeneratePrompts}
              disabled={!basePrompt.trim() || isGenerating}
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Icons.sparkles className="mr-2 h-4 w-4" />
                  Simple Variations
                </>
              )}
            </Button>
          </div>
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