import { AnimationProfile } from '@/types';

export const ANIMATION_TEMPLATES: AnimationProfile[] = [
  {
    id: 'subtle-breathing',
    name: 'Subtle Breathing',
    type: 'subtle' as const,
    movements: [
      {
        element: 'full',
        type: 'pulse',
        intensity: 2,
        timing: 'ease' as const
      }
    ],
    duration: 3,
    loop: true,
    transitions: {
      in: { type: 'fade' as const, duration: 0.3, easing: 'ease-out' },
      out: { type: 'fade' as const, duration: 0.3, easing: 'ease-in' }
    }
  },
  {
    id: 'ambient-float',
    name: 'Ambient Float',
    type: 'subtle' as const,
    movements: [
      {
        element: 'full',
        type: 'float',
        intensity: 3,
        direction: 'up' as const,
        timing: 'ease' as const
      }
    ],
    duration: 4,
    loop: true,
    transitions: {
      in: { type: 'none' as const, duration: 0, easing: 'linear' },
      out: { type: 'none' as const, duration: 0, easing: 'linear' }
    }
  },
  {
    id: 'parallax-layers',
    name: 'Parallax Layers',
    type: 'moderate' as const,
    movements: [
      {
        element: 'background',
        type: 'pan',
        intensity: 2,
        direction: 'right' as const,
        timing: 'linear' as const
      },
      {
        element: 'foreground',
        type: 'pan',
        intensity: 4,
        direction: 'right' as const,
        timing: 'linear' as const
      }
    ],
    duration: 5,
    loop: true,
    transitions: {
      in: { type: 'slide' as const, duration: 0.5, easing: 'ease-out' },
      out: { type: 'slide' as const, duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'ken-burns',
    name: 'Ken Burns',
    type: 'moderate' as const,
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 3,
        direction: 'in' as const,
        timing: 'ease' as const
      },
      {
        element: 'full',
        type: 'pan',
        intensity: 2,
        direction: 'left' as const,
        timing: 'ease' as const
      }
    ],
    duration: 6,
    loop: false,
    transitions: {
      in: { type: 'fade' as const, duration: 0.5, easing: 'ease-out' },
      out: { type: 'fade' as const, duration: 0.5, easing: 'ease-in' }
    }
  },
  {
    id: 'social-media-optimized',
    name: 'Social Media Optimized',
    type: 'dynamic' as const,
    movements: [
      {
        element: 'full',
        type: 'zoom',
        intensity: 5,
        direction: 'in' as const,
        timing: 'ease-out' as const
      },
      {
        element: 'full',
        type: 'pulse',
        intensity: 3,
        timing: 'ease' as const
      }
    ],
    duration: 2,
    loop: true,
    transitions: {
      in: { type: 'zoom' as const, duration: 0.2, easing: 'ease-out' },
      out: { type: 'fade' as const, duration: 0.2, easing: 'ease-in' }
    }
  }
];