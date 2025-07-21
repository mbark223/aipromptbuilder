'use client';

import { useCallback, useState, useRef, DragEvent } from 'react';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StaticAsset, ANIMATION_TEMPLATES } from '@/types';

interface ImageUploaderProps {
  onFilesUploaded: (assets: StaticAsset[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function ImageUploader({ 
  onFilesUploaded, 
  maxFiles = 50,
  maxSize = 20 
}: ImageUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [errors, setErrors] = useState<string[]>([]);

  const processFile = async (file: File): Promise<StaticAsset> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const asset: StaticAsset = {
            id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            projectId: 'current-project', // This would come from context
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
            animationProfile: ANIMATION_TEMPLATES[0], // Default animation
            metadata: {
              uploaded: new Date(),
              author: 'current-user', // This would come from auth
              tags: [],
            }
          };
          resolve(asset);
        };
        img.src = e.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const acceptedFiles = Array.from(files);
    setErrors([]);
    const newUploadingFiles = new Map(uploadingFiles);
    
    // Validate files
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        setErrors(prev => [...prev, `${file.name} is too large (max ${maxSize}MB)`]);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => [...prev, `${file.name} is not an image file`]);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Set initial progress
    validFiles.forEach(file => {
      newUploadingFiles.set(file.name, 0);
    });
    setUploadingFiles(newUploadingFiles);

    // Process files
    const processedAssets: StaticAsset[] = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          const currentProgress = newMap.get(file.name) || 0;
          if (currentProgress < 90) {
            newMap.set(file.name, currentProgress + 10);
          }
          return newMap;
        });
      }, 100);

      try {
        const asset = await processFile(file);
        processedAssets.push(asset);
        
        // Complete progress
        clearInterval(progressInterval);
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.set(file.name, 100);
          return newMap;
        });

        // Remove from uploading after a delay
        setTimeout(() => {
          setUploadingFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(file.name);
            return newMap;
          });
        }, 500);
      } catch (_error) {
        clearInterval(progressInterval);
        setErrors(prev => [...prev, `Failed to process ${file.name}`]);
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(file.name);
          return newMap;
        });
      }
    }

    if (processedAssets.length > 0) {
      onFilesUploaded(processedAssets);
    }
  }, [maxSize, onFilesUploaded, uploadingFiles]);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
        `}
      >
        <input 
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/20' : 'bg-muted'}`}>
            <Icons.upload className={`h-8 w-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse (max {maxFiles} files, {maxSize}MB each)
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap justify-center">
            <Badge variant="secondary">JPG</Badge>
            <Badge variant="secondary">PNG</Badge>
            <Badge variant="secondary">WebP</Badge>
            <Badge variant="secondary">SVG</Badge>
          </div>
        </div>
      </div>

      {/* Uploading files */}
      {uploadingFiles.size > 0 && (
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-medium">Uploading...</h3>
          {Array.from(uploadingFiles.entries()).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icons.image className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-xs">{fileName}</span>
                </div>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="p-4 border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-2">
            <Icons.alertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-destructive">Upload Errors</h3>
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-destructive/80">{error}</p>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setErrors([])}
          >
            Dismiss
          </Button>
        </Card>
      )}
    </div>
  );
}