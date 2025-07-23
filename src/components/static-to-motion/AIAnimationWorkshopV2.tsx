'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { ModelSelector } from './ModelSelector';
import { AssetGrid } from './AssetGrid';
import { FormatSelector } from './FormatSelector';
import { PreviewPanelV2 } from './PreviewPanelV2';
import { StaticAsset, AnimationModel, Format } from '@/types';

interface AIAnimationWorkshopV2Props {
  assets: StaticAsset[];
  selectedAssets: string[];
  onSelectAssets: (ids: string[]) => void;
  selectedFormats: Format[];
  onSelectFormats: (formats: Format[]) => void;
  selectedModel: AnimationModel;
  onSelectModel: (model: AnimationModel) => void;
  modelInputs: Record<string, string | number | boolean | null>;
  onModelInputsChange: (inputs: Record<string, string | number | boolean | null>) => void;
  onStartProcessing: () => void;
  onBack: () => void;
}

interface PromptSection {
  id: string;
  label: string;
  placeholder: string;
  helper: string;
  required?: boolean;
  examples: string[];
}

const PROMPT_SECTIONS: PromptSection[] = [
  {
    id: 'subject',
    label: 'Subject & Action',
    placeholder: 'Describe the main subject and what it should do',
    helper: 'Be specific about who or what is in the scene and their actions',
    required: true,
    examples: [
      'A golden retriever running through a meadow',
      'Ocean waves crashing against rocky cliffs',
      'City skyline with moving clouds and traffic'
    ]
  },
  {
    id: 'style',
    label: 'Visual Style',
    placeholder: 'Define the artistic style and mood',
    helper: 'Specify the aesthetic, mood, and visual treatment',
    required: true,
    examples: [
      'Cinematic and dramatic with warm sunset lighting',
      'Minimalist and clean with soft pastel colors',
      'Dark and moody with film noir atmosphere'
    ]
  },
  {
    id: 'camera',
    label: 'Camera Movement',
    placeholder: 'Describe how the camera should move',
    helper: 'Specify camera angles, movements, and perspectives',
    examples: [
      'Slow zoom out revealing the full landscape',
      'Smooth tracking shot following the subject',
      'Static wide shot with subtle handheld movement'
    ]
  },
  {
    id: 'details',
    label: 'Additional Details',
    placeholder: 'Add any specific details or requirements',
    helper: 'Include lighting, time of day, weather, or special effects',
    examples: [
      'Golden hour lighting with lens flares',
      'Foggy morning with soft diffused light',
      'Night scene with neon reflections on wet pavement'
    ]
  }
];

