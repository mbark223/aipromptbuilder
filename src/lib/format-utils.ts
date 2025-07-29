import { Format } from '@/types';

/**
 * Convert width and height to aspect ratio string (e.g., 1080x1080 → '1:1')
 */
export function formatToAspectRatio(format: Format): string {
  const { width, height } = format;
  
  // Common aspect ratios
  if (width === height) return '1:1';
  if (width === 1920 && height === 1080) return '16:9';
  if (width === 1080 && height === 1920) return '9:16';
  if (width === 864 && height === 1080) return '4:5';
  if (width === 1080 && height === 1350) return '4:5';
  if (width === 1280 && height === 720) return '16:9';
  if (width === 854 && height === 480) return '16:9'; // Standard 480p widescreen
  if (width === 640 && height === 480) return '4:3';
  
  // Calculate and simplify the ratio
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  const w = width / divisor;
  const h = height / divisor;
  
  return `${w}:${h}`;
}

/**
 * Convert height to resolution string (e.g., 1080 → '1080p', 720 → '720p')
 */
export function formatToResolution(format: Format): string {
  const { height } = format;
  
  // Map common heights to resolution strings
  if (height >= 2160) return '4K';
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  
  // For non-standard heights, use the height value
  return `${height}p`;
}

/**
 * Get the primary dimension for a format (used for square or portrait formats)
 */
export function getPrimaryDimension(format: Format): number {
  return Math.max(format.width, format.height);
}

/**
 * Map format to model-specific input parameters
 */
export function formatToModelInputs(format: Format): {
  aspect_ratio?: string;
  resolution?: string;
} {
  return {
    aspect_ratio: formatToAspectRatio(format),
    resolution: formatToResolution(format)
  };
}