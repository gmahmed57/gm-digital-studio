import { supabase } from './supabase';
import type { UserProfile, UserRole } from '../types/auth';
import { clientService } from './clientService';
import avatar1 from '../assets/avatars/avatar-1.jpg';
import avatar3 from '../assets/avatars/avatar-3.jpg';

export const authService = {
  async signIn(email: string, password?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    // 1. Authenticate with Supabase Auth API
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data.user) {
        const role = (data.user.user_metadata?.role as UserRole) || 'admin';
        return {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          fullName: data.user.user_metadata?.full_name || 'Studio User',
          role,
          company: data.user.user_metadata?.company,
          avatarUrl: data.user.user_metadata?.avatar_url || (role === 'admin' ? avatar1 : avatar3),
        };
      }
    }

    // 2. Authenticate against Client Database Records
    const clients = await clientService.getClients();
    const matchedClient = clients.find((c) => c.email.toLowerCase() === cleanEmail);

    if (matchedClient) {
      if (matchedClient.status === 'inactive') {
        throw new Error('Your client portal account has been deactivated. Please contact GM Digital Studio support.');
      }

      // Check strictly against the exact initial password assigned by Admin
      if (matchedClient.portalPassword && password !== matchedClient.portalPassword) {
        throw new Error('Invalid portal password. Please check your credentials.');
      }

      return {
        id: matchedClient.id,
        email: matchedClient.email,
        fullName: matchedClient.fullName,
        role: 'client',
        company: matchedClient.company,
        avatarUrl: matchedClient.avatarUrl || avatar3,
        phone: matchedClient.phone,
        createdAt: matchedClient.joinedDate,
      };
    }

    // 3. Invalid Credentials Error
    throw new Error('Invalid email address or password. Please check your credentials.');
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
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        throw new Error(error.message || 'Failed to send reset email.');
      }
    }
    return true;
  }
};
