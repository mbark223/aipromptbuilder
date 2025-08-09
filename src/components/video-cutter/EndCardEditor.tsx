'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface EndCard {
  text: string;
  backgroundColor: string;
  textColor: string;
  duration: number;
}

interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnailUrl?: string;
  endCard?: EndCard;
}

interface EndCardEditorProps {
  clips: VideoClip[];
  onUpdateClip: (clipId: string, updates: Partial<VideoClip>) => void;
}

const PRESET_COLORS = [
  { name: 'Black', bg: '#000000', text: '#FFFFFF' },
  { name: 'White', bg: '#FFFFFF', text: '#000000' },
  { name: 'Brand Blue', bg: '#2563EB', text: '#FFFFFF' },
  { name: 'Brand Red', bg: '#DC2626', text: '#FFFFFF' },
  { name: 'Brand Green', bg: '#16A34A', text: '#FFFFFF' },
  { name: 'Dark Gray', bg: '#1F2937', text: '#FFFFFF' },
];

const PRESET_TEXTS = [
  'Swipe Up to Learn More',
  'Visit Our Website',
  'Limited Time Offer',
  'Shop Now',
  'Sign Up Today',
  'Get Started',
  'Learn More',
  'Join Now',
];

export function EndCardEditor({ clips, onUpdateClip }: EndCardEditorProps) {
  const { toast } = useToast();
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [endCardText, setEndCardText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [duration, setDuration] = useState(2);
  const [applyToAll, setApplyToAll] = useState(false);

  const selectedClip = clips.find(c => c.id === selectedClipId);

  const handleSelectClip = (clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    setSelectedClipId(clipId);
    if (clip.endCard) {
      setEndCardText(clip.endCard.text);
      setBackgroundColor(clip.endCard.backgroundColor);
      setTextColor(clip.endCard.textColor);
      setDuration(clip.endCard.duration);
    } else {
      // Reset to defaults
      setEndCardText('');
      setBackgroundColor('#000000');
      setTextColor('#FFFFFF');
      setDuration(2);
    }
  };

  const handleApplyEndCard = () => {
    if (!endCardText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter text for the end card',
        variant: 'destructive',
      });
      return;
    }

    const endCard: EndCard = {
      text: endCardText,
      backgroundColor,
      textColor,
      duration,
    };

    if (applyToAll) {
      clips.forEach(clip => {
        onUpdateClip(clip.id, { endCard });
      });
      toast({
        title: 'End cards applied',
        description: `Applied to all ${clips.length} clips`,
      });
    } else if (selectedClipId) {
      onUpdateClip(selectedClipId, { endCard });
      toast({
        title: 'End card applied',
        description: 'End card applied to selected clip',
      });
    }
  };

  const handleRemoveEndCard = () => {
    if (selectedClipId) {
      onUpdateClip(selectedClipId, { endCard: undefined });
      setEndCardText('');
      toast({
        title: 'End card removed',
        description: 'End card removed from selected clip',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Select Clip</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose a clip to add or edit its end card
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {clips.map((clip, index) => (
            <Button
              key={clip.id}
              variant={selectedClipId === clip.id ? 'default' : 'outline'}
              onClick={() => handleSelectClip(clip.id)}
              className="relative"
            >
              Clip {index + 1}
              {clip.endCard && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full">
                  ✓
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {selectedClipId && (
        <>
          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="end-card-text">End Card Text</Label>
              <Textarea
                id="end-card-text"
                value={endCardText}
                onChange={(e) => setEndCardText(e.target.value)}
                placeholder="Enter your end card message..."
                className="mt-2"
                rows={3}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESET_TEXTS.map((text) => (
                  <Button
                    key={text}
                    variant="ghost"
                    size="sm"
                    onClick={() => setEndCardText(text)}
                    className="text-xs"
                  >
                    {text}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Color Presets</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {PRESET_COLORS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBackgroundColor(preset.bg);
                      setTextColor(preset.text);
                    }}
                    className="justify-start"
                  >
                    <div
                      className="w-4 h-4 rounded mr-2 border"
                      style={{ backgroundColor: preset.bg }}
                    />
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="duration">End Card Duration</Label>
              <p className="text-sm text-muted-foreground mb-2">
                How long the end card appears (in seconds)
              </p>
              <div className="flex items-center gap-4">
                <Slider
                  id="duration"
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  min={1}
                  max={5}
                  step={0.5}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[50px] justify-center">
                  {duration}s
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-medium mb-4">Preview</h4>
            <div
              className="aspect-square rounded-lg flex items-center justify-center p-8 text-center"
              style={{
                backgroundColor,
                color: textColor,
              }}
            >
              <p className="text-2xl font-bold" style={{ color: textColor }}>
                {endCardText || 'Your end card text will appear here'}
              </p>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Apply to all clips</span>
            </label>

            <div className="flex gap-2">
              {selectedClip?.endCard && (
                <Button variant="outline" onClick={handleRemoveEndCard}>
                  Remove End Card
                </Button>
              )}
              <Button onClick={handleApplyEndCard}>
                <Icons.check className="mr-2 h-4 w-4" />
                Apply End Card
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}