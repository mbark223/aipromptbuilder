'use client';

// Nano-Banana AI Image Transformation Tool
import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, Download, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NanoBananaPage() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  // Feedback fields
  const [styleFeedback, setStyleFeedback] = useState('');
  const [colorsFeedback, setColorsFeedback] = useState('');
  const [compositionFeedback, setCompositionFeedback] = useState('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setUploadedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedFile || !prompt) {
      toast({
        title: 'Missing inputs',
        description: 'Please upload an image and enter a transformation prompt.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setResultImage(null);
    setImageError(false);

    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('prompt', prompt);
      formData.append('feedback', JSON.stringify({ 
        style: styleFeedback,
        colors: colorsFeedback,
        composition: compositionFeedback,
        additional: additionalFeedback
      }));

      const response = await fetch('/api/product-variations/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.imageUrl) {
        // Ensure we have a valid URL
        const imageUrl = data.imageUrl.startsWith('http') ? data.imageUrl : `https:${data.imageUrl}`;
        console.log('Setting result image:', imageUrl);
        setResultImage(imageUrl);
        toast({
          title: 'Success!',
          description: 'Your image has been transformed with Nano-Banana.',
        });
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to transform the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (resultImage) {
      try {
        // Fetch the image and create a blob
        const response = await fetch(resultImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `nano-banana-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
        // Fallback to direct link
        window.open(resultImage, '_blank');
      }
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <span>🍌</span> Nano-Banana
        </h1>
        <p className="text-muted-foreground">
          Google's latest image editing model from Gemini 2.5 - Transform your images with AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Input</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Upload Image</Label>
                <div className="mt-2">
                  {!uploadedImage ? (
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    >
                      <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WEBP up to 10MB
                      </span>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  ) : (
                    <div className="relative group">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setUploadedFile(null);
                          setResultImage(null);
                        }}
                        className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Replace
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="prompt">Transformation Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe how to transform the image... (e.g., 'make it look like a watercolor painting', 'add dramatic lighting', 'change to winter scene')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Transformation Feedback</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="style-feedback">Style Preferences</Label>
                    <Textarea
                      id="style-feedback"
                      placeholder="Describe the style you want (e.g., photorealistic, watercolor, cinematic, anime...)"
                      value={styleFeedback}
                      onChange={(e) => setStyleFeedback(e.target.value)}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="colors-feedback">Color Adjustments</Label>
                    <Textarea
                      id="colors-feedback"
                      placeholder="Specify color preferences (e.g., vibrant colors, warm tones, monochrome...)"
                      value={colorsFeedback}
                      onChange={(e) => setColorsFeedback(e.target.value)}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="composition-feedback">Composition Feedback</Label>
                    <Textarea
                      id="composition-feedback"
                      placeholder="Describe composition changes (e.g., close-up view, wide angle, bird's eye view...)"
                      value={compositionFeedback}
                      onChange={(e) => setCompositionFeedback(e.target.value)}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional-feedback">Additional Notes</Label>
                    <Textarea
                      id="additional-feedback"
                      placeholder="Any other specific requirements or details..."
                      value={additionalFeedback}
                      onChange={(e) => setAdditionalFeedback(e.target.value)}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!uploadedImage || !prompt || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transforming...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Transform Image
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Output</h2>
              {resultImage && (
                <span className="text-sm text-green-600 font-medium">Image Ready!</span>
              )}
            </div>
            
            {resultImage ? (
              <div className="space-y-4">
                <div className="relative">
                  {imageError ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-muted/10 rounded-lg border border-destructive/20">
                      <AlertCircle className="h-12 w-12 text-destructive/50 mb-3" />
                      <p className="text-sm text-muted-foreground mb-2">Failed to load image</p>
                      <p className="text-xs text-muted-foreground/70 text-center px-4">
                        The image was generated but couldn't be displayed. Try downloading it instead.
                      </p>
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <img
                        src={resultImage}
                        alt="Generated result"
                        className="w-full h-auto rounded-lg shadow-lg"
                        onError={(e) => {
                          console.error('Image failed to load:', resultImage);
                          setImageError(true);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', resultImage);
                          setImageError(false);
                        }}
                      />
                      {/* Show the URL for debugging */}
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground break-all">
                        Debug: {resultImage}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Transformed Image
                  </Button>
                  {imageError && (
                    <Button
                      onClick={() => window.open(resultImage, '_blank')}
                      className="w-full"
                      size="lg"
                      variant="secondary"
                    >
                      Open in New Tab
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/5">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
                    <span className="text-sm text-muted-foreground">Processing your image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-3" />
                    <span className="text-sm text-muted-foreground">
                      Transformed image will appear here
                    </span>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}