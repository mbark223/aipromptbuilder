'use client';

import { useState, useCallback } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductSet, PRESET_VARIATIONS } from '@/types/product-sets';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Plus, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VariationGenerator } from './VariationGenerator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductSetBuilderProps {
  onProductSetCreated: (productSet: ProductSet) => void;
}

interface SelectedVariation {
  type: 'backgrounds' | 'angles' | 'seasonal' | 'custom';
  preset?: typeof PRESET_VARIATIONS.backgrounds[0] | typeof PRESET_VARIATIONS.angles[0] | typeof PRESET_VARIATIONS.seasonal[0];
  name: string;
  prompt?: string;
}

export function ProductSetBuilder({ onProductSetCreated }: ProductSetBuilderProps) {
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [baseImageUrl, setBaseImageUrl] = useState<string>('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVariations, setSelectedVariations] = useState<SelectedVariation[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = useCallback((files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setBaseImage(file);
      const url = URL.createObjectURL(file);
      setBaseImageUrl(url);
    }
  }, []);

  const togglePresetVariation = (
    type: 'backgrounds' | 'angles' | 'seasonal',
    preset: any,
    name: string
  ) => {
    setSelectedVariations(prev => {
      const exists = prev.find(v => v.type === type && v.name === name);
      if (exists) {
        return prev.filter(v => !(v.type === type && v.name === name));
      }
      return [...prev, { type, preset, name }];
    });
  };

  const addCustomVariation = () => {
    if (customPrompt.trim()) {
      setSelectedVariations(prev => [
        ...prev,
        { type: 'custom', name: `Custom: ${customPrompt.slice(0, 30)}...`, prompt: customPrompt }
      ]);
      setCustomPrompt('');
    }
  };

  const removeVariation = (index: number) => {
    setSelectedVariations(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!baseImage || !productName || selectedVariations.length === 0) {
      return;
    }

    setIsGenerating(true);
    
    const newProductSet: ProductSet = {
      id: Date.now().toString(),
      name: productName,
      description,
      baseImage: {
        url: baseImageUrl,
        filename: baseImage.name,
        uploadedAt: new Date(),
      },
      variations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onProductSetCreated(newProductSet);
  };

  const isVariationSelected = (type: string, name: string) => {
    return selectedVariations.some(v => v.type === type && v.name === name);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this product set"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label>Base Product Image</Label>
            <div className="mt-1">
              <ImageUploader
                onImagesSelected={handleImageUpload}
                maxFiles={1}
                acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
              />
              {baseImageUrl && (
                <div className="mt-4 relative">
                  <img
                    src={baseImageUrl}
                    alt="Base product"
                    className="w-full max-w-xs rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Variations</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Backgrounds</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_VARIATIONS.backgrounds.map((bg) => (
                    <Button
                      key={bg.name}
                      variant={isVariationSelected('backgrounds', bg.name) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => togglePresetVariation('backgrounds', bg, bg.name)}
                      className="justify-start"
                    >
                      {isVariationSelected('backgrounds', bg.name) && (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      {bg.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Angles</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_VARIATIONS.angles.map((angle) => (
                    <Button
                      key={angle.name}
                      variant={isVariationSelected('angles', angle.name) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => togglePresetVariation('angles', angle, angle.name)}
                      className="justify-start"
                    >
                      {isVariationSelected('angles', angle.name) && (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      {angle.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Seasonal</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_VARIATIONS.seasonal.map((season) => (
                    <Button
                      key={season.name}
                      variant={isVariationSelected('seasonal', season.name) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => togglePresetVariation('seasonal', season, season.name)}
                      className="justify-start"
                    >
                      {isVariationSelected('seasonal', season.name) && (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      {season.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Custom Variation</h4>
                <div className="flex gap-2">
                  <Input
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., Product on marble surface with plants"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomVariation()}
                  />
                  <Button
                    size="icon"
                    onClick={addCustomVariation}
                    disabled={!customPrompt.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {selectedVariations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Selected Variations ({selectedVariations.length})</h4>
              <div className="space-y-2">
                {selectedVariations.map((variation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                  >
                    <span className="truncate flex-1">{variation.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-6 h-6 ml-2"
                      onClick={() => removeVariation(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          disabled={!baseImage || !productName || selectedVariations.length === 0 || isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <>Processing...</>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate {selectedVariations.length} Variations
            </>
          )}
        </Button>
      </div>

      {isGenerating && baseImage && (
        <VariationGenerator
          productSet={{
            id: Date.now().toString(),
            name: productName,
            description,
            baseImage: {
              url: baseImageUrl,
              filename: baseImage.name,
              uploadedAt: new Date(),
            },
            variations: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
          selectedVariations={selectedVariations}
          baseImageFile={baseImage}
          onComplete={() => setIsGenerating(false)}
        />
      )}
    </div>
  );
}