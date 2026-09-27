import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const validSupabaseUrl = /^https?:\/\/[^\s/]+/.test(supabaseUrl)
	? supabaseUrl
	: 'https://placeholder.supabase.co';
const validSupabaseAnonKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(validSupabaseUrl, validSupabaseAnonKey);