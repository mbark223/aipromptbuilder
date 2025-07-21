'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from '../app-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TEMPLATE_CATEGORIES = [
  { id: 'sportsbook', name: 'Sportsbook', icon: '🏈' },
  { id: 'casino', name: 'iCasino', icon: '🎰' },
  { id: 'live', name: 'Live Casino', icon: '🎲' },
  { id: 'promotion', name: 'Promotions', icon: '🎁' },
  { id: 'winner', name: 'Winner Moments', icon: '🏆' },
  { id: 'social', name: 'Social Media', icon: '📱' },
];

const SAMPLE_TEMPLATES = [
  // Sportsbook Templates
  {
    id: '1',
    name: 'Live Betting Action',
    category: 'sportsbook',
    description: 'High-energy live sports betting showcase',
    content: {
      subject: 'Multiple sports in action with live odds ticker, betting slip animation',
      style: 'Sports broadcast energy with modern UI overlay, dynamic and exciting',
      composition: 'Split screen sports action and betting interface, dynamic transitions',
      lighting: 'Stadium floodlights mixed with digital UI glow',
      motion: 'Fast cuts between sports, odds updating in real-time, winning bet celebration',
      technical: '16:9 format, 30 seconds, suitable for social media and web',
    },
  },
  {
    id: '2',
    name: 'Parlay Winner Celebration',
    category: 'sportsbook',
    description: 'Epic multi-bet winning moment',
    content: {
      subject: 'Parlay ticket showing all legs hitting, confetti explosion, cash out moment',
      style: 'Championship celebration atmosphere with golden winner aesthetics',
      composition: 'Close-up on winning ticket transitioning to wide celebration shot',
      lighting: 'Dramatic spotlight with golden celebration lights',
      motion: 'Slow reveal of each winning leg, climactic celebration explosion',
      technical: '9:16 vertical for mobile, loop-ready for stories',
    },
  },
  {
    id: '3',
    name: 'Game Day Promo',
    category: 'sportsbook',
    description: 'Pre-game hype and betting opportunities',
    content: {
      subject: 'Stadium atmosphere, team logos, enhanced odds display, crowd energy',
      style: 'Electric pre-game energy with team colors and betting focus',
      composition: 'Aerial stadium shot zooming to odds display and app interface',
      lighting: 'Night game stadium lights with neon accent lighting',
      motion: 'Building energy, countdown timer, odds boost animation',
      technical: '1:1 square for social posts, 15 seconds with strong CTA',
    },
  },
  
  // iCasino Templates
  {
    id: '4',
    name: 'Mega Jackpot Win',
    category: 'casino',
    description: 'Slot machine massive jackpot moment',
    content: {
      subject: 'Slot reels aligning perfectly, jackpot explosion, coins cascading',
      style: 'Vegas luxury with golden jackpot aesthetics, premium celebration',
      composition: 'Tight on reels, pull back to reveal massive win amount',
      lighting: 'Jackpot spotlights, golden coin reflections, winner glow',
      motion: 'Reels spinning fast to slow-mo alignment, explosive celebration',
      technical: '16:9 HD, particle effects for coins, 20 seconds',
    },
  },
  {
    id: '5',
    name: 'Slot Bonus Feature',
    category: 'casino',
    description: 'Exciting bonus round activation',
    content: {
      subject: 'Bonus symbols landing, screen transformation, multiplier reveals',
      style: 'High-energy casino excitement with game-specific theme',
      composition: 'Full screen slot view with dynamic bonus round elements',
      lighting: 'Flashing bonus lights, colorful game-specific lighting',
      motion: 'Symbol animations, screen transitions, multiplier countup',
      technical: '9:16 mobile-first, seamless loop capability',
    },
  },
  {
    id: '6',
    name: 'Table Games Elegance',
    category: 'casino',
    description: 'Classic casino table game atmosphere',
    content: {
      subject: 'Blackjack perfect hand, roulette spin, poker royal flush reveal',
      style: 'Sophisticated casino elegance, James Bond aesthetic',
      composition: 'Multiple angle cuts: overhead table, close-up cards, player POV',
      lighting: 'Classic casino ambiance, focused table lighting',
      motion: 'Smooth card deals, chip slides, dramatic reveals',
      technical: '16:9 cinematic, 4K quality, 30fps for smoothness',
    },
  },
  
  // Live Casino Templates
  {
    id: '7',
    name: 'Live Dealer Experience',
    category: 'live',
    description: 'Premium live casino atmosphere',
    content: {
      subject: 'Professional dealer at luxury table, real-time game action, player interaction',
      style: 'Exclusive VIP room atmosphere, premium and trustworthy',
      composition: 'Multi-camera angles showing dealer, table, and UI elements',
      lighting: 'Professional studio lighting with elegant ambiance',
      motion: 'Smooth camera switches, natural dealer movements, card animations',
      technical: '16:9 HD streaming quality, 60fps for live feel',
    },
  },
  {
    id: '8',
    name: 'Game Show Excitement',
    category: 'live',
    description: 'Live game show winning moment',
    content: {
      subject: 'Wheel spinning, host excitement, multiplier reveal, winner celebration',
      style: 'TV game show energy with casino excitement',
      composition: 'Dynamic camera work, wheel close-ups, reaction shots',
      lighting: 'Bright studio lights with colorful wheel illumination',
      motion: 'Wheel spin slow-mo, number reveal, celebration sequence',
      technical: '16:9 broadcast quality, multiple camera angles',
    },
  },
  
  // Promotion Templates
  {
    id: '9',
    name: 'Welcome Bonus Reveal',
    category: 'promotion',
    description: 'New player welcome offer showcase',
    content: {
      subject: 'Bonus amount reveal, free spins animation, account credit visual',
      style: 'Exciting and welcoming, premium offer presentation',
      composition: 'Center-focused offer with supporting game imagery',
      lighting: 'Bright and inviting with bonus glow effects',
      motion: 'Number countup, gift unwrapping effect, CTA pulse',
      technical: 'Multi-format export, clear text readability, 15 seconds',
    },
  },
  {
    id: '10',
    name: 'Daily Promotions',
    category: 'promotion',
    description: 'Rotating daily offers showcase',
    content: {
      subject: 'Calendar animation, different daily offers, bonus variety display',
      style: 'Dynamic and fresh, emphasizing daily value',
      composition: 'Calendar flip or carousel showing different offers',
      lighting: 'Bright with color coding for different offer types',
      motion: 'Page turns, sliding transitions, offer highlights',
      technical: '1:1 and 9:16 formats, easily updatable template',
    },
  },
  
  // Winner Moments
  {
    id: '11',
    name: 'Big Winner Story',
    category: 'winner',
    description: 'Real winner testimonial style',
    content: {
      subject: 'Winner celebration, winning amount display, emotional moment',
      style: 'Authentic and emotional, documentary feel',
      composition: 'Portrait style with winning moment recreation',
      lighting: 'Natural with dramatic winner spotlight moments',
      motion: 'Slow-mo celebration, money count up, emotional reactions',
      technical: '16:9 testimonial format, subtitle ready',
    },
  },
  {
    id: '12',
    name: 'Winner Hall of Fame',
    category: 'winner',
    description: 'Multiple winners showcase',
    content: {
      subject: 'Gallery of winners, amounts won, variety of games',
      style: 'Prestigious and aspirational, wall of fame aesthetic',
      composition: 'Grid or carousel of winner moments and amounts',
      lighting: 'Gallery lighting with individual spotlights',
      motion: 'Smooth transitions between winners, amount reveals',
      technical: 'Adaptable to various formats, data-driven template',
    },
  },
  
  // Social Media
  {
    id: '13',
    name: 'Quick Bet Win - Stories',
    category: 'social',
    description: 'Snackable winning content for stories',
    content: {
      subject: 'Quick bet placement to win reveal, instant gratification',
      style: 'Fast-paced and exciting, mobile-first design',
      composition: 'Full screen mobile UI with dynamic elements',
      lighting: 'Bright UI with win celebration effects',
      motion: 'Tap animations, quick transitions, celebration burst',
      technical: '9:16 vertical, under 15 seconds, sound-off optimized',
    },
  },
  {
    id: '14',
    name: 'Tips & Predictions',
    category: 'social',
    description: 'Expert betting tips content',
    content: {
      subject: 'Stats display, expert analysis visualization, tip reveal',
      style: 'Professional sports analysis with modern graphics',
      composition: 'Data visualization with supporting footage',
      lighting: 'Clean and professional with data highlights',
      motion: 'Stats animation, percentage bars, prediction reveals',
      technical: 'Multiple formats, clear data presentation, 20-30 seconds',
    },
  },
];

