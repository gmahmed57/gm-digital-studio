import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { UserProfile, UserRole, SignInResult, MFAEnrollResult } from '../types/auth';
import { clientService } from './clientService';
import { activityLogService } from './activityLogService';

export const authService = {
  async signIn(email: string, password?: string): Promise<SignInResult> {
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

    // 3. Check if account has 2-Step Verification (MFA) enabled (Admin only)
    if (role === 'admin') {
      try {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData && aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          const verifiedFactor = factorsData?.totp?.find((f) => f.status === 'verified');
          if (verifiedFactor) {
            return {
              mfaRequired: true,
              factorId: verifiedFactor.id,
              tempUser: userProfile,
            };
          }
        }
      } catch (mfaCheckErr) {
        console.warn('MFA status verification notice on login:', mfaCheckErr);
      }
    }

    // Log sign-in activity to Supabase
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

    return {
      mfaRequired: false,
      user: userProfile,
    };
  },

  async verifyLoginMFA(factorId: string, code: string, userProfile: UserProfile): Promise<UserProfile> {
    const cleanCode = code.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6) {
      throw new Error('Please enter a valid 6-digit verification code.');
    }

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      throw new Error(challengeError.message || 'Failed to initiate 2-step verification challenge.');
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: cleanCode,
    });

    if (error) {
      throw new Error('Invalid verification code. Please check your Google Authenticator app and try again.');
    }

    // Log sign-in activity
    activityLogService.logActivity({
      user_id: userProfile.id,
      user_name: userProfile.fullName,
      user_email: userProfile.email,
      user_role: userProfile.role,
      action: 'USER_LOGIN',
      entity_type: 'auth',
      entity_id: userProfile.id,
      details: `User ${userProfile.fullName} (${userProfile.role.toUpperCase()}) completed 2-Step Verification.`
    });

    return userProfile;
  },

  async getMFAStatus(): Promise<{ enabled: boolean; factorId?: string; factorName?: string }> {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error || !data) return { enabled: false };

      const verified = data.totp?.find((f) => f.status === 'verified');
      if (verified) {
        return {
          enabled: true,
          factorId: verified.id,
          factorName: verified.friendly_name || 'Google Authenticator',
        };
      }
      return { enabled: false };
    } catch {
      return { enabled: false };
    }
  },

  async enrollMFA(friendlyName = 'Super Admin Device'): Promise<MFAEnrollResult> {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'GM Digital Studio',
      friendlyName,
    });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to generate 2FA enrollment credentials.');
    }

    return {
      id: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    };
  },

  async verifyMFAEnrollment(factorId: string, code: string): Promise<boolean> {
    const cleanCode = code.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6) {
      throw new Error('Please enter a valid 6-digit verification code.');
    }

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      throw new Error(challengeError.message || 'Failed to initiate verification.');
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: cleanCode,
    });

    if (error) {
      throw new Error('Invalid verification code. Please ensure your device time is synchronized and try again.');
    }

    return true;
  },

  async unenrollMFA(factorId: string): Promise<boolean> {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      throw new Error(error.message || 'Failed to disable Two-Factor Authentication.');
    }
    return true;
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
      const isPortal = typeof window !== 'undefined' && (window.location.hostname.includes('portal.') || window.location.hostname.includes('localhost'));
      const origin = isPortal ? window.location.origin : 'https://portal.gmdigitalstudio.app';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      });
      if (error) {
        throw new Error(error.message || 'Failed to send reset email.');
      }
    }
    return true;
  },

  async updatePassword(password: string): Promise<boolean> {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw new Error(error.message || 'Failed to update password.');
      }
    }
    return true;
  }
};
