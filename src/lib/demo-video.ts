// Demo video URL for testing when Replicate API is not configured
export const DEMO_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export function getDemoVideoUrl(id: string, format: string): string {
  // Return a real video URL for testing
  // In production, this would be replaced with actual generated video URLs
  return DEMO_VIDEO_URL;
}