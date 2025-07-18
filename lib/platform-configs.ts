import { PlatformConfig } from '@/types/platforms';

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    brandColor: '#E4405F',
    icon: '📷',
    formats: {
      feed: {
        dimensions: { width: 1080, height: 1080, aspectRatio: '1:1', name: 'Feed' },
        safetyZone: { top: 50, bottom: 50, left: 50, right: 50 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Instagram feed post',
        textRecommendations: { maxChars: 125, fontSize: '16px-24px' }
      },
      story: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Story' },
        safetyZone: { top: 160, bottom: 300, left: 50, right: 50 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Instagram Story format',
        textRecommendations: { maxChars: 50, fontSize: '24px-32px' }
      },
      reels: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Reels' },
        safetyZone: { top: 200, bottom: 460, left: 50, right: 165 },
        maxFileSize: 150,
        allowedFormats: ['mp4', 'mov'],
        description: 'Instagram Reels video format',
        textRecommendations: { maxChars: 125, fontSize: '20px-28px' }
      },
      reels_primary_post: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Reels Primary Post' },
        safetyZone: { top: 200, bottom: 820, left: 50, right: 165 },
        maxFileSize: 150,
        allowedFormats: ['mp4', 'mov'],
        description: 'Instagram Reels Primary Post format',
        textRecommendations: { maxChars: 125, fontSize: '20px-28px' }
      }
    }
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    brandColor: '#1877F2',
    icon: '📘',
    formats: {
      feed: {
        dimensions: { width: 1080, height: 1080, aspectRatio: '1:1', name: 'Feed' },
        safetyZone: { top: 50, bottom: 50, left: 50, right: 50 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Facebook feed post',
        textRecommendations: { maxChars: 125, maxLines: 2 }
      },
      story: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Story' },
        safetyZone: { top: 160, bottom: 300, left: 50, right: 50 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Facebook Story format'
      },
      reels: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Reels' },
        safetyZone: { top: 200, bottom: 460, left: 50, right: 165 },
        maxFileSize: 150,
        allowedFormats: ['mp4', 'mov'],
        description: 'Facebook Reels video format',
        textRecommendations: { maxChars: 125, fontSize: '20px-28px' }
      },
      reels_primary_post: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Reels Primary Post' },
        safetyZone: { top: 200, bottom: 820, left: 50, right: 165 },
        maxFileSize: 150,
        allowedFormats: ['mp4', 'mov'],
        description: 'Facebook Reels Primary Post format',
        textRecommendations: { maxChars: 125, fontSize: '20px-28px' }
      },
      cover: {
        dimensions: { width: 1200, height: 315, aspectRatio: '3.8:1', name: 'Cover Photo' },
        safetyZone: { top: 30, bottom: 30, left: 60, right: 60 },
        maxFileSize: 10,
        allowedFormats: ['jpg', 'png'],
        description: 'Facebook page cover photo'
      }
    }
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    category: 'social',
    brandColor: '#1DA1F2',
    icon: '🐦',
    formats: {
      feed: {
        dimensions: { width: 1080, height: 1080, aspectRatio: '1:1', name: 'Feed' },
        safetyZone: { top: 50, bottom: 50, left: 50, right: 50 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Twitter/X feed post',
        textRecommendations: { maxChars: 280 }
      },
      profile_header: {
        dimensions: { width: 1500, height: 500, aspectRatio: '3:1', name: 'Profile Header' },
        safetyZone: { top: 50, bottom: 50, left: 100, right: 100 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png'],
        description: 'Twitter/X profile header'
      }
    }
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    category: 'video',
    brandColor: '#FF0050',
    icon: '🎵',
    formats: {
      feed: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Feed' },
        safetyZone: { top: 230, bottom: 460, left: 50, right: 165 },
        maxFileSize: 150,
        allowedFormats: ['mp4'],
        description: 'TikTok feed video format',
        textRecommendations: { maxChars: 100, fontSize: '20px-28px' }
      }
    }
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat',
    category: 'social',
    brandColor: '#FFFC00',
    icon: '👻',
    formats: {
      snap_ad: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Snap Ad' },
        safetyZone: { top: 150, bottom: 300, left: 50, right: 50 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Snapchat Snap Ad format'
      },
      snap_ad_skoverlay: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Snap Ad (SKOverlay)' },
        safetyZone: { top: 150, bottom: 350, left: 50, right: 50 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Snapchat Snap Ad with iOS SKOverlay support'
      },
      discover_tile: {
        dimensions: { width: 360, height: 600, aspectRatio: '3:5', name: 'Discover Tile' },
        safetyZone: { top: 125, bottom: 240, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Snapchat Discover Tile format'
      },
      spotlight: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Spotlight' },
        safetyZone: { top: 150, bottom: 430, left: 50, right: 50 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Snapchat Spotlight format'
      },
      spotlight_skoverlay: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Spotlight (SKOverlay)' },
        safetyZone: { top: 150, bottom: 480, left: 50, right: 50 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Snapchat Spotlight with iOS SKOverlay support'
      }
    }
  },
  google_uac: {
    id: 'google_uac',
    name: 'Google UAC',
    category: 'professional',
    brandColor: '#4285F4',
    icon: '🎯',
    formats: {
      square_1080x1080: {
        dimensions: { width: 1080, height: 1080, aspectRatio: '1:1', name: '1080x1080 Square' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png'],
        description: 'Google UAC 1080x1080 square image',
        textRecommendations: { maxChars: 100, fontSize: '24px-32px' }
      },
      portrait_1080x1920: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: '1080x1920 Portrait' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png'],
        description: 'Google UAC 1080x1920 portrait image',
        textRecommendations: { maxChars: 100, fontSize: '24px-32px' }
      },
      square_1200x1200: {
        dimensions: { width: 1200, height: 1200, aspectRatio: '1:1', name: '1200x1200 Square' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png'],
        description: 'Google UAC 1200x1200 square image',
        textRecommendations: { maxChars: 100, fontSize: '24px-32px' }
      },
      portrait_1200x1500: {
        dimensions: { width: 1200, height: 1500, aspectRatio: '4:5', name: '1200x1500 Portrait' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png'],
        description: 'Google UAC 1200x1500 portrait image',
        textRecommendations: { maxChars: 120, fontSize: '20px-28px' }
      },
      landscape_1200x628: {
        dimensions: { width: 1200, height: 628, aspectRatio: '1.91:1', name: '1200x628 Landscape' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png'],
        description: 'Google UAC 1200x628 landscape image',
        textRecommendations: { maxChars: 120, fontSize: '20px-28px' }
      },
      skyscraper_160x600: {
        dimensions: { width: 160, height: 600, aspectRatio: '4:15', name: '160x600 Skyscraper' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Google UAC 160x600 skyscraper banner',
        textRecommendations: { maxChars: 30, fontSize: '12px-16px' }
      },
      medium_rectangle_300x250: {
        dimensions: { width: 300, height: 250, aspectRatio: '1.2:1', name: '300x250 Medium Rectangle' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Google UAC 300x250 medium rectangle',
        textRecommendations: { maxChars: 80, fontSize: '14px-18px' }
      },
      large_mobile_300x600: {
        dimensions: { width: 300, height: 600, aspectRatio: '1:2', name: '300x600 Large Mobile' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Google UAC 300x600 large mobile banner',
        textRecommendations: { maxChars: 60, fontSize: '14px-18px' }
      },
      small_banner_320x50: {
        dimensions: { width: 320, height: 50, aspectRatio: '6.4:1', name: '320x50 Small Banner' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Google UAC 320x50 small banner',
        textRecommendations: { maxChars: 30, fontSize: '12px-16px' }
      },
      leaderboard_728x90: {
        dimensions: { width: 728, height: 90, aspectRatio: '8.09:1', name: '728x90 Leaderboard' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Google UAC 728x90 leaderboard banner',
        textRecommendations: { maxChars: 60, fontSize: '14px-20px' }
      },
      billboard_970x250: {
        dimensions: { width: 970, height: 250, aspectRatio: '3.88:1', name: '970x250 Billboard' },
        safetyZone: { top: 0, bottom: 0, left: 0, right: 0 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Google UAC 970x250 billboard banner',
        textRecommendations: { maxChars: 80, fontSize: '16px-24px' }
      }
    }
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    category: 'video',
    brandColor: '#FF0000',
    icon: '📺',
    formats: {
      thumbnail: {
        dimensions: { width: 1280, height: 720, aspectRatio: '16:9', name: 'Thumbnail' },
        safetyZone: { top: 60, bottom: 60, left: 80, right: 80 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png'],
        description: 'YouTube video thumbnail'
      },
      shorts: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Shorts' },
        safetyZone: { top: 200, bottom: 680, left: 50, right: 165 },
        maxFileSize: 150,
        allowedFormats: ['mp4'],
        description: 'YouTube Shorts format'
      }
    }
  }
};

export function getAllPlatforms() {
  const platforms = Object.values(PLATFORM_CONFIGS);
  // Filter out any Meta platforms that might exist from legacy data
  const filteredPlatforms = platforms.filter(p => p.id !== 'meta' && p.name !== 'Meta');
  // Debug: log available platforms
  console.log('Available platforms:', filteredPlatforms.map(p => ({ id: p.id, name: p.name })));
  return filteredPlatforms;
}

export function getPlatformById(id: string) {
  return PLATFORM_CONFIGS[id];
}

export function getPlatformsByCategory(category: string) {
  return Object.values(PLATFORM_CONFIGS).filter(p => p.category === category);
} 