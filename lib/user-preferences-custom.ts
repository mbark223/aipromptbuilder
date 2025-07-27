'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

interface CustomOptionsData {
  added: string[];
  removed: string[];
}

export function useUserPreferences() {
  const { data: session, status } = useSession();
  const [namingValues, setNamingValuesState] = useState<Record<string, string>>({});
  const [customOptions, setCustomOptionsState] = useState<Record<string, CustomOptionsData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Get storage key based on user email
  const getStorageKey = useCallback(() => {
    if (session?.user?.email) {
      return `ad_naming_${session.user.email}`;
    }
    return 'ad_naming_guest';
  }, [session]);

  // Save to localStorage function
  const saveToStorageInternal = useCallback((key: string, values: Record<string, string>, options: Record<string, CustomOptionsData>) => {
    const data = {
      namingValues: values,
      customOptions: options,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(data));
    console.log('Saved preferences for:', key, data);
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    if (status === 'loading') return;
    
    const key = getStorageKey();
    console.log('Loading preferences for:', key);
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        console.log('Found stored preferences:', data);
        setNamingValuesState(data.namingValues || {});
        
        // Handle both old and new format
        if (data.customOptions) {
          const converted: Record<string, CustomOptionsData> = {};
          Object.entries(data.customOptions).forEach(([k, v]: [string, any]) => {
            if (Array.isArray(v)) {
              // Old format - array of custom options
              converted[k] = { added: v, removed: [] };
            } else if (v && typeof v === 'object' && 'added' in v) {
              // New format
              converted[k] = v as CustomOptionsData;
            }
          });
          setCustomOptionsState(converted);
        }
      } catch (e) {
        console.error('Error loading preferences:', e);
      }
    }
    
    setIsLoading(false);
  }, [getStorageKey, status, session, saveToStorageInternal]);

  // Save to localStorage whenever values change
  const saveToStorage = useCallback((values: Record<string, string>, options: Record<string, CustomOptionsData>) => {
    const key = getStorageKey();
    saveToStorageInternal(key, values, options);
  }, [getStorageKey, saveToStorageInternal]);

  const setNamingValues = useCallback((values: Record<string, string>) => {
    setNamingValuesState(values);
    saveToStorage(values, customOptions);
  }, [customOptions, saveToStorage]);

  const setCustomOptions = useCallback((options: Record<string, CustomOptionsData>) => {
    setCustomOptionsState(options);
    saveToStorage(namingValues, options);
  }, [namingValues, saveToStorage]);

  return {
    namingValues,
    customOptions,
    setNamingValues,
    setCustomOptions,
    isLoading,
    isAuthenticated: status === "authenticated",
  };
}