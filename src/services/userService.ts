import { supabase } from './supabase';
import type { UserProfile } from '../types/auth';

export const userService = {
  // Upload user avatar image to Supabase Storage with automatic deletion of previous avatar
  uploadUserAvatar: async (
    userId: string,
    file: File,
    oldAvatarUrl?: string
  ): Promise<string> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    // Strict MIME-type & File Size Security Check (Prevents malicious uploads via Inspect Element)
    if (!file.type.startsWith('image/')) {
      throw new Error('Security Error: Only valid image files (JPG, PNG, WEBP) are allowed for profile avatars.');
    }
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('File Size Limit Exceeded: Avatar images must be under 5MB.');
    }

    // 1. Storage Cleanup: Delete old avatar file from 'avatars' bucket if present
    if (oldAvatarUrl && oldAvatarUrl.includes('/storage/v1/object/public/avatars/')) {
      try {
        const oldFileName = oldAvatarUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('avatars').remove([oldFileName]);
        }
      } catch (cleanupErr) {
        console.warn('Failed to delete old avatar image from storage:', cleanupErr);
      }
    }

    // 2. Upload to Supabase Storage 'avatars' bucket
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `avatar-${userId.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Avatar Upload Error:', uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  },

  // Update user profile in Supabase Database
  updateUserProfile: async (
    userEmail: string,
    profileData: Partial<UserProfile>
  ): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');

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
    } catch (clientErr) {
      console.warn('Supabase clients table update notice:', clientErr);
    }

    // Sync to public.profiles
    try {
      await supabase
        .from('profiles')
        .update({
          ...dbPayload,
          avatar_url: dbPayload.avatarUrl,
        })
        .eq('email', emailClean);
    } catch (profilesErr) {
      console.warn('Supabase profiles table update notice:', profilesErr);
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
    } catch (authorErr) {
      console.warn('Supabase authors table update notice:', authorErr);
    }

    // Sync to Supabase Auth metadata
    try {
      if (profileData.avatarUrl !== undefined || profileData.fullName) {
        const authMetaData: any = {};
        if (profileData.avatarUrl !== undefined) authMetaData.avatar_url = profileData.avatarUrl;
        if (profileData.fullName) authMetaData.full_name = profileData.fullName;
        await supabase.auth.updateUser({ data: authMetaData });
      }
    } catch (authErr) {
      console.warn('Supabase Auth metadata update notice:', authErr);
    }
  },

  // Update password in Supabase Auth with current password re-authentication verification
  updateUserPassword: async (userEmail: string, currentPassword: string, newPassword: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');

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

    // 2. Update password in Supabase Auth (passing both camelCase and snake_case properties to satisfy Supabase Auth GoTrue API requirements)
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
      console.error('Password update error:', error.message);
      throw error;
    }
  },
};
