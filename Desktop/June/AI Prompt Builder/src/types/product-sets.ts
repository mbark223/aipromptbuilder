export interface ProductSet {
  id: string;
  name: string;
  description?: string;
  baseImage: {
    url: string;
    filename: string;
    uploadedAt: Date;
  };
  variations: ProductVariation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariation {
  id: string;
  productSetId: string;
  name: string;
  imageUrl: string;
  parameters: VariationParameters;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface VariationParameters {
  prompt?: string;
  style?: string;
  backgroundColor?: string;
  lighting?: 'natural' | 'studio' | 'dramatic' | 'soft';
  angle?: 'front' | 'side' | 'three-quarter' | 'top' | 'detail';
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  environment?: 'studio' | 'outdoor' | 'lifestyle' | 'minimal';
  customSettings?: Record<string, any>;
}

export interface GenerateVariationsRequest {
  productSetId: string;
  baseImageUrl: string;
  variations: Array<{
    name: string;
    parameters: VariationParameters;
  }>;
}

export interface NanoBananaConfig {
  modelVersion: string;
  imageSize: number;
  numOutputs: number;
  guidanceScale: number;
  numInferenceSteps: number;
  seed?: number;
}

export const DEFAULT_NANO_BANANA_CONFIG: NanoBananaConfig = {
  modelVersion: "latest",
  imageSize: 1024,
  numOutputs: 1,
  guidanceScale: 7.5,
  numInferenceSteps: 50,
};

export const PRESET_VARIATIONS = {
  backgrounds: [
    { name: "White Studio", backgroundColor: "#FFFFFF", environment: "studio" as const },
    { name: "Gray Studio", backgroundColor: "#F5F5F5", environment: "studio" as const },
    { name: "Natural Outdoor", environment: "outdoor" as const, lighting: "natural" as const },
    { name: "Lifestyle Scene", environment: "lifestyle" as const },
  ],
  angles: [
    { name: "Front View", angle: "front" as const },
    { name: "Side View", angle: "side" as const },
    { name: "Three-Quarter View", angle: "three-quarter" as const },
    { name: "Detail Shot", angle: "detail" as const },
  ],
  seasonal: [
    { name: "Spring Collection", season: "spring" as const, lighting: "soft" as const },
    { name: "Summer Collection", season: "summer" as const, lighting: "natural" as const },
    { name: "Fall Collection", season: "fall" as const, lighting: "dramatic" as const },
    { name: "Winter Collection", season: "winter" as const, lighting: "studio" as const },
  ],
};