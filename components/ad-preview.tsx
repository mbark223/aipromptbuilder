'use client';

import { useState, useRef, useEffect } from 'react';
import { getPlatformById } from '@/lib/platform-configs';
import { AdContent, TextOverlay } from '@/types/platforms';
import { cn, generateId, getMediaType, hasMedia } from '@/lib/utils';
import { Plus, Type, Play, Pause } from 'lucide-react';

interface AdPreviewProps {
  platformId?: string;
  formatId?: string;
  content: AdContent;
  onContentChange: (content: AdContent) => void;
  showSafetyZones?: boolean;
  className?: string;
}

export function AdPreview({
  platformId,
  formatId,
  content,
  onContentChange,
  showSafetyZones = true,
  className
}: AdPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState<string | null>(null);
  const [previewDimensions, setPreviewDimensions] = useState({ width: 300, height: 300 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const platform = platformId ? getPlatformById(platformId) : null;
  const format = platform && formatId ? platform.formats[formatId] : null;

  // Calculate preview dimensions maintaining aspect ratio
  useEffect(() => {
    if (!format) return;

    const maxWidth = 400;
    const maxHeight = 600;
    const { width: originalWidth, height: originalHeight } = format.dimensions;
    
    const scaleX = maxWidth / originalWidth;
    const scaleY = maxHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    setPreviewDimensions({
      width: originalWidth * scale,
      height: originalHeight * scale
    });
  }, [format]);

  // Handle media rendering (images and videos)
  useEffect(() => {
    if (!hasMedia(content) || !format) return;

    const mediaType = getMediaType(content);
    const mediaFile = content.media || content.image || content.video;

    if (mediaType === 'image') {
      // Handle image rendering on canvas
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fill background with light gray
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratios
        const canvasAspect = canvas.width / canvas.height;
        const imageAspect = img.width / img.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imageAspect > canvasAspect) {
          // Image is wider than canvas - fit to width
          drawWidth = canvas.width;
          drawHeight = canvas.width / imageAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          // Image is taller than canvas - fit to height
          drawHeight = canvas.height;
          drawWidth = canvas.height * imageAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        }
        
        // Draw image maintaining aspect ratio
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      };

      if (mediaFile instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            img.src = e.target.result as string;
          }
        };
        reader.readAsDataURL(mediaFile);
      } else if (typeof mediaFile === 'string') {
        img.src = mediaFile;
      }
    } else if (mediaType === 'video' && videoRef.current) {
      // Handle video loading
      setVideoError(null);
      const video = videoRef.current;
      
      if (mediaFile instanceof File) {
        const url = URL.createObjectURL(mediaFile);
        video.src = url;
        return () => URL.revokeObjectURL(url);
      } else if (typeof mediaFile === 'string') {
        video.src = mediaFile;
      }
    }
  }, [content, previewDimensions, format]);

  // Video control handlers
  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((error) => {
        setVideoError('Failed to play video: ' + error.message);
      });
    }
  };

  const addTextOverlay = (x: number, y: number) => {
    const newOverlay: TextOverlay = {
      id: generateId(),
      text: 'Click to edit',
      x,
      y,
      fontSize: 24,
      color: '#ffffff',
      fontWeight: 'bold',
      backgroundColor: '#00000080',
      padding: 8,
      borderRadius: 4
    };

    onContentChange({
      ...content,
      textOverlays: [...content.textOverlays, newOverlay]
    });
    setSelectedOverlay(newOverlay.id);
    setIsEditingText(newOverlay.id);
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    onContentChange({
      ...content,
      textOverlays: content.textOverlays.map(overlay =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    });
  };

  const deleteTextOverlay = (id: string) => {
    onContentChange({
      ...content,
      textOverlays: content.textOverlays.filter(overlay => overlay.id !== id)
    });
    setSelectedOverlay(null);
  };

  const scale = format ? previewDimensions.width / format.dimensions.width : 1;

  if (!platform || !format) {
    return (
      <div className={cn("flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg", className)}>
        <div className="text-center">
          <Type className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Select a platform and format to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{platform.name} - {format.dimensions.name}</h3>
          <p className="text-sm text-gray-500">
            {format.dimensions.width} × {format.dimensions.height} ({format.dimensions.aspectRatio})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect) {
                addTextOverlay(
                  (rect.width / 2) / scale,
                  (rect.height / 2) / scale
                );
              }
            }}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Text</span>
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div 
          ref={containerRef}
          className="relative border border-gray-300 rounded-lg overflow-hidden"
          style={{ 
            width: previewDimensions.width, 
            height: previewDimensions.height,
            backgroundColor: '#f5f5f5'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / scale;
              const y = (e.clientY - rect.top) / scale;
              addTextOverlay(x, y);
            }
          }}
        >
        {/* Background Media */}
        {hasMedia(content) && getMediaType(content) === 'image' && (
          <canvas
            ref={canvasRef}
            width={previewDimensions.width}
            height={previewDimensions.height}
            className="absolute inset-0 w-full h-full"
          />
        )}

        {hasMedia(content) && getMediaType(content) === 'video' && (
          <>
            <video
              ref={videoRef}
              width={previewDimensions.width}
              height={previewDimensions.height}
              className="absolute inset-0 w-full h-full object-cover"
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onError={() => setVideoError('Video playback error')}
              muted
              loop
              playsInline
            />
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVideoPlayback();
                }}
                className="pointer-events-auto bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
              >
                {isVideoPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
            </div>
            {videoError && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                {videoError}
              </div>
            )}
          </>
        )}

        {/* Safety Zones */}
        {showSafetyZones && format.safetyZone && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Safe area (inner rectangle) */}
            <div 
              className="border-2 border-purple-700 border-dashed bg-purple-600/25 relative"
              style={{
                left: format.safetyZone.left * scale,
                top: format.safetyZone.top * scale,
                right: format.safetyZone.right * scale,
                bottom: format.safetyZone.bottom * scale
              }}
            >
              <div className="absolute top-1 left-1 bg-purple-700 text-white text-xs px-1 py-0.5 rounded text-[10px] font-medium">
                Safe Area
              </div>
            </div>
            
            {/* Unsafe zones (outer areas) */}
            {/* Top zone */}
            {format.safetyZone.top > 0 && (
              <div 
                className="absolute bg-red-600/35 border border-red-600/50"
                style={{
                  left: 0,
                  top: 0,
                  right: 0,
                  height: format.safetyZone.top * scale
                }}
              />
            )}
            
            {/* Bottom zone */}
            {format.safetyZone.bottom > 0 && (
              <div 
                className="absolute bg-red-600/35 border border-red-600/50"
                style={{
                  left: 0,
                  bottom: 0,
                  right: 0,
                  height: format.safetyZone.bottom * scale
                }}
              />
            )}
            
            {/* Left zone */}
            {format.safetyZone.left > 0 && (
              <div 
                className="absolute bg-red-600/35 border border-red-600/50"
                style={{
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: format.safetyZone.left * scale
                }}
              />
            )}
            
            {/* Right zone */}
            {format.safetyZone.right > 0 && (
              <div 
                className="absolute bg-red-600/35 border border-red-600/50"
                style={{
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: format.safetyZone.right * scale
                }}
              />
            )}
          </div>
        )}

        {/* Text Overlays */}
        {content.textOverlays.map(overlay => (
          <div
            key={overlay.id}
            className={cn(
              "absolute cursor-move select-none",
              selectedOverlay === overlay.id && "ring-2 ring-blue-500"
            )}
            style={{
              left: overlay.x * scale,
              top: overlay.y * scale,
              fontSize: overlay.fontSize * scale,
              color: overlay.color,
              fontWeight: overlay.fontWeight,
              backgroundColor: overlay.backgroundColor,
              padding: (overlay.padding || 0) * scale,
              borderRadius: (overlay.borderRadius || 0) * scale,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOverlay(overlay.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingText(overlay.id);
            }}
          >
            {isEditingText === overlay.id ? (
              <input
                type="text"
                value={overlay.text}
                onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                onBlur={() => setIsEditingText(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingText(null);
                  }
                }}
                className="bg-transparent border-none outline-none"
                style={{ 
                  color: overlay.color,
                  fontSize: 'inherit',
                  fontWeight: 'inherit'
                }}
                autoFocus
              />
            ) : (
              overlay.text
            )}
          </div>
        ))}

        {/* Platform Frame Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 border-4 rounded-lg"
            style={{ borderColor: platform.brandColor }}
          />
        </div>
        </div>
      </div>

      {/* Selected Overlay Controls */}
      {selectedOverlay && (
        <TextOverlayControls
          overlay={content.textOverlays.find(o => o.id === selectedOverlay)!}
          onUpdate={(updates) => updateTextOverlay(selectedOverlay, updates)}
          onDelete={() => deleteTextOverlay(selectedOverlay)}
        />
      )}
    </div>
  );
}

interface TextOverlayControlsProps {
  overlay: TextOverlay;
  onUpdate: (updates: Partial<TextOverlay>) => void;
  onDelete: () => void;
}

function TextOverlayControls({ overlay, onUpdate, onDelete }: TextOverlayControlsProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Text Properties</h4>
        <button
          onClick={onDelete}
          className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Font Size</label>
          <input
            type="range"
            min="12"
            max="72"
            value={overlay.fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{overlay.fontSize}px</span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input
            type="color"
            value={overlay.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-full h-8 rounded border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Background</label>
          <input
            type="color"
            value={overlay.backgroundColor?.replace(/80$/, '') || '#000000'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value + '80' })}
            className="w-full h-8 rounded border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Weight</label>
          <select
            value={overlay.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'bold' })}
            className="w-full p-1 border rounded"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
      </div>
    </div>
  );
} 