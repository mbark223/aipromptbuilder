'use client';

import { useState, useEffect } from 'react';
import { Video, Sparkles, Loader2, Download, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoModel, VideoModelInput, VIDEO_MODEL_CATEGORIES } from '@/types/video-models';
import { AdContent } from '@/types/platforms';

interface VideoGeneratorProps {
  content: AdContent;
  className?: string;
}

export function VideoGenerator({
  content,
  className
}: VideoGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('seedance-1-lite');
  const [prompt, setPrompt] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<VideoModel[]>([]);
  const [modelOptions, setModelOptions] = useState<VideoModelInput>({});

  // Fetch available models
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/video/generate');
      const data = await response.json();
      setModels(data.models);
    } catch (err) {
      console.error('Failed to fetch models:', err);
    }
  };

  const handleGenerateVideo = async () => {
    if (!content.media && !content.image) {
      setError('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      // Convert the image to a URL
      const imageFile = content.media || content.image;
      let imageUrl: string;
      
      if (typeof imageFile === 'string') {
        imageUrl = imageFile;
      } else if (imageFile instanceof File) {
        // Upload to Vercel Blob for a public URL
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      } else {
        throw new Error('Invalid image format');
      }

      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: selectedModel,
          imageUrl,
          prompt: prompt || content.headline || content.bodyText,
          options: modelOptions
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      // Handle different output formats from different models
      const videoUrl = Array.isArray(data.output) ? data.output[0] : data.output;
      setGeneratedVideoUrl(videoUrl);
      
    } catch (err) {
      console.error('Error generating video:', err);
      setError(err.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedModelData = models.find(m => m.id === selectedModel);


  const downloadVideo = async () => {
    if (!generatedVideoUrl) return;
    
    try {
      const response = await fetch(generatedVideoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download video:', err);
      setError('Failed to download video');
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Video Generation</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Transform your static ad into an engaging video using state-of-the-art AI models
        </p>

        {/* Model Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Video Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              setModelOptions({});
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            disabled={isGenerating}
          >
            {Object.entries(VIDEO_MODEL_CATEGORIES).map(([category, modelIds]) => (
              <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                {models
                  .filter(model => modelIds.includes(model.id as never))
                  .map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          {selectedModelData && (
            <p className="mt-1 text-xs text-gray-500">{selectedModelData.description}</p>
          )}
        </div>

        {/* Model-specific options */}
        {selectedModelData && (
          <div className="mb-4 space-y-3">
            {Object.entries(selectedModelData.inputSchema).map(([key, schema]) => {
              // Skip image and prompt fields as they're handled separately
              if (key === 'image' || key === 'input_image' || key === 'prompt') return null;
              
              if (schema.enum) {
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}
                    </label>
                    <select
                      value={modelOptions[key] || schema.default || ''}
                      onChange={(e) => setModelOptions({ ...modelOptions, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      disabled={isGenerating}
                    >
                      {schema.enum.map((value: string | number) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              
              if (schema.type === 'number') {
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}
                      {schema.min !== undefined && schema.max !== undefined && (
                        <span className="text-gray-500 text-xs ml-1">({schema.min} - {schema.max})</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={modelOptions[key] || schema.default || ''}
                      onChange={(e) => setModelOptions({ ...modelOptions, [key]: parseFloat(e.target.value) })}
                      min={schema.min}
                      max={schema.max}
                      step={schema.type === 'number' && schema.max && schema.max <= 1 ? 0.01 : 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      disabled={isGenerating}
                    />
                  </div>
                );
              }
              
              return null;
            })}
          </div>
        )}

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe the Motion
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Tell the AI how to animate your static image
          </p>
          
          {/* Animation Presets */}
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-600 mb-2">Quick Presets</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPrompt("Keep all text and logos perfectly static and in place. Add subtle ambient movement to background elements only. Preserve all brand elements exactly as they are.")}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left"
                disabled={isGenerating}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Preserve Static</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPrompt("Add gentle, subtle motion like slow zoom (1.05x max), slight parallax, or soft particle effects. Keep all text, logos, and key brand elements completely static.")}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left"
                disabled={isGenerating}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Subtle Motion</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPrompt("Make product or main subject float gently up and down in a smooth loop. Keep all text and branding elements perfectly static. Add soft shadow movement beneath floating element.")}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left"
                disabled={isGenerating}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Product Float</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPrompt("Add natural portrait movement: subtle eye blinks, slight head turn, gentle hair movement. Keep all text overlays and brand elements completely static.")}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left"
                disabled={isGenerating}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Portrait Life</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPrompt("Animate scene elements: flowing water, moving clouds, flickering lights, swaying trees. Keep all text, logos, and UI elements perfectly static and sharp.")}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left"
                disabled={isGenerating}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Dynamic Scene</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPrompt("Create smooth cinemagraph loop: isolate one repeating motion element (steam, sparkles, flames). Keep everything else including text and branding completely frozen.")}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left"
                disabled={isGenerating}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Cinemagraph</span>
              </button>
            </div>
          </div>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Or write your own animation instructions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            rows={2}
            disabled={isGenerating}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateVideo}
          disabled={isGenerating || (!content.media && !content.image)}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors",
            isGenerating || (!content.media && !content.image)
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Video...
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              Generate Video
            </>
          )}
        </button>

        {/* Generated Video Display */}
        {generatedVideoUrl && (
          <div className="mt-4 space-y-3">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={generatedVideoUrl}
                controls
                autoPlay
                loop
                className="w-full h-full"
              />
            </div>
            <button
              onClick={downloadVideo}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Video
            </button>
          </div>
        )}
      </div>

      {/* Model Information */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Premium models offer the highest quality and longest videos</p>
        <p>• Standard models provide good quality at faster generation speeds</p>
        <p>• Research models are experimental and may have usage restrictions</p>
        <p>• Video generation typically takes 1-3 minutes depending on the model</p>
      </div>
    </div>
  );
}