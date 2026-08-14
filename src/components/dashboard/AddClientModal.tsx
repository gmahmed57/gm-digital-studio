import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ClientItem } from '../../types/client';
import { MASTER_STUDIO_TOOLS } from '../../constants/toolsData';
import { X, ShieldCheck, User, Building, Mail, Phone, Package, Wrench, CheckCircle2, Loader2 } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<ClientItem>) => void | Promise<void>;
  editingClient?: ClientItem | null;
}

export function AddClientModal({ isOpen, onClose, onSave, editingClient }: AddClientModalProps) {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedPackage, setAssignedPackage] = useState('Enterprise Web Development');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [allowedToolIds, setAllowedToolIds] = useState<string[]>(['file-converter', 'brand-kit']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingClient) {
      setFullName(editingClient.fullName);
      setCompany(editingClient.company);
      setEmail(editingClient.email);
      setPhone(editingClient.phone);
      setAssignedPackage(editingClient.assignedPackage);
      setStatus(editingClient.status);
      setAllowedToolIds(editingClient.allowedToolIds || []);
    } else {
      setFullName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setAssignedPackage('Enterprise Web Development');
      setStatus('active');
      setAllowedToolIds(['file-converter', 'brand-kit']);
    }
  }, [editingClient, isOpen]);

  if (!isOpen) return null;

  const toggleTool = (toolId: string) => {
    if (allowedToolIds.includes(toolId)) {
      setAllowedToolIds(allowedToolIds.filter((id) => id !== toolId));
    } else {
      setAllowedToolIds([...allowedToolIds, toolId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: editingClient?.id,
        fullName,
        company,
        email,
        phone,
        assignedPackage,
        status,
        allowedToolIds,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl my-8 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                {editingClient ? 'Edit Client Profile & Tool Entitlements' : 'Provision New Client Account'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure client account details and grant studio tool permissions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Email Address
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
                    name="status"
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
                    name="status"
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

          {/* Scalable Tool Access Entitlements Checkbox Matrix */}
          <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Granted Studio Tools & Add-ons Access
                </h3>
              </div>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                {allowedToolIds.length} of {MASTER_STUDIO_TOOLS.length} Tools Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MASTER_STUDIO_TOOLS.map((tool) => {
                const isEnabled = allowedToolIds.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                      isEnabled
                        ? 'border-brand-500/50 bg-brand-500/5 dark:bg-brand-500/10'
                        : 'border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {tool.name}
                        </span>
                        {tool.isPremium && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                        {tool.description}
                      </p>
                    </div>

                    <div className="mt-0.5">
                      {isEnabled ? (
                        <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400 fill-brand-600/10" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Account...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  {editingClient ? 'Save Client Profile' : 'Provision Client Account'}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}

export default AddClientModal;
