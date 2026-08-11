import { supabase } from './supabase';
import { activityLogService } from './activityLogService';

export interface SentEmailRecord {
  id: string;
  sender: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  body_message: string;
  raw_html?: string;
  cta_text?: string;
  cta_url?: string;
  status: 'sent' | 'failed';
  sent_at: string;
}

const STORAGE_KEY = 'studio_sent_emails_history';

export const emailRecordService = {
  /**
   * Get all sent email records from Supabase (or localStorage fallback)
   */
  getSentEmails: async (): Promise<SentEmailRecord[]> => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('sent_emails')
          .select('*')
          .order('sent_at', { ascending: false });

        if (!error && data) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return data as SentEmailRecord[];
        }
      }
    } catch (err) {
      console.warn('[EmailRecordService] Error reading remote sent_emails:', err);
    }

    // Fallback to localStorage
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return [];
      }
    }
    return [];
  },

  /**
   * Record a newly sent custom email to database and localStorage
   */
  recordSentEmail: async (record: Omit<SentEmailRecord, 'id' | 'sent_at'>): Promise<SentEmailRecord> => {
    const newRecord: SentEmailRecord = {
      ...record,
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sent_at: new Date().toISOString(),
    };

    // Save to local storage first
    const existing = await emailRecordService.getSentEmails();
    const updated = [newRecord, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Upsert to database table
    try {
      if (supabase) {
        const { error } = await supabase.from('sent_emails').insert({
          id: newRecord.id,
          sender: newRecord.sender,
          recipient_email: newRecord.recipient_email,
          recipient_name: newRecord.recipient_name || null,
          subject: newRecord.subject,
          body_message: newRecord.body_message,
          raw_html: newRecord.raw_html || null,
          cta_text: newRecord.cta_text || null,
          cta_url: newRecord.cta_url || null,
          status: newRecord.status,
          sent_at: newRecord.sent_at,
        });

        if (error) {
          console.warn('[EmailRecordService] Table insert notice:', error.message);
        }
      }
    } catch (err) {
      console.warn('[EmailRecordService] Record sync notice:', err);
    }

    activityLogService.logActivity({
      user_name: 'Studio Admin',
      user_email: newRecord.sender,
      user_role: 'admin',
      action: 'EMAIL_DISPATCHED',
      entity_type: 'email',
      entity_id: newRecord.id,
      details: `Transactional email "${newRecord.subject}" sent to ${newRecord.recipient_email}.`
    });

    return newRecord;
  },

  /**
   * Delete a sent email record from database and localStorage
   */
  deleteSentEmailRecord: async (id: string): Promise<boolean> => {
    try {
      if (supabase) {
        await supabase.from('sent_emails').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('[EmailRecordService] Record delete notice:', err);
    }

    const cached = await emailRecordService.getSentEmails();
    const filtered = cached.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },
};

export default emailRecordService;
