'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface PromptSectionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  suggestions?: string[];
}

export function PromptSection({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength = 500,
  suggestions = [],
}: PromptSectionProps) {
  const characterCount = value.length;
  const isNearLimit = maxLength && characterCount > maxLength * 0.8;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={label}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <span
          className={`text-xs ${
            isNearLimit ? 'text-amber-500' : 'text-muted-foreground'
          }`}
        >
          {characterCount}/{maxLength}
        </span>
      </div>
      
      <Textarea
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px] resize-y"
        maxLength={maxLength}
      />
      
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs text-muted-foreground mr-1">Suggestions:</span>
          {suggestions.map((suggestion, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                const separator = value ? ', ' : '';
                onChange(value + separator + suggestion);
              }}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}