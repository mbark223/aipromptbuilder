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
    category: 'Florida Sportsbook (40-65+)',
    templates: [
      'Florida football betting: Mature gentleman in comfortable Florida home, reviewing NFL odds on tablet with Dolphins game on TV, warm sunlight through windows, smooth UI navigation with relaxed pacing, ambient home sounds with subtle excitement, "21+ Only in FL" visible',
      'Golf betting experience: Distinguished golfer at Florida country club, checking PGA tour odds on phone at 19th hole, upscale clubhouse ambiance, elegant camera movements showing app and golf course views, gentle background conversations and golf sounds',
      'Florida sports bar scene: Group of mature friends at upscale sports bar, multiple games on screens while using betting apps, warm lighting with screen glow, natural interactions and app demonstrations, sports bar ambiance with cheering moments',
      'Retirement community game day: Active retirees in Florida community center, watching games together while placing bets on tablets, bright natural lighting, group celebrations and high-fives, community atmosphere with clear app interface demonstrations',
    ]
  },
  {
    category: 'iCasino NJ',
    templates: [
      'Atlantic City jackpot: New Jersey player at home winning online slots, Atlantic City boardwalk visible through window, slot reels aligning with massive win animation, bright game graphics with coastal ambiance, jackpot sounds and celebration, NJ DGE seal prominent',
      'Garden State blackjack: Player enjoying live dealer blackjack from NJ home, professional dealer on screen, perfect hand reveal moment, studio lighting for dealer with cozy home setting, card sounds and winning celebration, "Licensed in NJ" clearly visible',
      'Jersey Shore slots: Beach-themed slot game with boardwalk symbols, player at shore house with ocean view, bonus round activation with NJ landmarks, bright beach day lighting with colorful graphics, wave sounds and slot music, NJ gaming compliance visible',
      'Atlantic City online experience: NJ resident playing multiple casino games on tablet, AC casino partnership branding visible, switching between slots and table games, evening home ambiance with game lights, casino sounds with regulated gaming messaging',
    ]
  },
  {
    category: 'iCasino PA',
    templates: [
      'Pennsylvania slots paradise: PA-themed slot with Liberty Bell symbols, player in Philadelphia home winning big, Keystone State pride graphics, warm indoor lighting with vibrant slot animations, reel spins and celebration effects, PA Gaming Control Board seal visible',
      'Pocono poker night: Online poker game with PA player avatars, Pocono mountains visible through window, winning poker hand reveal, digital table glow with evening ambiance, card shuffling and chip sounds, PA iGaming license prominent',
      'Philly freedom spins: Historic Philadelphia themed slots, player with Independence Hall view, bonus round with fireworks animation, patriotic color scheme with warm lighting, Liberty Bell ringing sounds, state-specific responsible gaming visible',
      'Steel City casino: Pittsburgh player enjoying various iCasino games, city skyline visible, smooth transitions between games, modern apartment setting with game lighting, urban ambiance with winning moments, PA regulatory compliance shown',
    ]
  },
  {
    category: 'iCasino MI',
    templates: [
      'Great Lakes mega spins: Michigan nature-themed slots, Detroit skyline view while playing, Great Lakes symbols cascading, bright slot animations with Michigan seasonal lighting, wildlife sounds and winning music, MI Gaming Control Board compliance',
      'Motor City roulette: Live dealer roulette with Michigan player, Detroit casino partnership visible, ball landing on winning number, professional studio lights with Michigan home comfort, roulette sounds and celebration, MI regulations displayed',
      'Pure Michigan gaming: Player enjoying Michigan-themed casino games, Great Lakes scenery visible, switching between slots with local themes, natural Michigan lighting with game glow, ambient lake sounds with gaming audio, local responsible gaming resources',
      'Detroit online casino: Michigan resident winning at multiple games, automotive city energy in design, jackpot celebration moment, modern living space with dynamic lighting, winning sounds and excitement, Detroit partnership branding visible',
    ]
  },
  {
    category: 'Multi-State Promotions',
    templates: [
      'Welcome bonus reveal: New player in any legal state, bonus amount dramatically revealing on screen, account credit animation, bright inviting lighting with bonus glow effects, exciting reveal sounds with celebration music, state-specific compliance messaging',
      'Daily promotions showcase: Calendar showing different offers for each state, smooth transitions between promotions, variety of bonuses highlighted, clean modern interface with color coding, page turn sounds and highlight effects, multi-state availability shown',
      'VIP rewards presentation: High-value player receiving exclusive benefits, luxury aesthetic with state options, rewards accumulating animation, premium lighting with golden accents, sophisticated sounds and fanfare, available in NJ/PA/MI messaging',
      'Responsible gaming message: Player setting limits across platforms, clear interface demonstrations, positive responsible gaming approach, bright professional lighting, calm reassuring music, state-specific helpline numbers visible',
    ]
  },
  {
    category: 'Cross-Platform Features',
    templates: [
      'Mobile to desktop transition: Player seamlessly switching devices, same account across platforms, smooth transition effects, consistent branding and UI, device switching sounds, cross-platform availability highlighted',
      'Live betting action: Real-time odds updates during games, multiple sports with Florida focus, dynamic interface changes, sports broadcast lighting with UI glow, live update sounds and excitement, 21+ and geo-location indicators',
      'Social betting experience: Friends comparing bets remotely, chat features and leaderboards, social interaction focus, warm friendly lighting, notification sounds and social audio, community features with compliance',
      'Tutorial walkthrough: Easy onboarding for 40-65+ demographic, clear step-by-step demonstrations, simplified interface highlights, bright clear lighting for visibility, helpful guide voice with button clicks, accessibility features shown',
    ]
  }
];

export function PromptInput({ onPromptsGenerated }: PromptInputProps) {
  const { toast } = useToast();
  const [basePrompt, setBasePrompt] = useState('');
  const [variations, setVariations] = useState(1);
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