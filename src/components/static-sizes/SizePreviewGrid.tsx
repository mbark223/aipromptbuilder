'use client';

import React, { useState } from 'react';
import { IconDownload, IconMaximize, IconX } from '@tabler/icons-react';

interface SizePreviewGridProps {
  images: Record<string, string>;
}

export function SizePreviewGrid({ images }: SizePreviewGridProps) {
  const [selectedImage, setSelectedImage] = useState<{ size: string; url: string } | null>(null);

  const handleDownload = (size: string, url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `image-${size}.png`;
    link.click();
  };

  const getSizeInfo = (sizeKey: string) => {
    // Parse size from key (e.g., "1080x1080" or "square-1080")
    const match = sizeKey.match(/(\d+)x(\d+)/);
    if (match) {
      return { width: match[1], height: match[2] };
    }
    
    // For predefined size keys, extract dimensions
    const dimensionMatch = sizeKey.match(/(\d+)$/);
    if (dimensionMatch) {
      const size = dimensionMatch[1];
      if (sizeKey.includes('square')) return { width: size, height: size };
      if (sizeKey.includes('landscape')) return { width: size, height: Math.round(parseInt(size) * 9/16) };
      if (sizeKey.includes('portrait') || sizeKey.includes('story')) return { width: size, height: Math.round(parseInt(size) * 16/9) };
    }
    
    return { width: '?', height: '?' };
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generated Sizes Preview
        </h3>
        
        <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
          {Object.entries(images).map(([size, url]) => {
            const sizeInfo = getSizeInfo(size);
            return (
              <div
                key={size}
                className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage({ size, url })}
              >
                <div className="aspect-square relative">
                  <img
                    src={url}
                    alt={`Size: ${size}`}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage({ size, url });
                      }}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      title="View full size"
                    >
                      <IconMaximize className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(size, url);
                      }}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      title="Download"
                    >
                      <IconDownload className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
                
                {/* Size info */}
                <div className="p-2 text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {sizeInfo.width} × {sizeInfo.height}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {size.replace(/-/g, ' ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(selectedImage.size, selectedImage.url);
                }}
                className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
                title="Download"
              >
                <IconDownload className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
                className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
                title="Close"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>
            
            <img
              src={selectedImage.url}
              alt={`Full size: ${selectedImage.size}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
            
            <div className="p-4 bg-gray-100 dark:bg-gray-900 text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {getSizeInfo(selectedImage.size).width} × {getSizeInfo(selectedImage.size).height}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedImage.size.replace(/-/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}