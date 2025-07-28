'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '../app-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TEMPLATE_CATEGORIES = [
  { id: 'sportsbook-fl', name: 'Sportsbook FL (40-65+)', icon: '🏈' },
  { id: 'icasino-nj', name: 'iCasino NJ', icon: '🎰' },
  { id: 'icasino-pa', name: 'iCasino PA', icon: '🎲' },
  { id: 'icasino-mi', name: 'iCasino MI', icon: '🎯' },
  { id: 'promotion', name: 'Promotions', icon: '🎁' },
  { id: 'all', name: 'All Templates', icon: '📱' },
];

const SAMPLE_TEMPLATES = [
  // Sportsbook FL Templates (40-65+ demographic)
  {
    id: '1',
    name: 'Florida Football Betting Experience',
    category: 'sportsbook-fl',
    description: 'Mature audience football betting showcase for Florida market',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Experienced bettor in comfortable Florida setting, reviewing NFL odds on tablet, Dolphins/Jaguars/Bucs highlights playing on TV',
      style: 'Premium, sophisticated, relatable to 40-65 demographic, warm Florida aesthetics',
      composition: {
        '1:1': 'Centered composition with bettor and device prominent, TV in background',
        '9:16': 'Vertical focus on app interface with bettor hands, TV glimpse at top'
      },
      lighting: 'Natural Florida sunlight through windows, warm interior lighting',
      motion: 'Smooth UI interactions, gentle camera movements, relaxed pacing',
      technical: 'HD quality, clear UI elements, Florida regulatory compliance visible',
    },
  },
  {
    id: '2',
    name: 'Golf Betting - Florida Masters',
    category: 'sportsbook-fl',
    description: 'Golf betting content for mature Florida audience',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Golf course views, PGA tour odds display, mature golfer checking bets on phone at clubhouse',
      style: 'Upscale Florida golf culture, sophisticated betting experience',
      composition: {
        '1:1': 'Split between golf course beauty shot and betting interface',
        '9:16': 'Phone-first view with golf course bokeh background'
      },
      lighting: 'Golden hour Florida sunshine, professional sports broadcast quality',
      motion: 'Elegant transitions, odds updates, golf swing slow-motion cuts',
      technical: 'Must show "21+ only in FL" disclaimer, responsible gaming message',
    },
  },
  {
    id: '3',
    name: 'Florida Sports Bar Experience',
    category: 'sportsbook-fl',
    description: 'Social sports betting for 40-65 demographic',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Mature friends at upscale Florida sports bar, multiple games on screens, mobile betting in social setting',
      style: 'Social, fun but sophisticated, age-appropriate entertainment',
      composition: {
        '1:1': 'Wide shot of social group with betting apps and TV screens',
        '9:16': 'Focus on individual using app with friends and TVs in background'
      },
      lighting: 'Warm bar ambiance with screen glow, Florida evening atmosphere',
      motion: 'Natural interactions, app demonstrations, celebration moments',
      technical: 'Florida geo-fence messaging, responsible social betting emphasis',
    },
  },
  
  // iCasino NJ Templates
  {
    id: '4',
    name: 'Atlantic City Jackpot Experience',
    category: 'icasino-nj',
    description: 'New Jersey online slots mega win moment',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Online slot game on mobile device with Atlantic City boardwalk view, massive jackpot win animation, NJ player celebrating at home',
      style: 'Jersey Shore vibes meet premium online gaming, authentic NJ atmosphere',
      composition: {
        '1:1': 'Device centered with NJ landmarks visible through window',
        '9:16': 'Full screen slot game with NJ location indicators'
      },
      lighting: 'Bright slot game graphics with natural NJ coastal light',
      motion: 'Reels spinning, jackpot explosion, confetti animation, winner reaction',
      technical: 'NJ Division of Gaming Enforcement compliance messaging, geo-location indicator',
    },
  },
  {
    id: '5',
    name: 'Garden State Blackjack Live',
    category: 'icasino-nj',
    description: 'Live dealer blackjack for NJ players',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Live dealer on screen dealing blackjack, NJ player at home with perfect hand, Atlantic City casino branding',
      style: 'Professional live casino with NJ authenticity, trustworthy and regulated',
      composition: {
        '1:1': 'Split screen dealer and player hand, NJ license visible',
        '9:16': 'Vertical live dealer stream with player controls below'
      },
      lighting: 'Professional studio lighting for dealer, cozy home setting for player',
      motion: 'Real-time card dealing, chip animations, winning hand reveal',
      technical: 'HD streaming quality, "Licensed in NJ" prominent, responsible gaming footer',
    },
  },
  
  // iCasino PA Templates
  {
    id: '6',
    name: 'Pennsylvania Slots Paradise',
    category: 'icasino-pa',
    description: 'PA-themed online slots experience',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'PA-themed slot game (Liberty Bell symbols), player in Pittsburgh or Philly setting, big win moment',
      style: 'Keystone State pride with modern online gaming, local authenticity',
      composition: {
        '1:1': 'Slot game with PA imagery, player environment visible',
        '9:16': 'Mobile-first slot interface with PA-specific elements'
      },
      lighting: 'Vibrant slot graphics, warm indoor Pennsylvania home setting',
      motion: 'Smooth reel spins, PA symbols aligning, celebration effects',
      technical: 'PA Gaming Control Board seal visible, state-specific responsible gaming',
    },
  },
  {
    id: '7',
    name: 'Pocono Poker Night Online',
    category: 'icasino-pa',
    description: 'Online poker for Pennsylvania players',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Online poker table with PA players avatars, Pocono mountains visible through window, winning poker hand',
      style: 'Sophisticated PA gaming culture, community feel with state pride',
      composition: {
        '1:1': 'Poker table overview with PA setting context',
        '9:16': 'Mobile poker interface with hand close-up'
      },
      lighting: 'Digital poker table glow, evening Pennsylvania ambiance',
      motion: 'Card animations, pot sliding to winner, chat reactions',
      technical: 'PA iGaming license prominent, geolocation verified indicator',
    },
  },
  
  // iCasino MI Templates
  {
    id: '8',
    name: 'Great Lakes Mega Spins',
    category: 'icasino-mi',
    description: 'Michigan online casino slot adventure',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Michigan-themed slot game with Great Lakes imagery, Detroit skyline view, player winning big on tablet',
      style: 'Pure Michigan meets modern iGaming, automotive city energy',
      composition: {
        '1:1': 'Tablet gameplay with Michigan backdrop elements',
        '9:16': 'Vertical slot game with MI-specific bonus features'
      },
      lighting: 'Bright slot animations with Michigan seasonal lighting',
      motion: 'Dynamic reel action, Michigan symbols cascading, bonus round entry',
      technical: 'Michigan Gaming Control Board compliance, Detroit/Lansing geo-targeting',
    },
  },
  {
    id: '9',
    name: 'Motor City Live Roulette',
    category: 'icasino-mi',
    description: 'Live casino roulette for Michigan market',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Live roulette wheel spinning, Michigan player placing bets from home, Detroit casino partnership branding',
      style: 'Motor City glamour meets accessible online gaming',
      composition: {
        '1:1': 'Roulette wheel prominent with betting interface below',
        '9:16': 'Vertical live stream optimized for mobile betting'
      },
      lighting: 'Casino floor lighting with cozy Michigan home contrast',
      motion: 'Ball spinning, number selection, chip placement animations',
      technical: 'MI online gaming regulations compliance, local responsible gaming resources',
    },
  },
  
  // More Sportsbook FL Templates (40-65+)
  {
    id: '10',
    name: 'Florida Racing Legends',
    category: 'sportsbook-fl',
    description: 'Horse racing and NASCAR betting for mature FL audience',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Gulfstream Park racing, NASCAR Daytona highlights, mature bettor studying racing form on tablet',
      style: 'Classic racing tradition meets modern betting convenience',
      composition: {
        '1:1': 'Racing action with betting interface overlay',
        '9:16': 'Mobile racing form with track action in background'
      },
      lighting: 'Bright Florida track lighting, sophisticated interior',
      motion: 'Horse racing footage, odds changes, form scrolling',
      technical: 'Florida pari-mutuel regulations visible, 40-65 demographic imagery',
    },
  },
  {
    id: '11',
    name: 'Retirement Community Game Day',
    category: 'sportsbook-fl',
    description: 'Active retirement sports betting in Florida',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Active retirees in Florida community center watching games, using betting apps together, social betting experience',
      style: 'Vibrant retirement lifestyle, social and engaging, age-positive',
      composition: {
        '1:1': 'Group setting with multiple devices and TV screens',
        '9:16': 'Individual focus with community atmosphere visible'
      },
      lighting: 'Bright Florida community center, natural light',
      motion: 'Natural interactions, app tutorials, group celebrations',
      technical: 'Large text UI elements, simplified betting interface showcase',
    },
  },
  {
    id: '12',
    name: 'Florida Fishing Tournament Bets',
    category: 'sportsbook-fl',
    description: 'Unique Florida sports betting opportunities',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Deep sea fishing tournament, boat captain checking odds, Florida Keys setting, unique betting markets',
      style: 'Authentic Florida outdoor lifestyle, adventurous mature audience',
      composition: {
        '1:1': 'Boat deck with ocean and betting app',
        '9:16': 'Mobile app focus with marine background'
      },
      lighting: 'Bright Florida sun, ocean reflections',
      motion: 'Ocean movement, app navigation, fish catch moments',
      technical: 'Weather-resistant device usage, Florida-specific betting options',
    },
  },
  
  // Additional iCasino Templates for balance
  {
    id: '13',
    name: 'Jersey Shore Bonus Rounds',
    category: 'icasino-nj',
    description: 'Beach-themed slot bonuses for NJ',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Beach-themed slot game with boardwalk symbols, bonus round with NJ landmarks, player at shore house',
      style: 'Fun Jersey Shore atmosphere, bright and engaging',
      composition: {
        '1:1': 'Slot game with ocean view window',
        '9:16': 'Full screen bonus round with NJ elements'
      },
      lighting: 'Bright beach day lighting, colorful slot graphics',
      motion: 'Wave animations, seagull symbols, bonus multipliers',
      technical: 'NJ DGE approved messaging, Atlantic City partnerships visible',
    },
  },
  {
    id: '14',
    name: 'Philly Freedom Spins',
    category: 'icasino-pa',
    description: 'Historic Philadelphia themed slots',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Liberty Bell slot machine, Philadelphia skyline view, PA player winning with historic symbols',
      style: 'Patriotic Pennsylvania pride, historical reverence with modern gaming',
      composition: {
        '1:1': 'Slot game with Philly landmarks framing',
        '9:16': 'Mobile slot with Independence Hall backdrop'
      },
      lighting: 'Warm historic building tones, bright slot animations',
      motion: 'Liberty Bell ringing, symbol cascades, fireworks win animation',
      technical: 'PA Gaming Control Board seal, Philadelphia geo-targeting',
    },
  },
  {
    id: '15',
    name: 'Great Lakes Fortune',
    category: 'icasino-mi',
    description: 'Michigan nature-themed casino games',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Nature-themed casino game with Michigan wildlife, Great Lakes scenery, outdoor enthusiast playing',
      style: 'Pure Michigan outdoor beauty meets online gaming excitement',
      composition: {
        '1:1': 'Game interface with Michigan nature photography',
        '9:16': 'Mobile gaming with lakeside view'
      },
      lighting: 'Natural Michigan lighting, golden hour on lakes',
      motion: 'Wildlife animations, water effects, seasonal changes',
      technical: 'Michigan-specific responsible gaming resources, local partnerships',
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
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            {TEMPLATE_CATEGORIES.filter(cat => cat.id !== 'all').map((category) => (
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

          {TEMPLATE_CATEGORIES.filter(cat => cat.id !== 'all').map((category) => (
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
  formats?: string[];
  content: {
    subject: string;
    style: string;
    composition: string | { [key: string]: string };
    lighting: string;
    motion?: string;
    technical: string;
  };
}

function TemplateCard({ template }: { template: TemplateData }) {
  const router = useRouter();
  const [selectedFormat, setSelectedFormat] = useState(template.formats?.[0] || '16:9');
  const category = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);

  const handleUseTemplate = () => {
    // Get composition for selected format
    const composition = typeof template.content.composition === 'object' 
      ? template.content.composition[selectedFormat] || template.content.composition['1:1']
      : template.content.composition;

    // Create query parameters with template data
    const params = new URLSearchParams({
      templateId: template.id,
      templateName: template.name,
      subject: template.content.subject,
      style: template.content.style,
      composition: composition,
      lighting: template.content.lighting,
      motion: template.content.motion || '',
      technical: template.content.technical,
      aspectRatio: selectedFormat
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
        
        {template.formats && template.formats.length > 0 && (
          <div className="flex gap-2">
            <span className="text-sm font-medium">Format:</span>
            <div className="flex gap-2">
              {template.formats.map((format) => (
                <Badge
                  key={format}
                  variant={selectedFormat === format ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedFormat(format)}
                >
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
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
          Use Template ({selectedFormat})
        </Button>
      </div>
    </Card>
  );
}