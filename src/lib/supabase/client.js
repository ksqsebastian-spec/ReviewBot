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
*/

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate that env variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env.local file.'
  );
}

// Create and export the Supabase client
// This is a singleton - the same instance is reused across your app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
