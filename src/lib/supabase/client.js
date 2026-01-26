import { createClient } from '@supabase/supabase-js';

/*
  Supabase Browser Client

  WHY TWO CLIENTS?
  - Browser client (this file): Used in React components, runs in user's browser
  - Server client: Used in API routes, has elevated permissions

  The anon key is safe to expose in browser code because:
  1. It has limited permissions (defined by Row Level Security policies)
  2. It only allows operations you've explicitly permitted in Supabase

  NEXT_PUBLIC_ prefix:
  Next.js only exposes env variables starting with NEXT_PUBLIC_ to the browser.
  This is a security feature - other env vars stay server-side only.

  BUILD TIME NOTE:
  During Next.js build/prerender, env vars may not be available.
  We handle this gracefully to allow static generation to complete.
*/

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create the Supabase client only if env vars are available
// During build time, this may be null - pages should handle this gracefully
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to get supabase client with runtime validation
 * Use this in components that need guaranteed access
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase client not initialized. Check your environment variables.'
    );
  }
  return supabase;
}
