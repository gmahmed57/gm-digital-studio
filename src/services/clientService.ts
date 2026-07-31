import type { ClientItem } from '../types/client';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

export const clientService = {
  // Get all clients (Supabase live database)
  getClients: async (): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
      console.error('Supabase select clients error:', error.message);
      throw error;
    }

    if (data) {
      return data.map((row: any) => ({
        id: row.id,
        fullName: row.fullName || row.fullname || row.full_name || 'Client User',
        company: row.company || '',
        email: row.email || '',
        phone: row.phone || '',
        portalPassword: row.portalPassword || row.portalpassword || row.portal_password || '',
        avatarUrl: row.avatarUrl || row.avatarurl || row.avatar_url || '',
        status: row.status || 'active',
        joinedDate: row.joinedDate || row.joineddate || row.joined_date || '',
        activeProjectsCount: row.activeProjectsCount ?? row.activeprojectscount ?? 0,
        totalBilled: row.totalBilled || row.totalbilled || '$0',
        assignedPackage: row.assignedPackage || row.assignedpackage || 'Standard Package',
        allowedToolIds: row.allowedToolIds || row.allowedtoolids || row.allowed_tool_ids || [],
        requestedToolIds: row.requestedToolIds || row.requestedtoolids || row.requested_tool_ids || [],
      }));
    }
    
    return [];
  },

  // Save new client or update existing client
  saveClient: async (client: Partial<ClientItem>): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    let targetItem: ClientItem;

    if (client.id && client.id !== 'new') {
      const existing = await clientService.getClients();
      const match = existing.find((item) => item.id === client.id);
      targetItem = {
        ...(match || {}),
        ...client,
      } as ClientItem;
    } else {
      targetItem = {
        id: `client-${Date.now()}`,
        fullName: client.fullName || 'New Client',
        company: client.company || 'Client Company',
        email: client.email || 'client@company.com',
        phone: client.phone || '+1 (555) 000-0000',
        portalPassword: client.portalPassword || '',
        avatarUrl: client.avatarUrl || '',
        status: client.status || 'active',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        activeProjectsCount: client.activeProjectsCount || 0,
        totalBilled: client.totalBilled || '$0',
        assignedPackage: client.assignedPackage || 'Standard Web Development',
        allowedToolIds: client.allowedToolIds !== undefined ? client.allowedToolIds : [],
        requestedToolIds: client.requestedToolIds || [],
      };
    }

    // If this is a brand NEW client being created, provision their Auth account first
    if ((!client.id || client.id === 'new') && client.email && targetItem.portalPassword && targetItem.portalPassword.length >= 6) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey) {
        // Create secondary client so we don't log out the Admin
        const adminAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          }
        });

        const { error: authError } = await adminAuthClient.auth.signUp({
          email: client.email.trim().toLowerCase(),
          password: targetItem.portalPassword,
          options: {
            data: {
              full_name: targetItem.fullName || 'Client User',
              role: 'client',
              company: targetItem.company || 'Client Company',
            },
          },
        });

        if (authError) {
          // If the user is already in Auth (e.g. from a partial failure previously), we can safely proceed to DB insertion
          if (authError.message.toLowerCase().includes('already registered')) {
            console.warn('User already registered in Auth, proceeding to sync with clients table.');
          } else {
            throw new Error(`Failed to create authentication user: ${authError.message}`);
          }
        }
      }
    }

    // Prepare payload without portalPassword to avoid schema errors and ensure security
    const dbPayload = {
      id: targetItem.id,
      fullName: targetItem.fullName,
      company: targetItem.company,
      email: targetItem.email,
      phone: targetItem.phone,
      avatarUrl: targetItem.avatarUrl || '',
      status: targetItem.status,
      joinedDate: targetItem.joinedDate,
      activeProjectsCount: targetItem.activeProjectsCount,
      totalBilled: targetItem.totalBilled,
      assignedPackage: targetItem.assignedPackage,
      allowedToolIds: targetItem.allowedToolIds || [],
      requestedToolIds: targetItem.requestedToolIds || [],
    };

    const { error } = await supabase.from('clients').upsert(dbPayload);
    if (error) {
      console.error('Supabase client upsert error:', error.message);
      throw error;
    }

    return await clientService.getClients();
  },

  // Toggle client active/inactive status
  toggleClientStatus: async (id: string): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const existing = await clientService.getClients();
    const client = existing.find((c) => c.id === id);
    
    if (client) {
      const newStatus = client.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase.from('clients').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
    }

    return await clientService.getClients();
  },

  // Update SaaS Studio Tools Access for a specific client
  updateClientToolPermissions: async (
    clientId: string,
    allowedToolIds: string[]
  ): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase.from('clients').update({ allowedToolIds }).eq('id', clientId);
    if (error) throw error;

    return await clientService.getClients();
  },

  // Client requests tool activation permission from Admin
  requestToolAccess: async (
    clientId: string,
    toolId: string
  ): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const existing = await clientService.getClients();
    const client = existing.find((c) => c.id === clientId);

    if (client) {
      const currentReqs = client.requestedToolIds || [];
      if (!currentReqs.includes(toolId)) {
        const updatedReqs = [...currentReqs, toolId];
        const { error } = await supabase
          .from('clients')
          .update({ requestedToolIds: updatedReqs })
          .eq('id', clientId);
        if (error) throw error;
      }
    }

    return await clientService.getClients();
  },

  // Admin approves or denies a client tool request
  resolveToolAccessRequest: async (
    clientId: string,
    toolId: string,
    approve: boolean
  ): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const existing = await clientService.getClients();
    const client = existing.find((c) => c.id === clientId);

    if (client) {
      const reqs = (client.requestedToolIds || []).filter((id) => id !== toolId);
      let allowed = client.allowedToolIds || [];
      
      if (approve && !allowed.includes(toolId)) {
        allowed = [...allowed, toolId];
      }

      const { error } = await supabase
        .from('clients')
        .update({
          allowedToolIds: allowed,
          requestedToolIds: reqs,
        })
        .eq('id', clientId);
        
      if (error) throw error;
    }

    return await clientService.getClients();
  },

  // Alias for resolveToolAccessRequest
  respondToToolRequest: async (
    clientId: string,
    toolId: string,
    action: boolean | 'grant' | 'decline' | 'approve' | 'deny'
  ): Promise<ClientItem[]> => {
    const isApprove = action === true || action === 'approve' || action === 'grant';
    return clientService.resolveToolAccessRequest(clientId, toolId, isApprove);
  },

  // Delete client
  deleteClient: async (id: string): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;

    return await clientService.getClients();
  },
};
