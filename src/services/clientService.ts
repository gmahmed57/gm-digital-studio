import type { ClientItem } from '../types/client';
import { supabase } from './supabase';

const INITIAL_CLIENTS: ClientItem[] = [];
const STORAGE_KEY = 'gm_studio_clients_db';

export const clientService = {
  // Get all clients (Supabase live database or local storage)
  getClients: async (): Promise<ClientItem[]> => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('clients').select('*');
        if (error) {
          console.error('Supabase select clients error:', error.message || error);
        } else if (data && data.length > 0) {
          const normalized: ClientItem[] = data.map((row: any) => ({
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
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Supabase clients fetch failed, using local storage database.', e);
    }

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }

    return INITIAL_CLIENTS;
  },

  // Save new client or update existing client
  saveClient: async (client: Partial<ClientItem>): Promise<ClientItem[]> => {
    const existing = await clientService.getClients();
    let updatedList: ClientItem[];
    let targetItem: ClientItem;

    if (client.id && client.id !== 'new') {
      targetItem = {
        ...existing.find((item) => item.id === client.id),
        ...client,
      } as ClientItem;
      updatedList = existing.map((item) => (item.id === client.id ? targetItem : item));
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
      updatedList = [targetItem, ...existing];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    const dbPayload = {
      id: targetItem.id,
      fullName: targetItem.fullName,
      company: targetItem.company,
      email: targetItem.email,
      phone: targetItem.phone,
      portalPassword: targetItem.portalPassword,
      avatarUrl: targetItem.avatarUrl || '',
      status: targetItem.status,
      joinedDate: targetItem.joinedDate,
      activeProjectsCount: targetItem.activeProjectsCount,
      totalBilled: targetItem.totalBilled,
      assignedPackage: targetItem.assignedPackage,
      allowedToolIds: targetItem.allowedToolIds || [],
      requestedToolIds: targetItem.requestedToolIds || [],
    };

    try {
      if (supabase) {
        await supabase.from('clients').upsert(dbPayload);

        if (client.email && targetItem.portalPassword && targetItem.portalPassword.length >= 6) {
          await supabase.auth.signUp({
            email: client.email,
            password: targetItem.portalPassword,
            options: {
              data: {
                full_name: targetItem.fullName || 'Client User',
                role: 'client',
                company: targetItem.company || 'Client Company',
              },
            },
          });
        }
      }
    } catch (e) {
      console.warn('Supabase Auth provisioning notice:', e);
    }

    return updatedList;
  },

  // Toggle client active/inactive status
  toggleClientStatus: async (id: string): Promise<ClientItem[]> => {
    const existing = await clientService.getClients();
    let updatedTarget: ClientItem | null = null;

    const updatedList = existing.map((c) => {
      if (c.id === id) {
        const newStatus: 'active' | 'inactive' = c.status === 'active' ? 'inactive' : 'active';
        updatedTarget = { ...c, status: newStatus };
        return updatedTarget;
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (supabase && updatedTarget) {
      try {
        await supabase.from('clients').update({ status: (updatedTarget as ClientItem).status }).eq('id', id);
      } catch (e) {
        console.warn('Supabase status toggle notice:', e);
      }
    }

    return updatedList;
  },

  // Update SaaS Studio Tools Access for a specific client
  updateClientToolPermissions: async (
    clientId: string,
    allowedToolIds: string[]
  ): Promise<ClientItem[]> => {
    const existing = await clientService.getClients();
    let updatedTarget: ClientItem | null = null;

    const updatedList = existing.map((c) => {
      if (c.id === clientId) {
        updatedTarget = { ...c, allowedToolIds };
        return updatedTarget;
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (supabase && updatedTarget) {
      try {
        await supabase.from('clients').update({ allowedToolIds }).eq('id', clientId);
      } catch (e) {
        console.warn('Supabase tool permissions update notice:', e);
      }
    }

    return updatedList;
  },

  // Client requests tool activation permission from Admin
  requestToolAccess: async (
    clientId: string,
    toolId: string
  ): Promise<ClientItem[]> => {
    const existing = await clientService.getClients();
    let updatedTarget: ClientItem | null = null;

    const updatedList = existing.map((c) => {
      if (c.id === clientId) {
        const currentReqs = c.requestedToolIds || [];
        if (!currentReqs.includes(toolId)) {
          const updatedReqs = [...currentReqs, toolId];
          updatedTarget = { ...c, requestedToolIds: updatedReqs };
          return updatedTarget;
        }
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (supabase && updatedTarget) {
      try {
        await supabase
          .from('clients')
          .update({ requestedToolIds: (updatedTarget as ClientItem).requestedToolIds })
          .eq('id', clientId);
      } catch (e) {
        console.warn('Supabase request tool access notice:', e);
      }
    }

    return updatedList;
  },

  // Admin approves or denies a client tool request
  resolveToolAccessRequest: async (
    clientId: string,
    toolId: string,
    approve: boolean
  ): Promise<ClientItem[]> => {
    const existing = await clientService.getClients();
    let updatedTarget: ClientItem | null = null;

    const updatedList = existing.map((c) => {
      if (c.id === clientId) {
        const reqs = (c.requestedToolIds || []).filter((id) => id !== toolId);
        let allowed = c.allowedToolIds || [];
        if (approve && !allowed.includes(toolId)) {
          allowed = [...allowed, toolId];
        }
        updatedTarget = { ...c, requestedToolIds: reqs, allowedToolIds: allowed };
        return updatedTarget;
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (supabase && updatedTarget) {
      const target = updatedTarget as ClientItem;
      try {
        await supabase
          .from('clients')
          .update({
            allowedToolIds: target.allowedToolIds,
            requestedToolIds: target.requestedToolIds,
          })
          .eq('id', clientId);
      } catch (e) {
        console.warn('Supabase resolve tool request notice:', e);
      }
    }

    return updatedList;
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
    const existing = await clientService.getClients();
    const updatedList = existing.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    try {
      if (supabase) {
        await supabase.from('clients').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase delete client notice:', e);
    }

    return updatedList;
  },
};
