'use client';

import { useState, useEffect } from 'react';
import { ProductSet, ProductVariation, VariationParameters } from '@/types/product-sets';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VariationGeneratorProps {
  productSet: ProductSet;
  selectedVariations: Array<{
    type: string;
    name: string;
    preset?: any;
    prompt?: string;
  }>;
  baseImageFile: File;
  onComplete: () => void;
}

export function VariationGenerator({
  productSet,
  selectedVariations,
  baseImageFile,
  onComplete
}: VariationGeneratorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generatedVariations, setGeneratedVariations] = useState<ProductVariation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  const generateVariation = async (variation: typeof selectedVariations[0]) => {
    try {
      const formData = new FormData();
      formData.append('image', baseImageFile);
      
      let prompt = '';
      const parameters: VariationParameters = {};

      if (variation.type === 'custom' && variation.prompt) {
        prompt = variation.prompt;
      } else if (variation.preset) {
        if (variation.type === 'backgrounds') {
          parameters.backgroundColor = variation.preset.backgroundColor;
          parameters.environment = variation.preset.environment;
          prompt = `Product photography, ${variation.preset.name.toLowerCase()}, professional lighting`;
        } else if (variation.type === 'angles') {
          parameters.angle = variation.preset.angle;
          prompt = `Product ${variation.preset.angle} view, clean background, professional photography`;
        } else if (variation.type === 'seasonal') {
          parameters.season = variation.preset.season;
          parameters.lighting = variation.preset.lighting;
          prompt = `${variation.preset.season} product photography, ${variation.preset.lighting} lighting`;
        }
      }

      formData.append('prompt', prompt);
      formData.append('parameters', JSON.stringify(parameters));

      const response = await fetch('/api/product-variations/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate variation');
      }

      const result = await response.json();

      const newVariation: ProductVariation = {
        id: Date.now().toString(),
        productSetId: productSet.id,
        name: variation.name,
        imageUrl: result.imageUrl,
        parameters,
        status: 'completed',
        createdAt: new Date(),
      };

      setGeneratedVariations(prev => [...prev, newVariation]);
      return newVariation;
    } catch (err) {
      console.error('Error generating variation:', err);
      const failedVariation: ProductVariation = {
        id: Date.now().toString(),
        productSetId: productSet.id,
        name: variation.name,
        imageUrl: '',
        parameters: {},
        status: 'failed',
        createdAt: new Date(),
      };
      setGeneratedVariations(prev => [...prev, failedVariation]);
      return failedVariation;
    }
  };

  useEffect(() => {
    const generateNext = async () => {
      if (currentIndex < selectedVariations.length) {
        await generateVariation(selectedVariations[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsGenerating(false);
        onComplete();
      }
    };

    if (isGenerating) {
      generateNext();
    }
  }, [currentIndex, isGenerating]);

  const progress = (currentIndex / selectedVariations.length) * 100;
  const successCount = generatedVariations.filter(v => v.status === 'completed').length;
  const failureCount = generatedVariations.filter(v => v.status === 'failed').length;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Generating variations...</span>
              <span>{currentIndex} / {selectedVariations.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {selectedVariations.map((variation, index) => {
              const generated = generatedVariations[index];
              const isCurrentOrPast = index < currentIndex;
              const isCurrent = index === currentIndex - 1;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                    generated?.status === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : generated?.status === 'failed'
                      ? 'bg-red-50 border-red-200'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">{variation.name}</span>
                  <div>
                    {generated?.status === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {generated?.status === 'failed' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    {isCurrent && !generated && (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isGenerating && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-green-600 font-medium">{successCount} successful</span>
                  {failureCount > 0 && (
                    <span className="text-red-600 font-medium ml-4">{failureCount} failed</span>
                  )}
                </div>
                <Button onClick={onComplete}>Done</Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}