'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductSetBuilder } from '@/components/product-sets/ProductSetBuilder';
import { ProductSetList } from '@/components/product-sets/ProductSetList';
import { ProductSet } from '@/types/product-sets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProductSetsPage() {
  const [productSets, setProductSets] = useState<ProductSet[]>([]);
  const [activeTab, setActiveTab] = useState('create');

  const handleProductSetCreated = (newSet: ProductSet) => {
    setProductSets(prev => [...prev, newSet]);
    setActiveTab('manage');
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Image Variations</h1>
        <p className="text-muted-foreground">
          Create multiple variations of your product images using AI-powered image generation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="create">Create New Set</TabsTrigger>
          <TabsTrigger value="manage">Manage Sets</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Product Set</CardTitle>
              <CardDescription>
                Upload a base product image and generate variations with different backgrounds, angles, and styles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductSetBuilder onProductSetCreated={handleProductSetCreated} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Product Sets</CardTitle>
              <CardDescription>
                View and manage your created product image sets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductSetList 
                productSets={productSets} 
                onUpdate={(updatedSets) => setProductSets(updatedSets)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}