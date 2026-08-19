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

    // 1. Live Aggregate Projects by Client (ID, Email, Company, Name)
    const activeProjectsByClient: Record<string, number> = {};
    const activeProjectsByEmail: Record<string, number> = {};
    const activeProjectsByCompany: Record<string, number> = {};
    const activeProjectsByName: Record<string, number> = {};
    const latestCategoryByClient: Record<string, string> = {};
    const latestCategoryByEmail: Record<string, string> = {};

    try {
      const { data: projData } = await supabase
        .from('projects')
        .select('id, client_id, client_email, client_company, client_name, status, category');

      if (projData) {
        projData.forEach((p: any) => {
          const status = String(p.status || '').toLowerCase().trim();
          const isActive = status !== 'completed' && status !== 'on_hold';

          const cId = p.client_id || p.clientId;
          const cEmail = String(p.client_email || p.clientEmail || '').toLowerCase().trim();
          const cCompany = String(p.client_company || p.clientCompany || '').toLowerCase().trim();
          const cName = String(p.client_name || p.clientName || '').toLowerCase().trim();

          if (isActive) {
            if (cId) activeProjectsByClient[cId] = (activeProjectsByClient[cId] || 0) + 1;
            if (cEmail) activeProjectsByEmail[cEmail] = (activeProjectsByEmail[cEmail] || 0) + 1;
            if (cCompany) activeProjectsByCompany[cCompany] = (activeProjectsByCompany[cCompany] || 0) + 1;
            if (cName) activeProjectsByName[cName] = (activeProjectsByName[cName] || 0) + 1;
          }

          if (p.category) {
            if (cId && !latestCategoryByClient[cId]) latestCategoryByClient[cId] = p.category;
            if (cEmail && !latestCategoryByEmail[cEmail]) latestCategoryByEmail[cEmail] = p.category;
          }
        });
      }
    } catch (projErr) {
      console.warn('[Client Service] Projects telemetry notice:', projErr);
    }

    // 2. Live Aggregate Invoices / Total Billed by Client (ID, Email, Company, Name)
    const invoiceSumByClient: Record<string, number> = {};
    const invoiceSumByEmail: Record<string, number> = {};
    const invoiceSumByCompany: Record<string, number> = {};
    const invoiceSumByName: Record<string, number> = {};

    try {
      const { data: invData } = await supabase
        .from('invoices')
        .select('client_id, client_email, client_company, client_name, total, amount, status');

      if (invData) {
        invData.forEach((inv: any) => {
          if (inv.status !== 'Request Rejected') {
            const val = Number(inv.total) || parseFloat(String(inv.amount || '0').replace(/[^0-9.]/g, '')) || 0;
            const cId = inv.client_id || inv.clientId;
            const cEmail = String(inv.client_email || inv.clientEmail || '').toLowerCase().trim();
            const cCompany = String(inv.client_company || inv.clientCompany || '').toLowerCase().trim();
            const cName = String(inv.client_name || inv.clientName || '').toLowerCase().trim();

            if (cId) invoiceSumByClient[cId] = (invoiceSumByClient[cId] || 0) + val;
            if (cEmail) invoiceSumByEmail[cEmail] = (invoiceSumByEmail[cEmail] || 0) + val;
            if (cCompany) invoiceSumByCompany[cCompany] = (invoiceSumByCompany[cCompany] || 0) + val;
            if (cName) invoiceSumByName[cName] = (invoiceSumByName[cName] || 0) + val;
          }
        });
      }
    } catch (invErr) {
      console.warn('[Client Service] Invoices telemetry notice:', invErr);
    }

    if (data) {
      return data.map((row: any) => {
        const emailKey = String(row.email || '').toLowerCase().trim();
        const companyKey = String(row.company || '').toLowerCase().trim();
        const nameKey = String(row.fullName || row.fullname || row.full_name || '').toLowerCase().trim();

        // 1. Live Active Projects Count calculation with multi-key resolution
        const liveActiveCount =
          (row.id && activeProjectsByClient[row.id] !== undefined ? activeProjectsByClient[row.id] : undefined) ??
          (emailKey && activeProjectsByEmail[emailKey] !== undefined ? activeProjectsByEmail[emailKey] : undefined) ??
          (companyKey && activeProjectsByCompany[companyKey] !== undefined ? activeProjectsByCompany[companyKey] : undefined) ??
          (nameKey && activeProjectsByName[nameKey] !== undefined ? activeProjectsByName[nameKey] : undefined) ??
          (row.activeProjectsCount ?? row.activeprojectscount ?? 0);

        // 2. Live Total Billed calculation with multi-key resolution
        const computedBilledSum =
          (row.id && invoiceSumByClient[row.id] !== undefined ? invoiceSumByClient[row.id] : undefined) ??
          (emailKey && invoiceSumByEmail[emailKey] !== undefined ? invoiceSumByEmail[emailKey] : undefined) ??
          (companyKey && invoiceSumByCompany[companyKey] !== undefined ? invoiceSumByCompany[companyKey] : undefined) ??
          (nameKey && invoiceSumByName[nameKey] !== undefined ? invoiceSumByName[nameKey] : undefined);

        const rawBilled = row.totalBilled || row.totalbilled || row.total_billed;
        let displayBilled = '$0';
        if (computedBilledSum !== undefined && computedBilledSum > 0) {
          displayBilled = `$${computedBilledSum.toLocaleString()}`;
        } else if (rawBilled && rawBilled !== '$0') {
          displayBilled = String(rawBilled).startsWith('$') ? String(rawBilled) : `$${Number(rawBilled).toLocaleString()}`;
        }

        // 3. Assigned Package resolution
        const latestCategory =
          (row.id && latestCategoryByClient[row.id]) ||
          (emailKey && latestCategoryByEmail[emailKey]);

        const assignedPackage =
          row.assignedPackage ||
          row.assignedpackage ||
          row.assigned_package ||
          row.package ||
          latestCategory ||
          'Enterprise Web Development';

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
          activeProjectsCount: liveActiveCount,
          totalBilled: displayBilled,
          assignedPackage,
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
        user_email: '',
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
        user_email: '',
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