export function AIAnimationWorkshopV2({
  assets,
  selectedAssets,
  onSelectAssets,
  selectedFormats,
  onSelectFormats,
  selectedModel,
  onSelectModel,
  modelInputs,
  onModelInputsChange,
  onStartProcessing,
  onBack
}: AIAnimationWorkshopV2Props) {
  const [promptSections, setPromptSections] = useState<Record<string, string>>({
    subject: '',
    style: '',
    camera: '',
    details: ''
  });
  const [activeSection, setActiveSection] = useState<string>('subject');
  const [showPreview, setShowPreview] = useState(false);

  // Build the complete prompt from sections
  const buildCompletePrompt = useCallback(() => {
    const parts = [];
    
    if (promptSections.subject) {
      parts.push(promptSections.subject);
    }
    
    if (promptSections.style) {
      parts.push(promptSections.style);
    }
    
    if (promptSections.camera) {
      parts.push(promptSections.camera);
    }
    
    if (promptSections.details) {
      parts.push(promptSections.details);
    }
    
    return parts.join('. ');
  }, [promptSections]);

  // Update model inputs when prompt changes
  const handleSectionChange = (sectionId: string, value: string) => {
    setPromptSections(prev => ({
      ...prev,
      [sectionId]: value
    }));
    
    // Update the prompt in model inputs
    const completePrompt = buildCompletePrompt();
    onModelInputsChange({
      ...modelInputs,
      prompt: completePrompt
    });
  };

  // Handle example click
  const handleExampleClick = (sectionId: string, example: string) => {
    handleSectionChange(sectionId, example);
  };

  // Check if ready to process
  const isReadyToProcess = selectedAssets.length > 0 && 
    promptSections.subject && 
    promptSections.style &&
    selectedFormats.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icons.rotateCcw className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-semibold">AI Video Generation</h2>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Icons.target className="mr-2 h-4 w-4" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Asset Selection and Model */}
        <div className="space-y-6">
          {/* Asset Selection */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Select Images</h3>
            <AssetGrid
              assets={assets}
              selectedAssets={selectedAssets}
              onSelectAssets={onSelectAssets}
              compact
            />
          </Card>

          {/* Model Selection */}
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
          />

          {/* Format Selection */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Output Formats</h3>
            <FormatSelector
              selectedFormats={selectedFormats}
              onSelectFormats={onSelectFormats}
            />
          </Card>
        </div>

        {/* Middle Column - Prompt Builder */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Build Your Prompt</h3>
                <p className="text-sm text-muted-foreground">
                  Create a detailed prompt step by step for best results
                </p>
              </div>

              <Separator />

              {/* Prompt Sections */}
              <div className="space-y-6">
                {PROMPT_SECTIONS.map((section) => (
                  <div 
                    key={section.id}
                    className={`space-y-3 p-4 rounded-lg border-2 transition-all ${
                      activeSection === section.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent hover:border-border'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">
                          {section.label}
                          {section.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <p className="text-sm text-muted-foreground">{section.helper}</p>
                      </div>
                      {promptSections[section.id] && (
                        <Badge variant="secondary" className="ml-2">
                          <Icons.check className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>

                    <Textarea
                      value={promptSections[section.id]}
                      onChange={(e) => handleSectionChange(section.id, e.target.value)}
                      placeholder={section.placeholder}
                      className="min-h-20 resize-none"
                    />

                    {/* Examples */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Examples (click to use):</p>
                      <div className="flex flex-wrap gap-2">
                        {section.examples.map((example, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="cursor-pointer hover:bg-secondary transition-colors text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExampleClick(section.id, example);
                            }}
                          >
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Complete Prompt Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Complete Prompt</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(buildCompletePrompt());
                    }}
                  >
                    <Icons.copy className="mr-2 h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono whitespace-pre-wrap">
                    {buildCompletePrompt() || 'Your prompt will appear here as you fill in the sections above...'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {buildCompletePrompt().length} characters
                </p>
              </div>

              {/* Additional Model Inputs */}
              {selectedModel.inputs && selectedModel.inputs.length > 1 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Advanced Settings</Label>
                    {selectedModel.inputs
                      .filter(input => input.name !== 'prompt' && input.name !== 'image')
                      .map((input) => (
                        <div key={input.name} className="space-y-2">
                          <Label className="text-sm">{input.label}</Label>
                          {input.type === 'number' ? (
                            <Input
                              type="number"
                              value={modelInputs[input.name] as number || input.defaultValue || ''}
                              onChange={(e) => onModelInputsChange({
                                ...modelInputs,
                                [input.name]: parseFloat(e.target.value)
                              })}
                              min={input.min}
                              max={input.max}
                              placeholder={input.placeholder}
                            />
                          ) : input.type === 'select' && input.options ? (
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={modelInputs[input.name] as string || input.defaultValue || ''}
                              onChange={(e) => onModelInputsChange({
                                ...modelInputs,
                                [input.name]: e.target.value
                              })}
                            >
                              <option value="">Select {input.label}</option>
                              {input.options.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : input.type === 'boolean' ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={input.name}
                                checked={modelInputs[input.name] as boolean || input.defaultValue as boolean || false}
                                onChange={(e) => onModelInputsChange({
                                  ...modelInputs,
                                  [input.name]: e.target.checked
                                })}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={input.name} className="text-sm font-normal">
                                {input.placeholder || 'Enable'}
                              </Label>
                            </div>
                          ) : (
                            <Input
                              type="text"
                              value={modelInputs[input.name] as string || input.defaultValue || ''}
                              onChange={(e) => onModelInputsChange({
                                ...modelInputs,
                                [input.name]: e.target.value
                              })}
                              placeholder={input.placeholder}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  {selectedAssets.length} image{selectedAssets.length !== 1 ? 's' : ''} selected
                </div>
                <Button
                  onClick={onStartProcessing}
                  disabled={!isReadyToProcess}
                  size="lg"
                >
                  <Icons.play className="mr-2 h-4 w-4" />
                  Generate Video{selectedAssets.length > 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && selectedAssets.length > 0 && (
        <div className="mt-6">
          <PreviewPanelV2
            assets={assets.filter(a => selectedAssets.includes(a.id))}
            animationType="ai"
            model={selectedModel}
            prompt={buildCompletePrompt()}
          />
        </div>
      )}
    </div>
  );
}