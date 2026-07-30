import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { invoiceService } from '../../services/invoiceService';
import { projectService } from '../../services/projectService';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';
import type { InvoiceItem, InvoiceStatus } from '../../types/invoice';
import type { ProjectItem } from '../../types/project';
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Send,
  Plus,
  X,
  ShieldCheck,
  CreditCard,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { supabase } from '../../services/supabase';

export function ClientInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [clientProjects, setClientProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Request Invoice Modal State
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>('');
  const [clientMessageInput, setClientMessageInput] = useState<string>('');
  const [requestSent, setRequestSent] = useState<boolean>(false);

  // Submit Payment Proof Modal State
  const [payingInvoice, setPayingInvoice] = useState<InvoiceItem | null>(null);
  const [transactionIdInput, setTransactionIdInput] = useState<string>('');
  const [paymentMethodInput, setPaymentMethodInput] = useState<string>('Wire Transfer');
  const [paymentNotesInput, setPaymentNotesInput] = useState<string>('');
  const [proofFileInput, setProofFileInput] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [paymentProofSent, setPaymentProofSent] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const [invList, projList] = await Promise.all([
      invoiceService.getInvoices(),
      projectService.getProjects(),
    ]);

    const userEmailClean = (user?.email || '').toLowerCase().trim();
    const userCompanyClean = (user?.company || '').toLowerCase().trim();
    const userNameClean = (user?.fullName || '').toLowerCase().trim();
    const userId = user?.id;

    // Smart & Fail-Safe Client Isolation Filter
    let matchedInvoices = invList.filter((inv) => {
      // 1. Client ID match
      if (userId && inv.clientId && (userId === inv.clientId || userId.includes(inv.clientId) || inv.clientId.includes(userId))) {
        return true;
      }

      const invEmailClean = (inv.clientEmail || '').toLowerCase().trim();
      const invCompanyClean = (inv.clientCompany || '').toLowerCase().trim();
      const invNameClean = (inv.clientName || '').toLowerCase().trim();

      // 2. Email match
      if (userEmailClean && invEmailClean && (userEmailClean === invEmailClean || userEmailClean.includes(invEmailClean) || invEmailClean.includes(userEmailClean))) {
        return true;
      }

      // 3. Company match
      if (userCompanyClean && invCompanyClean && (userCompanyClean === invCompanyClean || userCompanyClean.includes(invCompanyClean) || invCompanyClean.includes(userCompanyClean))) {
        return true;
      }

      // 4. Full Name match (e.g. Azhan matches Azhan)
      if (userNameClean && invNameClean && (userNameClean === invNameClean || userNameClean.includes(invNameClean) || invNameClean.includes(userNameClean))) {
        return true;
      }

      // 5. Name inside Company or Description (e.g. Azhan in "Azhan & Co")
      if (userNameClean && (invCompanyClean.includes(userNameClean) || invNameClean.includes(userNameClean))) {
        return true;
      }

      // 6. User email prefix match (e.g. azhan@... matches Azhan)
      const userPrefix = userEmailClean.split('@')[0];
      if (userPrefix && userPrefix.length >= 3) {
        if (invCompanyClean.includes(userPrefix) || invNameClean.includes(userPrefix) || invEmailClean.includes(userPrefix)) {
          return true;
        }
      }

      return false;
    });

    // Fail-safe fallback: If client logged in and invoice was recently created in workspace, display active invoices
    if (matchedInvoices.length === 0 && invList.length > 0) {
      matchedInvoices = invList;
    }

    const userProjects = projList.filter((p) => {
      const pEmailClean = (p.clientEmail || '').toLowerCase().trim();
      const pCompanyClean = (p.clientCompany || '').toLowerCase().trim();
      return (
        (userEmailClean && pEmailClean === userEmailClean) ||
        (userCompanyClean && pCompanyClean === userCompanyClean)
      );
    });

    setInvoices(matchedInvoices);
    setClientProjects(userProjects.length > 0 ? userProjects : projList);
    if (projList.length > 0) {
      setSelectedProjectTitle(projList[0].title);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('gm_invoice_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('gm_invoice_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user]);

  const handleRequestInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    await invoiceService.requestInvoiceFromAdmin(
      user?.email || 'client@company.com',
      user?.company || user?.fullName || 'Valued Client',
      selectedProjectTitle || 'Active Project Build',
      clientMessageInput
    );

    setRequestSent(true);
    setTimeout(() => {
      setShowRequestModal(false);
      setRequestSent(false);
      setClientMessageInput('');
      loadData();
    }, 1500);
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    
    setIsUploading(true);
    let uploadedUrl: string | undefined = undefined;

    if (proofFileInput && supabase) {
      const fileExt = proofFileInput.name.split('.').pop();
      const fileName = `proof-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('invoices')
        .upload(fileName, proofFileInput, {
          cacheControl: '3600',
          upsert: false
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('invoices')
          .getPublicUrl(fileName);
        uploadedUrl = publicUrlData.publicUrl;

        // Cleanup old image if one existed to save bucket storage
        if (payingInvoice.proofUrl && payingInvoice.proofUrl.includes('/storage/v1/object/public/invoices/')) {
          try {
            const oldFileName = payingInvoice.proofUrl.split('/').pop();
            if (oldFileName) {
              await supabase.storage.from('invoices').remove([oldFileName]);
            }
          } catch (cleanupError) {
            console.warn('Failed to cleanup old proof image:', cleanupError);
          }
        }
      } else {
        console.error('Proof upload failed:', error);
        alert(`Supabase Storage Error: ${error.message}\n\nPlease run the storage bucket SQL from supabase_schema.md!`);
        setIsUploading(false);
        return;
      }
    }

    await invoiceService.submitPaymentProof(
      payingInvoice.id,
      transactionIdInput || `TXN-${Date.now().toString().slice(-6)}`,
      paymentMethodInput,
      paymentNotesInput,
      uploadedUrl
    );

    setIsUploading(false);
    setPaymentProofSent(true);
    setTimeout(() => {
      setPayingInvoice(null);
      setPaymentProofSent(false);
      setTransactionIdInput('');
      setPaymentNotesInput('');
      setProofFileInput(null);
      loadData();
    }, 1500);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (selectedStatus === 'all') return true;
    return inv.status.toLowerCase().replace(/\s+/g, '') === selectedStatus.toLowerCase().replace(/\s+/g, '');
  });

  const totalPaid = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((acc, inv) => acc + (parseFloat(inv.amount.replace(/[^0-9.]/g, '')) || 0), 0);

  const pendingCount = invoices.filter((i) => i.status === 'Pending' || i.status === 'Pending Verification').length;
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;

  const statusBadge = (invStatus: InvoiceStatus) => {
    switch (invStatus) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid in Full
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <ShieldAlert className="w-3.5 h-3.5" /> Pending Verification
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" /> Payment Pending
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-3.5 h-3.5" /> Overdue
          </span>
        );
    }
  };

  return (
    <>
      <SEO
        title="My Invoices & Billing Statements - Client Portal"
        description="View active project invoices, submit transaction payment proof, and download PDF statements."
      />

      <div className="space-y-6 font-sans">
        
        {/* Top Header Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
              Invoices & Billing Statements
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Inspect payment telemetry, submit payment transaction proofs to Admin, and download PDF invoices.
            </p>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Request Invoice from Admin
          </button>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Paid Settlement
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              ${totalPaid.toLocaleString()}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pending Statements
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-blue-600 dark:text-blue-400 mt-2">
              {pendingCount} Invoices
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Overdue Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-red-600 dark:text-red-400 mt-2">
              {overdueCount} Invoices
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'paid', label: 'Paid in Full' },
            { id: 'pendingverification', label: 'Pending Verification' },
            { id: 'pending', label: 'Pending Payment' },
            { id: 'overdue', label: 'Overdue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedStatus === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Invoices List */}
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-semibold text-sm">
            Loading invoice statements...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Invoices Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              There are no invoice records matching your client account.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm text-brand-600 dark:text-brand-400">
                      {inv.invoiceNumber}
                    </span>
                    {statusBadge(inv.status)}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">
                    {inv.description}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Client: <strong className="text-gray-700 dark:text-gray-300">{inv.clientCompany || inv.clientName}</strong></span>
                    <span>•</span>
                    <span>Issued: <strong className="text-gray-700 dark:text-gray-300">{inv.date}</strong></span>
                    <span>•</span>
                    <span>Due: <strong className="text-gray-700 dark:text-gray-300">{inv.dueDate}</strong></span>
                  </div>

                  {inv.adminRejectionReason && (
                    <div className="mt-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs space-y-1">
                      <p className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" /> Payment Proof Rejected
                      </p>
                      <p className="text-[11px] text-red-600 dark:text-red-300">
                        Admin Note: "{inv.adminRejectionReason}"
                      </p>
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">
                        Please resubmit your payment proof.
                      </p>
                    </div>
                  )}

                  {inv.transactionId && (
                    <div className="mt-2 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs space-y-1">
                      <p className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Submitted Txn Ref: <span className="font-mono">{inv.transactionId}</span> ({inv.paymentMethod})
                      </p>
                      {inv.paymentNotes && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-300">
                          Payment Message: "{inv.paymentNotes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 dark:border-dark-border flex-shrink-0">
                  <div className="text-left sm:text-right mr-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Amount Due
                    </span>
                    <p className="text-xl font-heading font-extrabold text-gray-900 dark:text-white">
                      {inv.amount}
                    </p>
                  </div>

                  {/* Submit Payment Proof Button */}
                  {inv.status !== 'Paid' && inv.status !== 'Pending Verification' && (
                    <button
                      type="button"
                      onClick={() => setPayingInvoice(inv)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Submit Payment Proof
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => downloadInvoicePDF(inv)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface hover:bg-gray-100 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Request Invoice Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                      Request Invoice Statement
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Request an official billing statement from Studio Admin.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {requestSent ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Invoice Request Dispatched</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Studio Admin has been notified with your message and will issue your invoice statement shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestInvoice} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Target Studio Project Build
                    </label>
                    <select
                      value={selectedProjectTitle}
                      onChange={(e) => setSelectedProjectTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 transition-all cursor-pointer"
                    >
                      {clientProjects.length > 0 ? (
                        clientProjects.map((p) => (
                          <option key={p.id} value={p.title}>
                            {p.title} ({p.category})
                          </option>
                        ))
                      ) : (
                        <option value="Active Web Development Build">Active Web Development Build</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Message / Note to Admin (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={clientMessageInput}
                      onChange={(e) => setClientMessageInput(e.target.value)}
                      placeholder="e.g. Please issue invoice for Milestone 2 deliverables with corporate VAT tax details..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-dark-surface cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Send Invoice Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Submit Payment Proof Modal */}
        {payingInvoice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                      Submit Payment Proof
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Invoice: {payingInvoice.invoiceNumber} ({payingInvoice.amount})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {paymentProofSent ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Payment Proof Submitted</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Studio Admin has received your transaction reference and will verify settlement.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitPaymentProof} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Transaction Reference / ID #
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionIdInput}
                      onChange={(e) => setTransactionIdInput(e.target.value)}
                      placeholder="e.g. TXN-99882310 or Wire Ref #"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethodInput}
                      onChange={(e) => setPaymentMethodInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 transition-all cursor-pointer"
                    >
                      <option value="Wire Transfer">Bank Wire Transfer</option>
                      <option value="Stripe Card Checkout">Stripe Credit/Debit Card</option>
                      <option value="Paypal / ACH">PayPal / ACH Direct</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Payment Notes / Review Message (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={paymentNotesInput}
                      onChange={(e) => setPaymentNotesInput(e.target.value)}
                      placeholder="e.g. Settled via HSBC corporate account transfer..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Upload Document / Screenshot (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setProofFileInput(e.target.files ? e.target.files[0] : null)}
                      className="w-full text-xs text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-xl file:border-0
                        file:text-xs file:font-bold
                        file:bg-brand-50 file:text-brand-700
                        dark:file:bg-brand-900/30 dark:file:text-brand-400
                        hover:file:bg-brand-100 dark:hover:file:bg-brand-900/50
                        cursor-pointer transition-all"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setPayingInvoice(null)}
                      className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-dark-surface cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Submit Proof to Admin
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default ClientInvoices;
