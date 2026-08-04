import { supabase } from './supabase';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company?: string;
  service: string;
  budget?: string;
  message: string;
  status: 'pending' | 'contacted' | 'archived';
  created_at: string;
}

export const contactService = {
  async submitContactForm(formData: Omit<ContactSubmission, 'id' | 'status' | 'created_at'>): Promise<boolean> {
    const newSubmission = {
      ...formData,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('contact_submissions').insert([newSubmission]);
      if (error) {
        console.error('Supabase contact submission insert failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase contact submission network error:', e);
      return false;
    }
  },

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch failed for contact_submissions:', error.message);
        return [];
      }

      return (data || []) as ContactSubmission[];
    } catch (e) {
      console.error('Supabase fetch network error for contact_submissions:', e);
      return [];
    }
  },

  async updateContactStatus(id: string, status: 'pending' | 'contacted' | 'archived'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Supabase update contact status failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase update contact status network error:', e);
      return false;
    }
  },

  async deleteContactSubmission(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete contact submission failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase delete contact submission network error:', e);
      return false;
    }
  },
};
