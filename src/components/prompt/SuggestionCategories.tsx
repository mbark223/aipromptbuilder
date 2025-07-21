'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  SUBJECT_SUGGESTIONS, 
  MOTION_SUGGESTIONS, 
  TECHNICAL_SUGGESTIONS,
  ATMOSPHERE_SUGGESTIONS,
  COLOR_PALETTE_SUGGESTIONS 
} from '@/lib/bettingSuggestions';

interface SuggestionCategoriesProps {
  onSelectSuggestion: (category: string, suggestion: string) => void;
}

export function SuggestionCategories({ onSelectSuggestion }: SuggestionCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState('subjects');

  const categories = {
    subjects: {
      title: 'Subjects & Elements',
      items: SUBJECT_SUGGESTIONS,
      section: 'subject'
    },
    atmosphere: {
      title: 'Atmosphere & Mood',
      items: ATMOSPHERE_SUGGESTIONS,
      section: 'style'
    },
    motion: {
      title: 'Motion & Animation',
      items: MOTION_SUGGESTIONS,
      section: 'motion'
    },
    technical: {
      title: 'Technical Specs',
      items: TECHNICAL_SUGGESTIONS,
      section: 'technical'
    },
    colors: {
      title: 'Color Palettes',
      items: COLOR_PALETTE_SUGGESTIONS,
      section: 'style'
    }
  };

  const sportsbookSuggestions = [
    'Live betting action',
    'Parlay ticket win',
    'Championship odds',
    'Game day excitement',
    'Score celebration',
    'Underdog victory',
    'Stats overlay',
    'Betting slip success'
  ];

  const casinoSuggestions = [
    'Jackpot moment',
    'Dealer reveal',
    'Slot bonus round',
    'VIP experience',
    'Roulette spin',
    'Card shuffle',
    'Chip stack win',
    'Live casino action'
  ];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Quick Suggestions</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Popular Sportsbook Prompts</h4>
          <div className="flex flex-wrap gap-2">
            {sportsbookSuggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => onSelectSuggestion('subject', suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Popular iCasino Prompts</h4>
          <div className="flex flex-wrap gap-2">
            {casinoSuggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => onSelectSuggestion('subject', suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mt-6">
        <TabsList className="grid grid-cols-5 w-full">
          {Object.keys(categories).map((key) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {categories[key as keyof typeof categories].title}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {category.items.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs"
                  onClick={() => onSelectSuggestion(category.section, item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}