import type { ClientItem } from '../types/client';
import { supabase } from './supabase';
import avatar5 from '../assets/avatars/avatar-5.jpg';

// Clear dummy seeders so only real created clients are visible
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
          // Normalize column names if returned in lowercase from PostgreSQL
          const normalized: ClientItem[] = data.map((row: any) => ({
            id: row.id,
            fullName: row.fullName || row.fullname || row.full_name || 'Client User',
            company: row.company || '',
            email: row.email || '',
            phone: row.phone || '',
            portalPassword: row.portalPassword || row.portalpassword || row.portal_password || '',
            avatarUrl: row.avatarUrl || row.avatarurl || row.avatar_url || avatar5,
            status: row.status || 'active',
            joinedDate: row.joinedDate || row.joineddate || row.joined_date || '',
            activeProjectsCount: row.activeProjectsCount ?? row.activeprojectscount ?? 0,
            totalBilled: row.totalBilled || row.totalbilled || '$0',
            assignedPackage: row.assignedPackage || row.assignedpackage || 'Standard Package',
            allowedToolIds: row.allowedToolIds || row.allowedtoolids || row.allowed_tool_ids || [],
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
        // Fallback to empty list
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
      // Update existing
      targetItem = {
        ...existing.find((item) => item.id === client.id),
        ...client,
      } as ClientItem;
      updatedList = existing.map((item) => (item.id === client.id ? targetItem : item));
    } else {
      // Create new client (all tools locked initially: allowedToolIds = [])
      targetItem = {
        id: `client-${Date.now()}`,
        fullName: client.fullName || 'New Client',
        company: client.company || 'Client Company',
        email: client.email || 'client@company.com',
        phone: client.phone || '+1 (555) 000-0000',
        portalPassword: client.portalPassword || '',
        avatarUrl: avatar5,
        status: client.status || 'active',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        activeProjectsCount: client.activeProjectsCount || 0,
        totalBilled: client.totalBilled || '$0',
        assignedPackage: client.assignedPackage || 'Standard Web Development',
        allowedToolIds: client.allowedToolIds !== undefined ? client.allowedToolIds : [], // Locked by default
      };
      updatedList = [targetItem, ...existing];
    }

    // Save persistently to LocalStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    // Database payload object - ONLY include columns that exist in public.clients PostgreSQL schema!
    const dbPayload = {
      id: targetItem.id,
      fullName: targetItem.fullName,
      company: targetItem.company,
      email: targetItem.email,
      phone: targetItem.phone,
      avatarUrl: typeof targetItem.avatarUrl === 'string' ? targetItem.avatarUrl : '/src/assets/avatars/avatar-5.jpg',
      status: targetItem.status,
      joinedDate: targetItem.joinedDate,
      activeProjectsCount: targetItem.activeProjectsCount,
      totalBilled: targetItem.totalBilled,
      assignedPackage: targetItem.assignedPackage,
      allowedToolIds: targetItem.allowedToolIds || [],
    };

    // Register user in Supabase Auth & PostgreSQL database
    try {
      if (supabase) {
        // 1. Sync payload to public.clients PostgreSQL table
        const { error: dbErr } = await supabase.from('clients').upsert(dbPayload);
        if (dbErr) {
          console.error('Supabase clients table insert error:', dbErr.message || dbErr);
        } else {
          console.log('Successfully inserted client into Supabase clients table!', dbPayload);
        }

        // 2. Create user in Supabase Auth (auth.users)
        if (client.email && targetItem.portalPassword && targetItem.portalPassword.length >= 6) {
          const { data: authData, error: authErr } = await supabase.auth.signUp({
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
          if (authErr) {
            console.warn('Supabase Auth signUp notice:', authErr.message || authErr);
          } else {
            console.log('Successfully created user in Supabase Auth:', authData?.user);
          }
        }
      }
    } catch (e) {
      console.warn('Supabase Auth provisioning notice:', e);
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
        const newToolIds = hasTool
          ? c.allowedToolIds.filter((id) => id !== toolId)
          : [...c.allowedToolIds, toolId];
        updatedTarget = { ...c, allowedToolIds: newToolIds };
        return updatedTarget;
      }
      return c;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    if (supabase && updatedTarget) {
      try {
        const payload = {
          id: (updatedTarget as ClientItem).id,
          fullName: (updatedTarget as ClientItem).fullName,
          company: (updatedTarget as ClientItem).company,
          email: (updatedTarget as ClientItem).email,
          phone: (updatedTarget as ClientItem).phone,
          avatarUrl: typeof (updatedTarget as ClientItem).avatarUrl === 'string' ? (updatedTarget as ClientItem).avatarUrl : '/src/assets/avatars/avatar-5.jpg',
          status: (updatedTarget as ClientItem).status,
          joinedDate: (updatedTarget as ClientItem).joinedDate,
          activeProjectsCount: (updatedTarget as ClientItem).activeProjectsCount,
          totalBilled: (updatedTarget as ClientItem).totalBilled,
          assignedPackage: (updatedTarget as ClientItem).assignedPackage,
          allowedToolIds: (updatedTarget as ClientItem).allowedToolIds,
        };
        await supabase.from('clients').upsert(payload);
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
        const payload = {
          id: (updatedTarget as ClientItem).id,
          fullName: (updatedTarget as ClientItem).fullName,
          company: (updatedTarget as ClientItem).company,
          email: (updatedTarget as ClientItem).email,
          phone: (updatedTarget as ClientItem).phone,
          avatarUrl: typeof (updatedTarget as ClientItem).avatarUrl === 'string' ? (updatedTarget as ClientItem).avatarUrl : '/src/assets/avatars/avatar-5.jpg',
          status: (updatedTarget as ClientItem).status,
          joinedDate: (updatedTarget as ClientItem).joinedDate,
          activeProjectsCount: (updatedTarget as ClientItem).activeProjectsCount,
          totalBilled: (updatedTarget as ClientItem).totalBilled,
          assignedPackage: (updatedTarget as ClientItem).assignedPackage,
          allowedToolIds: (updatedTarget as ClientItem).allowedToolIds,
        };
        await supabase.from('clients').upsert(payload);
      } catch (e) {
        // Ignore
      }
    }
    return updatedList;
  },
};
