'use client';

import { AppLayout } from '../app-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TEMPLATE_CATEGORIES = [
  { id: 'product', name: 'Product Showcase', icon: '📦' },
  { id: 'social', name: 'Social Media', icon: '📱' },
  { id: 'brand', name: 'Brand Story', icon: '🏢' },
  { id: 'event', name: 'Event Promo', icon: '🎉' },
  { id: 'tutorial', name: 'Tutorial', icon: '📚' },
];

const SAMPLE_TEMPLATES = [
  {
    id: '1',
    name: 'Product Hero Shot',
    category: 'product',
    description: 'Cinematic product reveal with dramatic lighting',
    content: {
      subject: 'Sleek product floating in minimal space, rotating slowly',
      style: 'Ultra-modern, minimalist, high-end commercial aesthetic',
      composition: 'Center-framed product with negative space, slow zoom',
      lighting: 'Dramatic studio lighting with soft reflections',
      motion: 'Smooth 360-degree rotation, subtle floating motion',
      technical: '4K resolution, 60fps, shallow depth of field',
    },
  },
  {
    id: '2',
    name: 'Instagram Reel - Lifestyle',
    category: 'social',
    description: 'Vertical format lifestyle content for social media',
    content: {
      subject: 'Young person using product in everyday setting',
      style: 'Bright, vibrant, authentic lifestyle photography',
      composition: 'Handheld camera movement, dynamic angles',
      lighting: 'Natural daylight, golden hour warmth',
      motion: 'Quick cuts, energetic transitions',
      technical: 'Vertical 9:16, optimized for mobile viewing',
    },
  },
  {
    id: '3',
    name: 'Brand Story Intro',
    category: 'brand',
    description: 'Emotional brand narrative opening sequence',
    content: {
      subject: 'Brand elements transitioning through abstract scenes',
      style: 'Cinematic, emotional, premium brand aesthetic',
      composition: 'Wide establishing shots transitioning to details',
      lighting: 'Moody, atmospheric with color grading',
      motion: 'Smooth camera movements, parallax effects',
      technical: 'Cinematic 2.35:1 aspect ratio, film grain',
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

function TemplateCard({ template }: { template: any }) {
  const category = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);

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
        
        <Button className="w-full" variant="outline">
          Use Template
        </Button>
      </div>
    </Card>
  );
}