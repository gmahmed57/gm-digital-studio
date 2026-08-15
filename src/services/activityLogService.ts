import { supabase } from './supabase';
import type { ActivityLog, CreateActivityLogDTO, EntityType } from '../types/activityLog';

export const activityLogService = {
  /**
   * Record a new activity log directly to Supabase public.activity_logs table
   */
  async logActivity(data: CreateActivityLogDTO): Promise<boolean> {
    try {
      const payload = {
        user_id: data.user_id || null,
        user_name: data.user_name || 'System User',
        user_email: data.user_email || 'system@gmstudio.com',
        user_role: data.user_role || 'client',
        action: data.action,
        entity_type: data.entity_type,
        entity_id: data.entity_id || null,
        details: data.details,
        metadata: data.metadata || {},
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('activity_logs')
        .insert([payload]);

      if (error) {
        console.warn('Activity log DB insertion note:', error.message);
        return false;
      }

      // Broadcast window event for live Activity Log subscribers
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studio_activity_logged'));
      }

      return true;
    } catch (err) {
      console.error('Failed to dispatch activity log:', err);
      return false;
    }
  },

  /**
   * Fetch activity logs with optional filters (100% DB query)
   */
  async getActivityLogs(filters?: {
    entity_type?: EntityType | 'all';
    user_email?: string;
    search_query?: string;
    limit?: number;
  }): Promise<ActivityLog[]> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100);
      }

      if (filters?.entity_type && filters.entity_type !== 'all') {
        query = query.eq('entity_type', filters.entity_type);
      }

      if (filters?.user_email) {
        query = query.ilike('user_email', `%${filters.user_email}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity logs from Supabase:', error.message);
        return [];
      }

      let results: ActivityLog[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        user_name: row.user_name,
        user_email: row.user_email,
        user_role: row.user_role,
        action: row.action,
        entity_type: row.entity_type as EntityType,
        entity_id: row.entity_id,
        details: row.details,
        metadata: row.metadata || {},
        created_at: row.created_at
      }));

      if (filters?.search_query && filters.search_query.trim() !== '') {
        const q = filters.search_query.toLowerCase();
        results = results.filter((log) =>
          log.details.toLowerCase().includes(q) ||
          log.user_name.toLowerCase().includes(q) ||
          log.user_email.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q)
        );
      }

      return results;
    } catch (err) {
      console.error('Exception fetching activity logs:', err);
      return [];
    }
  },

  /**
   * Delete single activity log entry (Admin only)
   */
  async deleteLog(logId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error('Error deleting activity log:', error.message);
        return false;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studio_activity_logged'));
      }
      return true;
    } catch (err) {
      console.error('Exception deleting activity log:', err);
      return false;
    }
  },

  /**
   * Delete multiple activity log entries in batch (Admin only)
   */
  async deleteLogs(logIds: string[]): Promise<boolean> {
    if (!logIds || logIds.length === 0) return true;
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .in('id', logIds);

      if (error) {
        console.error('Error deleting activity logs:', error.message);
        return false;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studio_activity_logged'));
      }
      return true;
    } catch (err) {
      console.error('Exception deleting activity logs in batch:', err);
      return false;
    }
  },

  /**
   * Clear all activity logs (Admin only)
   */
  async clearAllLogs(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        console.error('Error clearing activity logs:', error.message);
        return false;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studio_activity_logged'));
      }
      return true;
    } catch (err) {
      console.error('Exception clearing activity logs:', err);
      return false;
    }
  }
};
