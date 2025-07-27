'use client';

import { useState, useEffect } from 'react';
import { PlatformSelector } from '@/components/platform-selector';
import { FileUpload } from '@/components/ui/file-upload';
import { AdPreview } from '@/components/ad-preview';
import { ValidationPanel } from '@/components/validation-panel';
import { ExportPanel } from '@/components/export-panel';
import { AdNaming } from '@/components/ad-naming';
import { AdNamingDebug } from '@/components/ad-naming-debug';
import { AdContent, SelectedPlatform } from '@/types/platforms';
import { generateId } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Monitor, Settings, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  usePersistentPlatforms,
  usePersistentPreviewIndex,
  usePersistentSafetyZones,
  usePersistentAdName,
  fileManager,
  projectManager,
  useAutoSave
} from '@/lib/persistence';
import { ProjectManager } from '@/components/project-manager';
import { AuthButton } from '@/components/auth-button';

export default function Home() {
  // One-time cleanup of legacy Meta platform data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Clear any cached Meta platform data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('meta') || key.includes('Meta')) {
            try {
              const data = localStorage.getItem(key);
              if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                  const filtered = parsed.filter(item => 
                    item && item.platformId !== 'meta' && 
                    item.id !== 'meta' && 
                    item.name !== 'Meta'
                  );
                  if (filtered.length !== parsed.length) {
                    localStorage.setItem(key, JSON.stringify(filtered));
                  }
                }
              }
            } catch (e) {
              // If individual key fails, continue with others
              console.warn(`Failed to process localStorage key: ${key}`, e);
            }
          }
        });
      } catch (error) {
        // If localStorage access fails entirely, log but don't crash
        console.error('Failed to access localStorage:', error);
      }
    }
  }, []);

  const [selectedPlatforms, setSelectedPlatforms] = usePersistentPlatforms();
  const [currentPreviewIndex, setCurrentPreviewIndex] = usePersistentPreviewIndex();
  const [showSafetyZones, setShowSafetyZones] = usePersistentSafetyZones();
  const [adName, setAdName] = usePersistentAdName();
  const [content, setContent] = useState<AdContent>({
    id: generateId(),
    textOverlays: []
  });

  // Files are no longer persisted - they start fresh each session
  // (removed file loading on mount)

  // Auto-save project data whenever key state changes
  useAutoSave({
    selectedPlatforms,
    adName,
    textOverlays: content.textOverlays,
    showSafetyZones
  }, 'auto_save_project', 2000); // Save every 2 seconds

  // Auto-save to project manager
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      projectManager.autoSave({
        name: adName || 'Untitled Project',
        selectedPlatforms,
        adName,
        textOverlays: content.textOverlays,
        showSafetyZones,
        selectedExportFormats: ['png'] // Default, will be overridden by export panel
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [selectedPlatforms, adName, content.textOverlays, showSafetyZones]);

  const handleSelectionChange = (platforms: SelectedPlatform[]) => {
    setSelectedPlatforms(platforms);
    // Reset preview index if current selection is out of bounds
    if (currentPreviewIndex >= getAllCombinations(platforms).length) {
      setCurrentPreviewIndex(0);
    }
  };

  const handleFileSelect = async (file: File, duration?: number) => {
    // Files are not saved - they exist only in memory for the current session
    setContent(prev => ({
      ...prev,
      media: file,
      mediaType: file.type.startsWith('video/') ? 'video' : 'image',
      duration,
      // Keep legacy fields for backward compatibility
      image: file.type.startsWith('image/') ? file : undefined,
      video: file.type.startsWith('video/') ? file : undefined
    }));
  };

  const handleFileRemove = () => {
    // Remove file from localStorage
    fileManager.removeFile('current_media_file');
    
    setContent(prev => ({
      ...prev,
      media: undefined,
      mediaType: undefined,
      duration: undefined,
      image: undefined,
      video: undefined
    }));
  };

  // Get all platform-format combinations
  const getAllCombinations = (platforms: SelectedPlatform[]) => {
    const combinations: Array<{ platformId: string; formatId: string }> = [];
    platforms.forEach(platform => {
      platform.formatIds.forEach(formatId => {
        combinations.push({ platformId: platform.platformId, formatId });
      });
    });
    return combinations;
  };

  const allCombinations = getAllCombinations(selectedPlatforms);
  const currentCombination = allCombinations[currentPreviewIndex];

  const nextPreview = () => {
    setCurrentPreviewIndex((prev) => (prev + 1) % allCombinations.length);
  };

  const prevPreview = () => {
    setCurrentPreviewIndex((prev) => (prev - 1 + allCombinations.length) % allCombinations.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="relative">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎬 Social Media Ad Litmus
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Preview your ads across all major social platforms with safety zone validation. 
                Select multiple platforms and formats to test your creative across different placements.
              </p>
            </div>
            {/* Auth and Project Manager in top right */}
            <div className="absolute top-0 right-0 flex items-center space-x-4">
              <AuthButton />
              <ProjectManager />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Platform Selection & File Upload */}
          <div className="space-y-6">
            {/* Platform Selector */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <PlatformSelector
                selectedPlatforms={selectedPlatforms}
                onSelectionChange={handleSelectionChange}
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Creative</h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                currentFile={content.media instanceof File ? content.media : content.image instanceof File ? content.image : undefined}
                maxFileSize={150}
              />
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Preview Settings</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Safety Zones</h3>
                    <p className="text-sm text-gray-500">Show safety zone overlays</p>
                  </div>
                  <Switch
                    checked={showSafetyZones}
                    onCheckedChange={setShowSafetyZones}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Live Preview</h2>
                </div>
                {allCombinations.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevPreview}
                      disabled={allCombinations.length === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 min-w-0">
                      {allCombinations.length > 0 ? `${currentPreviewIndex + 1}/${allCombinations.length}` : '0/0'}
                    </span>
                    <button
                      onClick={nextPreview}
                      disabled={allCombinations.length === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {currentCombination ? (
                <div className="space-y-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      {currentCombination.platformId.charAt(0).toUpperCase() + currentCombination.platformId.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentCombination.formatId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  <AdPreview
                    platformId={currentCombination.platformId}
                    formatId={currentCombination.formatId}
                    content={content}
                    onContentChange={setContent}
                    showSafetyZones={showSafetyZones}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select platforms and formats to preview your ad</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Validation & Export */}
          <div className="space-y-6">
            {/* Validation Results */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ValidationPanel
                content={content}
                platformId={currentCombination?.platformId}
                formatId={currentCombination?.formatId}
                allCombinations={allCombinations}
              />
            </div>

            {/* Ad Naming */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <AdNamingDebug />
              <AdNaming
                onNameChange={setAdName}
              />
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ExportPanel
                content={content}
                platformId={currentCombination?.platformId}
                formatId={currentCombination?.formatId}
                allCombinations={allCombinations}
                adName={adName}
              />
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Selection Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platforms:</span>
                  <span className="font-medium">{selectedPlatforms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Formats:</span>
                  <span className="font-medium">{allCombinations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Text Overlays:</span>
                  <span className="font-medium">{content.textOverlays.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Image:</span>
                  <span className="font-medium">
                    {content.image ? '✓ Uploaded' : '✗ None'}
                  </span>
                </div>
              </div>
              
              {selectedPlatforms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Platforms:</h4>
                  <div className="space-y-1">
                    {selectedPlatforms.map(platform => (
                      <div key={platform.platformId} className="text-xs text-gray-600">
                        <span className="font-medium capitalize">{platform.platformId}</span>
                        <span className="text-gray-500"> ({platform.formatIds.length} formats)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}