'use client';

import { useUserPreferences } from '@/lib/user-preferences-client';

export function AdNamingDebug() {
  const { namingValues, isLoading } = useUserPreferences();
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Values: {JSON.stringify(namingValues, null, 2)}</p>
    </div>
  );
}