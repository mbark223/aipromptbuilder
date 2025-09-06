'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { mockBrandGuidelines } from '@/lib/auth';

interface BrandColors {
  primary: string[];
  accent: string[];
}

interface BrandGuidelines {
  id: string;
  name: string;
  colors: BrandColors;
  fonts: string[];
  style: string;
  keywords: string[];
  restrictions: string[];
  logoUrl: string;
}

interface BrandContextType {
  brandGuidelines: BrandGuidelines | null;
  isLoading: boolean;
}

const BrandContext = createContext<BrandContextType>({
  brandGuidelines: null,
  isLoading: true,
});

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [brandGuidelines, setBrandGuidelines] = useState<BrandGuidelines | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.brandId) {
      // In production, fetch from API
      // For now, use mock data
      const guidelines = mockBrandGuidelines[session.user.brandId as keyof typeof mockBrandGuidelines];
      setBrandGuidelines(guidelines || null);
      setIsLoading(false);
    } else {
      setBrandGuidelines(null);
      setIsLoading(false);
    }
  }, [session]);

  return (
    <BrandContext.Provider value={{ brandGuidelines, isLoading }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}