import { PlatformConfig } from '@/types/platforms';

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    brandColor: '#E4405F',
    icon: '📷',
    formats: {
      feed_square: {
        dimensions: { width: 1080, height: 1080, aspectRatio: '1:1', name: 'Feed Square' },
        safetyZone: { top: 80, bottom: 80, left: 80, right: 80 },
        maxFileSize: 30,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Standard Instagram feed post',
        textRecommendations: { maxChars: 125, fontSize: '16px-24px' }
      },
      feed_portrait: {
        dimensions: { width: 1080, height: 1350, aspectRatio: '4:5', name: 'Feed Portrait' },
        safetyZone: { top: 80, bottom: 120, left: 80, right: 80 },
        maxFileSize: 30,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Vertical Instagram feed post'
      },
      story: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Story' },
        safetyZone: { top: 250, bottom: 250, left: 80, right: 80 },
        maxFileSize: 30,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Instagram Story format',
        textRecommendations: { maxChars: 50, fontSize: '24px-32px' }
      },
      reels: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Reels' },
        safetyZone: { top: 200, bottom: 300, left: 80, right: 80 },
        maxFileSize: 100,
        allowedFormats: ['mp4', 'mov'],
        description: 'Instagram Reels video format',
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
        dimensions: { width: 1080, height: 1080, aspectRatio: '1:1', name: 'Feed Post' },
        safetyZone: { top: 80, bottom: 80, left: 80, right: 80 },
        maxFileSize: 30,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Facebook feed post',
        textRecommendations: { maxChars: 125, maxLines: 2 }
      },
      story: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Story' },
        safetyZone: { top: 250, bottom: 250, left: 80, right: 80 },
        maxFileSize: 30,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Facebook Story format'
      },
      reels: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Reels' },
        safetyZone: { top: 200, bottom: 300, left: 80, right: 80 },
        maxFileSize: 100,
        allowedFormats: ['mp4', 'mov'],
        description: 'Facebook Reels video format',
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
  meta: {
    id: 'meta',
    name: 'Meta',
    category: 'social',
    brandColor: '#0866FF',
    icon: '🔷',
    formats: {
      reels: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Reels' },
        safetyZone: { top: 200, bottom: 300, left: 80, right: 80 },
        maxFileSize: 100,
        allowedFormats: ['mp4', 'mov'],
        description: 'Meta Reels video format for Instagram and Facebook',
        textRecommendations: { maxChars: 125, fontSize: '20px-28px' }
      },
      story: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Story' },
        safetyZone: { top: 250, bottom: 250, left: 80, right: 80 },
        maxFileSize: 100,
        allowedFormats: ['mp4', 'mov', 'jpg', 'png'],
        description: 'Meta Story format for cross-platform publishing',
        textRecommendations: { maxChars: 50, fontSize: '24px-32px' }
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
      post: {
        dimensions: { width: 1200, height: 675, aspectRatio: '16:9', name: 'Post Image' },
        safetyZone: { top: 50, bottom: 50, left: 50, right: 50 },
        maxFileSize: 5,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Twitter/X post image',
        textRecommendations: { maxChars: 280 }
      },
      header: {
        dimensions: { width: 1500, height: 500, aspectRatio: '3:1', name: 'Header Image' },
        safetyZone: { top: 40, bottom: 40, left: 60, right: 60 },
        maxFileSize: 5,
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
      video: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Video' },
        safetyZone: { top: 200, bottom: 300, left: 80, right: 80 },
        maxFileSize: 500,
        allowedFormats: ['mp4'],
        description: 'TikTok video format',
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
      story: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Story' },
        safetyZone: { top: 250, bottom: 250, left: 80, right: 80 },
        maxFileSize: 32,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Snapchat Story format',
        textRecommendations: { maxChars: 50, fontSize: '24px-32px' }
      },
      ad: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Snap Ad' },
        safetyZone: { top: 300, bottom: 300, left: 100, right: 100 },
        maxFileSize: 32,
        allowedFormats: ['jpg', 'png', 'mp4'],
        description: 'Snapchat Snap Ad format'
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
      small_banner: {
        dimensions: { width: 320, height: 50, aspectRatio: '6.4:1', name: 'Small Banner' },
        safetyZone: { top: 5, bottom: 5, left: 10, right: 10 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Google UAC small banner for mobile',
        textRecommendations: { maxChars: 30, fontSize: '12px-16px' }
      },
      medium_rectangle: {
        dimensions: { width: 300, height: 250, aspectRatio: '1.2:1', name: 'Medium Rectangle' },
        safetyZone: { top: 20, bottom: 20, left: 20, right: 20 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Google UAC medium rectangle display ad',
        textRecommendations: { maxChars: 80, fontSize: '14px-18px' }
      },
      leaderboard: {
        dimensions: { width: 728, height: 90, aspectRatio: '8.09:1', name: 'Leaderboard' },
        safetyZone: { top: 10, bottom: 10, left: 30, right: 30 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png', 'gif'],
        description: 'Google UAC leaderboard banner',
        textRecommendations: { maxChars: 60, fontSize: '14px-20px' }
      },
      square_image: {
        dimensions: { width: 1200, height: 1200, aspectRatio: '1:1', name: 'Square Image' },
        safetyZone: { top: 60, bottom: 60, left: 60, right: 60 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png'],
        description: 'Google UAC square image for display and discovery',
        textRecommendations: { maxChars: 100, fontSize: '24px-32px' }
      },
      landscape_image: {
        dimensions: { width: 1200, height: 628, aspectRatio: '1.91:1', name: 'Landscape Image' },
        safetyZone: { top: 40, bottom: 40, left: 60, right: 60 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png'],
        description: 'Google UAC landscape image for YouTube and display',
        textRecommendations: { maxChars: 120, fontSize: '20px-28px' }
      },
      portrait_image: {
        dimensions: { width: 480, height: 320, aspectRatio: '1.5:1', name: 'Portrait Image' },
        safetyZone: { top: 20, bottom: 20, left: 24, right: 24 },
        maxFileSize: 150,
        allowedFormats: ['jpg', 'png'],
        description: 'Google UAC portrait image for mobile placements',
        textRecommendations: { maxChars: 60, fontSize: '16px-22px' }
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
        maxFileSize: 2,
        allowedFormats: ['jpg', 'png'],
        description: 'YouTube video thumbnail'
      },
      shorts: {
        dimensions: { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Shorts' },
        safetyZone: { top: 200, bottom: 300, left: 80, right: 80 },
        maxFileSize: 100,
        allowedFormats: ['mp4'],
        description: 'YouTube Shorts format'
      }
    }
  }
};

export function getAllPlatforms() {
  return Object.values(PLATFORM_CONFIGS);
}

export function getPlatformById(id: string) {
  return PLATFORM_CONFIGS[id];
}

export function getPlatformsByCategory(category: string) {
  return Object.values(PLATFORM_CONFIGS).filter(p => p.category === category);
} 