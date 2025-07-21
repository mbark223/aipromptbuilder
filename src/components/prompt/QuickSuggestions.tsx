'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function QuickSuggestions() {
  const quickPrompts = {
    trending: [
      'NFL Sunday betting action',
      'Slot jackpot celebration',
      'Live dealer blackjack',
      'Parlay ticket winner',
      'Casino welcome bonus',
      'Sports odds boost',
    ],
    sportsbook: [
      'Football touchdown celebration with odds overlay',
      'Basketball slam dunk with live betting ticker',
      'Soccer goal with in-play betting options',
      'Horse racing photo finish betting slip',
      'Multi-sport parlay ticket animation',
      'Championship odds comparison display',
    ],
    casino: [
      'Mega Moolah progressive jackpot win',
      'Roulette ball landing on winning number',
      'Blackjack perfect 21 hand reveal',
      'Slot bonus round with multipliers',
      'Poker royal flush dramatic reveal',
      'Baccarat high-stakes table action',
    ],
    live: [
      'Evolution Gaming studio atmosphere',
      'Crazy Time wheel spin moment',
      'Lightning Roulette multiplier strike',
      'Deal or No Deal live reveal',
      'Monopoly Live bonus round',
      'Live dealer interaction close-up',
    ],
  };

  const handleQuickAdd = (prompt: string) => {
    // This would need to be connected to the prompt builder
    console.log('Quick add:', prompt);
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Quick Start Ideas</h3>
      
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="sportsbook">Sports</TabsTrigger>
          <TabsTrigger value="casino">Casino</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
        </TabsList>

        {Object.entries(quickPrompts).map(([key, prompts]) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-2">
            {prompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left h-auto py-2 px-3"
                onClick={() => handleQuickAdd(prompt)}
              >
                <span className="text-xs line-clamp-2">{prompt}</span>
              </Button>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Pro Tip:</strong> Combine these ideas with specific brand elements, 
          colors, and CTAs for more effective prompts.
        </p>
      </div>
    </Card>
  );
}