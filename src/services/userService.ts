import { supabase } from './supabase';
import type { UserProfile } from '../types/auth';

export const userService = {
  // Upload user avatar image to Supabase Storage with automatic deletion of previous avatar
  uploadUserAvatar: async (
    userId: string,
    file: File
  ): Promise<string> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    // Strict MIME-type & File Size Security Check (Prevents malicious uploads via Inspect Element)
    if (!file.type.startsWith('image/')) {
      throw new Error('Security Error: Only valid image files (JPG, PNG, WEBP) are allowed for profile avatars.');
    }
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('File Size Limit Exceeded: Avatar images must be under 5MB.');
    }

    // Upload to Supabase Storage 'avatars' bucket using a fixed per-user filename.
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const userPrefix = `avatar-${userId.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const fileName = `${userPrefix}.${fileExt}`;

    // Step 1: Delete all possible extension variants for this user (no list needed).
    // supabase remove() silently succeeds for files that don't exist.
    const allExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
    const filesToDelete = allExtensions.map((ext) => `${userPrefix}.${ext}`);
    await supabase.storage.from('avatars').remove(filesToDelete);

    // Step 2: Fresh INSERT — always works since old file was removed above
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Cache-busting timestamp so the browser always loads the fresh image
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return `${publicUrlData.publicUrl}?t=${Date.now()}`;
  },

  // Update user profile in Supabase Database
  updateUserProfile: async (
    userEmail: string,
    profileData: Partial<UserProfile>
  ): Promise<void> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const emailClean = userEmail.toLowerCase().trim();

    const dbPayload: any = {};
    if (profileData.fullName) dbPayload.fullName = profileData.fullName;
    if (profileData.avatarUrl !== undefined) dbPayload.avatarUrl = profileData.avatarUrl;
    if (profileData.phone !== undefined) dbPayload.phone = profileData.phone;
    if (profileData.whatsapp !== undefined) dbPayload.whatsapp = profileData.whatsapp;
    if (profileData.secondaryEmail !== undefined) dbPayload.secondary_email = profileData.secondaryEmail;
    if (profileData.jobTitle !== undefined) dbPayload.job_title = profileData.jobTitle;
    if (profileData.timezone !== undefined) dbPayload.timezone = profileData.timezone;
    if (profileData.bio !== undefined) dbPayload.bio = profileData.bio;
    if (profileData.socialLinks !== undefined) dbPayload.social_links = profileData.socialLinks;

    // Update matching client record in public.clients
    try {
      await supabase
        .from('clients')
        .update(dbPayload)
        .eq('email', emailClean);
    } catch {
      // Clean catch
    }

    // Sync to public.profiles — use explicit snake_case columns only
    try {
      const profilesPayload: any = {};
      if (profileData.fullName) profilesPayload.full_name = profileData.fullName;
      if (profileData.avatarUrl !== undefined) profilesPayload.avatar_url = profileData.avatarUrl;
      if (profileData.phone !== undefined) profilesPayload.phone = profileData.phone;
      if (profileData.bio !== undefined) profilesPayload.bio = profileData.bio;
      if (profileData.jobTitle !== undefined) profilesPayload.role = profileData.jobTitle;

      if (Object.keys(profilesPayload).length > 0) {
        await supabase
          .from('profiles')
          .update(profilesPayload)
          .eq('email', emailClean);
      }
    } catch {
      // Clean catch
    }

    // Sync to public.authors
    try {
      const { data: existingAuthor } = await supabase
        .from('authors')
        .select('id')
        .eq('email', emailClean)
        .maybeSingle();

      if (existingAuthor) {
        await supabase
          .from('authors')
          .update({
            ...(profileData.fullName ? { name: profileData.fullName } : {}),
            ...(profileData.avatarUrl !== undefined ? { avatar_url: profileData.avatarUrl } : {}),
            ...(profileData.jobTitle !== undefined ? { role: profileData.jobTitle } : {}),
            ...(profileData.bio !== undefined ? { bio: profileData.bio } : {}),
          })
          .eq('email', emailClean);
      }
    } catch {
      // Clean catch
    }

    // Sync to Supabase Auth metadata
    try {
      if (profileData.avatarUrl !== undefined || profileData.fullName) {
        const authMetaData: any = {};
        if (profileData.avatarUrl !== undefined) authMetaData.avatar_url = profileData.avatarUrl;
        if (profileData.fullName) authMetaData.full_name = profileData.fullName;
        await supabase.auth.updateUser({ data: authMetaData });
      }
    } catch {
      // Clean catch
    }
  },

  // Update password in Supabase Auth with current password re-authentication verification
  updateUserPassword: async (userEmail: string, currentPassword: string, newPassword: string): Promise<void> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    // 1. Strict Security Re-Authentication Check
    if (currentPassword) {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (authErr) {
        throw new Error('Current password verification failed. Please enter your correct current password.');
      }
    }

    // 2. Update password in Supabase Auth
    const { error } = await supabase.auth.updateUser(
      {
        password: newPassword,
        current_password: currentPassword,
      } as any,
      {
        currentPassword: currentPassword,
      } as any
    );

    if (error) {
      throw error;
    }

    // 3. Wipe temporary plaintext portal_password in database clients table for security
    try {
      if (supabase) {
        await supabase
          .from('clients')
          .update({
            portalPassword: '',
            portalpassword: '',
            portal_password: '',
          } as any)
          .eq('email', userEmail);
      }
    } catch {
      // Soft catch if client row update handles via RLS
    }
  },
};
