'use client';

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

interface PromptQualityIndicatorProps {
  prompt: string;
  promptSections: Record<string, string>;
  showDetails?: boolean;
}

export function PromptQualityIndicator({ 
  prompt, 
  promptSections,
  showDetails = false 
}: PromptQualityIndicatorProps) {
  const analysis = useMemo(() => {
    return analyzePromptQuality(prompt, promptSections);
  }, [prompt, promptSections]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Prompt Quality</span>
          <Badge 
            variant="secondary" 
            className={`${getScoreColor(analysis.score)} font-medium`}
          >
            {getScoreLabel(analysis.score)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{analysis.score}%</span>
          <Progress value={analysis.score} className="w-24 h-2" />
        </div>
      </div>

      {showDetails && (
        <div className="space-y-2">
          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-600">Strengths</p>
              {analysis.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icons.check className="h-3 w-3 text-green-600" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          )}

          {/* Areas for Improvement */}
          {analysis.improvements.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-orange-600">Could Improve</p>
              {analysis.improvements.map((improvement, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icons.alertCircle className="h-3 w-3 text-orange-600" />
                  <span>{improvement}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {analysis.tips.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-blue-600">Quick Tips</p>
              {analysis.tips.map((tip, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icons.lightbulb className="h-3 w-3 text-blue-600" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PromptAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
}

function analyzePromptQuality(
  prompt: string, 
  sections: Record<string, string>
): PromptAnalysis {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const tips: string[] = [];

  // Check overall length
  const length = prompt.length;
  if (length >= 50 && length <= 200) {
    score += 15;
    strengths.push('Good prompt length');
  } else if (length < 50) {
    score += 5;
    improvements.push('Prompt is too short');
    tips.push('Add more descriptive details');
  } else if (length > 300) {
    score += 10;
    improvements.push('Prompt might be too long');
    tips.push('Focus on key visual elements');
  }

  // Check subject/action
  if (sections.subject && sections.subject.length > 10) {
    score += 20;
    if (sections.subject.match(/detailed|specific|clear/i)) {
      score += 5;
      strengths.push('Clear subject description');
    }
  } else {
    improvements.push('Subject needs more detail');
  }

  // Check style
  if (sections.style && sections.style.length > 5) {
    score += 15;
    strengths.push('Visual style specified');
    
    // Bonus for quality descriptors
    if (sections.style.match(/cinematic|professional|high quality|4k|8k|detailed/i)) {
      score += 5;
    }
  } else {
    improvements.push('Add visual style details');
    tips.push('Try: "cinematic", "minimalist", or "vibrant"');
  }

  // Check camera movement
  if (sections.camera && sections.camera.length > 5) {
    score += 15;
    strengths.push('Camera movement included');
  } else {
    improvements.push('Specify camera angle or movement');
    tips.push('Try: "slow zoom", "tracking shot", or "wide angle"');
  }

  // Check for lighting
  const hasLighting = prompt.match(/light|illuminat|bright|dark|shadow|glow/i);
  if (hasLighting) {
    score += 10;
    strengths.push('Lighting details present');
  } else {
    improvements.push('Add lighting information');
    tips.push('Describe the mood with lighting');
  }

  // Check for color information
  const hasColor = prompt.match(/color|hue|tone|palette|vibrant|muted|warm|cool/i);
  if (hasColor) {
    score += 10;
    strengths.push('Color information included');
  } else {
    improvements.push('Consider adding color details');
  }

  // Check for technical quality terms
  const hasTechnical = prompt.match(/resolution|quality|sharp|clear|detailed|texture/i);
  if (hasTechnical) {
    score += 10;
    strengths.push('Technical quality specified');
  }

  // Vocabulary diversity
  const words = prompt.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const diversity = uniqueWords.size / words.length;
  
  if (diversity > 0.7) {
    score += 5;
    strengths.push('Good vocabulary variety');
  } else if (diversity < 0.5) {
    improvements.push('Avoid repetitive words');
  }

  // Cap the score at 100
  score = Math.min(score, 100);

  return {
    score,
    strengths,
    improvements,
    tips
  };
}