'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

export function useUserPreferences() {
  const { data: session, status } = useSession();
  const [namingValues, setNamingValuesState] = useState<Record<string, string>>({});
  const [customOptions, setCustomOptionsState] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Get storage key based on user email
  const getStorageKey = useCallback(() => {
    if (session?.user?.email) {
      return `ad_naming_${session.user.email}`;
    }
    return 'ad_naming_guest';
  }, [session]);

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
        setCustomOptionsState(data.customOptions || {});
      } catch (e) {
        console.error('Error loading preferences:', e);
      }
    } else {
      console.log('No stored preferences found for:', key);
    }
    
    setIsLoading(false);
  }, [getStorageKey, status]);

  // Save to localStorage whenever values change
  const saveToStorage = useCallback((values: Record<string, string>, options: Record<string, string[]>) => {
    const key = getStorageKey();
    const data = {
      namingValues: values,
      customOptions: options,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(data));
    console.log('Saved preferences for:', key, data);
  }, [getStorageKey]);

  const setNamingValues = useCallback((values: Record<string, string>) => {
    setNamingValuesState(values);
    saveToStorage(values, customOptions);
  }, [customOptions, saveToStorage]);

  const setCustomOptions = useCallback((options: Record<string, string[]>) => {
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