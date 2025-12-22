'use client';

import React, { useState } from 'react';
import { 
  IconTypography, 
  IconPalette, 
  IconAdjustments, 
  IconBrush,
  IconDownload,
  IconFilter
} from '@tabler/icons-react';

interface MultiSizeEditorProps {
  images: Record<string, string>;
  onApplyEdits: (edits: EditOptions) => void;
}

interface EditOptions {
  text?: {
    content: string;
    fontSize: number;
    color: string;
    position: { x: number; y: number };
  };
  filter?: string;
  adjustments?: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  overlay?: {
    color: string;
    opacity: number;
  };
}

export function MultiSizeEditor({ images, onApplyEdits }: MultiSizeEditorProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'filter' | 'adjust' | 'overlay'>('text');
  const [edits, setEdits] = useState<EditOptions>({
    text: {
      content: '',
      fontSize: 24,
      color: '#ffffff',
      position: { x: 50, y: 50 }
    },
    filter: 'none',
    adjustments: {
      brightness: 100,
      contrast: 100,
      saturation: 100
    },
    overlay: {
      color: '#000000',
      opacity: 0
    }
  });

  const handleApplyEdits = () => {
    onApplyEdits(edits);
  };

  const handleDownloadAll = () => {
    Object.entries(images).forEach(([size, imageUrl], index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `image-${size}.png`;
        link.click();
      }, index * 100);
    });
  };

  const tabs = [
    { id: 'text', label: 'Text', icon: IconTypography },
    { id: 'filter', label: 'Filters', icon: IconFilter },
    { id: 'adjust', label: 'Adjust', icon: IconAdjustments },
    { id: 'overlay', label: 'Overlay', icon: IconBrush }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`
                flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium
                transition-colors duration-200 border-b-2
                ${activeTab === id
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Text Editor */}
        {activeTab === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Text Content
              </label>
              <input
                type="text"
                value={edits.text?.content || ''}
                onChange={(e) => setEdits({
                  ...edits,
                  text: { ...edits.text!, content: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Enter text to overlay"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Font Size
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={edits.text?.fontSize || 24}
                  onChange={(e) => setEdits({
                    ...edits,
                    text: { ...edits.text!, fontSize: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{edits.text?.fontSize}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={edits.text?.color || '#ffffff'}
                  onChange={(e) => setEdits({
                    ...edits,
                    text: { ...edits.text!, color: e.target.value }
                  })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          </>
        )}

        {/* Filter Editor */}
        {activeTab === 'filter' && (
          <div className="space-y-2">
            {['none', 'grayscale', 'sepia', 'blur', 'brightness', 'vintage'].map((filter) => (
              <button
                key={filter}
                onClick={() => setEdits({ ...edits, filter })}
                className={`
                  w-full px-4 py-2 rounded-md text-left capitalize
                  ${edits.filter === filter
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>
        )}

        {/* Adjustments Editor */}
        {activeTab === 'adjust' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Brightness
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={edits.adjustments?.brightness || 100}
                onChange={(e) => setEdits({
                  ...edits,
                  adjustments: { ...edits.adjustments!, brightness: parseInt(e.target.value) }
                })}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{edits.adjustments?.brightness}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contrast
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={edits.adjustments?.contrast || 100}
                onChange={(e) => setEdits({
                  ...edits,
                  adjustments: { ...edits.adjustments!, contrast: parseInt(e.target.value) }
                })}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{edits.adjustments?.contrast}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Saturation
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={edits.adjustments?.saturation || 100}
                onChange={(e) => setEdits({
                  ...edits,
                  adjustments: { ...edits.adjustments!, saturation: parseInt(e.target.value) }
                })}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{edits.adjustments?.saturation}%</span>
            </div>
          </div>
        )}

        {/* Overlay Editor */}
        {activeTab === 'overlay' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Overlay Color
              </label>
              <input
                type="color"
                value={edits.overlay?.color || '#000000'}
                onChange={(e) => setEdits({
                  ...edits,
                  overlay: { ...edits.overlay!, color: e.target.value }
                })}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Opacity
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={(edits.overlay?.opacity || 0) * 100}
                onChange={(e) => setEdits({
                  ...edits,
                  overlay: { ...edits.overlay!, opacity: parseInt(e.target.value) / 100 }
                })}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{Math.round((edits.overlay?.opacity || 0) * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={handleApplyEdits}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Apply to All Sizes
        </button>
        <button
          onClick={handleDownloadAll}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <IconDownload className="h-4 w-4" />
          Download All Sizes
        </button>
      </div>
    </div>
  );
}