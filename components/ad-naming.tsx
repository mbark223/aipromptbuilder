'use client';

import { useState, useEffect } from 'react';
import { Calendar, Tag, User, Palette, Ruler, Building, Edit3, Plus, X, Save } from 'lucide-react';

interface NamingElement {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: string[];
  placeholder?: string;
}

interface AdNamingProps {
  onNameChange: (name: string) => void;
  className?: string;
}

export function AdNaming({ onNameChange, className }: AdNamingProps) {
  const [namingValues, setNamingValues] = useState<Record<string, string>>({});

  // Define initial naming elements - now editable
  const [namingElements, setNamingElements] = useState<NamingElement[]>([
    {
      id: 'partner',
      label: 'Partner',
      icon: <Building className="w-4 h-4" />,
      options: ['google', 'facebook', 'tiktok', 'snapchat', 'instagram', 'youtube', 'twitter', 'meta'],
      placeholder: 'Select partner'
    },
    {
      id: 'theme',
      label: 'Theme',
      icon: <Palette className="w-4 h-4" />,
      options: ['sale', 'launch', 'brand', 'product', 'seasonal', 'promo', 'awareness', 'reels'],
      placeholder: 'Select theme'
    },
    {
      id: 'format',
      label: 'Format',
      icon: <Tag className="w-4 h-4" />,
      options: ['feed', 'story', 'banner', 'video', 'carousel', 'collection', 'reels'],
      placeholder: 'Select format'
    },
    {
      id: 'size',
      label: 'Size',
      icon: <Ruler className="w-4 h-4" />,
      options: ['square', 'landscape', 'portrait', 'banner', 'leaderboard', 'medium', 'vertical'],
      placeholder: 'Select size'
    },
    {
      id: 'designer',
      label: 'Designer',
      icon: <User className="w-4 h-4" />,
      options: ['john', 'sarah', 'mike', 'emma', 'alex', 'lisa'],
      placeholder: 'Select designer'
    },
    {
      id: 'date',
      label: 'Date',
      icon: <Calendar className="w-4 h-4" />,
      options: [
        new Date().toISOString().split('T')[0].replace(/-/g, ''), // Today
        new Date(Date.now() - 86400000).toISOString().split('T')[0].replace(/-/g, ''), // Yesterday
        new Date(Date.now() + 86400000).toISOString().split('T')[0].replace(/-/g, '') // Tomorrow
      ],
      placeholder: 'Select date'
    }
  ]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState<Record<string, string>>({});

  // Auto-populate today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const dateFormatted = today.replace(/-/g, ''); // Convert YYYY-MM-DD to YYYYMMDD
    setNamingValues(prev => ({ ...prev, date: dateFormatted }));
  }, []);

  // Generate the ad name based on current values
  useEffect(() => {
    const parts = namingElements.map(element => 
      namingValues[element.id] || ''
    ).filter(Boolean);
    
    const adName = parts.join('_');
    onNameChange(adName);
  }, [namingValues, onNameChange, namingElements]);

  // Functions to manage editable options
  const addOption = (elementId: string, newOption: string) => {
    if (!newOption.trim()) return;
    
    setNamingElements(prev => prev.map(element => 
      element.id === elementId 
        ? { ...element, options: [...element.options, newOption.toLowerCase().trim()] }
        : element
    ));
    
    setNewOptionInput(prev => ({ ...prev, [elementId]: '' }));
  };

  const removeOption = (elementId: string, optionToRemove: string) => {
    setNamingElements(prev => prev.map(element => 
      element.id === elementId 
        ? { ...element, options: element.options.filter(option => option !== optionToRemove) }
        : element
    ));
  };

  const handleValueChange = (elementId: string, value: string) => {
    setNamingValues(prev => ({
      ...prev,
      [elementId]: elementId === 'date' ? value : value.toLowerCase().replace(/\s+/g, '_')
    }));
  };

  const generatePreview = () => {
    const parts = namingElements.map(element => 
      namingValues[element.id] || `[${element.label.toLowerCase()}]`
    );
    return parts.join('_');
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center space-x-2">
          <Tag className="w-5 h-5" />
          <span>Ad Naming</span>
        </h2>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-2 ${
            isEditMode 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {isEditMode ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{isEditMode ? 'Done Editing' : 'Edit Options'}</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Naming Elements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {namingElements.map((element) => (
            <div key={element.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                {element.icon}
                <span>{element.label}</span>
              </label>
              
              {element.id === 'date' ? (
                <input
                  type="date"
                  value={namingValues[element.id] ? 
                    namingValues[element.id].length === 8 ? 
                      `${namingValues[element.id].slice(0,4)}-${namingValues[element.id].slice(4,6)}-${namingValues[element.id].slice(6,8)}` :
                      namingValues[element.id] 
                    : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value.replace(/-/g, ''); // Store as YYYYMMDD
                    handleValueChange(element.id, dateValue);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="relative">
                  <select
                    value={namingValues[element.id] || ''}
                    onChange={(e) => {
                      if (e.target.value === '__add_custom__') {
                        const customValue = prompt(`Enter custom ${element.label.toLowerCase()}:`);
                        if (customValue && customValue.trim()) {
                          const cleanValue = customValue.toLowerCase().trim().replace(/\s+/g, '_');
                          addOption(element.id, cleanValue);
                          handleValueChange(element.id, cleanValue);
                        }
                      } else {
                        handleValueChange(element.id, e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{element.placeholder}</option>
                    {element.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    <option value="__add_custom__" className="text-blue-600 font-medium">
                      + Add Custom {element.label}
                    </option>
                  </select>
                </div>
              )}
              
              {/* Edit Mode Controls */}
              {isEditMode && element.id !== 'date' && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">
                    Manage {element.label} Options:
                  </h4>
                  
                  {/* Current Options */}
                  <div className="space-y-1 mb-3">
                    {element.options.map((option) => (
                      <div key={option} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{option}</span>
                        <button
                          onClick={() => removeOption(element.id, option)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove option"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add New Option */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newOptionInput[element.id] || ''}
                      onChange={(e) => setNewOptionInput(prev => ({ 
                        ...prev, 
                        [element.id]: e.target.value 
                      }))}
                      placeholder="Add new option..."
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addOption(element.id, newOptionInput[element.id] || '');
                        }
                      }}
                    />
                    <button
                      onClick={() => addOption(element.id, newOptionInput[element.id] || '')}
                      className="p-1 text-green-500 hover:text-green-700"
                      title="Add option"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Filename Preview:</h3>
          <div className="font-mono text-sm bg-white p-2 rounded border">
            {generatePreview()}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Format: partner_theme_format_size_designer_date
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setNamingValues(prev => ({ ...prev, date: today }));
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Use Today&apos;s Date
          </button>
          
          <button
            onClick={() => setNamingValues({})}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
} 