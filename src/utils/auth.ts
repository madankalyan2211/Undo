import { UserProfile } from '../types';
import { supabase, mapSupabaseUserToProfile } from './supabase';

const AUTH_USER_KEY = 'undo_auth_user_v1';

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed: UserProfile = JSON.parse(raw);
    if (
      parsed.email === 'writer@gmail.com' ||
      parsed.name === 'Mindful Writer' ||
      parsed.id?.startsWith('google_') ||
      parsed.id?.startsWith('supabase_google_')
    ) {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

export async function signInWithGoogle(): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Supabase OAuth error:', err);
    throw err;
  }
}

export async function signInWithCredentials(email: string, password: string): Promise<UserProfile> {
  // 1. Direct Reviewer Test Account for Razorpay & App Store Reviewers
  if (
    (email.trim().toLowerCase() === 'reviewer@undo.app' ||
     email.trim().toLowerCase() === 'test@undo.app' ||
     email.trim().toLowerCase() === 'razorpay@undo.app') &&
    password === 'UndoReview2026!'
  ) {
    const reviewerProfile: UserProfile = {
      id: 'reviewer_test_user_id',
      email: email.trim().toLowerCase(),
      name: 'Razorpay Reviewer',
      authProvider: 'google',
      isPlusMember: false,
      createdAt: Date.now(),
    };
    saveStoredUser(reviewerProfile);
    return reviewerProfile;
  }

  // 2. Supabase password login fallback
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    if (data.user) {
      const profile = mapSupabaseUserToProfile(data.user);
      saveStoredUser(profile);
      return profile;
    }
  } catch (err: any) {
    throw new Error(err.message || 'Invalid email or password');
  }

  throw new Error('Invalid email or password');
}

export function signInAsReviewer(): UserProfile {
  const reviewerProfile: UserProfile = {
    id: 'reviewer_demo_id',
    email: 'reviewer@undo.app',
    name: 'Razorpay Reviewer',
    authProvider: 'google',
    isPlusMember: false,
    createdAt: Date.now(),
  };
  saveStoredUser(reviewerProfile);
  return reviewerProfile;
}

export async function signOutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {}
  saveStoredUser(null);
  window.location.reload();
}

export function subscribeToAuthChanges(callback: (user: UserProfile | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const profile = mapSupabaseUserToProfile(session.user);
      saveStoredUser(profile);
      callback(profile);
    } else {
      const current = getStoredUser();
      if (current?.id?.startsWith('reviewer_')) {
        callback(current);
      } else {
        saveStoredUser(null);
        callback(null);
      }
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
