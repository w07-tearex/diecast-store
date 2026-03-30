export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  
  // App
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
} as const;

// Ensure required env vars are present
Object.entries(env).forEach(([key, value]) => {
  if (value === undefined) {
    console.error(`Missing critical environment variable: ${key}`);
  }
});
