import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { invoiceService } from '../../services/invoiceService';
import { projectService } from '../../services/projectService';
import { sendInvoiceAlertEmail } from '../../services/resendService';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';
import type { InvoiceItem, InvoiceStatus, InvoiceLineItem } from '../../types/invoice';
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
  const [useCustomProject, setUseCustomProject] = useState<boolean>(false);
  const [customProjectName, setCustomProjectName] = useState<string>('');
  const [clientMessageInput, setClientMessageInput] = useState<string>('');
  const [tipAmountInput, setTipAmountInput] = useState<string>('');
  const [requestSent, setRequestSent] = useState<boolean>(false);

  // Itemized line items for Client Invoice Request
  const [requestLineItems, setRequestLineItems] = useState<InvoiceLineItem[]>([
    { id: 'item-1', description: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  // Submit Payment Proof Modal State
  const [payingInvoice, setPayingInvoice] = useState<InvoiceItem | null>(null);
  const [transactionIdInput, setTransactionIdInput] = useState<string>('');
  const [paymentMethodInput, setPaymentMethodInput] = useState<string>('Bank Wire Transfer');
  const [useCustomPaymentMethod, setUseCustomPaymentMethod] = useState<boolean>(false);
  const [customPaymentMethodInput, setCustomPaymentMethodInput] = useState<string>('');
  const [paymentNotesInput, setPaymentNotesInput] = useState<string>('');
  const [proofFileInput, setProofFileInput] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [paymentProofSent, setPaymentProofSent] = useState<boolean>(false);



  const handleRequestAddLineItem = () => {
    setRequestLineItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}`, description: '', quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const handleRequestRemoveLineItem = (id: string) => {
    if (requestLineItems.length === 1) return;
    setRequestLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRequestLineItemChange = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setRequestLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            const q = field === 'quantity' ? Number(value) || 0 : item.quantity;
            const r = field === 'rate' ? Number(value) || 0 : item.rate;
            updated.amount = q * r;
          }
          return updated;
        }
        return item;
      })
    );
  };


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

    const userProjects = projList.filter((p) => {
      const pEmailClean = (p.clientEmail || '').toLowerCase().trim();
      const pCompanyClean = (p.clientCompany || '').toLowerCase().trim();
      return (
        (userEmailClean && pEmailClean === userEmailClean) ||
        (userCompanyClean && pCompanyClean === userCompanyClean)
      );
    });

    setInvoices(matchedInvoices);
    setClientProjects(userProjects);
    if (userProjects.length > 0) {
      setSelectedProjectTitle(userProjects[0].title);
      setUseCustomProject(false);
    } else {
      setSelectedProjectTitle('');
      setUseCustomProject(true);
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

    const tipVal = parseFloat(tipAmountInput.replace(/[^0-9.]/g, '')) || 0;

    await invoiceService.requestInvoiceFromAdmin({
      clientEmail: user?.email || 'client@company.com',
      clientCompany: user?.company || user?.fullName || 'Valued Client',
      clientName: user?.fullName || 'Valued Client',
      projectName: useCustomProject ? undefined : selectedProjectTitle,
      customProjectName: useCustomProject ? customProjectName : undefined,
      clientMessage: clientMessageInput,
      items: requestLineItems,
      tipAmount: tipVal,
    });

    sendInvoiceAlertEmail({
      invoiceNumber: 'REQ-NEW',
      clientName: user?.fullName || user?.company || 'Valued Client',
      clientEmail: user?.email || 'client@company.com',
      amount: '$0 (Custom Request)',
      status: 'Under Approval',
    }).catch((err) => console.warn('Invoice request email notice:', err));

    setRequestSent(true);
    setTimeout(() => {
      setShowRequestModal(false);
      setRequestSent(false);
      setClientMessageInput('');
      setCustomProjectName('');
      setTipAmountInput('');
      setRequestLineItems([{ id: 'item-1', description: '', quantity: 1, rate: 0, amount: 0 }]);
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

    const finalPaymentMethod = useCustomPaymentMethod
      ? (customPaymentMethodInput.trim() || 'Custom Payment Method')
      : paymentMethodInput;

    await invoiceService.submitPaymentProof(
      payingInvoice.id,
      transactionIdInput || `TXN-${Date.now().toString().slice(-6)}`,
      finalPaymentMethod,
      paymentNotesInput,
      uploadedUrl
    );

    sendInvoiceAlertEmail({
      invoiceNumber: payingInvoice.invoiceNumber,
      clientName: payingInvoice.clientName,
      clientEmail: payingInvoice.clientEmail,
      amount: payingInvoice.amount,
      status: 'Under Approval',
      paymentProofUrl: uploadedUrl,
    }).catch((err) => console.warn('Payment proof email notice:', err));

    setIsUploading(false);
    setPaymentProofSent(true);
    setTimeout(() => {
      setPayingInvoice(null);
      setPaymentProofSent(false);
      setTransactionIdInput('');
      setPaymentNotesInput('');
      setCustomPaymentMethodInput('');
      setUseCustomPaymentMethod(false);
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

  const pendingCount = invoices.filter((i) => i.status === 'Pending' || i.status === 'Pending Verification' || i.status === 'Under Approval').length;
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;

  const statusBadge = (invStatus: InvoiceStatus) => {
    switch (invStatus) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid in Full
          </span>
        );
      case 'Under Approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Under Approval (Awaiting Admin)
          </span>
        );
      case 'Request Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <X className="w-3.5 h-3.5" /> Request Declined
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
                    {inv.tipAmount !== undefined && inv.tipAmount > 0 && (
                      <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        (Incl. ${inv.tipAmount.toLocaleString()} tip)
                      </span>
                    )}
                  </div>

                  {/* Submit Payment Proof Button (Enabled ONLY after Admin Approval: Pending or Overdue) */}
                  {(inv.status === 'Pending' || inv.status === 'Overdue') && (
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

        {/* Request Invoice Modal (Itemized, Custom Project & Tip Builder) */}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
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
                      Submit itemized deliverables and pricing for Studio Admin approval.
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
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Invoice Request Submitted for Approval</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your request has been dispatched to Studio Admin. Its status is now set to <strong>Under Approval</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestInvoice} className="space-y-5">
                  {/* Project Selector / Custom Project Name Toggle */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Project Scope / Reference
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseCustomProject(!useCustomProject)}
                        className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
                      >
                        {useCustomProject ? '← Select Active Project' : '+ Enter Custom Project Name'}
                      </button>
                    </div>

                    {useCustomProject ? (
                      <input
                        type="text"
                        required
                        value={customProjectName}
                        onChange={(e) => setCustomProjectName(e.target.value)}
                        placeholder="e.g. E-Commerce Rebrand & Mobile App API"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                      />
                    ) : (
                      <select
                        value={selectedProjectTitle}
                        onChange={(e) => setSelectedProjectTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all cursor-pointer"
                      >
                        {clientProjects.length > 0 ? (
                          clientProjects.map((p) => (
                            <option key={p.id} value={p.title}>
                              {p.title} ({p.category})
                            </option>
                          ))
                        ) : (
                          <option value="Custom Studio Build">Custom Studio Build</option>
                        )}
                      </select>
                    )}
                  </div>

                  {/* Itemized Deliverables & Pricing Builder */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          Itemized Deliverables & Pricing
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Add the specific items, quantities, and rates you are requesting.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRequestAddLineItem}
                        className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 hover:bg-brand-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Item
                      </button>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {requestLineItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface/60 border border-gray-200 dark:border-dark-border grid grid-cols-12 gap-2 items-center text-xs"
                        >
                          <div className="col-span-6">
                            <label className="block text-[10px] text-gray-400 font-bold mb-1">
                              Item #{index + 1} Description
                            </label>
                            <input
                              type="text"
                              required
                              value={item.description}
                              onChange={(e) => handleRequestLineItemChange(item.id, 'description', e.target.value)}
                              placeholder="e.g. Frontend UI Components"
                              className="w-full p-2 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[10px] text-gray-400 font-bold mb-1">
                              Qty
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleRequestLineItemChange(item.id, 'quantity', e.target.value)}
                              className="w-full p-2 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white text-xs text-center focus:ring-2 focus:ring-brand-600"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-[10px] text-gray-400 font-bold mb-1">
                              Unit Rate ($)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.rate}
                              onChange={(e) => handleRequestLineItemChange(item.id, 'rate', e.target.value)}
                              className="w-full p-2 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white text-xs text-right font-mono focus:ring-2 focus:ring-brand-600"
                            />
                          </div>

                          <div className="col-span-1 flex items-center justify-end pt-4">
                            <button
                              type="button"
                              onClick={() => handleRequestRemoveLineItem(item.id)}
                              disabled={requestLineItems.length === 1}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                              title="Delete Item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Optional Tip / Gratuity & Message */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Optional Gratuity / Studio Tip ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={tipAmountInput}
                        onChange={(e) => setTipAmountInput(e.target.value)}
                        placeholder="e.g. 50 (Optional bonus)"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Message / Note to Admin (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={clientMessageInput}
                        onChange={(e) => setClientMessageInput(e.target.value)}
                        placeholder="Additional billing details..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Requested Total Calculation Summary */}
                  <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      Total Requested Amount:
                    </span>
                    <span className="text-base font-extrabold text-brand-600 dark:text-brand-400 font-mono">
                      ${(
                        requestLineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0) +
                        (parseFloat(tipAmountInput) || 0)
                      ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
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
                      <Send className="w-4 h-4" /> Submit Request for Approval
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Payment Method
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseCustomPaymentMethod(!useCustomPaymentMethod)}
                        className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
                      >
                        {useCustomPaymentMethod ? '← Select Standard Method' : '+ Enter Custom Method'}
                      </button>
                    </div>

                    {useCustomPaymentMethod ? (
                      <input
                        type="text"
                        required
                        value={customPaymentMethodInput}
                        onChange={(e) => setCustomPaymentMethodInput(e.target.value)}
                        placeholder="e.g. Wise Transfer / Crypto (USDT) / Bank Cheque"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                      />
                    ) : (
                      <select
                        value={paymentMethodInput}
                        onChange={(e) => {
                          if (e.target.value === 'Other') {
                            setUseCustomPaymentMethod(true);
                          } else {
                            setPaymentMethodInput(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 transition-all cursor-pointer"
                      >
                        <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                        <option value="Stripe Card Checkout">Stripe Credit/Debit Card</option>
                        <option value="PayPal / ACH Direct">PayPal / ACH Direct</option>
                        <option value="Other">+ Other Custom Payment Method...</option>
                      </select>
                    )}
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
