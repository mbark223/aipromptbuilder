'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PromptSection } from './PromptSection';
import { type Format, type ConsistencySettings } from '@/types';
import { generateOptimizedPrompt, enhancePrompt } from '@/lib/promptGenerator';
import { 
  SUBJECT_SUGGESTIONS, 
  MOTION_SUGGESTIONS, 
  TECHNICAL_SUGGESTIONS,
  ATMOSPHERE_SUGGESTIONS,
  COLOR_PALETTE_SUGGESTIONS 
} from '@/lib/bettingSuggestions';

const STYLE_SUGGESTIONS = [
  'photorealistic',
  'cinematic',
  'minimalist',
  'vibrant',
  'moody',
  'retro',
  'futuristic',
  'artistic',
  'vegas neon aesthetic',
  'luxury casino atmosphere',
  'high-stakes dramatic',
  'sports arena energy',
  'championship celebration',
  'premium betting lounge',
  'digital sports ticker',
  'golden winner glow',
  'jackpot celebration',
  'sports broadcast style',
  'casino floor excitement',
  'VIP exclusive feel',
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
  'casino floor glow',
  'slot machine lights',
  'sports stadium floodlights',
  'jackpot spotlight',
  'roulette table ambiance',
  'poker table overhead',
  'sportsbook screen glow',
  'winner celebration lights',
  'championship ceremony lighting',
  'luxury gold lighting',
  'neon casino signage',
  'dramatic win moment lighting',
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
  'betting slip close-up',
  'casino table overhead',
  'slot machine face-on',
  'sports crowd reaction',
  'winner celebration shot',
  'dealer POV',
  'player hands reveal',
  'scoreboard focus',
  'odds display zoom',
  'chip stack close-up',
  'roulette wheel spin',
  'cards dealing sequence',
];

interface PromptBuilderProps {
  format: Format | null;
  consistency?: ConsistencySettings;
}

export function PromptBuilder({ format, consistency }: PromptBuilderProps) {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<'veo' | 'flows' | 'generic'>('generic');
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
    if (!format) return '';
    
    return generateOptimizedPrompt({
      content: promptContent,
      format,
      consistency,
      platform: selectedPlatform
    });
  };

  const handleCopyPrompt = async () => {
    const prompt = generateFullPrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: "Prompt copied!",
        description: `Ready to paste into ${selectedPlatform === 'veo' ? 'Google Veo' : selectedPlatform === 'flows' ? 'Flows' : 'your platform'}`,
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try selecting and copying manually",
        variant: "destructive",
      });
    }
  };

  const getPromptSuggestions = () => {
    const currentPrompt = generateFullPrompt();
    return enhancePrompt(currentPrompt);
  };


  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Prompt Builder</h2>
          <p className="text-muted-foreground text-sm">
            Create optimized prompts for AI video generation. Fill in the sections below and generate a prompt ready to paste into Veo, Flows, or other platforms.
          </p>
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
              suggestions={SUBJECT_SUGGESTIONS.slice(0, 8)}
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
              suggestions={MOTION_SUGGESTIONS.slice(0, 8)}
            />
            
            <PromptSection
              label="Technical Specifications"
              value={promptContent.technical}
              onChange={(value) => handleSectionChange('technical', value)}
              placeholder="Include any technical requirements or specifications"
              required
              maxLength={200}
              suggestions={TECHNICAL_SUGGESTIONS.slice(0, 8)}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform">Target Platform</Label>
                <Select 
                  value={selectedPlatform} 
                  onValueChange={(value) => setSelectedPlatform(value as 'veo' | 'flows' | 'generic')}
                >
                  <SelectTrigger id="platform" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">Generic</SelectItem>
                    <SelectItem value="veo">Google Veo</SelectItem>
                    <SelectItem value="flows">Flows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Optimized Prompt</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyPrompt}
                    disabled={!generateFullPrompt()}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap font-mono">
                    {generateFullPrompt() || 'Fill in the sections to see your optimized prompt...'}
                  </p>
                </div>
              </div>

              {generateFullPrompt() && (
                <div>
                  <h4 className="font-medium mb-2">Enhancement Suggestions</h4>
                  <div className="space-y-1">
                    {getPromptSuggestions().length > 0 ? (
                      getPromptSuggestions().map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{suggestion}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Your prompt looks comprehensive!
                      </p>
                    )}
                  </div>
                </div>
              )}
              
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

              {selectedPlatform !== 'generic' && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">
                    {selectedPlatform === 'veo' ? 'Veo' : 'Flows'} Optimization Applied
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPlatform === 'veo' 
                      ? 'Optimized for photorealistic rendering and cinematic quality'
                      : 'Optimized for smooth transitions and dynamic movement'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline"
            onClick={() => {
              setPromptContent({
                subject: '',
                style: '',
                composition: '',
                lighting: '',
                motion: '',
                technical: '',
              });
              toast({
                title: "Form cleared",
                description: "Ready to create a new prompt",
              });
            }}
          >
            Clear Form
          </Button>
          <Button 
            onClick={handleCopyPrompt} 
            disabled={!format || !promptContent.subject.trim()}
          >
            Generate & Copy Prompt
          </Button>
        </div>
      </div>
    </Card>
  );
}