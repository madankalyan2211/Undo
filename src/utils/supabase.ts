import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

export const SUPABASE_URL = 'https://qrmypgxmyeqsspjnsuan.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybXlwZ3hteWVxc3Nwam5zdWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTY1NDQsImV4cCI6MjEwMTA5MjU0NH0.lfEvfk6iOe5KZP__BOhoFL_bHS4aAyFxFbHyoR7xKfg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export function mapSupabaseUserToProfile(user: any): UserProfile {
  const email = user.email || '';
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.user_name ||
    (email ? email.split('@')[0] : 'Google User');

  return {
    id: user.id,
    email,
    name,
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
    authProvider: 'google',
    isPlusMember: !!user.user_metadata?.isPlusMember,
    plusTier: user.user_metadata?.plusTier || undefined,
    createdAt: Date.now(),
  };
}
