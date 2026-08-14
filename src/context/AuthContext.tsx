import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, UserRole, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';
import { supabase } from '../services/supabase';

const STORAGE_KEY = 'stu_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Live profile sync from Supabase DB (authors, profiles, clients) on every app boot
  useEffect(() => {
    if (!user || !user.email) return;
    const syncUserProfile = async () => {
      try {
        const cleanEmail = user.email.trim().toLowerCase();
        let freshAvatar: string | undefined = undefined;
        let freshName: string | undefined = undefined;
        let freshRole: string | undefined = undefined;
        let freshBio: string | undefined = undefined;

        if (!supabase) return;

        // 1. Check public.authors
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

        // 2. Check public.profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (profileData) {
          if (!freshName && profileData.fullName) freshName = profileData.fullName;
          if (!freshRole && profileData.job_title) freshRole = profileData.job_title;
          if (!freshBio && profileData.bio) freshBio = profileData.bio;
          if (!freshAvatar) freshAvatar = profileData.avatar_url || profileData.avatarUrl;
        }

        // 3. Check public.clients
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

        setUser((prev) => {
          if (!prev) return null;
          const updatedAvatar = freshAvatar !== undefined ? freshAvatar : (prev.avatarUrl || '');
          return {
            ...prev,
            fullName: freshName || prev.fullName,
            jobTitle: freshRole || prev.jobTitle,
            bio: freshBio || prev.bio,
            avatarUrl: updatedAvatar,
          };
        });
      } catch (err) {
        console.warn('Live profile sync notice:', err);
      }
    };
    syncUserProfile();
  }, [user?.email]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const profile = await authService.signIn(email, password);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const updateAuthUser = (updatedData: Partial<UserProfile>) => {
    if (user) {
      setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    }
  };

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setRole,
    updateAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
