import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useUserPreferences() {
  const { data: session, status } = useSession();
  const [namingValues, setNamingValues] = useState<Record<string, string>>({});
  const [customOptions, setCustomOptions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences when user is authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      loadPreferences();
    } else if (status === "unauthenticated") {
      // Load from localStorage for unauthenticated users
      const localNamingValues = localStorage.getItem('adNamingValues');
      if (localNamingValues) {
        setNamingValues(JSON.parse(localNamingValues));
      }
      setIsLoading(false);
    }
  }, [status, session]);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setNamingValues(data.namingValues || {});
        setCustomOptions(data.customOptions || {});
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newNamingValues: Record<string, string>, newCustomOptions: Record<string, string[]>) => {
    if (status === "authenticated") {
      // Save to database for authenticated users
      try {
        await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            namingValues: newNamingValues,
            customOptions: newCustomOptions,
          }),
        });
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    } else {
      // Save to localStorage for unauthenticated users
      localStorage.setItem('adNamingValues', JSON.stringify(newNamingValues));
    }
  };

  return {
    namingValues,
    customOptions,
    setNamingValues: (values: Record<string, string>) => {
      setNamingValues(values);
      savePreferences(values, customOptions);
    },
    setCustomOptions: (options: Record<string, string[]>) => {
      setCustomOptions(options);
      savePreferences(namingValues, options);
    },
    isLoading,
    isAuthenticated: status === "authenticated",
  };
}