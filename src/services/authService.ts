import { supabase } from './supabase';
import type { UserProfile, UserRole } from '../types/auth';

// Demo Mock Profiles for Instant Testing & Offline Capabilities
export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  admin: {
    id: 'usr-admin-001',
    email: 'admin@gmdigitalstudio.com',
    fullName: 'G. M. Ahmed',
    role: 'admin',
    company: 'GM Digital Studio',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    phone: '+1 (555) 019-2834',
    createdAt: '2026-01-15'
  },
  client: {
    id: 'usr-client-002',
    email: 'alex.morgan@nexus.tech',
    fullName: 'Alex Morgan',
    role: 'client',
    company: 'Nexus Tech Global',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    phone: '+1 (555) 482-9102',
    createdAt: '2026-03-10'
  }
};

export const authService = {
  async signIn(email: string, rolePreference?: UserRole): Promise<UserProfile> {
    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: 'password123',
        });
        if (!error && data.user) {
          return {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || 'Studio Member',
            role: (data.user.user_metadata?.role as UserRole) || rolePreference || 'client',
            avatarUrl: data.user.user_metadata?.avatar_url,
          };
        }
      }
    } catch (err) {
      console.warn('Supabase auth fallback active:', err);
    }

    const targetRole = rolePreference || (email.includes('admin') ? 'admin' : 'client');
    const profile = DEMO_PROFILES[targetRole];
    return {
      ...profile,
      email: email || profile.email
    };
  },

  async signOut(): Promise<void> {
    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  },

  async resetPassword(email: string): Promise<boolean> {
    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.warn('Reset password error:', err);
      return true;
    }
  }
};
