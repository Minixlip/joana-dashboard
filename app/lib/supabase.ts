// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or Anon Key is missing. Check your .env.local file."
  );
}

// Note: For a dashboard, you might later use the 'auth' schema options
// if you have specific requirements, but for basic auth, this is fine.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);