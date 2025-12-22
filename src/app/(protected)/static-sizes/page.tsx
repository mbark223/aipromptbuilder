'use client';

import React, { useState } from 'react';
import { StaticSizesUploader } from '@/components/static-sizes/StaticSizesUploader';
import { SizeSelector } from '@/components/static-sizes/SizeSelector';
import { TestPromptGenerator } from '@/components/static-sizes/TestPromptGenerator';
import { MultiSizeEditor } from '@/components/static-sizes/MultiSizeEditor';
import { SizePreviewGrid } from '@/components/static-sizes/SizePreviewGrid';

export default function StaticSizesPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [testPrompts, setTestPrompts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setGeneratedImages({});
    setTestPrompts([]);
  };

  const handleSizeSelect = (sizes: string[]) => {
    setSelectedSizes(sizes);
  };

  const handleGenerateImages = async () => {
    if (!uploadedImage || selectedSizes.length === 0) return;

    setIsGenerating(true);
    try {
      // Client-side image resizing
      const resizedImages: Record<string, string> = {};
      
      // Predefined sizes mapping
      const PREDEFINED_SIZES: Record<string, { width: number; height: number }> = {
        'square-1080': { width: 1080, height: 1080 },
        'square-500': { width: 500, height: 500 },
        'landscape-1920': { width: 1920, height: 1080 },
        'landscape-1200': { width: 1200, height: 675 },
        'fb-link': { width: 1200, height: 630 },
        'story-1080': { width: 1080, height: 1920 },
        'portrait-1080': { width: 1080, height: 1350 },
        'pinterest': { width: 1000, height: 1500 },
        'twitter-post': { width: 1200, height: 675 },
        'linkedin': { width: 1200, height: 627 },
        'fb-cover': { width: 820, height: 312 },
      };

      for (const sizeId of selectedSizes) {
        let dimensions = PREDEFINED_SIZES[sizeId];
        
        // Handle custom sizes
        if (!dimensions && sizeId.startsWith('custom-')) {
          const match = sizeId.match(/custom-(\d+)x(\d+)/);
          if (match) {
            dimensions = { width: parseInt(match[1]), height: parseInt(match[2]) };
          }
        }
        
        if (!dimensions) continue;

        // Create canvas and resize image
        const canvas = document.createElement('canvas');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) continue;

        // Load image
        const img = new Image();
        img.src = uploadedImage;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        // Calculate aspect ratios
        const sourceAspect = img.width / img.height;
        const targetAspect = dimensions.width / dimensions.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (sourceAspect > targetAspect) {
          // Source is wider - fit height
          drawHeight = dimensions.height;
          drawWidth = drawHeight * sourceAspect;
          drawX = (dimensions.width - drawWidth) / 2;
          drawY = 0;
        } else {
          // Source is taller - fit width
          drawWidth = dimensions.width;
          drawHeight = drawWidth / sourceAspect;
          drawX = 0;
          drawY = (dimensions.height - drawHeight) / 2;
        }

        // Draw the image centered and scaled
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Convert to base64
        resizedImages[sizeId] = canvas.toDataURL('image/png');
      }

      setGeneratedImages(resizedImages);
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyEdits = async (edits: any) => {
    try {
      // Apply edits client-side
      const editedImages: Record<string, string> = {};
      
      for (const [sizeId, imageUrl] of Object.entries(generatedImages)) {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = imageUrl;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) continue;
        
        // Apply filters
        let filterString = '';
        if (edits.filter && edits.filter !== 'none') {
          switch (edits.filter) {
            case 'grayscale':
              filterString += 'grayscale(100%) ';
              break;
            case 'sepia':
              filterString += 'sepia(100%) ';
              break;
            case 'blur':
              filterString += 'blur(5px) ';
              break;
            case 'brightness':
              filterString += 'brightness(150%) ';
              break;
            case 'vintage':
              filterString += 'sepia(50%) contrast(120%) brightness(90%) ';
              break;
          }
        }
        
        // Apply adjustments
        if (edits.adjustments) {
          filterString += `brightness(${edits.adjustments.brightness}%) `;
          filterString += `contrast(${edits.adjustments.contrast}%) `;
          filterString += `saturate(${edits.adjustments.saturation}%) `;
        }
        
        ctx.filter = filterString.trim();
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Apply overlay
        if (edits.overlay && edits.overlay.opacity > 0) {
          ctx.fillStyle = edits.overlay.color;
          ctx.globalAlpha = edits.overlay.opacity;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;
        }
        
        // Apply text
        if (edits.text && edits.text.content) {
          ctx.font = `${edits.text.fontSize}px Arial`;
          ctx.fillStyle = edits.text.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            edits.text.content,
            canvas.width * (edits.text.position.x / 100),
            canvas.height * (edits.text.position.y / 100)
          );
        }
        
        editedImages[sizeId] = canvas.toDataURL('image/png');
      }
      
      setGeneratedImages(editedImages);
    } catch (error) {
      console.error('Error applying edits:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Static Sizes Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            <StaticSizesUploader 
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
            />
            
            {uploadedImage && (
              <>
                <SizeSelector
                  selectedSizes={selectedSizes}
                  onSizeSelect={handleSizeSelect}
                />
                
                <button
                  onClick={handleGenerateImages}
                  disabled={isGenerating || selectedSizes.length === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Generate All Sizes'}
                </button>

                <TestPromptGenerator
                  imageUrl={uploadedImage}
                  onPromptsGenerated={setTestPrompts}
                />
              </>
            )}
          </div>

          {/* Center Column - Editor */}
          <div className="lg:col-span-1">
            {Object.keys(generatedImages).length > 0 && (
              <MultiSizeEditor
                images={generatedImages}
                onApplyEdits={handleApplyEdits}
              />
            )}
          </div>

          {/* Right Column - Preview Grid */}
          <div className="lg:col-span-1">
            {Object.keys(generatedImages).length > 0 && (
              <SizePreviewGrid images={generatedImages} />
            )}
          </div>
        </div>

        {/* Test Prompts Section */}
        {testPrompts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Suggested Testing Scenarios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testPrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-gray-700 dark:text-gray-300">{prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}