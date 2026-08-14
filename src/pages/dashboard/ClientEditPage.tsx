import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import { notificationService } from '../../services/notificationService';
import { sendWelcomeClientEmail, sendToolRequestAlertEmail } from '../../services/resendService';
import type { ClientItem } from '../../types/client';
import { folderService, type SharedFolder } from '../../services/folderService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { MASTER_STUDIO_TOOLS, normalizeToolId } from '../../constants/toolsData';
import {
  ArrowLeft,
  User,
  Building,
  Mail,
  Phone,
  Package,
  Wrench,
  CheckCircle2,
  Save,
  Power,
  Key,
  Clock,
  Check,
  X,
  FolderOpen,
  Link as LinkIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import SEO from '../../components/common/SEO';

export function ClientEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [assignedPackage, setAssignedPackage] = useState('Enterprise Web Development');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [allowedToolIds, setAllowedToolIds] = useState<string[]>([]);
  const [requestedToolIds, setRequestedToolIds] = useState<string[]>([]);
  const [clientItem, setClientItem] = useState<ClientItem | null>(null);
  const [formError, setFormError] = useState('');

  // Folder Management State
  const [folders, setFolders] = useState<SharedFolder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderUrl, setNewFolderUrl] = useState('');
  const [isAddingFolder, _setIsAddingFolder] = useState(false);

  const loadClient = async () => {
    if (isEditing && id) {
      const clients = await clientService.getClients();
      const found = clients.find((c) => c.id === id);
      if (found) {
        setClientItem(found);
        setFullName(found.fullName);
        setCompany(found.company);
        setEmail(found.email);
        setPhone(found.phone);
        setPortalPassword(found.portalPassword || '');
        setAssignedPackage(found.assignedPackage || 'Enterprise Web Development');
        setStatus(found.status || 'active');
        setAllowedToolIds(found.allowedToolIds || []);
        setRequestedToolIds(found.requestedToolIds || []);
        
        // Load folders
        const clientFolders = await folderService.getFoldersForClient(id);
        setFolders(clientFolders);
      } else {
        navigate('/admin/clients');
      }
    }
  };

  useEffect(() => {
    loadClient();

    const handleUpdate = () => loadClient();
    window.addEventListener('studio_client_updated', handleUpdate);
    window.addEventListener('studio_tools_updated', handleUpdate);
    return () => {
      window.removeEventListener('studio_client_updated', handleUpdate);
      window.removeEventListener('studio_tools_updated', handleUpdate);
    };
  }, [id, isEditing]);

  const toggleTool = (toolId: string) => {
    if (allowedToolIds.includes(toolId)) {
      setAllowedToolIds(allowedToolIds.filter((item) => item !== toolId));
    } else {
      setAllowedToolIds([...allowedToolIds, toolId]);
      setRequestedToolIds(requestedToolIds.filter((item) => item !== toolId));
    }
  };

  const handleToolResponse = async (toolId: string, toolName: string, action: 'grant' | 'decline') => {
    if (!id || !isEditing) return;

    await clientService.respondToToolRequest(id, toolId, action);

    if (action === 'grant') {
      setAllowedToolIds(Array.from(new Set([...allowedToolIds, toolId])));
      setRequestedToolIds(requestedToolIds.filter((t) => t !== toolId));

      if (email) {
        await notificationService.addNotification({
          title: 'Studio Tool Access Granted',
          message: `Admin approved and granted access to "${toolName}" tool.`,
          type: 'client',
          targetRole: 'client',
          targetEmail: email,
          link: '/client/tools',
        });
        sendToolRequestAlertEmail({ clientName: fullName, clientEmail: email, toolName, status: 'approved' }).catch((e) => console.warn(e));
      }
    } else {
      setRequestedToolIds(requestedToolIds.filter((t) => t !== toolId));

      if (email) {
        await notificationService.addNotification({
          title: 'Studio Tool Request Declined',
          message: `Admin declined access request for "${toolName}" tool.`,
          type: 'client',
          targetRole: 'client',
          targetEmail: email,
          link: '/client/tools',
        });
        sendToolRequestAlertEmail({ clientName: fullName, clientEmail: email, toolName, status: 'declined' }).catch((e) => console.warn(e));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isEditing && (!portalPassword || portalPassword.length < 6)) {
      setFormError('Initial Portal Password must be at least 6 characters long.');
      return;
    }

    try {
      await clientService.saveClient({
        id: isEditing ? id : undefined,
        fullName,
        company,
        email,
        phone,
        portalPassword,
        assignedPackage,
        status,
        allowedToolIds,
        requestedToolIds: isEditing ? requestedToolIds : [],
      });

      if (!isEditing) {
        sendWelcomeClientEmail({
          fullName,
          email,
          company,
          assignedPackage,
          portalPassword,
        }).catch((emailErr) => console.warn('Welcome email dispatch notice:', emailErr));
      }

      navigate('/admin/clients');
    } catch (err: any) {
      setFormError(err.message || 'Failed to provision client account.');
    }
  };

  const handleAddFolder = async () => {
    if (!newFolderName || !newFolderUrl || !id) return;
    _setIsAddingFolder(true);
    try {
      const added = await folderService.addFolder(id, newFolderName, newFolderUrl);
      setFolders([added, ...folders]);
      setNewFolderName('');
      setNewFolderUrl('');
    } catch (e) {
      console.error(e);
    }
    _setIsAddingFolder(false);
  };

  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);

  const handleRemoveFolder = (folderId: string) => {
    setDeletingFolderId(folderId);
  };

  const confirmRemoveFolder = async () => {
    if (!deletingFolderId) return;
    await folderService.removeFolder(deletingFolderId);
    setFolders(folders.filter(f => f.id !== deletingFolderId));
    setDeletingFolderId(null);
  };

  const handleToggleActiveStatus = async () => {
    if (id && isEditing) {
      await clientService.toggleClientStatus(id);
      setStatus(status === 'active' ? 'inactive' : 'active');
    }
  };

  return (
    <>
      <SEO
        title={isEditing ? `Edit ${fullName || 'Client'} - GM Admin` : 'Provision New Client - GM Admin'}
        description="Configure client account profile, portal access password, assigned packages, and studio tool access permissions."
      />

      <div className="space-y-6 font-sans">
        
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/clients"
              className="w-9 h-9 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white flex items-center justify-center transition-colors shadow-xs"
              title="Back to Client Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
                {isEditing ? `Manage Account: ${clientItem?.fullName || fullName}` : 'Provision New Client Account'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Configure profile details, portal password, assigned service packages, and granted studio tool permissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleToggleActiveStatus}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  status === 'active'
                    ? 'border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-700 font-bold'
                }`}
              >
                <Power className="w-4 h-4" />
                {status === 'active' ? 'Deactivate Account' : 'Activate Account'}
              </button>
            )}

            <button
              type="submit"
              form="client-edit-form"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Provision Client'}
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {formError && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs font-semibold">
            ⚠️ {formError}
          </div>
        )}

        {/* Edit Form Main Layout */}
        <form id="client-edit-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Client Profile & Account Information Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-dark-border">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                    Client Profile & Access Credentials
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Primary company contact details and portal password assignment.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Aetheria Design Co."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Portal Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sarah@aetheria.design"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Initial Portal Password (Min. 6 characters)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      required={!isEditing}
                      value={portalPassword}
                      onChange={(e) => setPortalPassword(e.target.value)}
                      placeholder="Enter minimum 6 character password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brand-600 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Clients will use this password to log in via the Client Portal.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Assigned Service Package
                  </label>
                  <div className="relative">
                    <Package className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <select
                      value={assignedPackage}
                      onChange={(e) => setAssignedPackage(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-600 text-sm transition-all appearance-none"
                    >
                      <option value="Enterprise Development">Enterprise Web Development</option>
                      <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                      <option value="Social Media Management">Social Media Management</option>
                      <option value="SEO">SEO</option>
                      <option value="Virtual Assistant">Virtual Assistant</option>
                      <option value="AI Automation Suite">AI Automation Suite</option>
                      <option value="Brand Identity Strategy">Brand Identity Strategy</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                      <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Account Status
                  </label>
                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="editStatus"
                        checked={status === 'active'}
                        onChange={() => setStatus('active')}
                        className="text-brand-600 focus:ring-brand-600"
                      />
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        Active Account
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="editStatus"
                        checked={status === 'inactive'}
                        onChange={() => setStatus('inactive')}
                        className="text-brand-600 focus:ring-brand-600"
                      />
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Deactivated
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Drive Shared Folders Management */}
            {isEditing && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-dark-border">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                      Assigned Cloud Folders
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Link Google Drive folders for this client to access securely.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Add New Folder Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <FolderOpen className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Folder Name (e.g. Brand Assets)"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="url"
                        value={newFolderUrl}
                        onChange={(e) => setNewFolderUrl(e.target.value)}
                        placeholder="Google Drive URL"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFolder}
                    disabled={!newFolderName || !newFolderUrl || isAddingFolder}
                    className="w-full px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-brand-200 dark:border-brand-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    {isAddingFolder ? 'Adding...' : 'Link New Folder'}
                  </button>

                  {/* List of Folders */}
                  {folders.length > 0 ? (
                    <div className="space-y-3 mt-4">
                      {folders.map(folder => (
                        <div key={folder.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                              <FolderOpen className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {folder.folderName}
                              </p>
                              <a href={folder.driveUrl} target="_blank" rel="noreferrer" className="text-[10px] text-brand-600 hover:underline truncate block">
                                {folder.driveUrl}
                              </a>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFolder(folder.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                            title="Remove Folder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-gray-300 dark:border-dark-border rounded-2xl bg-gray-50/50 dark:bg-dark-surface/50">
                      <FolderOpen className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">No folders linked for this client.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Granted Studio Tools Access Matrix */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white truncate">
                      Granted Studio Tools Access
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      Respond to client access requests (Grant or Decline).
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20 self-start sm:self-auto shrink-0">
                  {allowedToolIds.map(normalizeToolId).filter(id => MASTER_STUDIO_TOOLS.some(t => normalizeToolId(t.id) === id)).length} of {MASTER_STUDIO_TOOLS.length} Active
                </span>
              </div>

              <div className="space-y-3">
                {MASTER_STUDIO_TOOLS.map((tool) => {
                  const normToolId = normalizeToolId(tool.id);
                  const normAllowed = allowedToolIds.map(normalizeToolId);
                  const normRequested = requestedToolIds.map(normalizeToolId);
                  const isEnabled = normAllowed.includes(normToolId);
                  const isRequested = normRequested.includes(normToolId);

                  return (
                    <div
                      key={tool.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isEnabled
                          ? 'border-brand-500/50 bg-brand-500/5 dark:bg-brand-500/10'
                          : isRequested
                          ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/30'
                          : 'border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {tool.name}
                          </span>
                          {isRequested && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500 text-white uppercase flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> REQUESTED
                            </span>
                          )}
                          {tool.isPremium && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      <div className="shrink-0 self-start sm:self-auto">
                        {isEnabled ? (
                          <button
                            type="button"
                            onClick={() => toggleTool(tool.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 text-brand-600" /> Granted
                          </button>
                        ) : isRequested ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToolResponse(tool.id, tool.name, 'grant')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Grant Access
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToolResponse(tool.id, tool.name, 'decline')}
                              className="px-2.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleTool(tool.id)}
                            className="text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-xl hover:border-brand-500 hover:text-brand-500 cursor-pointer"
                          >
                            Grant Access
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </form>

      </div>

      <ConfirmModal
        isOpen={Boolean(deletingFolderId)}
        title="Remove Shared Folder"
        message="Are you sure you want to remove this shared folder link? The folder itself will not be deleted, only the link reference."
        confirmText="Remove Folder Link"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmRemoveFolder}
        onClose={() => setDeletingFolderId(null)}
      />
    </>
  );
}

export default ClientEditPage;
