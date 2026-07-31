import { supabase } from './supabase';

export interface Message {
  id: string;
  clientId: string;
  senderRole: 'admin' | 'client';
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const messageService = {
  // Fetch messages for a specific client thread
  getMessagesForClient: async (clientId: string): Promise<Message[]> => {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase fetch failed:', error.message);
        return [];
      }

      if (data) {
        return data.map((m) => ({
          id: m.id,
          clientId: m.client_id,
          senderRole: m.sender_role,
          content: m.content,
          isRead: m.is_read,
          createdAt: m.created_at,
        }));
      }
    } catch (e) {
      console.error('Unexpected error fetching messages:', e);
    }
    return [];
  },

  // Send a new message
  sendMessage: async (clientId: string, senderRole: 'admin' | 'client', content: string): Promise<Message> => {
    if (!supabase) throw new Error('Supabase is not initialized');

    const payload = {
      client_id: clientId,
      sender_role: senderRole,
      content,
      is_read: false,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([payload])
      .select()
      .single();
      
    if (error || !data) {
      console.error('Supabase insert failed:', error?.message);
      throw new Error(error?.message || 'Failed to send message');
    }

    if (typeof window !== 'undefined') window.dispatchEvent(new Event('gm_messages_updated'));
    
    return {
      id: data.id,
      clientId: data.client_id,
      senderRole: data.sender_role,
      content: data.content,
      isRead: data.is_read,
      createdAt: data.created_at
    };
  },

  // Mark all unread messages as read for a specific thread
  // For Admin: Marks all 'client' sender messages as read
  // For Client: Marks all 'admin' sender messages as read
  markThreadAsRead: async (clientId: string, receiverRole: 'admin' | 'client'): Promise<void> => {
    if (!supabase) return;
    const senderToMark = receiverRole === 'admin' ? 'client' : 'admin';

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('client_id', clientId)
      .eq('sender_role', senderToMark)
      .eq('is_read', false);

    if (error) {
      console.error('Failed to mark thread as read:', error.message);
    }
  },

  // Clear all messages for a specific client (Admin only feature)
  clearClientChat: async (clientId: string): Promise<void> => {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('client_id', clientId);
      
    if (error) {
      console.error('Failed to clear client chat:', error.message);
      throw new Error(error.message);
    }

    if (typeof window !== 'undefined') window.dispatchEvent(new Event('gm_messages_updated'));
  },

  // Get total unread count for a receiver
  // If receiver is 'admin', counts all unread 'client' messages across all clients.
  // If receiver is 'client', counts all unread 'admin' messages for their specific clientId.
  getUnreadCount: async (receiverRole: 'admin' | 'client', clientId?: string): Promise<number> => {
    if (!supabase) return 0;
    
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (receiverRole === 'admin') {
      query = query.eq('sender_role', 'client');
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
    } else {
      query = query.eq('sender_role', 'admin');
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
    }

    const { count, error } = await query;
    if (error) {
      console.error('Failed to get unread count:', error.message);
      return 0;
    }
    
    return count || 0;
  }
};
