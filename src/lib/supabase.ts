import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uwnlatmvvkywskbcwlla.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bmxhdG12dmt5d3NrYmN3bGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3OTc3ODUsImV4cCI6MjA4OTM3Mzc4NX0.euk0Qwmezdq7MKGWQUg-z85AgLXnXK5SX9VehAHgFJg';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type AuthUser = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
};
