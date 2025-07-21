'use client';

import { AnimationModel, ModelInput } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useState } from 'react';

interface ModelInputFieldsProps {
  model: AnimationModel;
  values: Record<string, string | number | boolean | null>;
  onChange: (values: Record<string, string | number | boolean | null>) => void;
  imageUrl?: string; // For models that support image-to-video
}

export function ModelInputFields({
  model,
  values,
  onChange,
  imageUrl
}: ModelInputFieldsProps) {
  const [_uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleInputChange = (name: string, value: string | number | boolean | null) => {
    onChange({
      ...values,
      [name]: value
    });
  };

  const handleImageUpload = (name: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      handleInputChange(name, base64);
    };
    reader.readAsDataURL(file);
  };

  const renderInput = (input: ModelInput) => {
    const value = values[input.name] ?? input.defaultValue ?? '';

    switch (input.type) {
      case 'text':
        if (input.name === 'prompt' || input.name === 'negative_prompt') {
          return (
            <Textarea
              id={input.name}
              value={String(value)}
              onChange={(e) => handleInputChange(input.name, e.target.value)}
              placeholder={input.placeholder}
              className="min-h-[100px]"
              required={input.required}
            />
          );
        }
        return (
          <Input
            id={input.name}
            type="text"
            value={String(value)}
            onChange={(e) => handleInputChange(input.name, e.target.value)}
            placeholder={input.placeholder}
            required={input.required}
          />
        );

      case 'number':
        return (
          <Input
            id={input.name}
            type="number"
            value={String(value)}
            onChange={(e) => handleInputChange(input.name, e.target.value ? Number(e.target.value) : null)}
            placeholder={input.placeholder}
            min={input.min}
            max={input.max}
            required={input.required}
          />
        );

      case 'select':
        return (
          <Select
            value={String(value)}
            onValueChange={(val) => handleInputChange(input.name, val)}
            required={input.required}
          >
            <SelectTrigger id={input.name}>
              <SelectValue placeholder={`Select ${input.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {input.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={input.name}
              checked={Boolean(value)}
              onChange={(e) => handleInputChange(input.name, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor={input.name} className="text-sm font-normal cursor-pointer">
              {input.label}
            </Label>
          </div>
        );

      case 'image':
        const shouldUseOriginalImage = input.name === 'image' || input.name === 'first_frame_image';
        const currentImage = value || (shouldUseOriginalImage && imageUrl ? imageUrl : null);

        return (
          <div className="space-y-2">
            {currentImage && (
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={String(currentImage)}
                  alt="Selected image"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setUploadedImage(null);
                    handleInputChange(input.name, null);
                  }}
                >
                  <Icons.x className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(input.name, file);
                  }}
                  className="hidden"
                />
                <Button type="button" variant="outline" className="w-full" asChild>
                  <span>
                    <Icons.upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </span>
                </Button>
              </label>
              
              {shouldUseOriginalImage && imageUrl && !value && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange(input.name, imageUrl)}
                >
                  Use Original
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!model.inputs || model.inputs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No additional inputs required for this model.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {model.inputs.map((input) => (
        <div key={input.name} className="space-y-2">
          {input.type !== 'boolean' && (
            <Label htmlFor={input.name}>
              {input.label}
              {input.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          {renderInput(input)}
        </div>
      ))}
    </div>
  );
}