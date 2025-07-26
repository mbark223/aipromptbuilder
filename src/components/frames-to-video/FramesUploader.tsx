'use client';

import { useCallback, useState, useRef, DragEvent } from 'react';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StaticAsset } from '@/types';

interface FramesUploaderProps {
  onFramesUploaded: (frame1: StaticAsset, frame2: StaticAsset) => void;
}

export function FramesUploader({ onFramesUploaded }: FramesUploaderProps) {
  const [frame1, setFrame1] = useState<StaticAsset | null>(null);
  const [frame2, setFrame2] = useState<StaticAsset | null>(null);
  const [uploadingFrame, setUploadingFrame] = useState<1 | 2 | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const frame1InputRef = useRef<HTMLInputElement>(null);
  const frame2InputRef = useRef<HTMLInputElement>(null);
  const [isDragActive1, setIsDragActive1] = useState(false);
  const [isDragActive2, setIsDragActive2] = useState(false);

  const processFile = async (file: File): Promise<StaticAsset> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const asset: StaticAsset = {
            id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            projectId: 'current-project',
            originalFile: {
              url: e.target?.result as string,
              name: file.name,
              size: file.size,
              format: file.type.split('/')[1] as 'jpg' | 'png' | 'webp' | 'svg',
              dimensions: {
                width: img.width,
                height: img.height,
                aspectRatio: `${img.width}:${img.height}`
              }
            },
            processedVersions: [],
            animationProfile: {
              id: 'frame-interpolation',
              name: 'Frame Interpolation',
              type: 'preserve',
              movements: [],
              duration: 0,
              loop: false,
              transitions: {
                in: { type: 'none', duration: 0, easing: 'linear' },
                out: { type: 'none', duration: 0, easing: 'linear' }
              },
              preserveImage: true
            },
            metadata: {
              uploaded: new Date(),
              author: 'current-user',
              tags: ['frame-interpolation'],
            }
          };
          resolve(asset);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const validateFrames = (asset1: StaticAsset, asset2: StaticAsset): boolean => {
    const dims1 = asset1.originalFile.dimensions;
    const dims2 = asset2.originalFile.dimensions;
    
    if (!dims1 || !dims2) return false;
    
    return dims1.width === dims2.width && dims1.height === dims2.height;
  };

  const handleFileUpload = useCallback(async (file: File, frameNumber: 1 | 2) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setError(null);
    setUploadingFrame(frameNumber);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      const asset = await processFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (frameNumber === 1) {
        setFrame1(asset);
        if (frame2 && !validateFrames(asset, frame2)) {
          setError('Images must have the same dimensions');
          setFrame1(null);
        } else if (frame2) {
          onFramesUploaded(asset, frame2);
        }
      } else {
        setFrame2(asset);
        if (frame1 && !validateFrames(frame1, asset)) {
          setError('Images must have the same dimensions');
          setFrame2(null);
        } else if (frame1) {
          onFramesUploaded(frame1, asset);
        }
      }

      setTimeout(() => {
        setUploadingFrame(null);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError('Failed to process image');
      setUploadingFrame(null);
      setUploadProgress(0);
    }
  }, [frame1, frame2, onFramesUploaded]);

  const handleDrop = (e: DragEvent, frameNumber: 1 | 2) => {
    e.preventDefault();
    if (frameNumber === 1) setIsDragActive1(false);
    else setIsDragActive2(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file, frameNumber);
  };

  const renderFrameUploader = (frameNumber: 1 | 2) => {
    const frame = frameNumber === 1 ? frame1 : frame2;
    const inputRef = frameNumber === 1 ? frame1InputRef : frame2InputRef;
    const isDragActive = frameNumber === 1 ? isDragActive1 : isDragActive2;
    const setIsDragActive = frameNumber === 1 ? setIsDragActive1 : setIsDragActive2;

    return (
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-2">Frame {frameNumber}</h3>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
          onDrop={(e) => handleDrop(e, frameNumber)}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200 min-h-[200px] flex items-center justify-center
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${frame ? 'bg-muted/20' : ''}
          `}
        >
          <input 
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], frameNumber)}
            className="hidden"
          />
          
          {uploadingFrame === frameNumber ? (
            <div className="space-y-3">
              <Icons.loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <Progress value={uploadProgress} className="w-32" />
            </div>
          ) : frame ? (
            <div className="space-y-3">
              <img 
                src={frame.originalFile.url} 
                alt={`Frame ${frameNumber}`}
                className="max-h-32 mx-auto rounded"
              />
              <p className="text-sm text-muted-foreground">{frame.originalFile.name}</p>
              <Badge variant="secondary">
                {frame.originalFile.dimensions?.width} × {frame.originalFile.dimensions?.height}
              </Badge>
            </div>
          ) : (
            <div className="space-y-2">
              <Icons.image className={`h-8 w-8 mx-auto ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm">
                {isDragActive ? 'Drop image here' : 'Click or drag to upload'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {renderFrameUploader(1)}
        <div className="flex items-center">
          <Icons.arrowRight className="h-6 w-6 text-muted-foreground" />
        </div>
        {renderFrameUploader(2)}
      </div>

      {error && (
        <Card className="p-4 border-destructive/50 bg-destructive/10">
          <div className="flex items-center gap-2">
            <Icons.alertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </Card>
      )}

      {frame1 && frame2 && !error && (
        <Card className="p-4 bg-primary/10 border-primary/20">
          <div className="flex items-center gap-2">
            <Icons.check className="h-5 w-5 text-primary" />
            <p className="text-sm text-primary">
              Both frames uploaded successfully! Ready to configure interpolation.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}