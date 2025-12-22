'use client';

import React, { useState } from 'react';
import { IconBulb, IconRefresh, IconSparkles } from '@tabler/icons-react';

interface TestPromptGeneratorProps {
  imageUrl: string;
  onPromptsGenerated: (prompts: string[]) => void;
}

export function TestPromptGenerator({ imageUrl, onPromptsGenerated }: TestPromptGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGeneratePrompts = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/static-sizes/test-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) throw new Error('Failed to generate prompts');

      const data = await response.json();
      onPromptsGenerated(data.prompts);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating test prompts:', error);
      // Fallback to default prompts if API fails
      const defaultPrompts = [
        'Add a bright summer background with beach elements',
        'Create a dark, moody atmosphere with dramatic lighting',
        'Apply a festive holiday theme with snow and decorations',
        'Use vibrant neon colors for a cyberpunk aesthetic',
        'Add subtle bokeh effect with warm golden tones',
        'Create a minimalist look with plenty of white space',
        'Apply vintage film grain and sepia tones',
        'Add dynamic motion blur for energy and movement',
        'Create a luxury feel with gold accents and elegant typography',
        'Use pastel colors for a soft, dreamy appearance'
      ];
      onPromptsGenerated(defaultPrompts.slice(0, 6));
      setHasGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IconBulb className="h-5 w-5 text-yellow-500" />
          Test Suggestions
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Generate AI-powered suggestions for testing your image across different scenarios and styles.
      </p>

      <button
        onClick={handleGeneratePrompts}
        disabled={isGenerating}
        className={`
          w-full px-4 py-3 rounded-md font-medium transition-all duration-200
          flex items-center justify-center gap-2
          ${isGenerating
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Generating Suggestions...
          </>
        ) : (
          <>
            {hasGenerated ? (
              <>
                <IconRefresh className="h-5 w-5" />
                Regenerate Suggestions
              </>
            ) : (
              <>
                <IconSparkles className="h-5 w-5" />
                Generate Test Suggestions
              </>
            )}
          </>
        )}
      </button>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Tip:</strong> These suggestions help you test how your design performs across different contexts, 
          ensuring it looks great in various scenarios.
        </p>
      </div>
    </div>
  );
}