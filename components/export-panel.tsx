'use client';

import { useState, useEffect } from 'react';
import { Download, Image as ImageIcon, FileText, Package, Video } from 'lucide-react';
import { AdContent, ExportFormat } from '@/types/platforms';
import { getPlatformById } from '@/lib/platform-configs';
import { cn, downloadFile, getMediaType, hasMedia } from '@/lib/utils';

interface ExportPanelProps {
  content: AdContent;
  platformId?: string;
  formatId?: string;
  allCombinations?: Array<{ platformId: string; formatId: string }>;
  adName?: string;
  className?: string;
}

export function ExportPanel({
  content,
  platformId,
  formatId,
  allCombinations,
  adName,
  className
}: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>(['png']);

  // Update selected formats when content type changes
  useEffect(() => {
    const mediaType = getMediaType(content);
    if (mediaType === 'video') {
      setSelectedFormats(['mp4']); // Default to original video for video content
    } else if (mediaType === 'image') {
      setSelectedFormats(['png']); // Default to PNG for image content
    }
  }, [content]);

  const platform = platformId ? getPlatformById(platformId) : null;
  const format = platform && formatId ? platform.formats[formatId] : null;

  // Check if we have multiple combinations for batch export
  const hasBatchMode = allCombinations && allCombinations.length > 1;

  // Generate filename based on adName or fallback to platform/format
  const generateFilename = (extension: string, suffix?: string) => {
    if (adName && adName.trim()) {
      return `${adName.trim()}${suffix || ''}.${extension}`;
    }
    
    // Fallback to original naming if no adName provided
    const platformName = platform?.name.toLowerCase() || 'ad';
    const formatName = formatId || 'format';
    return `${platformName}_${formatName}_ad${suffix || ''}.${extension}`;
  };

  // Generate filename for specific platform/format combination (used in batch export)
  const generateFilenameForCombination = (platformId: string, formatId: string, extension: string, suffix?: string) => {
    if (adName && adName.trim()) {
      return `${adName.trim()}${suffix || ''}.${extension}`;
    }
    
    // Fallback to platform/format naming
    const platform = getPlatformById(platformId);
    const platformName = platform?.name.toLowerCase() || 'ad';
    return `${platformName}_${formatId}_ad${suffix || ''}.${extension}`;
  };

  const mediaType = getMediaType(content);
  
  const exportFormats: { id: ExportFormat; name: string; description: string; icon: React.ReactNode }[] = [
    // Always show image formats (for images or video thumbnails)
    {
      id: 'png' as ExportFormat,
      name: 'PNG',
      description: mediaType === 'video' ? 'Video thumbnail (high quality)' : 'High quality with transparency',
      icon: <ImageIcon className="w-4 h-4" />
    },
    {
      id: 'jpg' as ExportFormat,
      name: 'JPEG',
      description: mediaType === 'video' ? 'Video thumbnail (smaller size)' : 'Smaller file size, good for web',
      icon: <ImageIcon className="w-4 h-4" />
    },
    ...(mediaType === 'image' ? [
      {
        id: 'pdf' as ExportFormat,
        name: 'PDF',
        description: 'Vector format for print',
        icon: <FileText className="w-4 h-4" />
      }
    ] : []),
    // Show video formats when video content is detected
    ...(mediaType === 'video' ? [
      {
        id: 'mp4' as ExportFormat,
        name: 'MP4',
        description: 'Original video file',
        icon: <Video className="w-4 h-4" />
      },
      {
        id: 'mov' as ExportFormat,
        name: 'MOV',
        description: 'QuickTime video format',
        icon: <Video className="w-4 h-4" />
      }
    ] : []),
    {
      id: 'zip',
      name: 'ZIP Package',
      description: 'All selected formats in one file',
      icon: <Package className="w-4 h-4" />
    }
  ];

  const generateVideoThumbnail = async (outputFormat: ExportFormat): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx || !format) {
        reject(new Error('Canvas not supported or format missing'));
        return;
      }

      canvas.width = format.dimensions.width;
      canvas.height = format.dimensions.height;

      const mediaFile = content.media || content.video;
      if (!mediaFile) {
        reject(new Error('No video file available'));
        return;
      }

      video.onloadedmetadata = () => {
        // Seek to 1 second or 10% through the video
        video.currentTime = Math.min(1, video.duration * 0.1);
      };

      video.onseeked = () => {
        // Draw video frame to canvas
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratio fitting
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (videoAspect > canvasAspect) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / videoAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          drawHeight = canvas.height;
          drawWidth = canvas.height * videoAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

        // Add text overlays
        content.textOverlays.forEach(overlay => {
          ctx.save();
          ctx.font = `${overlay.fontWeight} ${overlay.fontSize}px Arial`;
          ctx.fillStyle = overlay.color;
          
          if (overlay.backgroundColor) {
            const metrics = ctx.measureText(overlay.text);
            const textHeight = overlay.fontSize;
            const padding = overlay.padding || 0;
            
            ctx.fillStyle = overlay.backgroundColor;
            ctx.fillRect(
              overlay.x - padding,
              overlay.y - padding,
              metrics.width + (padding * 2),
              textHeight + (padding * 2)
            );
          }
          
          ctx.fillStyle = overlay.color;
          ctx.fillText(overlay.text, overlay.x, overlay.y);
          ctx.restore();
        });

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, outputFormat === 'jpg' ? 'image/jpeg' : 'image/png', 0.9);
      };

      video.onerror = () => reject(new Error('Failed to load video'));

      if (mediaFile instanceof File) {
        video.src = URL.createObjectURL(mediaFile);
      } else if (typeof mediaFile === 'string') {
        video.src = mediaFile;
      }
    });
  };

  const generateImage = async (outputFormat: ExportFormat): Promise<Blob> => {
    if (!format || !hasMedia(content)) {
      throw new Error('No content to export');
    }

    const mediaType = getMediaType(content);
    const mediaFile = content.media || content.image || content.video;

    // For video content, we can only export thumbnails as images
    if (mediaType === 'video' && ['png', 'jpg', 'pdf'].includes(outputFormat)) {
      return generateVideoThumbnail(outputFormat);
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      canvas.width = format.dimensions.width;
      canvas.height = format.dimensions.height;

      // Load and draw background media
      const img = new Image();
      img.onload = () => {
        // Fill background
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratio fitting
        const imageAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imageAspect > canvasAspect) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imageAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imageAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        }
        
        // Draw image maintaining aspect ratio
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Draw text overlays
        content.textOverlays.forEach(overlay => {
          ctx.save();
          
          // Set text properties
          ctx.font = `${overlay.fontWeight} ${overlay.fontSize}px Arial`;
          ctx.fillStyle = overlay.color;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          // Draw background if specified
          if (overlay.backgroundColor) {
            const metrics = ctx.measureText(overlay.text);
            const textHeight = overlay.fontSize;
            const padding = overlay.padding || 0;
            
            ctx.fillStyle = overlay.backgroundColor;
            ctx.fillRect(
              overlay.x - padding,
              overlay.y - padding,
              metrics.width + (padding * 2),
              textHeight + (padding * 2)
            );
          }

          // Draw text
          ctx.fillStyle = overlay.color;
          ctx.fillText(overlay.text, overlay.x, overlay.y);
          
          ctx.restore();
        });

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate image'));
          }
        }, outputFormat === 'jpg' ? 'image/jpeg' : 'image/png', 0.9);
      };

      img.onerror = () => reject(new Error('Failed to load media'));

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
    });
  };

  const exportVideo = async (outputFormat: ExportFormat): Promise<Blob> => {
    const mediaFile = content.media || content.video;
    if (!mediaFile || !(mediaFile instanceof File)) {
      throw new Error('No video file available for export');
    }

    // For MP4/MOV formats, return the original file if it matches
    const fileExt = mediaFile.name.split('.').pop()?.toLowerCase();
    if ((outputFormat === 'mp4' && fileExt === 'mp4') || 
        (outputFormat === 'mov' && fileExt === 'mov')) {
      return mediaFile;
    }

    // For format conversion, we'd typically need a video processing library
    // For now, we'll return the original file but rename it with the requested extension
    console.warn(`Video format conversion from ${fileExt} to ${outputFormat} not fully supported. Exporting original file with ${outputFormat} extension.`);
    
    // Create a new File object with the desired extension
    const newFile = new File([mediaFile], `${mediaFile.name.split('.')[0]}.${outputFormat}`, {
      type: outputFormat === 'mp4' ? 'video/mp4' : 'video/quicktime'
    });
    
    return newFile;
  };

  const handleExport = async () => {
    if (!platform || !format || !hasMedia(content)) {
      return;
    }

    setIsExporting(true);

    try {
      if (selectedFormats.includes('zip')) {
        // Export all formats as ZIP
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();

        // Add appropriate formats based on media type and selected formats
        const formatsToInclude = selectedFormats.filter(fmt => fmt !== 'zip');
        
        for (const fmt of formatsToInclude) {
          let blob: Blob;
          if (fmt === 'mp4' || fmt === 'mov') {
            blob = await exportVideo(fmt);
          } else {
            blob = await generateImage(fmt);
          }
          const filename = generateFilename(fmt);
          zip.file(filename, blob);
        }

        if (selectedFormats.includes('pdf')) {
          // Add PDF version
          const pngBlob = await generateImage('png');
          const { default: jsPDF } = await import('jspdf');
          
          const pdf = new jsPDF({
            orientation: format.dimensions.width > format.dimensions.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [format.dimensions.width, format.dimensions.height]
          });

          const imgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(pngBlob);
          });

                    pdf.addImage(imgData, 'PNG', 0, 0, format.dimensions.width, format.dimensions.height);
          const pdfBlob = pdf.output('blob');
          zip.file(generateFilename('pdf'), pdfBlob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
                 downloadFile(zipBlob, generateFilename('zip', '_ads'));
      } else {
        // Export individual formats
        for (const fmt of selectedFormats) {
          if (fmt === 'pdf') {
            const pngBlob = await generateImage('png');
            const { default: jsPDF } = await import('jspdf');
            
            const pdf = new jsPDF({
              orientation: format.dimensions.width > format.dimensions.height ? 'landscape' : 'portrait',
              unit: 'px',
              format: [format.dimensions.width, format.dimensions.height]
            });

            const imgData = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(pngBlob);
            });

            pdf.addImage(imgData, 'PNG', 0, 0, format.dimensions.width, format.dimensions.height);
            const pdfBlob = pdf.output('blob');
            downloadFile(pdfBlob, generateFilename('pdf'));
          } else if (fmt === 'mp4' || fmt === 'mov') {
            // Handle video export
            const blob = await exportVideo(fmt);
            const filename = generateFilename(fmt);
            downloadFile(blob, filename);
          } else {
            // Handle image export
            const blob = await generateImage(fmt);
            const filename = generateFilename(fmt);
            downloadFile(blob, filename);
          }
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportBatch = async () => {
    if (!allCombinations || allCombinations.length === 0 || !hasMedia(content)) {
      return;
    }

    setIsExporting(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      for (const combination of allCombinations) {
        const platform = getPlatformById(combination.platformId);
        const format = platform?.formats[combination.formatId];
        
        if (!platform || !format) continue;

        // Create a folder for each platform/format combination
        const folderName = `${platform.name.toLowerCase()}_${combination.formatId}`;
        const folder = zip.folder(folderName);

        for (const fmt of selectedFormats) {
          if (fmt === 'zip') continue; // Skip zip in batch mode
          
          if (fmt === 'pdf') {
            const pngBlob = await generateImageForFormat(format, 'png');
            const { default: jsPDF } = await import('jspdf');
            
            const pdf = new jsPDF({
              orientation: format.dimensions.width > format.dimensions.height ? 'landscape' : 'portrait',
              unit: 'px',
              format: [format.dimensions.width, format.dimensions.height]
            });

            const imgData = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(pngBlob);
            });

            pdf.addImage(imgData, 'PNG', 0, 0, format.dimensions.width, format.dimensions.height);
            const pdfBlob = pdf.output('blob');
            folder?.file(generateFilenameForCombination(combination.platformId, combination.formatId, 'pdf'), pdfBlob);
          } else if (fmt === 'mp4' || fmt === 'mov') {
            // Handle video export in batch mode
            const blob = await exportVideo(fmt);
            folder?.file(generateFilenameForCombination(combination.platformId, combination.formatId, fmt), blob);
          } else {
            // Handle image export in batch mode
            const blob = await generateImage(fmt);
            folder?.file(generateFilenameForCombination(combination.platformId, combination.formatId, fmt), blob);
          }
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const batchFilename = adName && adName.trim() 
        ? `${adName.trim()}_batch.zip`
        : `social_media_ads_batch.zip`;
      downloadFile(zipBlob, batchFilename);
    } catch (error) {
      console.error('Batch export failed:', error);
      alert('Batch export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to generate image for any format
  const generateImageForFormat = async (targetFormat: { dimensions: { width: number; height: number } }, outputFormat: ExportFormat): Promise<Blob> => {
    if (!hasMedia(content)) {
      throw new Error('No content to export');
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      canvas.width = targetFormat.dimensions.width;
      canvas.height = targetFormat.dimensions.height;

      // Load and draw background image
      const img = new Image();
      img.onload = () => {
        // Draw background
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw text overlays
        content.textOverlays.forEach(overlay => {
          ctx.save();
          
          // Set text properties
          ctx.font = `${overlay.fontWeight} ${overlay.fontSize}px Arial`;
          ctx.fillStyle = overlay.color;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          // Draw background if specified
          if (overlay.backgroundColor) {
            const metrics = ctx.measureText(overlay.text);
            const textHeight = overlay.fontSize;
            const padding = overlay.padding || 0;
            
            ctx.fillStyle = overlay.backgroundColor;
            ctx.fillRect(
              overlay.x - padding,
              overlay.y - padding,
              metrics.width + (padding * 2),
              textHeight + (padding * 2)
            );
            
            ctx.fillStyle = overlay.color;
          }

          // Draw text
          ctx.fillText(overlay.text, overlay.x, overlay.y);
          ctx.restore();
        });

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate image'));
          }
        }, outputFormat === 'jpg' ? 'image/jpeg' : 'image/png');
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      
      const mediaFile = content.media || content.image;
      if (mediaFile instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            img.src = result;
          }
        };
        reader.readAsDataURL(mediaFile);
      } else if (typeof mediaFile === 'string') {
        img.src = mediaFile;
      }
    });
  };

  const toggleFormat = (format: ExportFormat) => {
    setSelectedFormats(prev => 
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  // Show batch mode prompt if no single selection but have batch options
  if ((!platform || !format) && !hasBatchMode) {
    return (
      <div className={cn("p-4 bg-gray-50 rounded-lg", className)}>
        <div className="text-center text-gray-500">
          <Download className="w-8 h-8 mx-auto mb-2" />
          <p>Select a platform and format to enable export</p>
        </div>
      </div>
    );
  }

  if (!hasMedia(content)) {
    return (
      <div className={cn("p-4 bg-gray-50 rounded-lg", className)}>
        <div className="text-center text-gray-500">
          <Download className="w-8 h-8 mx-auto mb-2" />
          <p>Upload media (image or video) to enable export</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Export Options</h3>
        {hasBatchMode && (
          <div className="text-xs text-gray-500">
            {allCombinations?.length} formats available
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Select Formats:</h4>
        <div className="grid grid-cols-2 gap-2">
          {exportFormats.filter(fmt => !hasBatchMode || fmt.id !== 'zip').map(fmt => (
            <button
              key={fmt.id}
              onClick={() => toggleFormat(fmt.id)}
              className={cn(
                "flex items-center space-x-2 p-3 rounded-lg border text-left transition-all",
                selectedFormats.includes(fmt.id)
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded border-2",
                selectedFormats.includes(fmt.id)
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300"
              )}>
                {selectedFormats.includes(fmt.id) && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  {fmt.icon}
                  <span className="font-medium">{fmt.name}</span>
                </div>
                <p className="text-xs text-gray-500">{fmt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {/* Single format export (current preview) */}
        {platform && format && (
          <button
            onClick={handleExport}
            disabled={isExporting || selectedFormats.length === 0}
            className={cn(
              "w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all",
              isExporting || selectedFormats.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
          >
            <Download className="w-5 h-5" />
            <span>
              {isExporting ? 'Exporting...' : `Export Current (${selectedFormats.length} format${selectedFormats.length !== 1 ? 's' : ''})`}
            </span>
          </button>
        )}

        {/* Batch export button */}
        {hasBatchMode && (
          <button
            onClick={exportBatch}
            disabled={isExporting || selectedFormats.length === 0}
            className={cn(
              "w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all border-2",
              isExporting || selectedFormats.length === 0
                ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-50 border-green-500 text-green-700 hover:bg-green-100"
            )}
          >
            <Package className="w-5 h-5" />
            <span>
              {isExporting ? 'Exporting...' : `Export All ${allCombinations?.length} Formats (ZIP)`}
            </span>
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        {hasBatchMode 
          ? "Batch export creates organized folders for each platform/format combination"
          : "Files will be downloaded to your default download folder"
        }
      </div>
    </div>
  );
} 