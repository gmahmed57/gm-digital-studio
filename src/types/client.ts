export type ClientStatus = 'active' | 'inactive';

export interface StudioTool {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  isPremium: boolean;
  version: string;
  actionLabel?: string;
  isActive?: boolean;
}

export interface ClientItem {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  portalPassword?: string; // Admin assigned portal login password
  avatarUrl?: string;
  status: ClientStatus;
  joinedDate: string;
  activeProjectsCount: number;
  totalBilled: string;
  assignedPackage: string;
  allowedToolIds: string[]; // List of tool IDs enabled by Admin for this client
  requestedToolIds?: string[]; // List of tool IDs requested by client pending Admin approval
}
