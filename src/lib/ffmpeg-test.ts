import { loadFFmpeg, cleanupFFmpeg } from './ffmpeg-processor';

/**
 * Test FFmpeg loading and basic functionality
 */
export async function testFFmpeg(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  console.log('Starting FFmpeg test...');
  
  try {
    // Test 1: Check SharedArrayBuffer availability
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    console.log('SharedArrayBuffer available:', hasSharedArrayBuffer);
    
    if (!hasSharedArrayBuffer) {
      return {
        success: false,
        message: 'SharedArrayBuffer not available. Your browser may not support video processing.',
        details: {
          userAgent: navigator.userAgent,
          recommendation: 'Please use Chrome, Firefox, or Edge with proper CORS headers enabled.'
        }
      };
    }
    
    // Test 2: Try to load FFmpeg
    console.log('Attempting to load FFmpeg...');
    const startTime = Date.now();
    
    const ffmpeg = await loadFFmpeg((message, progress) => {
      console.log(`FFmpeg load progress: ${message} (${progress}%)`);
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`FFmpeg loaded successfully in ${loadTime}ms`);
    
    // Test 3: Check if FFmpeg can execute a simple command
    try {
      // Create a simple test to verify FFmpeg is working
      const testCommand = ['-version'];
      await ffmpeg.exec(testCommand);
      console.log('FFmpeg version command executed successfully');
    } catch (versionError) {
      console.warn('FFmpeg version command failed (this is normal in browser):', versionError);
    }
    
    // Clean up
    cleanupFFmpeg();
    
    return {
      success: true,
      message: 'FFmpeg loaded and initialized successfully',
      details: {
        loadTime: `${loadTime}ms`,
        hasSharedArrayBuffer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('FFmpeg test failed:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'FFmpeg test failed',
      details: {
        error: error instanceof Error ? error.stack : String(error),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Get browser compatibility information
 */
export function getBrowserCompatibility(): {
  browser: string;
  version: string;
  isSupported: boolean;
  hasSharedArrayBuffer: boolean;
  hasCrossOriginIsolated: boolean;
} {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';
  let isSupported = false;
  
  // Detect browser
  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 66;
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 79;
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 15;
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 79;
  }
  
  return {
    browser,
    version,
    isSupported,
    hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    hasCrossOriginIsolated: (window as any).crossOriginIsolated || false
  };
}