'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { AnimationModel } from '@/types';
import { AnimationElement } from './AnimationElements';

interface PromptEnhancerProps {
  promptSections: Record<string, string>;
  modelInfo?: AnimationModel;
  animationElements?: AnimationElement[];
  format?: { aspectRatio: string };
  onAcceptEnhanced: (enhancedPrompt: string) => void;
}

interface EnhanceResponse {
  original: string;
  enhanced: string;
  suggestions: string[];
  qualityScore: number;
  enhancedBy: 'openai' | 'anthropic' | 'rules';
}

export function PromptEnhancer({
  promptSections,
  modelInfo,
  animationElements,
  format,
  onAcceptEnhanced
}: PromptEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState<EnhanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const handleEnhance = async () => {
    setIsEnhancing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptSections,
          modelInfo: modelInfo ? {
            name: modelInfo.name,
            capabilities: modelInfo.capabilities
          } : undefined,
          animationElements,
          format,
          useVeo3Format: modelInfo?.name?.toLowerCase().includes('veo')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const result: EnhanceResponse = await response.json();
      setEnhanceResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAccept = () => {
    if (enhanceResult) {
      onAcceptEnhanced(enhanceResult.enhanced);
      setEnhanceResult(null);
    }
  };

  const handleReject = () => {
    setEnhanceResult(null);
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  // Check if there's content to enhance
  const hasContent = Object.values(promptSections).some(section => section.trim().length > 0);

  return (
    <div className="space-y-4">
      {/* Enhance Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleEnhance}
            disabled={!hasContent || isEnhancing}
            variant="outline"
            size="sm"
          >
            {isEnhancing ? (
              <>
                <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Icons.sparkles className="mr-2 h-4 w-4" />
                Enhance with AI
              </>
            )}
          </Button>
          {enhanceResult && (
            <Badge variant="secondary" className="text-xs">
              Enhanced by {enhanceResult.enhancedBy === 'openai' ? 'GPT-4' : 
                          enhanceResult.enhancedBy === 'anthropic' ? 'Claude' : 'Rules'}
            </Badge>
          )}
        </div>
        {enhanceResult && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiff(!showDiff)}
          >
            {showDiff ? 'Hide' : 'Show'} Comparison
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <Icons.alertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhancement Result */}
      {enhanceResult && (
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Enhanced Prompt</h4>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getQualityColor(enhanceResult.qualityScore)}`}>
                  {getQualityLabel(enhanceResult.qualityScore)}
                </span>
                <Progress 
                  value={enhanceResult.qualityScore} 
                  className="w-20 h-2"
                />
              </div>
            </div>
            
            {/* Enhanced Prompt Display */}
            <div className="p-3 bg-primary/5 rounded-md">
              <p className="text-sm font-mono whitespace-pre-wrap">
                {enhanceResult.enhanced}
              </p>
            </div>

            {/* Comparison View */}
            {showDiff && (
              <div className="space-y-2 pt-2">
                <h5 className="text-sm font-medium text-muted-foreground">Original</h5>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-mono whitespace-pre-wrap text-muted-foreground">
                    {enhanceResult.original}
                  </p>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {enhanceResult.suggestions.length > 0 && (
              <div className="space-y-2 pt-2">
                <h5 className="text-sm font-medium">Suggestions for Improvement</h5>
                <ul className="space-y-1">
                  {enhanceResult.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Icons.lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
            >
              Keep Original
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAccept}
            >
              <Icons.check className="mr-2 h-4 w-4" />
              Use Enhanced Prompt
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}