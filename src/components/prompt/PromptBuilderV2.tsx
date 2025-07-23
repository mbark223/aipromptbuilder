'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';

interface PromptBuilderV2Props {
  onPromptChange?: (prompt: string) => void;
  targetModel?: string;
}

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type BuildMode = 'guided' | 'template' | 'freestyle';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: ExperienceLevel;
  prompt: string;
  tags: string[];
  tips?: string[];
}

// Comprehensive prompt templates based on Veo-3 best practices
const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Perfect for displaying products with professional quality',
    category: 'Commercial',
    difficulty: 'beginner',
    prompt: 'A sleek smartphone slowly rotating on a white circular platform, soft studio lighting creating subtle reflections on the glass surface, camera smoothly orbiting around the product at eye level, minimalist white background, professional product photography style, subtle tech ambient sounds',
    tags: ['product', 'commercial', 'clean', 'professional'],
    tips: ['Keep backgrounds simple', 'Focus on one product', 'Mention specific materials like "glass" or "metal"']
  },
  {
    id: 'nature-sunrise',
    name: 'Sunrise Landscape',
    description: 'Breathtaking nature scenes with golden hour lighting',
    category: 'Nature',
    difficulty: 'beginner',
    prompt: 'A misty mountain valley at sunrise, golden sunlight breaking through clouds and illuminating the fog, camera slowly pushing forward through the mist, birds flying in the distance, cinematic nature documentary style, sounds of birds chirping and gentle wind',
    tags: ['nature', 'landscape', 'sunrise', 'cinematic'],
    tips: ['Specify time of day for best lighting', 'Include atmospheric elements like mist or fog', 'Add wildlife for more interest']
  },
  {
    id: 'urban-movement',
    name: 'City Life',
    description: 'Dynamic urban scenes with movement and energy',
    category: 'Urban',
    difficulty: 'intermediate',
    prompt: 'Busy city intersection at dusk with streams of car lights creating light trails, pedestrians crossing with umbrellas in light rain, camera positioned high looking down, neon signs reflecting on wet pavement, cyberpunk aesthetic, urban ambient sounds with distant sirens',
    tags: ['urban', 'city', 'night', 'cyberpunk'],
    tips: ['Rain adds visual interest', 'Mention specific times like "dusk" or "blue hour"', 'Include human elements for scale']
  },
  {
    id: 'food-prep',
    name: 'Cooking Scene',
    description: 'Appetizing food preparation with close-up details',
    category: 'Food',
    difficulty: 'intermediate',
    prompt: 'Chef\'s hands skillfully chopping fresh herbs on a wooden cutting board, extreme close-up shot, natural window light from the left, shallow depth of field with background kitchen blur, food photography style, sounds of knife on board and sizzling in background',
    tags: ['food', 'cooking', 'close-up', 'professional'],
    tips: ['Focus on hands and action', 'Mention specific ingredients', 'Include cooking sounds for realism']
  },
  {
    id: 'portrait-story',
    name: 'Personal Story',
    description: 'Intimate portrait with spoken narrative',
    category: 'People',
    difficulty: 'advanced',
    prompt: 'A elderly craftsman in his workshop speaking to camera: "I\'ve been making these by hand for forty years", warm afternoon light through dusty windows, medium shot with tools visible in background, documentary interview style, ambient workshop sounds (no subtitles)',
    tags: ['portrait', 'documentary', 'story', 'dialogue'],
    tips: ['Keep dialogue under 8 seconds', 'Add "(no subtitles)" if needed', 'Include character backstory']
  },
  {
    id: 'action-sports',
    name: 'Sports Action',
    description: 'High-energy sports moments with dynamic camera work',
    category: 'Sports',
    difficulty: 'advanced',
    prompt: 'Professional skateboarder performing a kickflip in slow motion at a concrete skate park, camera tracking alongside at low angle, golden hour backlighting creating rim light, high frame rate capture, sounds of wheels on concrete and crowd reactions',
    tags: ['sports', 'action', 'slow-motion', 'dynamic'],
    tips: ['Specify "slow motion" for dramatic effect', 'Use tracking shots for movement', 'Include crowd reactions']
  }
];

