// Configuration module for environment variables
// This ensures proper access to environment variables in both server and client

export const config = {
  lumaAI: {
    apiKey: process.env.NEXT_PUBLIC_LUMA_AI_API_KEY || '',
  },
  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN || '',
  },
} as const;

// Helper to check if Luma AI is configured
export const isLumaAIConfigured = () => !!config.lumaAI.apiKey;

// Helper to check if Replicate is configured
export const isReplicateConfigured = () => !!config.replicate.apiToken;