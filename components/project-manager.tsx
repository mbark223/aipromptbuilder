'use client';

import { useState } from 'react';
import { Save, FolderOpen, Trash2, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { projectManager, storage } from '@/lib/persistence';
import { cn } from '@/lib/utils';

interface ProjectManagerProps {
  className?: string;
}

export function ProjectManager({ className }: ProjectManagerProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProject = () => {
    try {
      const project = projectManager.loadProject();
      if (project) {
        showMessage('success', 'Project auto-saved successfully!');
      } else {
        showMessage('error', 'No project data to save');
      }
    } catch (error) {
      showMessage('error', 'Failed to save project');
    }
  };

  const handleExportProject = () => {
    try {
      const projectJson = projectManager.exportProject();
      const blob = new Blob([projectJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social_media_ad_project_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage('success', 'Project exported successfully!');
    } catch (error) {
      showMessage('error', 'Failed to export project');
    }
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectJson = e.target?.result as string;
        projectManager.importProject(projectJson);
        showMessage('success', 'Project imported successfully! Refresh the page to see changes.');
      } catch (error) {
        showMessage('error', 'Failed to import project. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
      try {
        storage.clear();
        projectManager.clearProject();
        showMessage('success', 'All data cleared successfully! Refresh the page to see changes.');
      } catch (error) {
        showMessage('error', 'Failed to clear data');
      }
    }
  };

  const currentProject = projectManager.loadProject();

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Save className="w-4 h-4" />
        <span>Project</span>
      </button>

      {showPanel && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Project Management</h3>
            
            {/* Current Project Info */}
            {currentProject && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700">Current Project</h4>
                <p className="text-sm text-gray-600">{currentProject.name}</p>
                <p className="text-xs text-gray-500">
                  Last saved: {new Date(currentProject.updatedAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleSaveProject}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Current Project</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportProject}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>

                <label className="flex items-center justify-center space-x-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportProject}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={handleClearData}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            </div>

            {/* Auto-save indicator */}
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <span>Auto-save enabled</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Your progress is automatically saved every 2 seconds
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowPanel(false)}
              className="mt-3 w-full px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Message notification */}
      {message && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg",
          message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        )}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}
    </div>
  );
} 