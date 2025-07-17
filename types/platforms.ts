export interface PlatformDimensions {
  width: number;
  height: number;
  aspectRatio: string;
  name: string;
}

export interface SafetyZone {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PlatformConfig {
  id: string;
  name: string;
  category: 'social' | 'professional' | 'video';
  formats: {
    [key: string]: {
      dimensions: PlatformDimensions;
      safetyZone: SafetyZone;
      maxFileSize: number; // in MB
      allowedFormats: string[];
      description: string;
      textRecommendations?: {
        maxChars?: number;
        maxLines?: number;
        fontSize?: string;
      };
    };
  };
  brandColor: string;
  icon: string;
}

export interface AdContent {
  id: string;
  media?: File | string; // Unified media field for both images and videos
  mediaType?: 'image' | 'video'; // Track the type of media
  image?: File | string; // Deprecated but kept for backward compatibility
  video?: File | string; // Deprecated but kept for backward compatibility
  headline?: string;
  bodyText?: string;
  cta?: string;
  textOverlays: TextOverlay[];
  duration?: number; // Video duration in seconds
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  recommendations: string[];
}

export interface SelectedPlatform {
  platformId: string;
  formatIds: string[];
}

export type ExportFormat = 'png' | 'jpg' | 'pdf' | 'mp4' | 'mov' | 'zip'; 