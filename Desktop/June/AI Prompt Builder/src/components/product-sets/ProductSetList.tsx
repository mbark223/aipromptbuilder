'use client';

import { ProductSet } from '@/types/product-sets';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProductSetListProps {
  productSets: ProductSet[];
  onUpdate: (productSets: ProductSet[]) => void;
}

export function ProductSetList({ productSets, onUpdate }: ProductSetListProps) {
  const handleDelete = (id: string) => {
    onUpdate(productSets.filter(set => set.id !== id));
  };

  const handleDownloadAll = async (productSet: ProductSet) => {
    for (const variation of productSet.variations) {
      if (variation.status === 'completed' && variation.imageUrl) {
        const response = await fetch(variation.imageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${productSet.name}-${variation.name}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  if (productSets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No product sets created yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first product set to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {productSets.map((productSet) => {
        const completedCount = productSet.variations.filter(v => v.status === 'completed').length;
        const totalCount = productSet.variations.length;

        return (
          <Card key={productSet.id}>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <img
                    src={productSet.baseImage.url}
                    alt={productSet.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{productSet.name}</h3>
                  {productSet.description && (
                    <p className="text-sm text-muted-foreground mb-2">{productSet.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>
                      {completedCount} / {totalCount} variations
                    </span>
                    <span>•</span>
                    <span>
                      Created {formatDistanceToNow(new Date(productSet.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {totalCount > 0 && (
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {productSet.variations.slice(0, 6).map((variation) => (
                        <div
                          key={variation.id}
                          className="relative aspect-square rounded overflow-hidden bg-muted"
                        >
                          {variation.status === 'completed' && variation.imageUrl && (
                            <img
                              src={variation.imageUrl}
                              alt={variation.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {variation.status === 'processing' && (
                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                              Processing...
                            </div>
                          )}
                          {variation.status === 'failed' && (
                            <div className="flex items-center justify-center h-full text-xs text-red-500">
                              Failed
                            </div>
                          )}
                        </div>
                      ))}
                      {totalCount > 6 && (
                        <div className="flex items-center justify-center bg-muted rounded text-sm text-muted-foreground">
                          +{totalCount - 6}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadAll(productSet)}
                      disabled={completedCount === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product Set?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{productSet.name}&quot; and all its variations.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(productSet.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}