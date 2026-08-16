export type UserRole = 'admin' | 'client' | 'author';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  company?: string;
  avatarUrl?: string;
  phone?: string;
  whatsapp?: string;
  secondaryEmail?: string;
  jobTitle?: string;
  timezone?: string;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    github?: string;
    website?: string;
  };
  createdAt?: string;
}

export interface SignInResult {
  mfaRequired: boolean;
  factorId?: string;
  user?: UserProfile;
  tempUser?: UserProfile;
}

export interface MFAFactor {
  id: string;
  status: 'verified' | 'unverified';
  friendly_name?: string;
  factor_type: string;
}

export interface MFAEnrollResult {
  id: string;
  qrCode: string;
  secret: string;
  uri: string;
}

export interface AuthState {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password?: string) => Promise<SignInResult>;
  verifyMFA: (factorId: string, code: string, tempUser: UserProfile) => Promise<UserProfile>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  updateAuthUser: (updatedData: Partial<UserProfile>) => void;
}
