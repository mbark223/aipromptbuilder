'use client';

import React, { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';

interface SizeSelectorProps {
  selectedSizes: string[];
  onSizeSelect: (sizes: string[]) => void;
}

interface SizeOption {
  id: string;
  name: string;
  ratio: string;
  dimensions: { width: number; height: number };
  platform?: string;
}

const PREDEFINED_SIZES: SizeOption[] = [
  // Square formats
  { id: 'square-1080', name: 'Square', ratio: '1:1', dimensions: { width: 1080, height: 1080 }, platform: 'Instagram' },
  { id: 'square-500', name: 'Small Square', ratio: '1:1', dimensions: { width: 500, height: 500 } },
  
  // Landscape formats
  { id: 'landscape-1920', name: 'HD Landscape', ratio: '16:9', dimensions: { width: 1920, height: 1080 }, platform: 'YouTube' },
  { id: 'landscape-1200', name: 'Blog Header', ratio: '16:9', dimensions: { width: 1200, height: 675 } },
  { id: 'fb-link', name: 'Facebook Link', ratio: '1.91:1', dimensions: { width: 1200, height: 630 }, platform: 'Facebook' },
  
  // Portrait formats
  { id: 'story-1080', name: 'Story/Reel', ratio: '9:16', dimensions: { width: 1080, height: 1920 }, platform: 'Instagram' },
  { id: 'portrait-1080', name: 'Portrait', ratio: '4:5', dimensions: { width: 1080, height: 1350 }, platform: 'Instagram' },
  { id: 'pinterest', name: 'Pinterest Pin', ratio: '2:3', dimensions: { width: 1000, height: 1500 }, platform: 'Pinterest' },
  
  // Social media specific
  { id: 'twitter-post', name: 'Twitter Post', ratio: '16:9', dimensions: { width: 1200, height: 675 }, platform: 'Twitter' },
  { id: 'linkedin', name: 'LinkedIn', ratio: '1.91:1', dimensions: { width: 1200, height: 627 }, platform: 'LinkedIn' },
  { id: 'fb-cover', name: 'FB Cover', ratio: '2.7:1', dimensions: { width: 820, height: 312 }, platform: 'Facebook' },
];

export function SizeSelector({ selectedSizes, onSizeSelect }: SizeSelectorProps) {
  const [customSize, setCustomSize] = useState({ width: '', height: '' });
  const [showCustom, setShowCustom] = useState(false);

  const handleSizeToggle = (sizeId: string) => {
    if (selectedSizes.includes(sizeId)) {
      onSizeSelect(selectedSizes.filter(id => id !== sizeId));
    } else {
      onSizeSelect([...selectedSizes, sizeId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSizes.length === PREDEFINED_SIZES.length) {
      onSizeSelect([]);
    } else {
      onSizeSelect(PREDEFINED_SIZES.map(size => size.id));
    }
  };

  const handleAddCustomSize = () => {
    const width = parseInt(customSize.width);
    const height = parseInt(customSize.height);
    
    if (width > 0 && height > 0) {
      const customId = `custom-${width}x${height}`;
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(width, height);
      const ratioW = width / divisor;
      const ratioH = height / divisor;
      
      const newSize: SizeOption = {
        id: customId,
        name: `Custom ${width}×${height}`,
        ratio: `${ratioW}:${ratioH}`,
        dimensions: { width, height }
      };
      
      // Add to predefined sizes temporarily (in real app, might want to store separately)
      PREDEFINED_SIZES.push(newSize);
      handleSizeToggle(customId);
      setCustomSize({ width: '', height: '' });
      setShowCustom(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Output Sizes
        </h3>
        <button
          onClick={handleSelectAll}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {selectedSizes.length === PREDEFINED_SIZES.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
        {PREDEFINED_SIZES.map((size) => (
          <div
            key={size.id}
            onClick={() => handleSizeToggle(size.id)}
            className={`
              flex items-center justify-between p-3 rounded-lg cursor-pointer
              transition-all duration-200 border
              ${selectedSizes.includes(size.id)
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {size.name}
                </span>
                {size.platform && (
                  <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                    {size.platform}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {size.dimensions.width} × {size.dimensions.height} • {size.ratio}
              </div>
            </div>
            <div className={`
              w-5 h-5 rounded border-2 flex items-center justify-center
              ${selectedSizes.includes(size.id)
                ? 'bg-blue-600 border-blue-600'
                : 'border-gray-300 dark:border-gray-600'
              }
            `}>
              {selectedSizes.includes(size.id) && (
                <IconCheck className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Size Option */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            + Add Custom Size
          </button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Width"
                value={customSize.width}
                onChange={(e) => setCustomSize({ ...customSize, width: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Height"
                value={customSize.height}
                onChange={(e) => setCustomSize({ ...customSize, height: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCustomSize}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Size
              </button>
              <button
                onClick={() => setShowCustom(false)}
                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedSizes.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {selectedSizes.length} size{selectedSizes.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}