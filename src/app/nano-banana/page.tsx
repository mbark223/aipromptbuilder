'use client';

// Nano-Banana AI Image Transformation Tool
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, Download, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NanoBananaPage() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [outputFormat, setOutputFormat] = useState('jpg');
  
  // Transformation parameters
  const [style, setStyle] = useState('');
  const [lighting, setLighting] = useState('');
  const [colorGrading, setColorGrading] = useState('');
  const [atmosphere, setAtmosphere] = useState('');
  const [cameraAngle, setCameraAngle] = useState('');

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

    try {
      // Build enhanced prompt with all parameters
      let enhancedPrompt = prompt;
      if (style) enhancedPrompt += `, ${style} style`;
      if (lighting) enhancedPrompt += `, ${lighting} lighting`;
      if (colorGrading) enhancedPrompt += `, ${colorGrading} color grading`;
      if (atmosphere) enhancedPrompt += `, ${atmosphere} atmosphere`;
      if (cameraAngle) enhancedPrompt += `, ${cameraAngle} camera angle`;

      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('prompt', enhancedPrompt);
      formData.append('parameters', JSON.stringify({ 
        outputFormat,
        style,
        lighting,
        colorGrading,
        atmosphere,
        cameraAngle
      }));

      const response = await fetch('/api/product-variations/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setResultImage(data.imageUrl);
      
      toast({
        title: 'Success!',
        description: 'Your image has been transformed using Nano-Banana.',
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: 'Failed to transform the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `nano-banana-${Date.now()}.${outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <span>🍌</span> Nano-Banana
        </h1>
        <p className="text-muted-foreground">
          Google&apos;s latest AI-powered image transformation model from Gemini 2.5
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
                <h3 className="text-sm font-medium text-muted-foreground">Transformation Options</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="style">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style" className="mt-1">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="photorealistic">Photorealistic</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                        <SelectItem value="watercolor">Watercolor</SelectItem>
                        <SelectItem value="oil painting">Oil Painting</SelectItem>
                        <SelectItem value="sketch">Sketch</SelectItem>
                        <SelectItem value="3d render">3D Render</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="lighting">Lighting</Label>
                    <Select value={lighting} onValueChange={setLighting}>
                      <SelectTrigger id="lighting" className="mt-1">
                        <SelectValue placeholder="Select lighting" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="dramatic">Dramatic</SelectItem>
                        <SelectItem value="soft">Soft</SelectItem>
                        <SelectItem value="neon">Neon</SelectItem>
                        <SelectItem value="golden hour">Golden Hour</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="backlit">Backlit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color-grading">Color Grading</Label>
                    <Select value={colorGrading} onValueChange={setColorGrading}>
                      <SelectTrigger id="color-grading" className="mt-1">
                        <SelectValue placeholder="Select colors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="vibrant">Vibrant</SelectItem>
                        <SelectItem value="muted">Muted</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="cool">Cool</SelectItem>
                        <SelectItem value="monochrome">Monochrome</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                        <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="atmosphere">Atmosphere</Label>
                    <Select value={atmosphere} onValueChange={setAtmosphere}>
                      <SelectTrigger id="atmosphere" className="mt-1">
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="mysterious">Mysterious</SelectItem>
                        <SelectItem value="dreamy">Dreamy</SelectItem>
                        <SelectItem value="energetic">Energetic</SelectItem>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="whimsical">Whimsical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="camera-angle">Camera Angle</Label>
                    <Select value={cameraAngle} onValueChange={setCameraAngle}>
                      <SelectTrigger id="camera-angle" className="mt-1">
                        <SelectValue placeholder="Select angle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="eye level">Eye Level</SelectItem>
                        <SelectItem value="low angle">Low Angle</SelectItem>
                        <SelectItem value="high angle">High Angle</SelectItem>
                        <SelectItem value="bird's eye">Bird&apos;s Eye</SelectItem>
                        <SelectItem value="dutch angle">Dutch Angle</SelectItem>
                        <SelectItem value="close-up">Close-up</SelectItem>
                        <SelectItem value="wide shot">Wide Shot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="format">Output Format</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger id="format" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                      </SelectContent>
                    </Select>
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
            <h2 className="text-xl font-semibold mb-4">Output</h2>
            
            {resultImage ? (
              <div className="space-y-4">
                <img
                  src={resultImage}
                  alt="Generated result"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  onClick={handleDownload}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  Transformed image will appear here
                </span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">About Nano-Banana</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Advanced AI image transformation model</li>
              <li>• Part of Google&apos;s Gemini 2.5 family</li>
              <li>• Supports creative style transfers</li>
              <li>• Fast processing with high-quality results</li>
              <li>• $0.039 per image transformation</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}