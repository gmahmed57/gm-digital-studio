import type { ClientItem } from '../types/client';
import { supabase } from './supabase';

export const clientService = {
  getClients: async (): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized');

    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
      console.error('Database query error:', error.message);
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
        whatsapp: row.whatsapp || '',
        secondaryEmail: row.secondary_email || row.secondaryEmail || '',
        jobTitle: row.job_title || row.jobTitle || '',
        timezone: row.timezone || '',
        bio: row.bio || '',
        socialLinks: row.social_links || row.socialLinks || {},
      }));
    }
    
    return [];
  },

  // Save new client or update existing client
  saveClient: async (client: Partial<ClientItem>): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');



    if (!client.id || client.id === 'new') {
      if (!client.email || !client.portalPassword || client.portalPassword.length < 6) {
        throw new Error('Email and a password of at least 6 characters are required for new clients.');
      }

      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create-user',
          email: client.email,
          password: client.portalPassword,
          role: 'client',
          updates: {
            fullName: client.fullName || 'New Client',
            company: client.company || 'Client Company',
            phone: client.phone || '',
            avatarUrl: client.avatarUrl || '',
            status: client.status || 'active',
            assignedPackage: client.assignedPackage || 'Standard Web Development',
            allowedToolIds: client.allowedToolIds || [],
            requestedToolIds: client.requestedToolIds || [],
          }
        }
      });

      if (error || data?.error) {
        let errorMsg = 'Failed to create client.';
        if (error) {
          try {
            const errBody = await (error as any).context.json();
            errorMsg = errBody.error || error.message;
          } catch {
            errorMsg = error.message;
          }
        } else if (data?.error) {
          errorMsg = data.error;
        }
        throw new Error(errorMsg);
      }
    } else {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'update-user',
          userId: client.id,
          email: client.email,
          password: client.portalPassword || undefined,
          role: 'client',
          updates: {
            fullName: client.fullName,
            company: client.company,
            phone: client.phone,
            avatarUrl: client.avatarUrl,
            status: client.status,
            assignedPackage: client.assignedPackage,
            allowedToolIds: client.allowedToolIds,
            requestedToolIds: client.requestedToolIds,
          }
        }
      });

      if (error || data?.error) {
        let errorMsg = 'Failed to update client.';
        if (error) {
          try {
            const errBody = await (error as any).context.json();
            errorMsg = errBody.error || error.message;
          } catch {
            errorMsg = error.message;
          }
        } else if (data?.error) {
          errorMsg = data.error;
        }
        throw new Error(errorMsg);
      }
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

  deleteClient: async (id: string): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: {
        action: 'delete-user',
        userId: id,
        role: 'client',
      }
    });

    if (error || data?.error) {
      throw new Error(error?.message || data?.error || 'Failed to delete client.');
    }

    return await clientService.getClients();
  },
};
