import { supabase } from './supabase';

export interface SharedFolder {
  id: string;
  clientId: string;
  folderName: string;
  driveUrl: string;
  createdAt: string;
}

export const folderService = {
  // Fetch folders assigned to a specific client
  getFoldersForClient: async (clientId: string): Promise<SharedFolder[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('shared_folders')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch folders:', error.message);
      throw error;
    }

    if (data) {
      return data.map((f) => ({
        id: f.id,
        clientId: f.client_id,
        folderName: f.folder_name,
        driveUrl: f.drive_url,
        createdAt: f.created_at,
      }));
    }
    return [];
  },

  // Admin assigns a new folder to a client
  addFolder: async (clientId: string, folderName: string, driveUrl: string): Promise<SharedFolder> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const dbPayload = {
      client_id: clientId,
      folder_name: folderName,
      drive_url: driveUrl,
    };

    const { data, error } = await supabase
      .from('shared_folders')
      .insert([dbPayload])
      .select()
      .single();
      
    if (error || !data) {
      console.error('Failed to add folder:', error?.message);
      throw new Error(error?.message || 'Failed to assign folder');
    }

    if (typeof window !== 'undefined') window.dispatchEvent(new Event('studio_folders_updated'));
    
    return {
      id: data.id,
      clientId: data.client_id,
      folderName: data.folder_name,
      driveUrl: data.drive_url,
      createdAt: data.created_at
    };
  },

  // Admin removes a folder
  removeFolder: async (folderId: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase
      .from('shared_folders')
      .delete()
      .eq('id', folderId);

    if (error) {
      console.error('Failed to remove folder:', error.message);
      throw error;
    }
    
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('studio_folders_updated'));
  }
};
