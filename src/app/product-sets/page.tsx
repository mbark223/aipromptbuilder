'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function ProductSetsPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <span>🛍️</span> Product Sets
        </h1>
        <p className="text-muted-foreground">
          Generate multiple product variations using AI
        </p>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground mb-6">
            Product Sets feature is under development. Soon you'll be able to generate<br />
            multiple variations of your products for A/B testing and marketing campaigns.
          </p>
          <Button variant="outline" disabled>
            <Sparkles className="mr-2 h-4 w-4" />
            Feature Coming Soon
          </Button>
        </div>
      </Card>
    </div>
  );
}