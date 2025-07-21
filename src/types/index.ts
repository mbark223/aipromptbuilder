export interface Prompt {
  id: string;
  projectId: string;
  title: string;
  content: {
    subject: string;
    style: string;
    composition: string;
    lighting: string;
    motion?: string;
    technical: string;
  };
  format: Format;
  consistency: {
    seedId?: string;
    lockedParams: string[];
    colorPalette?: string[];
  };
  metadata: {
    created: Date;
    modified: Date;
    author: string;
    version: number;
    tags: string[];
  };
}

export interface Format {
  aspectRatio: string;
  width: number;
  height: number;
  name: string;
  custom: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created: Date;
  modified: Date;
  prompts: string[]; // Array of prompt IDs
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  content: Partial<Prompt['content']>;
  format?: Format;
  tags: string[];
  isPublic: boolean;
  author: string;
  created: Date;
}

export interface ExportConfig {
  platform: 'veo' | 'flows' | 'generic';
  format: 'json' | 'csv' | 'txt';
  includeMetadata: boolean;
  options?: Record<string, any>;
}

export interface ConsistencySettings {
  seedId?: string;
  lockedParams: string[];
  colorPalette?: string[];
  styleReference?: string;
  characterIds?: string[];
}

export const PRESET_FORMATS: Format[] = [
  { aspectRatio: '1:1', width: 1080, height: 1080, name: 'Square', custom: false },
  { aspectRatio: '9:16', width: 1080, height: 1920, name: 'Vertical', custom: false },
  { aspectRatio: '16:9', width: 1920, height: 1080, name: 'Horizontal', custom: false },
  { aspectRatio: '4:5', width: 1080, height: 1350, name: 'Portrait', custom: false },
];

export const PROMPT_SECTIONS = [
  { key: 'subject', label: 'Subject/Main Elements', required: true },
  { key: 'style', label: 'Style & Aesthetic', required: true },
  { key: 'composition', label: 'Camera/Shot Composition', required: true },
  { key: 'lighting', label: 'Lighting & Mood', required: true },
  { key: 'motion', label: 'Motion/Animation', required: false },
  { key: 'technical', label: 'Technical Specifications', required: true },
] as const;

export type PromptSection = typeof PROMPT_SECTIONS[number]['key'];