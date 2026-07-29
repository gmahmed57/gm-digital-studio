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
        } else if (data) {
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

  // Save persistent tool request for a client
  requestToolAccess: async (clientEmail: string, toolId: string): Promise<ClientItem[]> => {
    const existing = await clientService.getClients();
    let updatedTarget: ClientItem | null = null;

    const updatedList = existing.map((c) => {
      if (c.email.toLowerCase() === clientEmail.toLowerCase()) {
        const currentRequested = c.requestedToolIds || [];
        if (!currentRequested.includes(toolId)) {
          updatedTarget = { ...c, requestedToolIds: [...currentRequested, toolId] };
          return updatedTarget;
        }
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (supabase && updatedTarget) {
      try {
        await supabase.from('clients').upsert({
          id: (updatedTarget as ClientItem).id,
          fullName: (updatedTarget as ClientItem).fullName,
          company: (updatedTarget as ClientItem).company,
          email: (updatedTarget as ClientItem).email,
          allowedToolIds: (updatedTarget as ClientItem).allowedToolIds || [],
          requestedToolIds: (updatedTarget as ClientItem).requestedToolIds || [],
        });
      } catch (e) {
        console.warn('Supabase requestToolAccess notice:', e);
      }
    }

    return updatedList;
  },

  // Respond to client tool request (Grant or Decline)
  respondToToolRequest: async (clientId: string, toolId: string, action: 'grant' | 'decline'): Promise<ClientItem[]> => {
    const existing = await clientService.getClients();
    let updatedTarget: ClientItem | null = null;

    const updatedList = existing.map((c) => {
      if (c.id === clientId) {
        const currentAllowed = c.allowedToolIds || [];
        const currentRequested = c.requestedToolIds || [];

        const newAllowed = action === 'grant'
          ? Array.from(new Set([...currentAllowed, toolId]))
          : currentAllowed;

        const newRequested = currentRequested.filter((id) => id !== toolId);

        updatedTarget = {
          ...c,
          allowedToolIds: newAllowed,
          requestedToolIds: newRequested,
        };
        return updatedTarget;
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (supabase && updatedTarget) {
      try {
        await supabase.from('clients').upsert({
          id: (updatedTarget as ClientItem).id,
          fullName: (updatedTarget as ClientItem).fullName,
          company: (updatedTarget as ClientItem).company,
          email: (updatedTarget as ClientItem).email,
          allowedToolIds: (updatedTarget as ClientItem).allowedToolIds || [],
          requestedToolIds: (updatedTarget as ClientItem).requestedToolIds || [],
        });
      } catch (e) {
        console.warn('Supabase respondToToolRequest notice:', e);
      }
    }

    return updatedList;
  },

  // Toggle tool access for a specific client
  toggleClientTool: async (clientId: string, toolId: string): Promise<ClientItem[]> => {
    const existing = await clientService.getClients();
    let updatedTarget: ClientItem | null = null;

    const updatedList = existing.map((c) => {
      if (c.id === clientId) {
        const hasTool = c.allowedToolIds.includes(toolId);
        const newAllowed = hasTool
          ? c.allowedToolIds.filter((id) => id !== toolId)
          : [...c.allowedToolIds, toolId];
        const newRequested = (c.requestedToolIds || []).filter((id) => id !== toolId);

        updatedTarget = { ...c, allowedToolIds: newAllowed, requestedToolIds: newRequested };
        return updatedTarget;
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    if (supabase && updatedTarget) {
      try {
        await supabase.from('clients').upsert({
          id: (updatedTarget as ClientItem).id,
          fullName: (updatedTarget as ClientItem).fullName,
          company: (updatedTarget as ClientItem).company,
          email: (updatedTarget as ClientItem).email,
          allowedToolIds: (updatedTarget as ClientItem).allowedToolIds || [],
          requestedToolIds: (updatedTarget as ClientItem).requestedToolIds || [],
        });
      } catch (e) {
        // Ignore
      }
    }
    return updatedList;
  },

  // Deactivate/Activate client profile
  toggleClientStatus: async (clientId: string): Promise<ClientItem[]> => {
    const existing = await clientService.getClients();
    let updatedTarget: ClientItem | null = null;

    const updatedList = existing.map((c) => {
      if (c.id === clientId) {
        updatedTarget = { ...c, status: (c.status === 'active' ? 'inactive' : 'active') as ClientItem['status'] };
        return updatedTarget;
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    if (supabase && updatedTarget) {
      try {
        await supabase.from('clients').upsert({
          id: (updatedTarget as ClientItem).id,
          fullName: (updatedTarget as ClientItem).fullName,
          company: (updatedTarget as ClientItem).company,
          email: (updatedTarget as ClientItem).email,
          status: (updatedTarget as ClientItem).status,
        });
      } catch (e) {
        // Ignore
      }
    }
    return updatedList;
  },
};
