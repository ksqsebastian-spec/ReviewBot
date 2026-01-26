import { createClient } from '@supabase/supabase-js';

/*
  Supabase Server Client (Admin)

  WHY A SEPARATE SERVER CLIENT?
  The service_role key bypasses Row Level Security (RLS) policies.
  This is needed for admin operations like:
  - Sending emails to all subscribers
  - Bulk data operations
  - Background jobs

  SECURITY: This key must NEVER be exposed to the browser.
  Only use this in:
  - API routes (src/app/api/...)
  - Server components (with 'use server')
  - Server actions

  The SUPABASE_SERVICE_ROLE_KEY env variable (no NEXT_PUBLIC_ prefix)
  is automatically hidden from browser code by Next.js.
*/

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Creates a Supabase client with admin privileges
 * Only call this in server-side code (API routes, server components)
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase server environment variables. Check your .env.local file.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      // Disable auto-refresh since this is server-side
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
