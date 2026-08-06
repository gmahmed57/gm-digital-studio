import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { clientService } from '../../services/clientService';
import { supabase } from '../../services/supabase';
import type { ClientItem } from '../../types/client';
import SEO from '../../components/common/SEO';
import {
  User,
  Mail,
  Building,
  Phone,
  MessageSquare,
  Globe,
  Lock,
  Upload,
  Trash2,
  ShieldCheck,
  KeyRound,
  Clock,
  Briefcase,
  AlertCircle,
  Users,
  Search,
  ExternalLink,
  Eye,
  X,
} from 'lucide-react';

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="evenodd" clipRule="evenodd" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export function ProfileSettings() {
  const { user, updateAuthUser } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'clients' | 'security'>('profile');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState<string>(user?.fullName || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState<string>(user?.whatsapp || '');
  const [secondaryEmail, setSecondaryEmail] = useState<string>(user?.secondaryEmail || '');
  const [jobTitle, setJobTitle] = useState<string>(user?.jobTitle || '');
  const [timezone, setTimezone] = useState<string>(user?.timezone || 'UTC+0 (GMT)');
  const [bio, setBio] = useState<string>(user?.bio || '');

  // Social Links
  const [linkedin, setLinkedin] = useState<string>(user?.socialLinks?.linkedin || '');
  const [twitter, setTwitter] = useState<string>(user?.socialLinks?.twitter || '');
  const [instagram, setInstagram] = useState<string>(user?.socialLinks?.instagram || '');
  const [facebook, setFacebook] = useState<string>(user?.socialLinks?.facebook || '');
  const [github, setGithub] = useState<string>(user?.socialLinks?.github || '');
  const [website, setWebsite] = useState<string>(user?.socialLinks?.website || '');

  // Avatar DP Upload State
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  // Password Security State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Admin View Client Profiles State
  const [clientsList, setClientsList] = useState<ClientItem[]>([]);
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [selectedClientModal, setSelectedClientModal] = useState<ClientItem | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setWhatsapp(user.whatsapp || '');
      setSecondaryEmail(user.secondaryEmail || '');
      setJobTitle(user.jobTitle || '');
      setTimezone(user.timezone || 'UTC+0 (GMT)');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setLinkedin(user.socialLinks?.linkedin || '');
      setTwitter(user.socialLinks?.twitter || '');
      setInstagram(user.socialLinks?.instagram || '');
      setFacebook(user.socialLinks?.facebook || '');
      setGithub(user.socialLinks?.github || '');
      setWebsite(user.socialLinks?.website || '');
    }
  }, [user]);

  // Universal Profile Sync: fetch live data from authors, profiles, and clients tables
  useEffect(() => {
    if (!user || !user.email) return;
    const syncUserProfile = async () => {
      try {
        const cleanEmail = user.email.trim().toLowerCase();
        let freshAvatar = '';
        let freshName = '';
        let freshRole = '';
        let freshBio = '';

        // 1. Authors table check
        const { data: authorData } = await supabase
          .from('authors')
          .select('name, role, bio, avatar_url')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (authorData) {
          if (authorData.name) freshName = authorData.name;
          if (authorData.role) freshRole = authorData.role;
          if (authorData.bio) freshBio = authorData.bio;
          if (authorData.avatar_url) freshAvatar = authorData.avatar_url;
        }

        // 2. Profiles table check
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (profileData) {
          if (!freshName && profileData.fullName) freshName = profileData.fullName;
          if (!freshRole && profileData.job_title) freshRole = profileData.job_title;
          if (!freshBio && profileData.bio) freshBio = profileData.bio;
          if (!freshAvatar) freshAvatar = profileData.avatar_url || profileData.avatarUrl || '';
        }

        // 3. Clients table check
        const { data: clientData } = await supabase
          .from('clients')
          .select('fullName, job_title, bio, avatarUrl')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (clientData) {
          if (!freshName && clientData.fullName) freshName = clientData.fullName;
          if (!freshRole && clientData.job_title) freshRole = clientData.job_title;
          if (!freshBio && clientData.bio) freshBio = clientData.bio;
          if (!freshAvatar && clientData.avatarUrl) freshAvatar = clientData.avatarUrl;
        }

        // Apply to local form state
        if (freshName) setFullName(freshName);
        if (freshRole) setJobTitle(freshRole);
        if (freshBio) setBio(freshBio);
        if (freshAvatar) setAvatarUrl(freshAvatar);

        // Update AuthContext + localStorage
        const updates: Record<string, string> = {};
        if (freshName) updates.fullName = freshName;
        if (freshRole) updates.jobTitle = freshRole;
        if (freshBio) updates.bio = freshBio;
        if (freshAvatar) updates.avatarUrl = freshAvatar;
        if (Object.keys(updates).length > 0) updateAuthUser(updates);
      } catch (err) {
        console.warn('Profile Settings live sync notice:', err);
      }
    };
    syncUserProfile();
  }, [user?.email]);

  // Fetch clients directory for Admin
  useEffect(() => {
    if (isAdmin) {
      const fetchClientsData = async () => {
        setIsLoadingClients(true);
        try {
          const list = await clientService.getClients();
          setClientsList(list);
        } catch (err) {
          console.error('Failed to fetch client profiles directory:', err);
        } finally {
          setIsLoadingClients(false);
        }
      };
      fetchClientsData();
    }
  }, [isAdmin]);

  // Calculate Profile Completion Percentage
  const fields = [fullName, user?.email, user?.company, phone, whatsapp, jobTitle, bio, avatarUrl, linkedin];
  const filledFieldsCount = fields.filter((f) => Boolean(f && f.trim())).length;
  const completionPercentage = Math.round((filledFieldsCount / fields.length) * 100);

  // Handle Avatar Image Selection & Storage Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const uploadedUrl = await userService.uploadUserAvatar(user.id, file, avatarUrl);
      setAvatarUrl(uploadedUrl);

      await userService.updateUserProfile(user.email, { avatarUrl: uploadedUrl });
      updateAuthUser({ avatarUrl: uploadedUrl });

      setSuccessMessage('Profile avatar updated successfully!');
    } catch (err: any) {
      setErrorMessage(`Avatar Upload Failed: ${err.message || 'Storage error'}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Remove Avatar DP
  const handleRemoveAvatar = async () => {
    if (!user) return;
    setIsUploadingAvatar(true);
    try {
      await userService.updateUserProfile(user.email, { avatarUrl: '' });
      setAvatarUrl('');
      updateAuthUser({ avatarUrl: undefined });
      setSuccessMessage('Profile picture removed.');
    } catch (err: any) {
      setErrorMessage(`Failed to remove avatar: ${err.message}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const socialLinks = { linkedin, twitter, instagram, facebook, github, website };
      const profilePayload = {
        fullName,
        phone,
        whatsapp,
        secondaryEmail,
        jobTitle,
        timezone,
        bio,
        socialLinks,
      };

      await userService.updateUserProfile(user.email, profilePayload);
      updateAuthUser(profilePayload);

      setSuccessMessage('Your profile and contact preferences have been saved successfully!');
    } catch (err: any) {
      setErrorMessage(`Failed to save profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Update via Supabase Auth
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage('Security Error: Please enter your current password to verify identity.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await userService.updateUserPassword(user?.email || '', currentPassword, newPassword);
      setSuccessMessage('Password verified and changed successfully! Next time you log in, please use your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(`Password Update Failed: ${err.message || 'Authentication error'}`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Filter clients list for Admin
  const filteredClients = clientsList.filter((c) => {
    const q = clientSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.fullName || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.jobTitle || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.whatsapp || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      <SEO
        title="My Profile & Settings - GM Digital Studio"
        description="Manage your profile identity, avatar picture, contact details, and account security settings."
      />

      <div className="max-w-5xl mx-auto space-y-6 font-sans pb-12">
        {/* Banner Header Card with Centered Circular Avatar */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            {/* Centered Circular Avatar DP */}
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-brand-500/80 shadow-md bg-gray-100 dark:bg-dark-surface flex items-center justify-center mx-auto">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.fullName}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <span className="text-3xl font-heading font-extrabold text-brand-600 dark:text-brand-400">
                    {(user?.fullName || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  disabled={isUploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
                  {user?.fullName || 'My Account'}
                </h1>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                  {user?.role === 'admin' ? 'Studio Administrator' : 'Verified Client'}
                </span>
              </div>

              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {user?.company ? `${user.company} • ` : ''} {user?.email}
              </p>

              {/* Avatar Actions */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                {isUploadingAvatar && (
                  <span className="text-xs font-semibold text-brand-600 animate-pulse">
                    Uploading & updating avatar picture...
                  </span>
                )}
                {avatarUrl && !isUploadingAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Picture
                  </button>
                )}
              </div>

              {/* Profile Completion Bar */}
              <div className="pt-3 max-w-md">
                <div className="flex items-center justify-between text-xs mb-1 font-semibold text-gray-500">
                  <span>Profile Strength</span>
                  <span className="font-extrabold text-brand-600">{completionPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback Notifications */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-dark-border space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Profile & Contact Info
          </button>

          {/* Admin sees Client Profiles tab; Client sees Social Accounts tab */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setActiveTab('clients')}
              className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'clients'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Client Profiles Directory
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('social')}
              className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'social'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Social Profiles & Accounts
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'security'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Security & Password
          </button>
        </div>

        {/* Tab 1: Profile & Contact Info Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
            <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" /> Account Identity & Contact Settings
            </h2>

            {/* Locked Credentials Callout */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" /> {isAdmin ? 'Administrator Account Security Policy' : 'Primary Credentials Security Notice'}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {isAdmin
                  ? 'Administrator identity, primary email, and superadmin role permissions are protected to preserve root platform authority.'
                  : 'Primary Email, Company Name, and Account Role are locked for security compliance. Contact studio support to request organization record changes.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Primary Email (Locked) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  Primary Email <Lock className="w-3 h-3 text-gray-400" />
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-surface/60 text-gray-500 dark:text-gray-400 text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Organization / Company (Locked) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  Company / Organization <Lock className="w-3 h-3 text-gray-400" />
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={user?.company || 'GM Digital Studio'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-surface/60 text-gray-500 dark:text-gray-400 text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                />
              </div>

              {/* Job Title / Role */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Job Title / Position
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. VP of Product Engineering"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>

              {/* Direct Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Direct Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>

              {/* Secondary Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Secondary / Billing Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={secondaryEmail}
                    onChange={(e) => setSecondaryEmail(e.target.value)}
                    placeholder="e.g. billing@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Timezone / Region
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all cursor-pointer"
                  >
                    <option value="UTC-8 (PST)">UTC-8 (Pacific Time - PST)</option>
                    <option value="UTC-5 (EST)">UTC-5 (Eastern Time - EST)</option>
                    <option value="UTC+0 (GMT)">UTC+0 (London - GMT/BST)</option>
                    <option value="UTC+1 (CET)">UTC+1 (Central Europe - CET)</option>
                    <option value="UTC+4 (GST)">UTC+4 (Dubai - GST)</option>
                    <option value="UTC+5 (PKT)">UTC+5 (Pakistan Standard Time - PKT)</option>
                    <option value="UTC+5:30 (IST)">UTC+5:30 (India Standard Time - IST)</option>
                    <option value="UTC+8 (SGT)">UTC+8 (Singapore - SGT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bio / About */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Bio / Personal Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short bio or notes..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2 for CLIENT: Social Media Accounts */}
        {!isAdmin && activeTab === 'social' && (
          <form onSubmit={handleSaveProfile} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
            <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-600" /> Social Media & Professional Handles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* LinkedIn */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <LinkedinIcon className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>

              {/* Twitter / X */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  X / Twitter Handle or URL
                </label>
                <div className="relative">
                  <TwitterIcon className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@username or https://x.com/username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Instagram Handle or Profile
                </label>
                <div className="relative">
                  <InstagramIcon className="w-4 h-4 text-pink-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username or https://instagram.com/username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Facebook Page or Profile URL
                </label>
                <div className="relative">
                  <FacebookIcon className="w-4 h-4 text-blue-700 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>

              {/* GitHub */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  GitHub Profile
                </label>
                <div className="relative">
                  <GithubIcon className="w-4 h-4 text-gray-800 dark:text-white absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Personal / Corporate Website
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourcompany.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {loading ? 'Saving Links...' : 'Save Social Profiles'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2 for ADMIN: Client Profiles Directory & View Details */}
        {isAdmin && activeTab === 'clients' && (
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-600" /> Client Profiles Directory & Detail Inspector
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Inspect comprehensive profile telemetry, contact info, social handles, and preferences added by registered clients.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  placeholder="Search client profile..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                />
              </div>
            </div>

            {isLoadingClients ? (
              <div className="p-8 text-center text-xs font-semibold text-gray-400 animate-pulse">
                Fetching client profile records...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
                <Users className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-bold">No client profiles found matching "{clientSearchQuery}".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClients.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-gray-50 dark:bg-dark-surface/50 border border-gray-200 dark:border-dark-border flex flex-col justify-between space-y-4 hover:border-brand-500/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar DP */}
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-500/60 bg-gray-200 dark:bg-dark-card flex-shrink-0 flex items-center justify-center">
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt={c.fullName} className="w-full h-full object-cover object-center" />
                        ) : (
                          <span className="font-heading font-extrabold text-brand-600 dark:text-brand-400 text-base">
                            {(c.fullName || 'C').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {c.fullName || 'Unnamed Client'}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {c.status || 'Active'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 truncate">
                          {c.company || 'Private Client'} {c.jobTitle ? `• ${c.jobTitle}` : ''}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> {c.email}
                        </p>
                      </div>
                    </div>

                    {/* Social & Contact Highlights */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/60 dark:border-dark-border/60 text-[11px] text-gray-500">
                      <div className="flex items-center gap-2">
                        {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                        {c.whatsapp && <span className="flex items-center gap-1 text-emerald-600"><MessageSquare className="w-3 h-3" /> WA</span>}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedClientModal(c)}
                        className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Full Profile Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
            <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-600" /> Account Security & Password Management
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Update your account password. Changes take effect immediately upon saving.
            </p>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password to verify identity"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {isUpdatingPassword ? 'Updating Password...' : 'Update Password Now'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Admin Full Client Profile Detail Modal */}
      {selectedClientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-500 bg-gray-100 flex items-center justify-center">
                  {selectedClientModal.avatarUrl ? (
                    <img src={selectedClientModal.avatarUrl} alt={selectedClientModal.fullName} className="w-full h-full object-cover object-center" />
                  ) : (
                    <span className="font-bold text-brand-600 text-lg">{(selectedClientModal.fullName || 'C').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-gray-900 dark:text-white">
                    {selectedClientModal.fullName}
                  </h3>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-bold">
                    {selectedClientModal.company} {selectedClientModal.jobTitle ? `• ${selectedClientModal.jobTitle}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientModal(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Information Telemetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-surface space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Primary Email</span>
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-600" /> {selectedClientModal.email}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-surface space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Secondary / Billing Email</span>
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> {selectedClientModal.secondaryEmail || 'Not Specified'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-surface space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Direct Phone</span>
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-500" /> {selectedClientModal.phone || 'Not Specified'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-surface space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">WhatsApp Number</span>
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> {selectedClientModal.whatsapp || 'Not Specified'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-surface space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Timezone / Region</span>
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-500" /> {selectedClientModal.timezone || 'UTC+0 (GMT)'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-surface space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Portal Password</span>
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 font-mono">
                  <Lock className="w-3.5 h-3.5 text-rose-500" /> {selectedClientModal.portalPassword || '••••••••'}
                </p>
              </div>
            </div>

            {/* Social Links Telemetry */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Social Accounts & Handles</span>
              <div className="flex flex-wrap gap-2">
                {selectedClientModal.socialLinks?.linkedin ? (
                  <a href={selectedClientModal.socialLinks.linkedin} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold flex items-center gap-1">
                    <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}

                {selectedClientModal.socialLinks?.twitter ? (
                  <a href={selectedClientModal.socialLinks.twitter} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold flex items-center gap-1">
                    <TwitterIcon className="w-3.5 h-3.5" /> X / Twitter <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}

                {selectedClientModal.socialLinks?.instagram ? (
                  <a href={selectedClientModal.socialLinks.instagram} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 font-bold flex items-center gap-1">
                    <InstagramIcon className="w-3.5 h-3.5" /> Instagram <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}

                {selectedClientModal.socialLinks?.facebook ? (
                  <a href={selectedClientModal.socialLinks.facebook} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200 font-bold flex items-center gap-1">
                    <FacebookIcon className="w-3.5 h-3.5" /> Facebook <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}

                {selectedClientModal.socialLinks?.github ? (
                  <a href={selectedClientModal.socialLinks.github} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-800 dark:bg-dark-surface dark:text-white font-bold flex items-center gap-1">
                    <GithubIcon className="w-3.5 h-3.5" /> GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}

                {selectedClientModal.socialLinks?.website ? (
                  <a href={selectedClientModal.socialLinks.website} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
            </div>

            {/* Client Bio */}
            {selectedClientModal.bio && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Client Personal Bio & Notes</span>
                <p className="text-gray-700 dark:text-gray-300 italic">{selectedClientModal.bio}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedClientModal(null)}
                className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileSettings;
