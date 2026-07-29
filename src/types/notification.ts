export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  createdAt?: string;
  read: boolean;
  type: 'project' | 'client' | 'system' | 'review';
  link?: string;
  targetRole?: 'admin' | 'client';
  targetEmail?: string;
}
