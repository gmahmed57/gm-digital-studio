import { supabase } from './supabase';
import { MASTER_STUDIO_TOOLS } from '../constants/toolsData';
import type { StudioTool } from '../types/client';

export interface WebsiteSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialInstagram?: string;
  seoTitle: string;
  seoDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  logoDisplayMode?: 'logo-and-name' | 'logo-only';
  footerName?: string;
}

const SETTINGS_KEY = 'studio_website_settings';
const TOOLS_KEY = 'studio_tools_cache';

const DEFAULT_SETTINGS: WebsiteSettings = {
  siteName: 'GM DIGITAL STUDIO',
  contactEmail: 'support@gmdigitalstudio.app',
  contactPhone: '+1 (555) 019-2834',
  contactAddress: '123 Creative Suite, Tech City',
  socialFacebook: 'https://facebook.com/gmstudio',
  socialTwitter: 'https://twitter.com/gmstudio',
  socialLinkedin: 'https://linkedin.com/company/gmstudio',
  socialInstagram: 'https://instagram.com/gmstudio',
  seoTitle: 'GM Digital Studio | Premium Software & Creative Agency',
  seoDescription: 'Premium SaaS digital agency designing and engineering high-velocity websites, UI/UX systems, and AI automation pipelines.',
  logoUrl: '',
  faviconUrl: '',
  logoDisplayMode: 'logo-and-name',
  footerName: 'GM DIGITAL STUDIO',
};

export const settingsService = {
  async getSettings(): Promise<WebsiteSettings> {
    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (data && !error) {
        // Map database fields (check both folded lowercase and case-preserved camelCase)
        const mapped: WebsiteSettings = {
          siteName: data.sitename || data.siteName || '',
          contactEmail: data.contactemail || data.contactEmail || '',
          contactPhone: data.contactphone || data.contactPhone || '',
          contactAddress: data.contactaddress || data.contactAddress || '',
          socialFacebook: data.socialfacebook || data.socialFacebook || '',
          socialTwitter: data.socialtwitter || data.socialTwitter || '',
          socialLinkedin: data.sociallinkedin || data.socialLinkedin || '',
          socialInstagram: data.socialinstagram || data.socialInstagram || '',
          seoTitle: data.seotitle || data.seoTitle || '',
          seoDescription: data.seodescription || data.seoDescription || '',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          logoDisplayMode: data.logoDisplayMode || 'logo-and-name',
          footerName: data.footerName || '',
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase fetch failed for website_settings, loading local cache.', e);
    }

    // Fallback to local storage or defaults
    const cached = localStorage.getItem(SETTINGS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as WebsiteSettings;
      } catch (err) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  },

  async saveSettings(settings: WebsiteSettings): Promise<boolean> {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    try {
      // Upsert payload contains both folded lowercase keys and camelCase keys
      // to ensure compatibility with whichever database schema is currently active.
      const payload = {
        id: 'global',
        // Lowercase keys
        sitename: settings.siteName,
        contactemail: settings.contactEmail,
        contactphone: settings.contactPhone,
        contactaddress: settings.contactAddress,
        socialfacebook: settings.socialFacebook,
        socialtwitter: settings.socialTwitter,
        sociallinkedin: settings.socialLinkedin,
        socialinstagram: settings.socialInstagram,
        seotitle: settings.seoTitle,
        seodescription: settings.seoDescription,
        // Case-preserved camelCase keys (must match double-quoted SQL columns)
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        logoDisplayMode: settings.logoDisplayMode,
        footerName: settings.footerName,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('website_settings').upsert(payload);

      if (!error) return true;
      console.error('Failed to save settings to Supabase:', error.message);
    } catch (e) {
      console.error('Failed to save settings to Supabase (network error):', e);
    }

    return true; // Return true as it saved locally
  },

  async updateLogoUrl(logoUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('website_settings')
        .update({ logoUrl })
        .eq('id', 'global');
      if (!error) {
        const cached = localStorage.getItem(SETTINGS_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.logoUrl = logoUrl;
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
        }
        return true;
      }
      console.error('Failed to update logoUrl in Supabase:', error.message);
    } catch (e) {
      console.error('Failed to update logoUrl:', e);
    }
    return false;
  },

  async updateFaviconUrl(faviconUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('website_settings')
        .update({ faviconUrl })
        .eq('id', 'global');
      if (!error) {
        const cached = localStorage.getItem(SETTINGS_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.faviconUrl = faviconUrl;
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
        }
        return true;
      }
      console.error('Failed to update faviconUrl in Supabase:', error.message);
    } catch (e) {
      console.error('Failed to update faviconUrl:', e);
    }
    return false;
  },

  async getTools(): Promise<StudioTool[]> {
    try {
      const { data, error } = await supabase
        .from('studio_tools')
        .select('*')
        .order('created_at', { ascending: true });

      if (data && !error && data.length > 0) {
        const parsedTools = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          description: t.description,
          iconName: t.iconName || t.iconname || t.icon_name || 'Wrench',
          isPremium: t.isPremium ?? t.ispremium ?? t.is_premium ?? false,
          version: t.version || '1.0.0',
          isActive: t.isActive ?? t.isactive ?? t.is_active ?? true,
        }));
        localStorage.setItem(TOOLS_KEY, JSON.stringify(parsedTools));
        return parsedTools;
      }
    } catch (e) {
      console.warn('Supabase fetch failed for studio_tools, using cache.', e);
    }

    // Cache fallback
    const cached = localStorage.getItem(TOOLS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as StudioTool[];
      } catch (err) {
        return MASTER_STUDIO_TOOLS;
      }
    }

    // Initialize cache if empty
    localStorage.setItem(TOOLS_KEY, JSON.stringify(MASTER_STUDIO_TOOLS));
    return MASTER_STUDIO_TOOLS;
  },

  async updateToolStatus(toolId: string, isActive: boolean): Promise<boolean> {
    const tools = await this.getTools();
    const targetTool = tools.find((t) => t.id === toolId);
    
    if (targetTool) {
      try {
        const { error } = await supabase
          .from('studio_tools')
          .upsert({
            id: targetTool.id,
            name: targetTool.name,
            description: targetTool.description,
            category: targetTool.category,
            version: targetTool.version,
            iconname: targetTool.iconName,
            isactive: isActive,
            ispremium: targetTool.isPremium,
          }, { onConflict: 'id' });

        if (error) {
          console.error('Supabase update tool status failed:', error.message, error);
          throw error;
        }
      } catch (e) {
        console.error('Supabase upsert tool status exception:', e);
      }
    }

    const updated = tools.map((t) => (t.id === toolId ? { ...t, isActive } : t));
    localStorage.setItem(TOOLS_KEY, JSON.stringify(updated));
    return true;
  },
};
