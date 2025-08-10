// Utility functions for handling video blob URLs and downloads

export async function downloadVideoFromBlob(
  blobUrl: string,
  filename: string
): Promise<boolean> {
  try {
    // Fetch the blob from the blob URL
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    return true;
  } catch (error) {
    console.error('Failed to download video from blob:', error);
    return false;
  }
}

export async function getBlobFromUrl(blobUrl: string): Promise<Blob | null> {
  try {
    const response = await fetch(blobUrl);
    return await response.blob();
  } catch (error) {
    console.error('Failed to get blob from URL:', error);
    return null;
  }
}

export function isBlobUrl(url: string): boolean {
  return url.startsWith('blob:');
}

export async function convertBlobUrlToFile(
  blobUrl: string,
  filename: string
): Promise<File | null> {
  try {
    const blob = await getBlobFromUrl(blobUrl);
    if (!blob) return null;
    
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error('Failed to convert blob URL to file:', error);
    return null;
  }
}