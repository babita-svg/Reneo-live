import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Fallback dummy URL and Key for development / evaluation preview if env not set
const defaultUrl = supabaseUrl || 'https://placeholder-supabase.supabase.co';
const defaultKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(defaultUrl, defaultKey);
