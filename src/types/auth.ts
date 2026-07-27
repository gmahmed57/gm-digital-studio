export type UserRole = 'admin' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  company?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
}
