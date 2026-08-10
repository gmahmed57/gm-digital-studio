import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { UserProfile, UserRole } from '../types/auth';
import { clientService } from './clientService';
import { activityLogService } from './activityLogService';

export const authService = {
  async signIn(email: string, password?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    // 1. Authenticate with Supabase Auth API
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error('Authentication configuration is missing. Cannot authenticate.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid email address or password. Please check your credentials.');
    }

    const role = (data.user.app_metadata?.role as UserRole) || 'client';
    
    let userProfile: UserProfile;

    // 2. If role is client, strictly resolve profile from database public.clients table
    if (role === 'client') {
      const clients = await clientService.getClients();
      const matchedClient = clients.find((c) => c.email.toLowerCase() === cleanEmail);
      
      if (matchedClient) {
        if (matchedClient.status === 'inactive') {
          throw new Error('Your client portal account has been deactivated. Please contact support.');
        }
        userProfile = {
          id: matchedClient.id,
          email: matchedClient.email,
          fullName: matchedClient.fullName,
          role: 'client',
          company: matchedClient.company,
          avatarUrl: matchedClient.avatarUrl || '',
          phone: matchedClient.phone,
          createdAt: matchedClient.joinedDate,
        };
      } else {
        throw new Error('No client profile found matching this email address in the database.');
      }
    } else {
      let avatarUrl = data.user.user_metadata?.avatar_url || '';
      let fullName = data.user.user_metadata?.full_name || 'Studio Admin';

      try {
        if (role === 'author') {
          const { data: authorDb } = await supabase
            .from('authors')
            .select('name, avatar_url')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (authorDb) {
            if (authorDb.name) fullName = authorDb.name;
            if (authorDb.avatar_url) avatarUrl = authorDb.avatar_url;
          }
        } else {
          const { data: profileDb } = await supabase
            .from('profiles')
            .select('fullName, avatar_url')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (profileDb) {
            if (profileDb.fullName) fullName = profileDb.fullName;
            if (profileDb.avatar_url) avatarUrl = profileDb.avatar_url;
          }
        }
      } catch (err) {
        console.warn('Profile fetch during signIn notice:', err);
      }

      userProfile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        fullName,
        role,
        company: data.user.user_metadata?.company,
        avatarUrl,
      };
    }

    // Log sign-in activity to Supabase for ALL roles (Client, Admin, Author)
    activityLogService.logActivity({
      user_id: userProfile.id,
      user_name: userProfile.fullName,
      user_email: userProfile.email,
      user_role: userProfile.role,
      action: 'USER_LOGIN',
      entity_type: 'auth',
      entity_id: userProfile.id,
      details: `User ${userProfile.fullName} (${userProfile.role.toUpperCase()}) logged in successfully.`
    });

    return userProfile;
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
