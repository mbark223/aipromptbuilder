'use client';

import { useState, useRef, useEffect } from 'react';
import { getPlatformsByCategory } from '@/lib/platform-configs';

import { cn } from '@/lib/utils';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { SelectedPlatform } from '@/types/platforms';

interface PlatformSelectorProps {
  selectedPlatforms: SelectedPlatform[];
  onSelectionChange: (selectedPlatforms: SelectedPlatform[]) => void;
  className?: string;
}

export function PlatformSelector({
  selectedPlatforms = [],
  onSelectionChange,
  className
}: PlatformSelectorProps) {
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const categories = [
    { id: 'social', name: 'Social Media', platforms: getPlatformsByCategory('social') },
    { id: 'professional', name: 'Professional', platforms: getPlatformsByCategory('professional') },
    { id: 'video', name: 'Video Platforms', platforms: getPlatformsByCategory('video') }
  ];

  const allPlatforms = categories.flatMap(cat => cat.platforms);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAddDropdown(false);
        setSelectedPlatformId('');
      }
    }

    if (showAddDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAddDropdown]);

  const addPlatformFormat = (platformId: string, formatId: string) => {
    const existingPlatformIndex = selectedPlatforms.findIndex(p => p.platformId === platformId);
    
    if (existingPlatformIndex === -1) {
      // Add new platform with this format
      onSelectionChange([...selectedPlatforms, { platformId, formatIds: [formatId] }]);
    } else {
      // Add format to existing platform if not already selected
      const platform = selectedPlatforms[existingPlatformIndex];
      if (!platform.formatIds.includes(formatId)) {
        const updatedPlatforms = [...selectedPlatforms];
        updatedPlatforms[existingPlatformIndex] = {
          ...platform,
          formatIds: [...platform.formatIds, formatId]
        };
        onSelectionChange(updatedPlatforms);
      }
    }
    
    // Reset dropdown state
    setShowAddDropdown(false);
    setSelectedPlatformId('');
  };

  const removePlatformFormat = (platformId: string, formatId: string) => {
    const platformIndex = selectedPlatforms.findIndex(p => p.platformId === platformId);
    if (platformIndex === -1) return;

    const platform = selectedPlatforms[platformIndex];
    const updatedFormatIds = platform.formatIds.filter(id => id !== formatId);
    
    if (updatedFormatIds.length === 0) {
      // Remove platform entirely if no formats left
      onSelectionChange(selectedPlatforms.filter(p => p.platformId !== platformId));
    } else {
      // Update platform with remaining formats
      const updatedPlatforms = [...selectedPlatforms];
      updatedPlatforms[platformIndex] = { ...platform, formatIds: updatedFormatIds };
      onSelectionChange(updatedPlatforms);
    }
  };

  const getTotalSelections = () => {
    return selectedPlatforms.reduce((total, platform) => total + platform.formatIds.length, 0);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddDropdown(!showAddDropdown);
  };

  const closeDropdown = () => {
    setShowAddDropdown(false);
    setSelectedPlatformId('');
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Select Platforms & Formats</h2>
          <div className="text-sm text-gray-500">
            {getTotalSelections()} formats selected across {selectedPlatforms.length} platforms
          </div>
        </div>

        {/* Selected Items Display */}
        {selectedPlatforms.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Selected Formats</h3>
            <div className="space-y-2">
              {selectedPlatforms.map(platform => {
                const platformConfig = allPlatforms.find(p => p.id === platform.platformId);
                if (!platformConfig) return null;

                return (
                  <div key={platform.platformId} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: platformConfig.brandColor }}
                      >
                        {platformConfig.icon}
                      </div>
                      <span className="font-medium text-sm text-blue-900">
                        {platformConfig.name}
                      </span>
                      <span className="text-xs text-blue-600">
                        ({platform.formatIds.length} formats)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-8">
                      {platform.formatIds.map(formatId => {
                        const format = platformConfig.formats[formatId];
                        if (!format) return null;

                        return (
                          <div
                            key={formatId}
                            className="flex items-center space-x-1 bg-white border border-blue-300 rounded-full px-2 py-1 text-xs"
                          >
                            <span>{format.dimensions.name}</span>
                            <button
                              onClick={() => removePlatformFormat(platform.platformId, formatId)}
                              className="text-blue-600 hover:text-red-600 transition-colors"
                              type="button"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add New Selection Dropdown */}
        <div className="space-y-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Platform & Format</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showAddDropdown && "rotate-180")} />
            </button>

            {showAddDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] max-h-96 overflow-hidden">
                <div className="p-4 space-y-4">
                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Platform
                    </label>
                    <select
                      value={selectedPlatformId}
                      onChange={(e) => setSelectedPlatformId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a platform...</option>
                      {categories.map(category => (
                        <optgroup key={category.id} label={category.name}>
                          {category.platforms.map(platform => (
                            <option key={platform.id} value={platform.id}>
                              {platform.icon} {platform.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Format Selection */}
                  {selectedPlatformId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Format
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(
                          allPlatforms.find(p => p.id === selectedPlatformId)?.formats || {}
                        ).map(([formatId, format]) => {
                          const isAlreadySelected = selectedPlatforms
                            .find(p => p.platformId === selectedPlatformId)
                            ?.formatIds.includes(formatId);

                          return (
                            <button
                              key={formatId}
                              onClick={() => addPlatformFormat(selectedPlatformId, formatId)}
                              disabled={isAlreadySelected}
                              type="button"
                              className={cn(
                                "w-full text-left p-3 rounded-md border transition-all",
                                isAlreadySelected
                                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{format.dimensions.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{format.description}</p>
                                </div>
                                <div className="text-right ml-2 flex-shrink-0">
                                  <p className="text-xs font-mono text-gray-600">
                                    {format.dimensions.width}×{format.dimensions.height}
                                  </p>
                                  <p className="text-xs text-gray-500">{format.dimensions.aspectRatio}</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                                <span>Max: {format.maxFileSize}MB</span>
                                <span className="truncate ml-2">{format.allowedFormats.join(', ')}</span>
                              </div>
                              {isAlreadySelected && (
                                <div className="mt-1 flex items-center space-x-1 text-green-600">
                                  <Check className="w-3 h-3" />
                                  <span className="text-xs">Already selected</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cancel Button */}
                  <div className="flex justify-end pt-2 border-t border-gray-200">
                    <button
                      onClick={closeDropdown}
                      type="button"
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 