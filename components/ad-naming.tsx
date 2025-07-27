'use client';

import { useState, useEffect } from 'react';
import { Calendar, Tag, User, Palette, Ruler, Building, Edit3, Plus, X, Save } from 'lucide-react';
import { useUserPreferences } from '@/lib/user-preferences-custom';

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
  const { 
    namingValues, 
    customOptions,
    setNamingValues: updateNamingValues,
    setCustomOptions,
    isAuthenticated,
    isLoading: preferencesLoading
  } = useUserPreferences();
  
  const setNamingValues = (values: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
    if (typeof values === 'function') {
      updateNamingValues(values(namingValues));
    } else {
      updateNamingValues(values);
    }
  };

  // Define initial naming elements - now editable
  const [namingElements, setNamingElements] = useState<NamingElement[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Initialize naming elements with custom options from user preferences
  useEffect(() => {
    if (!hasInitialized) {
      const defaultElements = [
        {
          id: 'partner',
          label: 'Partner',
          icon: <Building className="w-4 h-4" />,
          options: ['google', 'facebook', 'tiktok', 'snapchat', 'instagram', 'youtube', 'twitter'],
          placeholder: 'Select partner'
        },
        {
          id: 'jurisdiction',
          label: 'Jurisdiction',
          icon: <Building className="w-4 h-4" />,
          options: ['US', 'ON', 'NV', 'MI', 'PA', 'NJ', 'WV', 'IA', 'IN', 'IL', 'CO', 'TN', 'VA', 'AZ', 'CT', 'NY', 'UK', 'CA'],
          placeholder: 'Select jurisdiction'
        },
        {
          id: 'offer',
          label: 'Offer',
          icon: <Tag className="w-4 h-4" />,
          options: ['Bet/Get', 'DYW', 'BonusMatch', 'bonus', 'discount', 'freebets', 'cashback', 'welcome', 'deposit', 'noodeposit', 'loyalty'],
          placeholder: 'Select offer type'
        },
        {
          id: 'theme',
          label: 'Theme 1',
          icon: <Palette className="w-4 h-4" />,
          options: ['sale', 'launch', 'brand', 'product', 'seasonal', 'promo', 'awareness', 'reels'],
          placeholder: 'Select theme'
        },
        {
          id: 'theme2',
          label: 'Theme 2',
          icon: <Palette className="w-4 h-4" />,
          options: ['88Drums', 'Cleopatra', 'holiday', 'sports', 'gaming', 'finance', 'health', 'tech', 'lifestyle', 'entertainment'],
          placeholder: 'Select secondary theme'
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
          id: 'design',
          label: 'Design',
          icon: <User className="w-4 h-4" />,
          options: ['john', 'sarah', 'mike', 'emma', 'alex', 'lisa'],
          placeholder: 'Select design'
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
      ];
      
      // First, check if there are saved values that aren't in the default options
      const additionalOptions: Record<string, string[]> = {};
      
      // Add any saved values to the options
      Object.entries(namingValues).forEach(([key, value]) => {
        if (value && key !== 'date') {
          const element = defaultElements.find(el => el.id === key);
          if (element && !element.options.includes(value)) {
            additionalOptions[key] = [value];
          }
        }
      });
      
      // Merge custom options with default options and saved values
      const mergedElements = defaultElements.map(element => {
        const customData = customOptions[element.id];
        const savedOpts = additionalOptions[element.id] || [];
        
        let finalOptions = [...element.options];
        
        if (customData) {
          // Remove any removed default options
          if (customData.removed && customData.removed.length > 0) {
            finalOptions = finalOptions.filter(opt => !customData.removed.includes(opt));
          }
          // Add custom options
          if (customData.added && customData.added.length > 0) {
            finalOptions = [...finalOptions, ...customData.added];
          }
        }
        
        // Add any saved values that aren't in the list
        finalOptions = [...new Set([...finalOptions, ...savedOpts])];
        
        return {
          ...element,
          options: finalOptions
        };
      });
      
      console.log('Initialized naming elements with options:', mergedElements);
      console.log('Custom options state:', customOptions);
      setNamingElements(mergedElements);
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState<Record<string, string>>({});

  // Auto-populate today's date only after preferences load and only if no date exists
  useEffect(() => {
    if (!preferencesLoading && !namingValues.date) {
      const today = new Date().toISOString().split('T')[0];
      const dateFormatted = today.replace(/-/g, ''); // Convert YYYY-MM-DD to YYYYMMDD
      console.log('Auto-populating date:', dateFormatted);
      setNamingValues(prev => ({ ...prev, date: dateFormatted }));
    }
  }, [preferencesLoading]);

  // Debug: Log when naming values change
  useEffect(() => {
    console.log('Naming values updated:', namingValues);
    // Check if saved values exist in options
    Object.entries(namingValues).forEach(([key, value]) => {
      const element = namingElements.find(el => el.id === key);
      if (element && value && key !== 'date') {
        if (!element.options.includes(value)) {
          console.warn(`Saved value "${value}" for ${key} not found in options. Adding it.`);
          // Add the saved value to options if it doesn't exist
          setNamingElements(prev => prev.map(el => 
            el.id === key 
              ? { ...el, options: [...el.options, value] }
              : el
          ));
        }
      }
    });
  }, [namingValues, namingElements]);

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
    
    const cleanOption = newOption.toLowerCase().trim();
    
    setNamingElements(prev => {
      const updated = prev.map(element => 
        element.id === elementId 
          ? { ...element, options: [...element.options, cleanOption] }
          : element
      );
      
      // Save custom options (preserving removed status)
      const currentCustom = customOptions[elementId] || { added: [], removed: [] };
      // Only add if not already in the list
      const newAdded = currentCustom.added.includes(cleanOption) 
        ? currentCustom.added 
        : [...currentCustom.added, cleanOption];
        
      const newCustomOptions = {
        ...customOptions,
        [elementId]: {
          added: newAdded,
          removed: currentCustom.removed
        }
      };
      console.log('Saving custom options after add:', newCustomOptions);
      setCustomOptions(newCustomOptions);
      
      return updated;
    });
    
    setNewOptionInput(prev => ({ ...prev, [elementId]: '' }));
  };

  const removeOption = (elementId: string, optionToRemove: string) => {
    setNamingElements(prev => {
      const updated = prev.map(element => 
        element.id === elementId 
          ? { ...element, options: element.options.filter(option => option !== optionToRemove) }
          : element
      );
      
      // Update custom options to track removed items
      const defaultElements: Record<string, string[]> = {
        partner: ['google', 'facebook', 'tiktok', 'snapchat', 'instagram', 'youtube', 'twitter'],
        jurisdiction: ['US', 'ON', 'NV', 'MI', 'PA', 'NJ', 'WV', 'IA', 'IN', 'IL', 'CO', 'TN', 'VA', 'AZ', 'CT', 'NY', 'UK', 'CA'],
        offer: ['Bet/Get', 'DYW', 'BonusMatch', 'bonus', 'discount', 'freebets', 'cashback', 'welcome', 'deposit', 'noodeposit', 'loyalty'],
        theme: ['sale', 'launch', 'brand', 'product', 'seasonal', 'promo', 'awareness', 'reels'],
        theme2: ['88Drums', 'Cleopatra', 'holiday', 'sports', 'gaming', 'finance', 'health', 'tech', 'lifestyle', 'entertainment'],
        format: ['feed', 'story', 'banner', 'video', 'carousel', 'collection', 'reels'],
        size: ['square', 'landscape', 'portrait', 'banner', 'leaderboard', 'medium', 'vertical'],
        design: ['john', 'sarah', 'mike', 'emma', 'alex', 'lisa']
      };
      
      const currentCustom = customOptions[elementId] || { added: [], removed: [] };
      const defaultOpts = defaultElements[elementId] || [];
      
      // Check if it's a default option being removed
      if (defaultOpts.includes(optionToRemove)) {
        // Add to removed list if not already there
        const newRemoved = currentCustom.removed.includes(optionToRemove) 
          ? currentCustom.removed 
          : [...currentCustom.removed, optionToRemove];
          
        const newCustomOptions = {
          ...customOptions,
          [elementId]: {
            added: currentCustom.added,
            removed: newRemoved
          }
        };
        console.log('Removing default option:', optionToRemove, 'New custom options:', newCustomOptions);
        setCustomOptions(newCustomOptions);
      } else {
        // It's a custom option - remove from added list
        const newCustomOptions = {
          ...customOptions,
          [elementId]: {
            added: currentCustom.added.filter(opt => opt !== optionToRemove),
            removed: currentCustom.removed
          }
        };
        console.log('Removing custom option:', optionToRemove, 'New custom options:', newCustomOptions);
        setCustomOptions(newCustomOptions);
      }
      
      return updated;
    });
    
    // Clear the value if the removed option was selected
    if (namingValues[elementId] === optionToRemove) {
      handleValueChange(elementId, '');
    }
  };

  const handleValueChange = (elementId: string, value: string) => {
    // Don't update if preferences are still loading
    if (preferencesLoading) return;
    
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3">
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
                    key={`${element.id}-${namingValues[element.id] || 'empty'}`}
                    value={namingValues[element.id] || ''}
                    data-testid={`select-${element.id}`}
                    onChange={(e) => {
                      console.log(`Changing ${element.id} from "${namingValues[element.id]}" to "${e.target.value}"`);
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
                  <div className="flex items-center space-x-2 w-full">
                    <input
                      type="text"
                      value={newOptionInput[element.id] || ''}
                      onChange={(e) => setNewOptionInput(prev => ({ 
                        ...prev, 
                        [element.id]: e.target.value 
                      }))}
                      placeholder="Add new option..."
                      className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addOption(element.id, newOptionInput[element.id] || '');
                        }
                      }}
                    />
                    <button
                      onClick={() => addOption(element.id, newOptionInput[element.id] || '')}
                      className="flex-shrink-0 p-1 text-green-500 hover:text-green-700"
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Generated Filename Preview:</h3>
            {isAuthenticated && (
              <span className="text-xs text-green-600">✓ Preferences saved to account</span>
            )}
          </div>
          <div className="font-mono text-sm bg-white p-2 rounded border break-all overflow-x-auto max-w-full">
            {generatePreview()}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Format: partner_jurisdiction_offer_theme1_theme2_format_size_design_date
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