import { put, del, list } from '@vercel/blob';

export interface VideoStorageResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  size: number;
}

export class VideoStorageService {
  /**
   * Upload a video from a temporary URL to permanent storage
   */
  async uploadFromUrl(
    tempUrl: string, 
    fileName: string,
    metadata?: Record<string, string>
  ): Promise<VideoStorageResult> {
    try {
      // Fetch the video from the temporary URL
      const response = await fetch(tempUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Generate a unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const uniqueFileName = `videos/${timestamp}_${fileName}`;

      // Upload to Vercel Blob
      const result = await put(uniqueFileName, blob, {
        access: 'public',
        addRandomSuffix: true,
        contentType: blob.type || 'video/mp4',
        ...(metadata && { metadata })
      });

      return {
        url: result.url,
        downloadUrl: result.downloadUrl || result.url,
        pathname: result.pathname,
        contentType: result.contentType,
        size: blob.size
      };
    } catch (error) {
      console.error('Failed to upload video to storage:', error);
      throw new Error(`Storage upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload a video from a File object
   */
  async uploadFromFile(
    file: File,
    metadata?: Record<string, string>
  ): Promise<VideoStorageResult> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const uniqueFileName = `videos/${timestamp}_${file.name}`;

      const result = await put(uniqueFileName, file, {
        access: 'public',
        addRandomSuffix: true,
        contentType: file.type || 'video/mp4',
        ...(metadata && { metadata })
      });

      return {
        url: result.url,
        downloadUrl: result.downloadUrl || result.url,
        pathname: result.pathname,
        contentType: result.contentType,
        size: file.size
      };
    } catch (error) {
      console.error('Failed to upload file to storage:', error);
      throw new Error(`Storage upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a video from storage
   */
  async deleteVideo(pathname: string): Promise<void> {
    try {
      await del(pathname);
    } catch (error) {
      console.error('Failed to delete video:', error);
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all videos in storage
   */
  async listVideos(prefix: string = 'videos/'): Promise<Array<{
    pathname: string;
    url: string;
    size: number;
    uploadedAt: Date;
  }>> {
    try {
      const { blobs } = await list({ prefix });
      return blobs.map(blob => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: new Date(blob.uploadedAt)
      }));
    } catch (error) {
      console.error('Failed to list videos:', error);
      throw new Error(`List failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Factory function
export function createVideoStorageService(): VideoStorageService {
  return new VideoStorageService();
}