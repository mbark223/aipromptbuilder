export async function downloadVideoDirectly(videoUrl: string, filename: string): Promise<boolean> {
  try {
    // First try direct download with fetch
    const response = await fetch(videoUrl, {
      mode: 'cors',
      credentials: 'omit',
    }).catch(() => null);

    if (response && response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      return true;
    }
  } catch (error) {
    console.log('Direct download failed, trying alternative method');
  }

  // If direct download fails, try opening in new tab with download attribute
  try {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (error) {
    console.error('All download methods failed:', error);
    return false;
  }
}

export async function downloadVideoWithFallback(
  videoUrl: string,
  filename: string,
  useServerProxy: boolean = true
): Promise<{ success: boolean; error?: string }> {
  // First try direct browser download
  const directSuccess = await downloadVideoDirectly(videoUrl, filename);
  
  if (directSuccess) {
    return { success: true };
  }

  // If direct download fails and server proxy is enabled, try server route
  if (useServerProxy) {
    try {
      const downloadUrl = `/api/video-download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`;
      
      const response = await fetch(downloadUrl);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
        return { success: true };
      } else {
        const error = await response.json();
        console.error('Server download failed:', error);
        
        // Try the proxy page as last resort
        return await openVideoProxyPage(videoUrl, filename);
      }
    } catch (error) {
      console.error('Server proxy download failed:', error);
      
      // Try the proxy page as last resort
      return await openVideoProxyPage(videoUrl, filename);
    }
  }

  return { 
    success: false, 
    error: 'Unable to download video. Please try right-clicking the video and selecting "Save video as..."' 
  };
}

async function openVideoProxyPage(videoUrl: string, filename: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Open a new window with the proxy page
    const proxyResponse = await fetch('/api/video-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl, filename }),
    });
    
    if (proxyResponse.ok) {
      const html = await proxyResponse.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      window.open(url, '_blank', 'width=800,height=600');
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      return { 
        success: true, 
        error: 'Download page opened in new window. Right-click the video to save it.' 
      };
    }
  } catch (error) {
    console.error('Proxy page failed:', error);
  }
  
  return { 
    success: false, 
    error: 'All download methods failed. Please try manually downloading the video.' 
  };
}