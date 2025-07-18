import { useEffect, useState, useCallback } from 'react';
import { SelectedPlatform, ExportFormat, TextOverlay } from '@/types/platforms';

// Storage keys
const STORAGE_KEYS = {
  SELECTED_PLATFORMS: 'social_ad_litmus_selected_platforms',
  CURRENT_PREVIEW_INDEX: 'social_ad_litmus_preview_index',
  SHOW_SAFETY_ZONES: 'social_ad_litmus_safety_zones',
  AD_NAME: 'social_ad_litmus_ad_name',
  NAMING_VALUES: 'social_ad_litmus_naming_values',
  NAMING_ELEMENTS: 'social_ad_litmus_naming_elements',
  SELECTED_EXPORT_FORMATS: 'social_ad_litmus_export_formats',
  USER_PREFERENCES: 'social_ad_litmus_preferences',
  PROJECT_DATA: 'social_ad_litmus_current_project',
  TEXT_OVERLAYS: 'social_ad_litmus_text_overlays'
} as const;

// Utility functions for localStorage
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing from localStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      // Only clear our app's keys
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }
};

// Custom hook for persistent state
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  } = {}
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    return storage.get(key, defaultValue);
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      storage.set(key, newValue);
      return newValue;
    });
  }, [key]);

  return [state, setValue];
}

// Specialized hooks for different data types
export function usePersistentPlatforms() {
  const [platforms, setPlatforms] = usePersistentState<SelectedPlatform[]>(STORAGE_KEYS.SELECTED_PLATFORMS, []);
  
  // Filter out any Meta platforms that might be persisted from legacy data
  const filteredPlatforms = platforms.filter(p => p.platformId !== 'meta');
  
  // If we filtered anything out, update storage
  if (filteredPlatforms.length !== platforms.length) {
    setPlatforms(filteredPlatforms);
  }
  
  return [filteredPlatforms, setPlatforms] as const;
}

export function usePersistentPreviewIndex() {
  return usePersistentState<number>(STORAGE_KEYS.CURRENT_PREVIEW_INDEX, 0);
}

export function usePersistentSafetyZones() {
  return usePersistentState<boolean>(STORAGE_KEYS.SHOW_SAFETY_ZONES, true);
}

export function usePersistentAdName() {
  return usePersistentState<string>(STORAGE_KEYS.AD_NAME, '');
}

export function usePersistentNamingValues() {
  return usePersistentState<Record<string, string>>(STORAGE_KEYS.NAMING_VALUES, {});
}

interface NamingElement {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: string[];
  placeholder?: string;
}

export function usePersistentNamingElements() {
  return usePersistentState<NamingElement[]>(STORAGE_KEYS.NAMING_ELEMENTS, []);
}

export function usePersistentExportFormats() {
  return usePersistentState<ExportFormat[]>(STORAGE_KEYS.SELECTED_EXPORT_FORMATS, ['png']);
}

export function usePersistentTextOverlays() {
  return usePersistentState(STORAGE_KEYS.TEXT_OVERLAYS, []);
}

// Project management functions
export interface ProjectData {
  id: string;
  name: string;
  selectedPlatforms: SelectedPlatform[];
  adName: string;
  namingValues: Record<string, string>;
  textOverlays: TextOverlay[];
  showSafetyZones: boolean;
  selectedExportFormats: string[];
  createdAt: string;
  updatedAt: string;
}

export const projectManager = {
  // Save current project data
  saveProject: (data: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>): ProjectData => {
    const now = new Date().toISOString();
    const project: ProjectData = {
      ...data,
      id: `project_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    
    storage.set(STORAGE_KEYS.PROJECT_DATA, project);
    return project;
  },

  // Load current project
  loadProject: (): ProjectData | null => {
    return storage.get<ProjectData | null>(STORAGE_KEYS.PROJECT_DATA, null);
  },

  // Auto-save current state
  autoSave: (data: Partial<ProjectData>): void => {
    const existingProject = storage.get<ProjectData | null>(STORAGE_KEYS.PROJECT_DATA, null);
    const now = new Date().toISOString();
    
    const updatedProject: ProjectData = {
      id: existingProject?.id || `project_${Date.now()}`,
      name: data.name || existingProject?.name || 'Untitled Project',
      selectedPlatforms: data.selectedPlatforms || existingProject?.selectedPlatforms || [],
      adName: data.adName || existingProject?.adName || '',
      namingValues: data.namingValues || existingProject?.namingValues || {},
      textOverlays: data.textOverlays || existingProject?.textOverlays || [],
      showSafetyZones: data.showSafetyZones ?? existingProject?.showSafetyZones ?? true,
      selectedExportFormats: data.selectedExportFormats || existingProject?.selectedExportFormats || ['png'],
      createdAt: existingProject?.createdAt || now,
      updatedAt: now
    };
    
    storage.set(STORAGE_KEYS.PROJECT_DATA, updatedProject);
  },

  // Clear current project
  clearProject: (): void => {
    storage.remove(STORAGE_KEYS.PROJECT_DATA);
  },

  // Export project data
  exportProject: (): string => {
    const project = storage.get<ProjectData | null>(STORAGE_KEYS.PROJECT_DATA, null);
    if (!project) {
      throw new Error('No project data to export');
    }
    return JSON.stringify(project, null, 2);
  },

  // Import project data
  importProject: (projectJson: string): ProjectData => {
    try {
      const project: ProjectData = JSON.parse(projectJson);
      storage.set(STORAGE_KEYS.PROJECT_DATA, project);
      return project;
    } catch (error) {
      throw new Error('Invalid project data format');
    }
  }
};

// File handling - no persistence (files are not saved and are erased when removed)
export const fileManager = {
  // No-op save function - files are not persisted
  saveFile: async (key: string, file: File): Promise<void> => {
    // Files are not saved to localStorage - they exist only in memory
    return Promise.resolve();
  },

  // No-op load function - files are not persisted
  loadFile: (key: string): File | null => {
    // Files are not loaded from localStorage - they don't persist across sessions
    return null;
  },

  // No-op remove function - files are not persisted so nothing to remove from storage
  removeFile: (key: string): void => {
    // Files are not stored so nothing to remove from localStorage
    return;
  }
};

// Auto-save hook for continuous persistence
export function useAutoSave<T>(
  data: T,
  key: string,
  delay: number = 1000
): void {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      storage.set(key, data);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [data, key, delay]);
}

// Restore application state on mount
export function useRestoreState() {
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    // This will trigger restoration of all persistent state
    setIsRestored(true);
  }, []);

  return isRestored;
} 