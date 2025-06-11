// src/lib/supabase/client.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (!supabaseUrl) {
  console.error("Error: Supabase URL is not defined. Please check your .env.local file for NEXT_PUBLIC_SUPABASE_URL.");
}
if (!supabaseAnonKey) {
  console.error("Error: Supabase Anon Key is not defined. Please check your .env.local file for NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized.");
  } catch (error) {
    console.error("CRITICAL: Error initializing Supabase client:", error);
    // supabase remains null
  }
} else {
  console.warn("Supabase client not initialized due to missing URL or Anon Key. App features requiring Supabase will not work.");
}

export { supabase }; // Export the client, which might be null
