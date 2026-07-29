import type { NotificationItem } from '../types/notification';
import { supabase } from './supabase';

const STORAGE_KEY = 'gm_studio_notifications_db';
const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

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
    let allNotifications: NotificationItem[] = [];

    try {
      if (supabase) {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (error) {
          console.warn('Supabase select notifications notice:', error.message || error);
        } else if (data && data.length > 0) {
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
      }
    } catch (e) {
      console.warn('Supabase notifications fetch failed, using local storage database.', e);
    }

    if (allNotifications.length === 0) {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsed: NotificationItem[] = JSON.parse(cached);
          allNotifications = parsed.map((n) => ({
            ...n,
            timestamp: formatNotificationTime(n.timestamp, n.createdAt),
          }));
        } catch (e) {
          allNotifications = INITIAL_NOTIFICATIONS;
        }
      } else {
        allNotifications = INITIAL_NOTIFICATIONS;
      }
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
    const existing = await notificationService.getNotifications();
    const nowIso = new Date().toISOString();
    const realTimeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const newItem: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: realTimeStr,
      createdAt: nowIso,
      read: false,
    };
    const updated = [newItem, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      if (supabase) {
        await supabase.from('notifications').upsert({
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
      }
    } catch (e) {
      console.warn('Supabase insert notification error:', e);
    }

    return updated;
  },

  // Delete single specific notification
  deleteNotification: async (id: string, userEmail?: string, userRole?: string): Promise<NotificationItem[]> => {
    const existing = await notificationService.getNotifications(userEmail, userRole);
    const updated = existing.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      if (supabase) {
        await supabase.from('notifications').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase delete single notification error:', e);
    }

    return updated;
  },

  // Mark single notification as read
  markAsRead: async (id: string): Promise<NotificationItem[]> => {
    const existing = await notificationService.getNotifications();
    const updated = existing.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      if (supabase) {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase mark as read error:', e);
    }

    return updated;
  },

  // Mark all notifications as read for target user/role
  markAllAsRead: async (userEmail?: string, userRole?: string): Promise<NotificationItem[]> => {
    const existing = await notificationService.getNotifications(userEmail, userRole);
    const updated = existing.map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      if (supabase) {
        if (userRole === 'admin') {
          await supabase.from('notifications').update({ read: true }).eq('target_role', 'admin');
        } else if (userEmail) {
          await supabase.from('notifications').update({ read: true }).ilike('target_email', userEmail);
        }
      }
    } catch (e) {
      console.warn('Supabase mark all read error:', e);
    }

    return updated;
  },

  // Clear notifications for active role/email
  clearNotifications: async (userEmail?: string, userRole?: string): Promise<NotificationItem[]> => {
    const existing = await notificationService.getNotifications();
    let remaining: NotificationItem[] = [];

    if (userRole === 'admin') {
      remaining = existing.filter((n) => n.targetRole !== 'admin');
    } else if (userEmail) {
      remaining = existing.filter((n) => !n.targetEmail || n.targetEmail.toLowerCase() !== userEmail.toLowerCase());
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

    try {
      if (supabase) {
        if (userRole === 'admin') {
          await supabase.from('notifications').delete().eq('target_role', 'admin');
        } else if (userEmail) {
          await supabase.from('notifications').delete().ilike('target_email', userEmail);
        }
      }
    } catch (e) {
      console.warn('Supabase delete notifications error:', e);
    }

    return remaining;
  },
};
