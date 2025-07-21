'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ConsistencySettings } from '@/types';

interface ConsistencyPanelProps {
  settings: ConsistencySettings;
  onSettingsChange: (settings: ConsistencySettings) => void;
}

const LOCKABLE_PARAMS = [
  'Style',
  'Lighting',
  'Color Palette',
  'Camera Angle',
  'Background',
  'Character Appearance',
  'Mood',
  'Time of Day',
];

export function ConsistencyPanel({ settings, onSettingsChange }: ConsistencyPanelProps) {
  const [newColor, setNewColor] = useState('#000000');
  const [newCharacterId, setNewCharacterId] = useState('');

  const toggleLockedParam = (param: string) => {
    const isLocked = settings.lockedParams.includes(param);
    const newParams = isLocked
      ? settings.lockedParams.filter((p) => p !== param)
      : [...settings.lockedParams, param];
    
    onSettingsChange({
      ...settings,
      lockedParams: newParams,
    });
  };

  const addColor = () => {
    if (!settings.colorPalette?.includes(newColor)) {
      onSettingsChange({
        ...settings,
        colorPalette: [...(settings.colorPalette || []), newColor],
      });
    }
  };

  const removeColor = (color: string) => {
    onSettingsChange({
      ...settings,
      colorPalette: settings.colorPalette?.filter((c) => c !== color) || [],
    });
  };

  const addCharacterId = () => {
    if (newCharacterId && !settings.characterIds?.includes(newCharacterId)) {
      onSettingsChange({
        ...settings,
        characterIds: [...(settings.characterIds || []), newCharacterId],
      });
      setNewCharacterId('');
    }
  };

  const removeCharacterId = (id: string) => {
    onSettingsChange({
      ...settings,
      characterIds: settings.characterIds?.filter((c) => c !== id) || [],
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Consistency Settings</h3>
      
      <div className="space-y-6">
        {/* Seed ID */}
        <div>
          <Label htmlFor="seedId">Seed/Reference ID</Label>
          <Input
            id="seedId"
            value={settings.seedId || ''}
            onChange={(e) =>
              onSettingsChange({ ...settings, seedId: e.target.value })
            }
            placeholder="Enter seed ID for consistent generation"
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use the same seed ID across prompts to maintain visual consistency
          </p>
        </div>

        <Separator />

        {/* Locked Parameters */}
        <div>
          <Label>Locked Parameters</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Select parameters to keep consistent across variations
          </p>
          <div className="flex flex-wrap gap-2">
            {LOCKABLE_PARAMS.map((param) => (
              <Badge
                key={param}
                variant={settings.lockedParams.includes(param) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleLockedParam(param)}
              >
                {param}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Color Palette */}
        <div>
          <Label>Color Palette</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-20 h-10"
            />
            <Input
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
            <Button size="sm" onClick={addColor}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {settings.colorPalette?.map((color) => (
              <div
                key={color}
                className="flex items-center gap-1 bg-secondary rounded-md px-2 py-1"
              >
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">{color}</span>
                <button
                  onClick={() => removeColor(color)}
                  className="text-muted-foreground hover:text-foreground ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Character IDs */}
        <div>
          <Label>Character IDs</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Add character IDs to maintain consistent appearances
          </p>
          <div className="flex gap-2">
            <Input
              value={newCharacterId}
              onChange={(e) => setNewCharacterId(e.target.value)}
              placeholder="Enter character ID"
              onKeyPress={(e) => e.key === 'Enter' && addCharacterId()}
            />
            <Button size="sm" onClick={addCharacterId}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {settings.characterIds?.map((id) => (
              <Badge key={id} variant="secondary">
                {id}
                <button
                  onClick={() => removeCharacterId(id)}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Style Reference */}
        <div>
          <Label htmlFor="styleRef">Style Reference</Label>
          <Input
            id="styleRef"
            value={settings.styleReference || ''}
            onChange={(e) =>
              onSettingsChange({ ...settings, styleReference: e.target.value })
            }
            placeholder="Reference image URL or style description"
            className="mt-2"
          />
        </div>
      </div>
    </Card>
  );
}