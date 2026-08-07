import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { settingsService, type WebsiteSettings } from '../../services/settingsService';
import { contactService, type ContactSubmission } from '../../services/contactService';
import { clientService } from '../../services/clientService';
import { notificationService } from '../../services/notificationService';
import { sendToolRequestAlertEmail } from '../../services/resendService';
import type { ClientItem, StudioTool } from '../../types/client';
import SEO from '../../components/common/SEO';
import { supabase } from '../../services/supabase';
import {
  Settings,
  Wrench,
  Inbox,
  UserCheck,
  Save,
  CheckCircle2,
  Globe,
  Mail,
  Check,
  X,
  FileText,
  Clock,
  Trash2,
} from 'lucide-react';

export function AdminSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Tab 1: General Settings state
  const [generalSettings, setGeneralSettings] = useState<WebsiteSettings>({
    siteName: 'GM DIGITAL STUDIO',
    contactEmail: 'support@gmdigitalstudio.app',
    contactPhone: '+1 (555) 019-2834',
    contactAddress: '123 Creative Suite, Tech City',
    socialFacebook: '',
    socialTwitter: '',
    socialLinkedin: '',
    socialInstagram: '',
    seoTitle: '',
    seoDescription: '',
    logoUrl: '',
    faviconUrl: '',
  });

  // Tab 2: Studio Tools state
  const [tools, setTools] = useState<StudioTool[]>([]);

  // Tab 3: Client Access Requests state
  const [clients, setClients] = useState<ClientItem[]>([]);

  // Tab 4: Contact Submissions state
  const [inquiries, setInquiries] = useState<ContactSubmission[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'pending' | 'contacted' | 'archived'>('all');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFavicons, setUploadedFavicons] = useState<string[]>([]);

  const checkFaviconAssets = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('invoices')
        .list('settings/favicons');
      if (data && !error) {
        setUploadedFavicons(data.map((f) => f.name));
      }
    } catch (e) {
      console.warn('Failed to list favicon files', e);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. General Settings
      const settings = await settingsService.getSettings();
      setGeneralSettings(settings);

      // 2. Tools Catalog
      const toolsList = await settingsService.getTools();
      setTools(toolsList);

      // 3. Client Directory for Requests
      const clientList = await clientService.getClients();
      setClients(clientList);

      // 4. Contact inquiries
      const subList = await contactService.getContactSubmissions();
      setInquiries(subList);

      // 5. Favicon list
      await checkFaviconAssets();
    } catch (e) {
      console.error('Failed to load settings data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  // General Settings save
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await settingsService.saveSettings(generalSettings);
    setIsLoading(false);
    if (success) {
      // Dynamically update the browser tab favicon if specified
      if (generalSettings.faviconUrl) {
        const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = generalSettings.faviconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      setFeedbackMsg('Global website settings saved successfully!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert('Failed to save settings.');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
      if (data && data.publicUrl) {
        setGeneralSettings((prev) => ({ ...prev, logoUrl: data.publicUrl }));
        await settingsService.updateLogoUrl(data.publicUrl);
        alert('Brand logo image uploaded and applied successfully!');
        fetchData();
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      alert(`Logo upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      let finalFaviconUrl = generalSettings.faviconUrl || '';
      const uploadedList: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `favicon_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('favicons')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;
        uploadedList.push(file.name);

        const { data } = supabase.storage.from('favicons').getPublicUrl(fileName);
        if (data && data.publicUrl) {
          finalFaviconUrl = data.publicUrl;
        }
      }

      setGeneralSettings((prev) => ({ ...prev, faviconUrl: finalFaviconUrl }));
      await settingsService.updateFaviconUrl(finalFaviconUrl);

      // Update browser head immediately
      if (finalFaviconUrl) {
        const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = finalFaviconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      setUploadedFavicons((prev) => [...new Set([...prev, ...uploadedList])]);
      alert(`Successfully uploaded and applied ${files.length} favicon assets!`);
      fetchData();
    } catch (err: any) {
      console.error('Favicon upload error:', err);
      alert(`Favicon upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!window.confirm('Are you sure you want to delete and reset the brand logo?')) return;
    setIsUploading(true);
    try {
      await settingsService.updateLogoUrl('');
      setGeneralSettings((prev) => ({ ...prev, logoUrl: '' }));
      alert('Brand logo deleted and reset successfully!');
      fetchData();
    } catch (err: any) {
      console.error('Logo delete error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFavicon = async () => {
    if (!window.confirm('Are you sure you want to delete and reset the custom favicons?')) return;
    setIsUploading(true);
    try {
      await settingsService.updateFaviconUrl('');
      setGeneralSettings((prev) => ({ ...prev, faviconUrl: '' }));
      setUploadedFavicons([]);
      alert('Custom favicons deleted and reset successfully!');
      fetchData();
    } catch (err: any) {
      console.error('Favicon delete error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Tool status toggle
  const handleToggleTool = async (toolId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setTools((prev) => prev.map((t) => (t.id === toolId ? { ...t, isActive: nextStatus } : t)));
    await settingsService.updateToolStatus(toolId, nextStatus);
  };

  // Client Tool request handlers
  const handleApproveTool = async (client: ClientItem, toolId: string, toolName: string) => {
    const updatedAllowed = [...(client.allowedToolIds || [])];
    if (!updatedAllowed.includes(toolId)) {
      updatedAllowed.push(toolId);
    }
    const updatedRequested = (client.requestedToolIds || []).filter((id) => id !== toolId);

    // Save to database
    await clientService.saveClient({
      ...client,
      allowedToolIds: updatedAllowed,
      requestedToolIds: updatedRequested,
    });

    // Alert Client
    await notificationService.addNotification({
      title: 'Studio Tool Unlocked',
      message: `Your access request to "${toolName}" has been approved.`,
      type: 'system',
      targetEmail: client.email,
      link: '/client/tools',
    });

    sendToolRequestAlertEmail({
      clientName: client.fullName,
      clientEmail: client.email,
      toolName,
      status: 'approved',
    }).catch((err) => console.warn('Tool approve email alert notice:', err));

    setFeedbackMsg(`Access to "${toolName}" granted to ${client.fullName}!`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    fetchData();
  };

  const handleDeclineTool = async (client: ClientItem, toolId: string, toolName: string) => {
    const updatedRequested = (client.requestedToolIds || []).filter((id) => id !== toolId);

    // Save to database
    await clientService.saveClient({
      ...client,
      requestedToolIds: updatedRequested,
    });

    // Alert Client
    await notificationService.addNotification({
      title: 'Studio Tool Request Update',
      message: `Your access request to "${toolName}" has been declined. Contact support for details.`,
      type: 'system',
      targetEmail: client.email,
      link: '/client/tools',
    });

    sendToolRequestAlertEmail({
      clientName: client.fullName,
      clientEmail: client.email,
      toolName,
      status: 'declined',
    }).catch((err) => console.warn('Tool decline email alert notice:', err));

    setFeedbackMsg(`Access request to "${toolName}" declined for ${client.fullName}.`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    fetchData();
  };

  // Inquiry status change
  const handleInquiryStatusChange = async (inquiryId: string, nextStatus: 'pending' | 'contacted' | 'archived') => {
    setInquiries((prev) => prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: nextStatus } : inq)));
    await contactService.updateContactStatus(inquiryId, nextStatus);
  };

  const handleInquiryDelete = async (inquiryId: string) => {
    if (!window.confirm('Are you sure you want to delete this contact submission? This action is permanent.')) {
      return;
    }
    setIsLoading(true);
    const success = await contactService.deleteContactSubmission(inquiryId);
    setIsLoading(false);
    if (success) {
      setFeedbackMsg('Contact submission deleted successfully.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchData();
    } else {
      alert('Failed to delete submission.');
    }
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    if (inquiryFilter === 'all') return true;
    return inq.status === inquiryFilter;
  });

  // Count active tool requests
  const requestedClients = clients.filter((c) => (c.requestedToolIds || []).length > 0);
  const totalRequestsCount = requestedClients.reduce((acc, c) => acc + (c.requestedToolIds || []).length, 0);

  // Count pending inquiries
  const pendingInquiriesCount = inquiries.filter((inq) => inq.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-6 space-y-6 font-sans">
      <SEO
        title="Agency Core Configuration | Admin settings"
        description="GM Digital Studio platform and global settings dashboard."
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-500" />
            Agency Configurations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage global parameters, social identity, tool access policies, and inbound visitor inquiries.
          </p>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">{feedbackMsg}</span>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-gray-200 dark:border-dark-border">
        <button
          onClick={() => handleTabChange('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50'
          }`}
        >
          <Globe className="w-4 h-4" /> General & SEO Settings
        </button>

        <button
          onClick={() => handleTabChange('tools')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'tools'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50'
          }`}
        >
          <Wrench className="w-4 h-4" /> Studio Tools Catalog
        </button>

        <button
          onClick={() => handleTabChange('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
            activeTab === 'requests'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Tool Requests
          {totalRequestsCount > 0 && (
            <span className="bg-brand-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
              {totalRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('inquiries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
            activeTab === 'inquiries'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50'
          }`}
        >
          <Inbox className="w-4 h-4" /> Contact Inquiries
          {pendingInquiriesCount > 0 && (
            <span className="bg-brand-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
              {pendingInquiriesCount}
            </span>
          )}
        </button>
      </div>

      {isLoading && <div className="text-center p-6 text-xs text-gray-500">Syncing settings catalog...</div>}

      {/* TAB 1: GENERAL WEBSITE SETTINGS */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Identity card */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-500" /> Agency Profile Coordinates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Studio Platform Name *</label>
                  <input
                    type="text"
                    required
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Contact Email Address *</label>
                  <input
                    type="email"
                    required
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Contact Hotline Phone *</label>
                  <input
                    type="text"
                    required
                    value={generalSettings.contactPhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Physical HQ Address *</label>
                  <input
                    type="text"
                    required
                    value={generalSettings.contactAddress}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Logo Display Mode</label>
                  <select
                    value={generalSettings.logoDisplayMode || 'logo-and-name'}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, logoDisplayMode: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 cursor-pointer font-semibold"
                  >
                    <option value="logo-and-name">Logo and Platform Name</option>
                    <option value="logo-only">Logo Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Footer Brand Name / Copy Title</label>
                  <input
                    type="text"
                    value={generalSettings.footerName || ''}
                    placeholder="E.g., GM DIGITAL STUDIO"
                    onChange={(e) => setGeneralSettings({ ...generalSettings, footerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
                <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-150 dark:border-dark-border pt-4">
                  {/* Logo Upload Card */}
                  <div className="space-y-3 bg-gray-50/50 dark:bg-dark-bg/40 p-4 rounded-xl border border-gray-200/60 dark:border-dark-border">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Brand Logo Uploader</label>
                    {generalSettings.logoUrl && (
                      <div className="p-3 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border flex items-center justify-between relative group">
                        <img src={generalSettings.logoUrl} alt="Preview" className="h-10 w-auto object-contain" />
                        <button
                          type="button"
                          onClick={handleDeleteLogo}
                          className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                          title="Delete logo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        id="logo-picker"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="logo-picker"
                        className={`px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg text-center cursor-pointer transition-all inline-block shadow-xs ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {isUploading ? 'Uploading Image...' : 'Choose Logo Image File'}
                      </label>
                      <input
                        type="text"
                        value={generalSettings.logoUrl || ''}
                        placeholder="Or enter direct URL path"
                        onChange={(e) => setGeneralSettings({ ...generalSettings, logoUrl: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Favicon Upload Card */}
                  <div className="space-y-3 bg-gray-50/50 dark:bg-dark-bg/40 p-4 rounded-xl border border-gray-200/60 dark:border-dark-border">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Favicon Multi-Size Uploader</label>
                    {generalSettings.faviconUrl && (
                      <div className="p-3 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border flex items-center justify-between gap-2">
                        <span className="text-[9px] truncate max-w-[80%] font-mono text-gray-500 dark:text-gray-400">{generalSettings.faviconUrl}</span>
                        <button
                          type="button"
                          onClick={handleDeleteFavicon}
                          className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer flex-shrink-0"
                          title="Delete favicon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        id="favicon-picker"
                        multiple
                        accept=".ico,.png,.webmanifest"
                        onChange={handleFaviconUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="favicon-picker"
                        className={`px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg text-center cursor-pointer transition-all inline-block shadow-xs ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {isUploading ? 'Uploading Favicons...' : 'Choose Favicon Files'}
                      </label>
                      <input
                        type="text"
                        value={generalSettings.faviconUrl || ''}
                        placeholder="Main favicon.ico URL path"
                        onChange={(e) => setGeneralSettings({ ...generalSettings, faviconUrl: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                    {/* Live checklist of uploaded files */}
                    <div className="text-[10px] space-y-1 mt-2 border-t border-gray-200/40 dark:border-dark-border/40 pt-2">
                      <span className="font-bold text-gray-500 block mb-1">Uploaded Assets Checklist:</span>
                      <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                        {[
                          'favicon.ico',
                          'favicon-16x16.png',
                          'favicon-32x32.png',
                          'apple-touch-icon.png',
                          'site.webmanifest'
                        ].map((asset) => {
                          const isUploaded = uploadedFavicons.includes(asset);
                          return (
                            <div key={asset} className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${isUploaded ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                              <span className={isUploaded ? 'text-emerald-600 dark:text-emerald-450 font-bold' : 'text-gray-400'}>
                                {asset}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Settings Card */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" /> SEO Default Metadata
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Default Site SEO Title *</label>
                  <input
                    type="text"
                    required
                    value={generalSettings.seoTitle}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, seoTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Default Meta Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={generalSettings.seoDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, seoDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-500" /> Social Integrations
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1">
                    <Globe className="w-3.5 h-3.5 text-blue-600" /> LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={generalSettings.socialLinkedin || ''}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, socialLinkedin: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1">
                    <Globe className="w-3.5 h-3.5 text-sky-400" /> Twitter (X) URL
                  </label>
                  <input
                    type="text"
                    value={generalSettings.socialTwitter || ''}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, socialTwitter: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1">
                    <Globe className="w-3.5 h-3.5 text-blue-800" /> Facebook URL
                  </label>
                  <input
                    type="text"
                    value={generalSettings.socialFacebook || ''}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, socialFacebook: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1">
                    <Globe className="w-3.5 h-3.5 text-rose-500" /> Instagram URL
                  </label>
                  <input
                    type="text"
                    value={generalSettings.socialInstagram || ''}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, socialInstagram: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-200 dark:border-dark-border">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save Global Config'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: STUDIO TOOLS CATALOG CONTROLS */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-brand-500" /> SaaS Catalog Access Controls
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
              Turn tools on/off globally. Deactivated tools are hidden immediately in the client tools tab, preventing access requests or client launch events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={`p-6 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-xs flex flex-col justify-between transition-all ${
                  !tool.isActive && 'opacity-65'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-dark-bg px-2.5 py-1 rounded-lg">
                      {tool.category}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">{tool.version}</span>
                  </div>
                  <h4 className="text-md font-bold text-gray-900 dark:text-white">{tool.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-450 mt-2 mb-6 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tool.isPremium 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                    }`}>
                      {tool.isPremium ? 'Premium Plan' : 'Standard'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${tool.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {tool.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tool.isActive !== false}
                        onChange={() => handleToggleTool(tool.id, tool.isActive !== false)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLIENT ACCESS REQUEST LOG */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-500" /> Pending Client Requests Log
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
              Clients can request access to Premium tools from their portal. Approve to unlock access, or decline to dismiss the request.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
            {requestedClients.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                No pending client tool access requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-dark-bg/60 border-b border-gray-200 dark:border-dark-border text-gray-500">
                    <tr>
                      <th className="p-4 font-semibold text-xs">Client Coordinate</th>
                      <th className="p-4 font-semibold text-xs">Company</th>
                      <th className="p-4 font-semibold text-xs">Requested Studio Tool</th>
                      <th className="p-4 font-semibold text-xs text-right">Actions Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                    {requestedClients.map((client) => {
                      return (client.requestedToolIds || []).map((reqId) => {
                        const matchedTool = tools.find((t) => t.id === reqId);
                        const toolName = matchedTool ? matchedTool.name : reqId;

                        return (
                          <tr key={`${client.id}-${reqId}`} className="hover:bg-gray-50/30 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-gray-900 dark:text-white">{client.fullName}</div>
                              <div className="text-xs text-gray-500">{client.email}</div>
                            </td>
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                              {client.company}
                            </td>
                            <td className="p-4">
                              <span className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold rounded-xl inline-block">
                                {toolName}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => handleApproveTool(client, reqId, toolName)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  title="Approve Access"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleDeclineTool(client, reqId, toolName)}
                                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  title="Decline Request"
                                >
                                  <X className="w-3.5 h-3.5" /> Decline
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CONTACT SUBMISSIONS LOG */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-dark-border">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Inbox className="w-4 h-4 text-brand-500" /> Inbound Contact Inquiries
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Review visitor project inquiries, budget requests, and direct message entries.
              </p>
            </div>
            
            {/* Filter pills */}
            <div className="flex items-center bg-gray-100 dark:bg-dark-bg p-1 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-semibold">
              {(['all', 'pending', 'contacted', 'archived'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setInquiryFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    inquiryFilter === st
                      ? 'bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions list */}
          <div className="space-y-4">
            {filteredInquiries.length === 0 ? (
              <div className="p-12 bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border text-center text-gray-400 text-sm">
                No contact inquiries matching this status filter found.
              </div>
            ) : (
              filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 dark:border-dark-border pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-gray-900 dark:text-white text-md">{inq.name}</h4>
                        {inq.company && (
                          <span className="text-xs text-gray-450">({inq.company})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {inq.email}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(inq.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Inquiry status select */}
                      <select
                        value={inq.status}
                        onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value as any)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-all ${
                          inq.status === 'pending'
                            ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/30 dark:text-amber-450 dark:border-amber-900'
                            : inq.status === 'contacted'
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-900'
                            : 'bg-gray-150 border-gray-300 text-gray-800 dark:bg-gray-850 dark:text-gray-400 dark:border-gray-700'
                        }`}
                      >
                        <option value="pending">Pending Review</option>
                        <option value="contacted">Contacted / Lead</option>
                        <option value="archived">Archived</option>
                      </select>

                      <button
                        onClick={() => handleInquiryDelete(inq.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 rounded-lg transition-all cursor-pointer border border-red-500/20"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-dark-bg p-3 rounded-xl border border-gray-200 dark:border-dark-border text-xs">
                    <div>
                      <span className="font-semibold text-gray-550 block mb-0.5">Requested Service</span>
                      <span className="font-bold text-gray-850 dark:text-gray-200">{inq.service}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-550 block mb-0.5">Estimated Budget Scope</span>
                      <span className="font-bold text-gray-850 dark:text-gray-200">{inq.budget || 'Not specified'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Message Details</span>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-350 bg-gray-50/50 dark:bg-dark-bg/40 p-4 rounded-xl border border-gray-100 dark:border-dark-border whitespace-pre-wrap leading-relaxed">
                      {inq.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
