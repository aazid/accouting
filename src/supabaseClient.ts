import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.warn('Supabase URL or Anon Key missing. Remote sync is disabled.');
}

const isValidUrl = (url: string | undefined) => {
    try {
        return url && url.startsWith('http') && url !== 'YOUR_SUPABASE_URL';
    } catch {
        return false;
    }
};

export const supabase = createClient(
    isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-project.supabase.co',
    supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' ? supabaseAnonKey : 'noop'
);
