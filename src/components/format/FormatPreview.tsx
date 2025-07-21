'use client';

import { Format } from '@/types';

interface FormatPreviewProps {
  format: Format | null;
  className?: string;
}

export function FormatPreview({ format, className = '' }: FormatPreviewProps) {
  if (!format) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg p-8 ${className}`}>
        <p className="text-muted-foreground">Select a format to see preview</p>
      </div>
    );
  }

  const maxWidth = 400;
  const maxHeight = 400;
  
  let previewWidth = format.width;
  let previewHeight = format.height;
  
  // Scale down to fit within max dimensions while maintaining aspect ratio
  const widthScale = maxWidth / format.width;
  const heightScale = maxHeight / format.height;
  const scale = Math.min(widthScale, heightScale, 1);
  
  previewWidth = format.width * scale;
  previewHeight = format.height * scale;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div
        className="relative bg-muted rounded-lg overflow-hidden"
        style={{
          width: `${previewWidth}px`,
          height: `${previewHeight}px`,
        }}
      >
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="border border-dashed border-gray-300/50"
            />
          ))}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {format.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {format.width} × {format.height}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Aspect Ratio: {format.aspectRatio}
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-center text-muted-foreground space-y-1">
        <p>Format guidelines:</p>
        <ul className="text-xs space-y-0.5">
          {format.aspectRatio === '1:1' && (
            <>
              <li>• Perfect for Instagram posts</li>
              <li>• Center important elements</li>
            </>
          )}
          {format.aspectRatio === '9:16' && (
            <>
              <li>• Ideal for TikTok, Reels, Stories</li>
              <li>• Keep text in safe zones</li>
            </>
          )}
          {format.aspectRatio === '16:9' && (
            <>
              <li>• Standard for YouTube, landscape video</li>
              <li>• Great for detailed scenes</li>
            </>
          )}
          {format.aspectRatio === '4:5' && (
            <>
              <li>• Optimal for Instagram feed</li>
              <li>• Slightly taller than square</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}