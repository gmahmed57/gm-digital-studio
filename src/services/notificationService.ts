import type { NotificationItem } from '../types/notification';
import { supabase } from './supabase';

// Helper to format real time strings (e.g. "10:38 PM", "5m ago")
export const formatNotificationTime = (timestamp?: string, createdAt?: string): string => {
  let dateObj: Date | null = null;

  if (createdAt) {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) dateObj = d;
  }

  if (!dateObj && timestamp && timestamp !== 'Just now') {
    const parsed = Date.parse(timestamp);
    if (!isNaN(parsed)) {
      dateObj = new Date(parsed);
    }
  }

  if (!dateObj) {
    if (timestamp && timestamp !== 'Just now') return timestamp;
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 45) {
    return 'Just now';
  }
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const notificationService = {
  // Get notifications filtered strictly by user role and target email
  getNotifications: async (userEmail?: string, userRole?: string): Promise<NotificationItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    let allNotifications: NotificationItem[] = [];

    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) {
      throw error;
    }

    if (data) {
      allNotifications = data.map((row: any) => {
        const rawCreated = row.created_at || new Date().toISOString();
        const realTime = formatNotificationTime(row.timestamp, rawCreated);

        return {
          id: row.id,
          title: row.title,
          message: row.message,
          timestamp: realTime,
          createdAt: rawCreated,
          read: Boolean(row.read),
          type: row.type || 'system',
          link: row.link || undefined,
          targetRole: row.target_role || row.targetRole || undefined,
          targetEmail: row.target_email || row.targetEmail || undefined,
        };
      });
    }

    // Role and Email Filtering Logic:
    if (userRole === 'admin') {
      return allNotifications.filter(
        (n) =>
          n.targetRole === 'admin' ||
          !n.targetRole ||
          (userEmail && n.targetEmail?.toLowerCase() === userEmail.toLowerCase())
      );
    }

    if (userRole === 'client' && userEmail) {
      return allNotifications.filter(
        (n) =>
          n.targetRole !== 'admin' &&
          n.targetEmail &&
          n.targetEmail.toLowerCase() === userEmail.toLowerCase()
      );
    }

    return allNotifications;
  },

  // Add new notification with real clock timestamp
  addNotification: async (
    notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
  ): Promise<NotificationItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const nowIso = new Date().toISOString();
    const realTimeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const newItem: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: realTimeStr,
      createdAt: nowIso,
      read: false,
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Only execute direct table upsert if caller has an active user session
      if (session?.user) {
        const { error } = await supabase.from('notifications').upsert({
          id: newItem.id,
          title: newItem.title,
          message: newItem.message,
          timestamp: newItem.timestamp,
          created_at: newItem.createdAt,
          read: newItem.read,
          type: newItem.type,
          link: newItem.link,
          target_role: newItem.targetRole,
          target_email: newItem.targetEmail,
        });

        if (error) {
          console.warn('[NotificationService] RLS or insert notice:', error.message);
        }
      }
    } catch (err) {
      console.warn('[NotificationService] Exception during notification creation:', err);
    }

    if (typeof window !== 'undefined') window.dispatchEvent(new Event('studio_notifications_updated'));

    try {
      return await notificationService.getNotifications();
    } catch {
      return [];
    }
  },

  // Delete single specific notification
  deleteNotification: async (id: string, userEmail?: string, userRole?: string): Promise<NotificationItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch {
      // Clean catch
    }

    if (typeof window !== 'undefined') window.dispatchEvent(new Event('studio_notifications_updated'));

    return await notificationService.getNotifications(userEmail, userRole);
  },

  // Mark single notification as read
  markAsRead: async (id: string): Promise<NotificationItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;

    if (typeof window !== 'undefined') window.dispatchEvent(new Event('studio_notifications_updated'));

    return await notificationService.getNotifications();
  },

  // Mark all notifications as read for target user/role
  markAllAsRead: async (userEmail?: string, userRole?: string): Promise<NotificationItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    try {
      if (userRole === 'admin') {
        await supabase.from('notifications').update({ read: true }).or('target_role.eq.admin,target_role.is.null');
      } else if (userEmail) {
        await supabase.from('notifications').update({ read: true }).eq('target_email', userEmail);
      }
    } catch {
      // Clean catch
    }

    if (typeof window !== 'undefined') window.dispatchEvent(new Event('studio_notifications_updated'));

    return await notificationService.getNotifications(userEmail, userRole);
  },

  // Clear notifications for active role/email
  clearNotifications: async (userEmail?: string, userRole?: string): Promise<NotificationItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    try {
      if (userRole === 'admin') {
        await supabase.from('notifications').delete().or('target_role.eq.admin,target_role.is.null');
      } else if (userEmail) {
        await supabase.from('notifications').delete().eq('target_email', userEmail);
      }
    } catch {
      // Clean catch
    }

    if (typeof window !== 'undefined') window.dispatchEvent(new Event('studio_notifications_updated'));

    return await notificationService.getNotifications(userEmail, userRole);
  },
};
