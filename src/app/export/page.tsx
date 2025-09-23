'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { usePromptStore } from '@/store/promptStore';
import { ExportConfig } from '@/types';

export default function ExportPage() {
  const { prompts, projects } = usePromptStore();
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    platform: 'veo',
    format: 'json',
    includeMetadata: false,
  });

  const handleSelectAll = () => {
    setSelectedPrompts(prompts.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPrompts([]);
  };

  const togglePromptSelection = (promptId: string) => {
    setSelectedPrompts(prev =>
      prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Default';
  };

  const generateExportData = () => {
    const selectedPromptData = prompts.filter(p => selectedPrompts.includes(p.id));
    
    switch (exportConfig.format) {
      case 'json':
        return JSON.stringify(
          selectedPromptData.map(prompt => ({
            title: prompt.title,
            prompt: Object.values(prompt.content).filter(v => v).join('. '),
            format: `${prompt.format.width}x${prompt.format.height}`,
            aspectRatio: prompt.format.aspectRatio,
            ...(exportConfig.includeMetadata && {
              seedId: prompt.consistency.seedId,
              lockedParams: prompt.consistency.lockedParams,
              colorPalette: prompt.consistency.colorPalette,
              tags: prompt.metadata.tags,
            }),
          })),
          null,
          2
        );
      
      case 'csv':
        const headers = ['Title', 'Prompt', 'Format', 'Aspect Ratio'];
        if (exportConfig.includeMetadata) {
          headers.push('Seed ID', 'Locked Params', 'Color Palette', 'Tags');
        }
        
        const rows = selectedPromptData.map(prompt => {
          const row = [
            `"${prompt.title}"`,
            `"${Object.values(prompt.content).filter(v => v).join('. ')}"`,
            `"${prompt.format.width}x${prompt.format.height}"`,
            `"${prompt.format.aspectRatio}"`,
          ];
          
          if (exportConfig.includeMetadata) {
            row.push(
              `"${prompt.consistency.seedId || ''}"`,
              `"${prompt.consistency.lockedParams.join(', ')}"`,
              `"${prompt.consistency.colorPalette?.join(', ') || ''}"`,
              `"${prompt.metadata.tags.join(', ')}"`,
            );
          }
          
          return row.join(',');
        });
        
        return [headers.join(','), ...rows].join('\n');
      
      case 'txt':
        return selectedPromptData
          .map(prompt => {
            const lines = [
              `Title: ${prompt.title}`,
              `Format: ${prompt.format.name} (${prompt.format.width}x${prompt.format.height})`,
              `Prompt: ${Object.values(prompt.content).filter(v => v).join('. ')}`,
            ];
            
            if (exportConfig.includeMetadata && prompt.consistency.seedId) {
              lines.push(`Seed ID: ${prompt.consistency.seedId}`);
            }
            
            return lines.join('\n');
          })
          .join('\n\n---\n\n');
      
      default:
        return '';
    }
  };

  const handleExport = () => {
    const data = generateExportData();
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompts-export-${Date.now()}.${exportConfig.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportData = generateExportData();

  return (
    <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Export Prompts</h1>
          <p className="text-muted-foreground">
            Export your prompts to different platforms and formats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Select Prompts</h3>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {prompts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No prompts available to export
                  </p>
                ) : (
                  prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPrompts.includes(prompt.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => togglePromptSelection(prompt.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{prompt.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {prompt.format.name}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getProjectName(prompt.projectId)}
                            </Badge>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedPrompts.includes(prompt.id)}
                          onChange={() => {}}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Export Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={exportConfig.platform}
                    onValueChange={(value) =>
                      setExportConfig({ ...exportConfig, platform: value as 'veo' | 'flows' | 'generic' })
                    }
                  >
                    <SelectTrigger id="platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veo">Veo</SelectItem>
                      <SelectItem value="flows">Flows</SelectItem>
                      <SelectItem value="generic">Generic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select
                    value={exportConfig.format}
                    onValueChange={(value) =>
                      setExportConfig({ ...exportConfig, format: value as 'json' | 'csv' | 'txt' })
                    }
                  >
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="txt">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="metadata"
                    checked={exportConfig.includeMetadata}
                    onChange={(e) =>
                      setExportConfig({
                        ...exportConfig,
                        includeMetadata: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="metadata">Include metadata</Label>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                onClick={handleExport}
                disabled={selectedPrompts.length === 0}
              >
                Export {selectedPrompts.length} Prompt{selectedPrompts.length !== 1 ? 's' : ''}
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Export Preview</h3>
              <Textarea
                value={exportData}
                readOnly
                className="font-mono text-xs h-[200px]"
                placeholder="Select prompts to see preview"
              />
            </Card>
          </div>
        </div>
    </div>
  );
}