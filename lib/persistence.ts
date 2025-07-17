import { useEffect, useState, useCallback } from 'react';
import { AdContent, SelectedPlatform, ExportFormat } from '@/types/platforms';

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
  return usePersistentState<SelectedPlatform[]>(STORAGE_KEYS.SELECTED_PLATFORMS, []);
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
  textOverlays: any[];
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

// File handling for persistence (since File objects can't be directly serialized)
export interface SerializedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  dataUrl: string; // base64 data URL
}

export const fileManager = {
  // Serialize file to storable format
  serializeFile: async (file: File): Promise<SerializedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          dataUrl: reader.result as string
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  // Deserialize stored file data back to File object
  deserializeFile: (serializedFile: SerializedFile): File => {
    // Convert data URL back to File
    const byteString = atob(serializedFile.dataUrl.split(',')[1]);
    const mimeString = serializedFile.dataUrl.split(',')[0].split(':')[1].split(';')[0];
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new File([ab], serializedFile.name, {
      type: mimeString,
      lastModified: serializedFile.lastModified
    });
  },

  // Save file to localStorage (with size limits)
  saveFile: async (key: string, file: File): Promise<void> => {
    try {
      // Check file size (localStorage has ~5-10MB limit)
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        console.warn('File too large for localStorage, skipping save');
        return;
      }
      
      const serializedFile = await fileManager.serializeFile(file);
      storage.set(key, serializedFile);
    } catch (error) {
      console.warn('Failed to save file to localStorage:', error);
    }
  },

  // Load file from localStorage
  loadFile: (key: string): File | null => {
    try {
      const serializedFile = storage.get<SerializedFile | null>(key, null);
      if (!serializedFile) return null;
      
      return fileManager.deserializeFile(serializedFile);
    } catch (error) {
      console.warn('Failed to load file from localStorage:', error);
      return null;
    }
  },

  // Remove file from localStorage
  removeFile: (key: string): void => {
    storage.remove(key);
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