export default function TemplatesPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Templates</h1>
          <p className="text-muted-foreground">
            Start with pre-built templates for common video types
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            {TEMPLATE_CATEGORIES.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_TEMPLATES.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          {TEMPLATE_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SAMPLE_TEMPLATES.filter((t) => t.category === category.id).map(
                  (template) => (
                    <TemplateCard key={template.id} template={template} />
                  )
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}

interface TemplateData {
  id: string;
  name: string;
  category: string;
  description: string;
  content: {
    subject: string;
    style: string;
    composition: string;
    lighting: string;
    motion?: string;
    technical: string;
  };
}

function TemplateCard({ template }: { template: TemplateData }) {
  const router = useRouter();
  const category = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);

  const handleUseTemplate = () => {
    // Create query parameters with template data
    const params = new URLSearchParams({
      templateId: template.id,
      templateName: template.name,
      subject: template.content.subject,
      style: template.content.style,
      composition: template.content.composition,
      lighting: template.content.lighting,
      motion: template.content.motion || '',
      technical: template.content.technical
    });
    
    // Navigate to the prompt builder page with template data in URL
    router.push(`/prompts?${params.toString()}`);
  };

  return (
    <Card className="p-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{template.name}</h3>
          <Badge variant="secondary">
            {category?.icon} {category?.name}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">{template.description}</p>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Style: </span>
            <span className="text-muted-foreground">{template.content.style}</span>
          </div>
          <div>
            <span className="font-medium">Technical: </span>
            <span className="text-muted-foreground">{template.content.technical}</span>
          </div>
        </div>
        
        <Button className="w-full" variant="outline" onClick={handleUseTemplate}>
          Use Template
        </Button>
      </div>
    </Card>
  );
}