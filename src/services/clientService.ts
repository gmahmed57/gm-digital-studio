import type { ClientItem } from '../types/client';
import { supabase } from './supabase';
import { activityLogService } from './activityLogService';
import { normalizeToolId } from '../constants/toolsData';

const parseToolArray = (val: any): string[] => {
  let list: string[] = [];
  if (Array.isArray(val)) {
    list = val.map(String);
  } else if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) list = parsed.map(String);
    } catch {
      list = val.replace(/[\{\}\"']/g, '').split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return Array.from(new Set(list.map(normalizeToolId).filter(Boolean)));
};

export const clientService = {
  getClients: async (): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized');

    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
      console.error('Database query error:', error.message);
      throw error;
    }

    let invoiceSumByClient: Record<string, number> = {};
    let invoiceSumByEmail: Record<string, number> = {};
    try {
      const { data: invData } = await supabase.from('invoices').select('client_id, client_email, total, amount, status');
      if (invData) {
        invData.forEach((inv: any) => {
          if (inv.status === 'Paid' || inv.status === 'Issued' || inv.status === 'Overdue') {
            const val = Number(inv.total) || parseFloat(String(inv.amount || '0').replace(/[^0-9.]/g, '')) || 0;
            if (inv.client_id) {
              invoiceSumByClient[inv.client_id] = (invoiceSumByClient[inv.client_id] || 0) + val;
            }
            if (inv.client_email) {
              const emailKey = inv.client_email.toLowerCase().trim();
              invoiceSumByEmail[emailKey] = (invoiceSumByEmail[emailKey] || 0) + val;
            }
          }
        });
      }
    } catch {
      // Fallback
    }

    if (data) {
      return data.map((row: any) => {
        const computedBilledSum = (row.id && invoiceSumByClient[row.id]) || (row.email && invoiceSumByEmail[row.email.toLowerCase().trim()]);
        const rawBilled = row.totalBilled || row.totalbilled || row.total_billed;
        let displayBilled = '$0';
        if (computedBilledSum !== undefined && computedBilledSum > 0) {
          displayBilled = `$${computedBilledSum.toLocaleString()}`;
        } else if (rawBilled && rawBilled !== '$0') {
          displayBilled = String(rawBilled).startsWith('$') ? String(rawBilled) : `$${Number(rawBilled).toLocaleString()}`;
        }

        return {
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
          totalBilled: displayBilled,
          assignedPackage: row.assignedPackage || row.assignedpackage || 'Standard Package',
          allowedToolIds: parseToolArray(row.allowedToolIds ?? row.allowedtoolids ?? row.allowed_tool_ids),
          requestedToolIds: parseToolArray(row.requestedToolIds ?? row.requestedtoolids ?? row.requested_tool_ids),
          whatsapp: row.whatsapp || '',
          secondaryEmail: row.secondary_email || row.secondaryEmail || '',
          jobTitle: row.job_title || row.jobTitle || '',
          timezone: row.timezone || '',
          bio: row.bio || '',
          socialLinks: row.social_links || row.socialLinks || {},
        };
      });
    }
    
    return [];
  },

  // Save new client or update existing client
  saveClient: async (client: Partial<ClientItem>): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');



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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_client_updated'));
      window.dispatchEvent(new Event('studio_tools_updated'));
    }

    return await clientService.getClients();
  },

  // Toggle client active/inactive status
  toggleClientStatus: async (id: string): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');
    
    const existing = await clientService.getClients();
    const client = existing.find((c) => c.id === id);
    
    if (client) {
      const newStatus = client.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase.from('clients').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_client_updated'));
    }

    return await clientService.getClients();
  },

  // Update SaaS Studio Tools Access for a specific client
  updateClientToolPermissions: async (
    clientId: string,
    allowedToolIds: string[]
  ): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const existing = await clientService.getClients();
    const client = existing.find((c) => c.id === clientId);

    const { error } = await supabase.from('clients').update({ allowedToolIds }).eq('id', clientId);
    if (error) throw error;

    if (client) {
      activityLogService.logActivity({
        user_name: 'Studio Admin',
        user_email: 'admin@gmstudio.com',
        user_role: 'admin',
        action: 'TOOL_PERMISSIONS_UPDATED',
        entity_type: 'tools',
        entity_id: clientId,
        details: `Admin updated Studio Tool access entitlements for client ${client.fullName} (${client.company}). Unlocked tools count: ${allowedToolIds.length}.`
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_client_updated'));
      window.dispatchEvent(new Event('studio_tools_updated'));
    }

    return await clientService.getClients();
  },

  // Client requests tool activation permission from Admin
  requestToolAccess: async (
    clientId: string,
    toolId: string
  ): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

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

        activityLogService.logActivity({
          user_name: client.fullName || 'Client User',
          user_email: client.email,
          user_role: 'client',
          action: 'TOOL_ACCESS_REQUESTED',
          entity_type: 'tools',
          entity_id: toolId,
          details: `Client ${client.fullName} (${client.company}) requested activation access for Studio Tool "${toolId}".`
        });
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_client_updated'));
      window.dispatchEvent(new Event('studio_tools_updated'));
    }

    return await clientService.getClients();
  },

  // Admin approves or denies a client tool request
  resolveToolAccessRequest: async (
    clientId: string,
    toolId: string,
    approve: boolean
  ): Promise<ClientItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

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

      activityLogService.logActivity({
        user_name: 'Studio Admin',
        user_email: 'admin@gmstudio.com',
        user_role: 'admin',
        action: approve ? 'TOOL_ACCESS_GRANTED' : 'TOOL_ACCESS_DECLINED',
        entity_type: 'tools',
        entity_id: toolId,
        details: `Admin ${approve ? 'granted' : 'declined'} access to Studio Tool "${toolId}" for client ${client.fullName} (${client.company}).`
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_client_updated'));
      window.dispatchEvent(new Event('studio_tools_updated'));
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
    if (!supabase) throw new Error('Database service is not initialized.');

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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_client_updated'));
    }

    return await clientService.getClients();
  },
};
