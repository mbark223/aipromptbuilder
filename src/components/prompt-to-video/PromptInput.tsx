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
      'Cinematic style: A professional stunt driver in black leather jacket, downtown Tokyo at midnight with neon reflections, drifting through narrow streets in a sports car, camera tracking alongside the vehicle then pulling up to aerial view, screeching tires and engine roar with electronic music (no subtitles)',
      'Hyperrealistic: Athletic woman with braided hair in tactical gear, abandoned warehouse with shafts of light, performing parkour jumps across metal beams, dynamic camera following her movements with quick cuts, heavy breathing and footsteps echoing (no subtitles)',
      'Action movie style: Two martial artists in traditional robes, ancient temple courtyard at sunset, exchanging rapid kicks and punches, camera circling the fighters with slow-motion moments, combat sounds with dramatic orchestral hits (no subtitles)',
      'Documentary style: Professional race car driver in full gear, winding mountain road at dawn, navigating hairpin turns at high speed, camera mounted on car hood and aerial drone shots, engine noise and tire squeals with no music',
    ]
  },
  {
    category: 'Nature',
    templates: [
      'Timelapse style: Majestic snow-capped mountain range, alpine meadow in early morning, clouds flowing over peaks as sun rises, camera slowly pushing forward, gentle wind sounds with peaceful ambient music (no subtitles)',
      'Dramatic nature documentary: Massive ocean waves, rocky coastline during storm, waves crashing and spraying high into air, camera on cliff edge with spray hitting lens, thunderous wave crashes and howling wind (no subtitles)',
      'Ethereal style: Dense rainforest canopy, morning mist with golden sunlight, leaves gently swaying as birds fly through, camera slowly ascending through layers, bird calls and rustling leaves with mystical music (no subtitles)',
      'Magical realism: Northern lights, frozen lake in Arctic wilderness, aurora dancing and reflecting on ice surface, camera slowly rotating upward from ice to sky, crackling ice and ethereal whooshing sounds (no subtitles)',
    ]
  },
  {
    category: 'Abstract',
    templates: [
      'Macro photography style: Vibrant paint colors, white studio backdrop, liquids mixing and creating patterns, extreme close-up with probe lens movement, viscous liquid sounds with experimental electronic music (no subtitles)',
      'Digital art style: Crystalline geometric shapes, infinite black void, forms rotating and fragmenting into smaller pieces, camera moving through the shapes, digital glitch sounds and synthesizer ambience (no subtitles)',
      'Scientific visualization: Glowing particles, dark space environment, particles forming DNA helix then dispersing, camera orbiting around the formation, electronic hums and chimes (no subtitles)',
      'Psychedelic style: Kaleidoscope patterns, bright colored background, patterns morphing and pulsing to rhythm, camera zooming in and out, ambient electronic music synchronized with visuals (no subtitles)',
    ]
  },
  {
    category: 'Cinematic',
    templates: [
      'Blade Runner style: Futuristic cityscape, dawn with fog and neon lights, flying cars emerging from mist, camera rising from street level to reveal full city, ambient city sounds with synthwave music (no subtitles)',
      'Film noir style: Detective in trench coat, rain-slicked city street at night, walking under streetlights with cigarette, extreme close-up transitioning to wide shot, footsteps and rain with jazz saxophone (no subtitles)',
      'Epic landscape: Mountain valley, golden hour with mist, camera sweeping over peaks and forests, smooth drone movement from low to high altitude, wind sounds with orchestral crescendo (no subtitles)',
      'Action sequence: Building explosion, urban setting, debris flying in slow motion, camera pulling back while rotating, explosion sound followed by ringing silence then dramatic music (no subtitles)',
    ]
  },
  {
    category: 'Product & Commercial',
    templates: [
      'Luxury product shot: High-end watch, black reflective surface, watch rotating slowly with light revealing details, camera macro to full view with smooth motion, subtle mechanical sounds with elegant piano (no subtitles)',
      'Tech product reveal: Latest smartphone, minimalist white environment, device assembling itself piece by piece, camera orbiting with dynamic angles, futuristic assembly sounds with upbeat music (no subtitles)',
      'Fashion commercial: Model in flowing dress, sunset beach location, fabric billowing in wind as model walks, camera tracking alongside then pulling to wide shot, ocean waves and fabric sounds with contemporary music (no subtitles)',
      'Food commercial: Gourmet burger, dark moody background, ingredients falling and assembling in slow motion, camera rotating around subject, sizzling sounds and ingredient impacts with upbeat music (no subtitles)',
    ]
  },
  {
    category: 'Storytelling',
    templates: [
      'Short film opening: Young woman with red scarf, busy train station, looking anxiously at departure board, camera push-in from wide to close-up on eyes, station ambience with emotional piano music (no subtitles)',
      'Mystery scene: Shadow figure in fedora, foggy alleyway at night, walking slowly toward camera, low angle shot with dramatic lighting, footsteps echoing with suspenseful strings (no subtitles)',
      'Romance scene: Couple holding hands, sunset on beach, walking along water edge, camera following from behind then circling to front, ocean waves and seagulls with romantic melody (no subtitles)',
      'Adventure opening: Explorer with backpack, ancient ruins in jungle, discovering hidden entrance, camera following then revealing vast chamber, jungle sounds transitioning to echoing chamber ambience (no subtitles)',
    ]
  }
];

export function PromptInput({ onPromptsGenerated }: PromptInputProps) {
  const { toast } = useToast();
  const [basePrompt, setBasePrompt] = useState('');
  const [variations, setVariations] = useState(3);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [promptAnalysis, setPromptAnalysis] = useState<{
    score: number;
    elements: Record<string, boolean>;
    suggestions: string[];
  } | null>(null);

  const handleTemplateSelect = (template: string) => {
    setBasePrompt(template);
    setSelectedTemplate(template);
  };

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