import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qkbbaxcytipnibxswcbi.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYmJheGN5dGlwbmlieHN3Y2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDczNDM0NTEsImV4cCI6MTk2MjkxOTQ1MX0.QYm7L3Y_8Fzl_P7Z_Q_7Y_X_7Z_6X_5Y_4Z_3X_2Y_1Z';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type AuthUser = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
};
