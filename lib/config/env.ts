export type AIProvider = 'mock' | 'gemini' | 'openai';

export interface EnvConfig {
  isDemoMode: boolean;
  hasSupabase: boolean;
  hasAIProvider: boolean;
  aiProvider: AIProvider;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  aiApiKey?: string;
  aiModel?: string;
}

export const getEnvConfig = (): EnvConfig => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const aiProvider = (process.env.AI_PROVIDER as AIProvider) || 'mock';

  // Demo mode is the default. Supabase keys missing -> demo automatically.
  const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false' && !hasSupabase;

  const hasAIProvider =
    aiProvider !== 'mock' && Boolean(process.env.AI_API_KEY);

  return {
    isDemoMode,
    hasSupabase,
    hasAIProvider,
    aiProvider,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    aiApiKey: process.env.AI_API_KEY,
    aiModel: process.env.AI_MODEL,
  };
};

// Singleton — the single seam every factory/provider reads from.
export const env = getEnvConfig();