// Smart suggestions for each prompt component
const ELEMENT_SUGGESTIONS = {
  subject: [
    { text: 'A person', tip: 'Be specific: age, clothing, expression' },
    { text: 'An animal', tip: 'Mention species, action, environment' },
    { text: 'A landscape', tip: 'Include time of day and weather' },
    { text: 'An object', tip: 'Describe material, size, condition' },
    { text: 'A vehicle', tip: 'Specify type, color, movement' }
  ],
  action: [
    { text: 'walking slowly', tip: 'Specify pace and direction' },
    { text: 'speaking to camera', tip: 'Include what they say' },
    { text: 'performing', tip: 'Describe the specific action' },
    { text: 'interacting with', tip: 'Mention what they interact with' },
    { text: 'revealing', tip: 'Create suspense with reveals' }
  ],
  style: [
    { text: 'cinematic', tip: 'Movie-like quality' },
    { text: 'documentary', tip: 'Realistic and authentic' },
    { text: 'commercial', tip: 'Polished and professional' },
    { text: 'artistic', tip: 'Creative and stylized' },
    { text: 'photorealistic', tip: 'Highly detailed and real' }
  ],
  camera: [
    { text: 'static shot', tip: 'Camera doesn\'t move' },
    { text: 'slow push in', tip: 'Camera moves toward subject' },
    { text: 'orbit around', tip: 'Camera circles the subject' },
    { text: 'tracking shot', tip: 'Camera follows movement' },
    { text: 'drone shot', tip: 'Aerial perspective' }
  ],
  lighting: [
    { text: 'golden hour', tip: 'Warm sunrise/sunset light' },
    { text: 'soft diffused', tip: 'Even, flattering light' },
    { text: 'dramatic shadows', tip: 'High contrast lighting' },
    { text: 'neon lights', tip: 'Colorful urban lighting' },
    { text: 'natural daylight', tip: 'Realistic outdoor light' }
  ],
  audio: [
    { text: 'ambient sounds', tip: 'Background environment' },
    { text: 'dialogue:', tip: 'Follow with "quoted speech"' },
    { text: 'music:', tip: 'Describe genre and mood' },
    { text: '(no subtitles)', tip: 'Add at end for clean video' },
    { text: 'sound effects', tip: 'Specific sounds to include' }
  ]
};

