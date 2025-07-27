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
    const key = getStorageKey();
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setNamingValuesState(data.namingValues || {});
        setCustomOptionsState(data.customOptions || {});
      } catch (e) {
        console.error('Error loading preferences:', e);
      }
    }
    
    setIsLoading(false);
  }, [getStorageKey, status]);

  // Save to localStorage whenever values change
  const saveToStorage = useCallback((values: Record<string, string>, options: Record<string, string[]>) => {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify({
      namingValues: values,
      customOptions: options,
      lastUpdated: new Date().toISOString()
    }));
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