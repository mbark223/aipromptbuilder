'use client';

import { StaticAsset } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

interface AssetGridProps {
  assets: StaticAsset[];
  selectedAssets: string[];
  onSelectAssets: (ids: string[]) => void;
  multiSelect?: boolean;
}

export function AssetGrid({
  assets,
  selectedAssets,
  onSelectAssets,
  multiSelect = true
}: AssetGridProps) {
  const handleAssetClick = (assetId: string) => {
    if (multiSelect) {
      if (selectedAssets.includes(assetId)) {
        onSelectAssets(selectedAssets.filter(id => id !== assetId));
      } else {
        onSelectAssets([...selectedAssets, assetId]);
      }
    } else {
      onSelectAssets([assetId]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (assets.length === 0) {
    return (
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
        <Icons.image className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No assets uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {assets.filter(asset => asset && asset.id && asset.originalFile).map((asset) => {
        const isSelected = selectedAssets.includes(asset.id);
        
        return (
          <Card
            key={asset.id}
            className={`
              relative cursor-pointer transition-all duration-200 overflow-hidden
              ${isSelected 
                ? 'ring-2 ring-primary' 
                : 'hover:ring-2 hover:ring-primary/50'
              }
            `}
            onClick={() => handleAssetClick(asset.id)}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 z-10 rounded-full bg-primary p-1">
                <Icons.check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}

            {/* Image preview */}
            <div className="aspect-square relative bg-muted">
              {asset.originalFile?.url && (
                <img
                  src={asset.originalFile.url}
                  alt={asset.originalFile.name || 'Asset'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Asset info */}
            <div className="p-3 space-y-1">
              <p className="text-sm font-medium truncate">
                {asset.originalFile?.name || 'Unnamed asset'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="px-1 py-0">
                  {asset.originalFile.format ? asset.originalFile.format.toUpperCase() : 'N/A'}
                </Badge>
                <span>{asset.originalFile.size !== undefined ? formatFileSize(asset.originalFile.size) : 'Unknown size'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {asset.originalFile.dimensions ? `${asset.originalFile.dimensions.width} × ${asset.originalFile.dimensions.height}` : 'Unknown dimensions'}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}