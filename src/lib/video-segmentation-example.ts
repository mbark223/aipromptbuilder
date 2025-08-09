/**
 * Example usage of the Video Segmentation Service
 * 
 * This demonstrates how to use the service to detect and split videos
 * based on object detection (person, car, etc.)
 */

import { createVideoSegmentationService } from './video-segmentation';
import { VideoSegmentationInput } from '@/types/video-segmentation';

// Example 1: Basic usage - detect persons and cars
async function basicExample() {
  // Initialize the service
  const segmentationService = createVideoSegmentationService();

  // Define input parameters
  const input: VideoSegmentationInput = {
    videoUrl: 'https://example.com/video.mp4',
    objectQueries: ['person', 'car'], // Detect persons and cars
    splitStrategy: 'object-presence', // Split when these objects appear
    minSegmentDuration: 3, // Minimum 3 seconds per segment
    maxSegmentDuration: 10, // Maximum 10 seconds per segment
    confidenceThreshold: 0.6, // 60% confidence threshold
  };

  try {
    // Process the video
    const result = await segmentationService.detectAndSplit(input);

    // Log results
    console.log(`Generated ${result.segments.length} segments`);
    console.log(`Total duration: ${result.totalDuration} seconds`);
    console.log(`Processing time: ${result.processingTime}ms`);

    // Process each segment
    result.segments.forEach((segment, index) => {
      console.log(`\nSegment ${index + 1}:`);
      console.log(`  Start: ${segment.startTime}s`);
      console.log(`  End: ${segment.endTime}s`);
      console.log(`  Duration: ${segment.duration}s`);
      console.log(`  Objects: ${segment.detectedObjects.join(', ')}`);
      console.log(`  Tracks: ${segment.tracks.length}`);
    });
  } catch (error) {
    console.error('Segmentation failed:', error);
  }
}

// Example 2: Advanced usage with progress tracking
async function advancedExample() {
  const segmentationService = createVideoSegmentationService();

  const input: VideoSegmentationInput = {
    videoUrl: 'https://example.com/traffic-video.mp4',
    objectQueries: ['person', 'car', 'truck', 'bicycle', 'traffic light'],
    splitStrategy: 'scene-change', // Split on scene changes
    minSegmentDuration: 5,
    maxSegmentDuration: 15,
    confidenceThreshold: 0.7,
  };

  // Track progress
  const progressCallback = (progress) => {
    console.log(`[${progress.stage}] ${progress.message} - ${progress.progress}%`);
    if (progress.currentFrame && progress.totalFrames) {
      console.log(`  Frame ${progress.currentFrame}/${progress.totalFrames}`);
    }
  };

  try {
    const result = await segmentationService.detectAndSplit(input, progressCallback);
    
    // Get URLs for split video segments
    const segmentUrls = await segmentationService.splitVideo(
      input.videoUrl,
      result.segments
    );

    console.log('\nSplit video URLs:');
    segmentUrls.forEach((url, index) => {
      console.log(`  Segment ${index + 1}: ${url}`);
    });
  } catch (error) {
    console.error('Advanced segmentation failed:', error);
  }
}

// Example 3: Using the API route
async function apiExample() {
  const input: VideoSegmentationInput = {
    videoUrl: 'https://example.com/security-footage.mp4',
    objectQueries: ['person', 'vehicle'],
    splitStrategy: 'object-presence',
    minSegmentDuration: 3,
    confidenceThreshold: 0.5,
  };

  try {
    const response = await fetch('/api/video-segmentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API Response:', result);

    // Access the segmentation data
    const { data, progress } = result;
    console.log(`Found ${data.segments.length} segments`);
    
    // Show progress updates
    progress.forEach(update => {
      console.log(`Progress: ${update.stage} - ${update.message}`);
    });
  } catch (error) {
    console.error('API call failed:', error);
  }
}

// Example 4: Integration with Video Cutter
async function videoCutterIntegration() {
  // This shows how to integrate with the existing video cutter
  const videoFile = {
    url: 'https://example.com/uploaded-video.mp4',
    duration: 120, // 2 minutes
  };

  // Detect specific objects for social media clips
  const input: VideoSegmentationInput = {
    videoUrl: videoFile.url,
    objectQueries: ['person speaking', 'product', 'logo'],
    splitStrategy: 'object-presence',
    minSegmentDuration: 6, // Good for social media
    maxSegmentDuration: 8,
    confidenceThreshold: 0.6,
  };

  try {
    const response = await fetch('/api/video-segmentation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const { data } = await response.json();
    
    // Convert segments to video cutter format
    const clips = data.segments.map((segment, index) => ({
      id: `clip-${index}`,
      startTime: segment.startTime,
      endTime: segment.endTime,
      duration: segment.duration,
      thumbnailUrl: segment.thumbnailUrl,
      metadata: {
        detectedObjects: segment.detectedObjects,
        trackCount: segment.tracks.length,
      },
    }));

    return clips;
  } catch (error) {
    console.error('Video cutter integration failed:', error);
    return [];
  }
}

// Export examples for testing
export {
  basicExample,
  advancedExample,
  apiExample,
  videoCutterIntegration,
};