export function PromptBuilderV2({ onPromptChange, targetModel = 'veo-3' }: PromptBuilderV2Props) {
  const { toast } = useToast();
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');
  const [buildMode, setBuildMode] = useState<BuildMode>('guided');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Guided mode fields
  const [guidedFields, setGuidedFields] = useState({
    subject: '',
    action: '',
    location: '',
    style: '',
    camera: '',
    lighting: '',
    audio: ''
  });

  // Freestyle mode
  const [freestylePrompt, setFreestylePrompt] = useState('');

  // Construct prompt from guided fields
  const constructGuidedPrompt = useCallback(() => {
    const parts = [];
    
    if (guidedFields.subject) {
      parts.push(guidedFields.subject);
      if (guidedFields.action) {
        parts.push(guidedFields.action);
      }
    }
    
    if (guidedFields.location) {
      parts.push(guidedFields.location);
    }
    
    if (guidedFields.camera) {
      parts.push(guidedFields.camera);
    }
    
    if (guidedFields.style) {
      parts.push(guidedFields.style + ' style');
    }
    
    if (guidedFields.lighting) {
      parts.push(guidedFields.lighting);
    }
    
    if (guidedFields.audio) {
      parts.push(guidedFields.audio);
    }
    
    return parts.join(', ');
  }, [guidedFields]);

  // Update parent when prompt changes
  useEffect(() => {
    let finalPrompt = '';
    
    if (buildMode === 'guided') {
      finalPrompt = constructGuidedPrompt();
    } else if (buildMode === 'template' && selectedTemplate) {
      const template = PROMPT_TEMPLATES.find(t => t.id === selectedTemplate);
      finalPrompt = template?.prompt || '';
    } else if (buildMode === 'freestyle') {
      finalPrompt = freestylePrompt;
    }
    
    onPromptChange?.(finalPrompt);
  }, [guidedFields, selectedTemplate, freestylePrompt, buildMode, onPromptChange, constructGuidedPrompt]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      // If in guided mode, parse template into fields
      if (buildMode === 'guided') {
        // Simple parsing - in production this would be more sophisticated
        setGuidedFields({
          subject: template.prompt.split(',')[0] || '',
          action: '',
          location: '',
          style: template.tags.includes('cinematic') ? 'cinematic' : '',
          camera: '',
          lighting: '',
          audio: template.prompt.includes('sounds') ? 'ambient sounds' : ''
        });
      }
    }
  };

  const handleSuggestionClick = (field: keyof typeof guidedFields, suggestion: string) => {
    setGuidedFields(prev => ({
      ...prev,
      [field]: prev[field] ? `${prev[field]} ${suggestion}` : suggestion
    }));
  };

  const handleCopyPrompt = () => {
    const prompt = buildMode === 'guided' 
      ? constructGuidedPrompt() 
      : buildMode === 'template' && selectedTemplate
      ? PROMPT_TEMPLATES.find(t => t.id === selectedTemplate)?.prompt || ''
      : freestylePrompt;
      
    navigator.clipboard.writeText(prompt);
    toast({
      title: 'Copied!',
      description: 'Prompt copied to clipboard'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">AI Video Prompt Builder</h2>
          <p className="text-muted-foreground mt-1">
            Create perfect prompts for {targetModel} and other video models
          </p>
        </div>
        
        <Select value={experienceLevel} onValueChange={(v) => setExperienceLevel(v as ExperienceLevel)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Build Mode Tabs */}
      <Tabs value={buildMode} onValueChange={(v) => setBuildMode(v as BuildMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guided">
            <Icons.wand2 className="mr-2 h-4 w-4" />
            Guided Builder
          </TabsTrigger>
          <TabsTrigger value="template">
            <Icons.layers className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="freestyle">
            <Icons.zap className="mr-2 h-4 w-4" />
            Freestyle
          </TabsTrigger>
        </TabsList>

        {/* Guided Builder */}
        <TabsContent value="guided" className="space-y-4 mt-6">
          {experienceLevel === 'beginner' && (
            <Alert>
              <Icons.sparkles className="h-4 w-4" />
              <AlertDescription>
                Let&apos;s build your prompt step by step! Start with describing what you want to see.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {/* Subject/What */}
            <Card className="p-4">
              <Label className="text-base font-medium">What do you want to see?</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Describe the main subject or focus of your video
              </p>
              <Textarea
                value={guidedFields.subject}
                onChange={(e) => setGuidedFields(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., A golden retriever puppy playing in a garden"
                className="min-h-20"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {ELEMENT_SUGGESTIONS.subject.map((sug, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleSuggestionClick('subject', sug.text)}
                  >
                    {sug.text}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Action/Movement */}
            <Card className="p-4">
              <Label className="text-base font-medium">What&apos;s happening?</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Describe the action or movement
              </p>
              <Textarea
                value={guidedFields.action}
                onChange={(e) => setGuidedFields(prev => ({ ...prev, action: e.target.value }))}
                placeholder="e.g., running through tall grass, chasing butterflies"
                className="min-h-16"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {ELEMENT_SUGGESTIONS.action.map((sug, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleSuggestionClick('action', sug.text)}
                  >
                    {sug.text}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Location/Setting */}
            <Card className="p-4">
              <Label className="text-base font-medium">Where is this happening?</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Describe the location or environment
              </p>
              <Textarea
                value={guidedFields.location}
                onChange={(e) => setGuidedFields(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., in a sunny backyard with flowers"
                className="min-h-16"
              />
            </Card>

            {/* Style */}
            <Card className="p-4">
              <Label className="text-base font-medium">Visual Style</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Choose the overall look and feel
              </p>
              <Textarea
                value={guidedFields.style}
                onChange={(e) => setGuidedFields(prev => ({ ...prev, style: e.target.value }))}
                placeholder="e.g., warm and playful"
                className="min-h-16"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {ELEMENT_SUGGESTIONS.style.map((sug, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleSuggestionClick('style', sug.text)}
                  >
                    {sug.text}
                  </Badge>
                ))}
              </div>
            </Card>

            {(experienceLevel === 'intermediate' || experienceLevel === 'advanced') && (
              <>
                {/* Camera Movement */}
                <Card className="p-4">
                  <Label className="text-base font-medium">Camera Movement</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    How should the camera move?
                  </p>
                  <Textarea
                    value={guidedFields.camera}
                    onChange={(e) => setGuidedFields(prev => ({ ...prev, camera: e.target.value }))}
                    placeholder="e.g., following the puppy at ground level"
                    className="min-h-16"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ELEMENT_SUGGESTIONS.camera.map((sug, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleSuggestionClick('camera', sug.text)}
                      >
                        {sug.text}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Lighting */}
                <Card className="p-4">
                  <Label className="text-base font-medium">Lighting</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Describe the lighting conditions
                  </p>
                  <Textarea
                    value={guidedFields.lighting}
                    onChange={(e) => setGuidedFields(prev => ({ ...prev, lighting: e.target.value }))}
                    placeholder="e.g., bright sunny day with dappled shade"
                    className="min-h-16"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ELEMENT_SUGGESTIONS.lighting.map((sug, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleSuggestionClick('lighting', sug.text)}
                      >
                        {sug.text}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {experienceLevel === 'advanced' && (
              /* Audio */
              <Card className="p-4">
                <Label className="text-base font-medium">Audio & Sounds</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add dialogue, music, or sound effects
                </p>
                <Textarea
                  value={guidedFields.audio}
                  onChange={(e) => setGuidedFields(prev => ({ ...prev, audio: e.target.value }))}
                  placeholder='e.g., playful barking, birds chirping, child laughing'
                  className="min-h-16"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {ELEMENT_SUGGESTIONS.audio.map((sug, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleSuggestionClick('audio', sug.text)}
                    >
                      {sug.text}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="template" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {PROMPT_TEMPLATES
              .filter(t => experienceLevel === 'advanced' || t.difficulty !== 'advanced')
              .map((template) => (
                <Card
                  key={template.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedTemplate === template.id ? 'border-primary shadow-sm' : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    {selectedTemplate === template.id && (
                      <>
                        <div className="pt-2 border-t">
                          <p className="text-sm font-mono bg-muted p-2 rounded">
                            {template.prompt}
                          </p>
                        </div>
                        {template.tips && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Tips:</p>
                            {template.tips.map((tip, i) => (
                              <p key={i} className="text-xs text-muted-foreground">
                                • {tip}
                              </p>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex flex-wrap gap-1 pt-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Freestyle */}
        <TabsContent value="freestyle" className="space-y-4 mt-6">
          <Card className="p-4">
            <Label className="text-base font-medium">Write your prompt</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Full creative control - write exactly what you want
            </p>
            <Textarea
              value={freestylePrompt}
              onChange={(e) => setFreestylePrompt(e.target.value)}
              placeholder="Describe your video in detail..."
              className="min-h-32"
            />
            
            {experienceLevel !== 'advanced' && (
              <Alert className="mt-4">
                <Icons.sparkles className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro tips:</strong> Include subject, location, camera movement, style, 
                  lighting, and audio. Be specific and descriptive!
                </AlertDescription>
              </Alert>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-medium">Generated Prompt</Label>
          <Button size="sm" variant="outline" onClick={handleCopyPrompt}>
            <Icons.copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </div>
        <div className="bg-muted p-4 rounded-md">
          <p className="font-mono text-sm whitespace-pre-wrap">
            {buildMode === 'guided' 
              ? constructGuidedPrompt() || 'Your prompt will appear here as you build it...'
              : buildMode === 'template' && selectedTemplate
              ? PROMPT_TEMPLATES.find(t => t.id === selectedTemplate)?.prompt || 'Select a template...'
              : freestylePrompt || 'Start writing your prompt...'}
          </p>
        </div>
        
        {/* Character count */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-muted-foreground">
            {(buildMode === 'guided' ? constructGuidedPrompt() : 
              buildMode === 'template' && selectedTemplate ? 
              PROMPT_TEMPLATES.find(t => t.id === selectedTemplate)?.prompt || '' :
              freestylePrompt).length} characters
          </p>
          {targetModel === 'veo-3' && (
            <p className="text-xs text-muted-foreground">
              Veo-3 supports audio descriptions!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}