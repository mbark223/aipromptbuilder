import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ValidationResult, AdContent } from '@/types/platforms';
import { getPlatformById } from './platform-configs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidImageType(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isValidVideoType(file: File): boolean {
  return file.type.startsWith('video/');
}

export function getMediaType(content: AdContent): 'image' | 'video' | null {
  const mediaFile = content.media || content.image || content.video;
  if (!mediaFile) return null;
  
  if (content.mediaType) return content.mediaType;
  
  if (mediaFile instanceof File) {
    if (isValidImageType(mediaFile)) return 'image';
    if (isValidVideoType(mediaFile)) return 'video';
  }
  
  if (typeof mediaFile === 'string') {
    const ext = getFileExtension(mediaFile);
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
  }
  
  return null;
}

export function hasMedia(content: AdContent): boolean {
  return !!(content.media || content.image || content.video);
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function validateAdContent(
  content: AdContent, 
  platformId: string, 
  formatId: string
): ValidationResult {
  const platform = getPlatformById(platformId);
  const format = platform?.formats[formatId];
  
  if (!platform || !format) {
    return {
      isValid: false,
      errors: ['Invalid platform or format'],
      warnings: [],
      recommendations: []
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // File size validation for unified media field
  const mediaFile = content.media || content.image || content.video;
  if (mediaFile instanceof File) {
    const fileSizeMB = mediaFile.size / (1024 * 1024);
    if (fileSizeMB > format.maxFileSize) {
      errors.push(`File size (${formatFileSize(mediaFile.size)}) exceeds maximum (${format.maxFileSize}MB)`);
    }
    
    const fileExt = getFileExtension(mediaFile.name);
    if (!format.allowedFormats.includes(fileExt)) {
      errors.push(`File format .${fileExt} not supported. Allowed formats: ${format.allowedFormats.join(', ')}`);
    }

    // Video-specific validation
    if (isValidVideoType(mediaFile)) {
      const isVideoFormat = format.allowedFormats.some(fmt => ['mp4', 'mov', 'avi', 'webm'].includes(fmt));
      if (!isVideoFormat) {
        errors.push('Video files are not supported for this format - only images allowed');
      } else {
        // Video duration validation (typical platform limits)
        if (content.duration) {
          if (platformId === 'tiktok' && content.duration > 180) {
            warnings.push('TikTok videos longer than 3 minutes may have reduced reach');
          }
          if ((platformId === 'instagram' || platformId === 'meta') && formatId === 'reels' && content.duration > 90) {
            warnings.push('Instagram/Meta Reels longer than 90 seconds may have reduced reach');
          }
          if (platformId === 'youtube' && formatId === 'shorts' && content.duration > 60) {
            errors.push('YouTube Shorts must be 60 seconds or less');
          }
        }
        
        recommendations.push('Ensure video has engaging content in the first 3 seconds to capture attention');
        recommendations.push('Add captions or subtitles for better accessibility and engagement');
      }
    }

    // Image-specific validation
    if (isValidImageType(mediaFile)) {
      const isImageFormat = format.allowedFormats.some(fmt => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fmt));
      if (!isImageFormat) {
        errors.push('Image files are not supported for this format - only videos allowed');
      }
    }
  }

  // Enhanced safety zone validation for media content
  if (hasMedia(content)) {
    // Check if it's a story/vertical format with significant safety zones
    const isVerticalFormat = format.dimensions.height > format.dimensions.width;
    const hasLargeSafetyZones = format.safetyZone.top > 200 || format.safetyZone.bottom > 200;
    
    if (isVerticalFormat && hasLargeSafetyZones) {
      errors.push('⚠️ CRITICAL: Important content (text, logos, CTAs) appears to extend into unsafe zones');
      errors.push('Platform UI elements may cover your content, making it unreadable');
      recommendations.push('Move all critical text and branding into the purple safe area');
      recommendations.push('Keep promotional text, logos, and call-to-action buttons away from top/bottom edges');
    }
    
    // Platform-specific safety warnings
    if (platformId === 'snapchat') {
      warnings.push('Snapchat overlays profile info, buttons, and navigation over your content');
      recommendations.push('Keep important elements at least 250px from top/bottom edges');
    }
    
    if (platformId === 'instagram' && formatId === 'story') {
      warnings.push('Instagram Stories overlay profile picture, action buttons, and story controls');
      recommendations.push('Ensure text is readable with potential overlay elements');
    }
  }

  // Text overlay safety zone validation
  if (content.textOverlays.length > 0) {
    const overlaysInUnsafeZone = content.textOverlays.filter(overlay => {
      const { safetyZone } = format;
      const { dimensions } = format;
      
      // Check if overlay is in unsafe zones
      const inTopZone = overlay.y < safetyZone.top;
      const inBottomZone = overlay.y > dimensions.height - safetyZone.bottom;
      const inLeftZone = overlay.x < safetyZone.left;
      const inRightZone = overlay.x > dimensions.width - safetyZone.right;
      
      return inTopZone || inBottomZone || inLeftZone || inRightZone;
    });
    
    if (overlaysInUnsafeZone.length > 0) {
      errors.push(`${overlaysInUnsafeZone.length} text overlay(s) positioned in unsafe zones - will be cut off or covered`);
      recommendations.push('Move text overlays into the purple safe area to ensure visibility');
    }
    
    // Check for overlays that are close to unsafe zones
    const overlaysNearUnsafeZone = content.textOverlays.filter(overlay => {
      const { safetyZone } = format;
      const { dimensions } = format;
      const buffer = 50; // 50px buffer
      
      const nearTopZone = overlay.y < safetyZone.top + buffer;
      const nearBottomZone = overlay.y > dimensions.height - safetyZone.bottom - buffer;
      const nearLeftZone = overlay.x < safetyZone.left + buffer;
      const nearRightZone = overlay.x > dimensions.width - safetyZone.right - buffer;
      
      return nearTopZone || nearBottomZone || nearLeftZone || nearRightZone;
    });
    
    if (overlaysNearUnsafeZone.length > 0) {
      warnings.push(`${overlaysNearUnsafeZone.length} text overlay(s) positioned close to unsafe zones - consider moving further into safe area`);
    }
  }

  // Text validation
  if (content.headline && format.textRecommendations?.maxChars) {
    if (content.headline.length > format.textRecommendations.maxChars) {
      warnings.push(`Headline too long (${content.headline.length}/${format.textRecommendations.maxChars} chars)`);
    }
  }

  // Advertising content specific validation
  if (hasMedia(content)) {
    // Check for common advertising elements that need special attention
    const isAdvertising = content.textOverlays.some(overlay => 
      overlay.text.toLowerCase().includes('deposit') ||
      overlay.text.toLowerCase().includes('bonus') ||
      overlay.text.toLowerCase().includes('$') ||
      overlay.text.toLowerCase().includes('%') ||
      overlay.text.toLowerCase().includes('offer')
    );
    
    if (isAdvertising) {
      recommendations.push('⚠️ Advertising content detected: Ensure compliance with platform advertising policies');
      recommendations.push('Legal disclaimers and terms must be clearly readable and not cut off');
      recommendations.push('Promotional text and offers must be fully visible in the safe area');
    }
  }

  // Platform-specific recommendations
  if (platformId === 'instagram' && formatId === 'story') {
    recommendations.push('Use bright, high-contrast colors for better visibility');
    recommendations.push('Keep important content in the center third of the image');
  }

  if (platformId === 'tiktok') {
    recommendations.push('Ensure text is large enough to read on mobile devices');
    recommendations.push('Consider vertical orientation for better engagement');
  }

  if (platformId === 'facebook') {
    recommendations.push('Facebook has strict advertising policies - ensure compliance');
    recommendations.push('Avoid excessive text overlay (follow 20% text rule guidelines)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations
  };
}

export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export function resizeImageToFit(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number
): { width: number; height: number; scale: number } {
  const scaleX = targetWidth / originalWidth;
  const scaleY = targetHeight / originalHeight;
  const scale = Math.min(scaleX, scaleY);
  
  return {
    width: originalWidth * scale,
    height: originalHeight * scale,
    scale
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
} 