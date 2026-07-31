import { createClient } from '@supabase/supabase-js';
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
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration is missing. Cannot authenticate.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid email address or password. Please check your credentials.');
    }

    const role = (data.user.user_metadata?.role as UserRole) || 'admin';
    
    // If role is client, we use their ID from the clients table to match where messages/projects are assigned
    if (role === 'client') {
      const clients = await clientService.getClients();
      const matchedClient = clients.find((c) => c.email.toLowerCase() === cleanEmail);
      
      if (matchedClient) {
        if (matchedClient.status === 'inactive') {
          throw new Error('Your client portal account has been deactivated. Please contact support.');
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
      } else {
        throw new Error('No client profile found matching this email address.');
      }
    }

    return {
      id: data.user.id,
      email: data.user.email || cleanEmail,
      fullName: data.user.user_metadata?.full_name || 'Studio Admin',
      role,
      company: data.user.user_metadata?.company,
      avatarUrl: data.user.user_metadata?.avatar_url || avatar1,
    };
  },

  async adminCreateClientUser(email: string, password?: string): Promise<string> {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Create a secondary client just for user creation so we don't log out the Admin
    const adminAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    const { data, error } = await adminAuthClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          role: 'client'
        }
      }
    });

    if (error) {
      throw new Error(`Failed to provision auth user: ${error.message}`);
    }
    
    if (!data.user) {
      throw new Error('Failed to create authentication user.');
    }

    return data.user.id;
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
