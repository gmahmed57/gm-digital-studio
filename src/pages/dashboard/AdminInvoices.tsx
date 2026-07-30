import { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import { clientService } from '../../services/clientService';
import { notificationService } from '../../services/notificationService';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';
import type { InvoiceItem, InvoiceStatus, InvoiceLineItem } from '../../types/invoice';
import type { ClientItem } from '../../types/client';
import {
  FileText,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  DollarSign,
  User,
  Trash2,
  Send,
  X,
  FileCode2,
  ShieldAlert,
  MessageSquare,
  Eye,
  ExternalLink,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import SEO from '../../components/common/SEO';

export function AdminInvoices() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State for Advanced Multi-Item Invoice Builder
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<InvoiceStatus>('Pending');
  const [notes, setNotes] = useState<string>(
    'Please issue payment within 14 business days of invoice receipt via direct wire transfer or portal checkout.'
  );

  // Modal State for Inspecting Client Payment Proof Document
  const [inspectingInvoice, setInspectingInvoice] = useState<InvoiceItem | null>(null);
  const [rejectMode, setRejectMode] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Clean empty initial line items state (no prefilled generic text)
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: 'item-1', description: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  const loadData = async () => {
    setLoading(true);
    const [invList, clientList] = await Promise.all([
      invoiceService.getInvoices(),
      clientService.getClients(),
    ]);
    setInvoices(invList);
    setClients(clientList);
    if (clientList.length > 0) {
      setSelectedClientId(clientList[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculatedSubtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const calculatedTaxAmount = Math.round((calculatedSubtotal * taxRate) / 100);
  const calculatedTotal = calculatedSubtotal + calculatedTaxAmount;

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLineItemChange = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setLineItems((prev) =>
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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedClient = clients.find((c) => c.id === selectedClientId);
    const formattedAmountStr = `$${calculatedTotal.toLocaleString()}`;

    const mainTitle = description.trim() || lineItems[0]?.description || 'Studio Professional Services';

    const created = await invoiceService.saveInvoice({
      clientId: matchedClient?.id || 'client-1',
      clientName: matchedClient?.fullName || matchedClient?.company || 'Client User',
      clientCompany: matchedClient?.company || 'Client Company',
      clientEmail: matchedClient?.email || 'client@company.com',
      description: mainTitle,
      amount: formattedAmountStr,
      subtotal: calculatedSubtotal,
      taxRate: taxRate,
      tax: calculatedTaxAmount,
      total: calculatedTotal,
      dueDate,
      status,
      notes,
      items: lineItems,
    });

    setInvoices(created);
    setShowModal(false);

    setDescription('');
    setTaxRate(0);
    setLineItems([
      { id: 'item-1', description: '', quantity: 1, rate: 0, amount: 0 },
    ]);

    if (matchedClient?.email) {
      await notificationService.addNotification({
        title: 'New Invoice Issued',
        message: `Admin issued invoice for "${mainTitle}" (${formattedAmountStr}).`,
        type: 'project',
        targetRole: 'client',
        targetEmail: matchedClient.email,
        link: '/client/invoices',
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    const updated = await invoiceService.updateInvoiceStatus(id, newStatus);
    setInvoices(updated);
    if (inspectingInvoice && inspectingInvoice.id === id) {
      setInspectingInvoice(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice record?')) {
      const updated = await invoiceService.deleteInvoice(id);
      setInvoices(updated);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.transactionId && inv.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'all' || inv.status.toLowerCase().replace(/\s+/g, '') === selectedStatus.toLowerCase().replace(/\s+/g, '');

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (parseFloat(inv.amount.replace(/[^0-9.]/g, '')) || 0), 0);
  const paidRevenue = invoices.filter((i) => i.status === 'Paid').reduce((acc, inv) => acc + (parseFloat(inv.amount.replace(/[^0-9.]/g, '')) || 0), 0);
  const pendingAmount = invoices.filter((i) => i.status === 'Pending' || i.status === 'Pending Verification').reduce((acc, inv) => acc + (parseFloat(inv.amount.replace(/[^0-9.]/g, '')) || 0), 0);
  const overdueAmount = invoices.filter((i) => i.status === 'Overdue').reduce((acc, inv) => acc + (parseFloat(inv.amount.replace(/[^0-9.]/g, '')) || 0), 0);

  const statusBadge = (invStatus: InvoiceStatus) => {
    switch (invStatus) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" /> Pending Verification
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" /> Pending
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
        title="Invoices & Billing Control Center - GM Admin"
        description="Manage client invoices, custom tax calculation rates, payment verification proof documents, and lightweight PDF generation."
      />

      <div className="space-y-6 font-sans">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Invoices & Billing Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Issue client billing statements, calculate custom tax rates, inspect visual payment proofs, and export PDF invoices.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" /> Create New Invoice
          </button>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Invoiced
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-2">
              ${totalInvoiced.toLocaleString()}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Paid Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              ${paidRevenue.toLocaleString()}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pending Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-blue-600 dark:text-blue-400 mt-2">
              ${pendingAmount.toLocaleString()}
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
              ${overdueAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Invoices' },
              { id: 'paid', label: 'Paid' },
              { id: 'pendingverification', label: 'Pending Verification' },
              { id: 'pending', label: 'Pending' },
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

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoice #, client, txn ref..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-600 text-xs transition-all"
            />
          </div>
        </div>

        {/* Invoices Directory Table */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading invoice directory...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 mx-auto text-gray-400" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                No invoice records match your search filter query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Invoice & Scope</th>
                    <th className="py-3.5 px-6">Client & Company</th>
                    <th className="py-3.5 px-6">Payment Proof / Txn Ref</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-xs">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className={`hover:bg-gray-50/50 dark:hover:bg-dark-surface/50 transition-colors ${
                        inv.status === 'Pending Verification' ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''
                      }`}
                    >
                      {/* Invoice Details */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                              {inv.invoiceNumber}
                            </span>
                            {inv.requestedByClient && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500 text-white uppercase flex items-center gap-1">
                                REQUESTED BY CLIENT
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {inv.description}
                          </p>

                          {inv.clientMessage && (
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 italic flex items-center gap-1 mt-0.5">
                              <MessageSquare className="w-3 h-3" /> Client Note: "{inv.clientMessage}"
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Client Info */}
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{inv.clientCompany || inv.clientName}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-gray-400" /> {inv.clientName}
                          </p>
                        </div>
                      </td>

                      {/* Payment Proof / Txn Ref */}
                      <td className="py-4 px-6">
                        {inv.transactionId || inv.proofUrl ? (
                          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 space-y-1.5 max-w-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-[11px]">
                                Txn: {inv.transactionId || 'Wire Ref'}
                              </span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                {inv.paymentMethod || 'Wire'}
                              </span>
                            </div>

                            {/* View Visual Proof Document Button */}
                            <button
                              type="button"
                              onClick={() => setInspectingInvoice(inv)}
                              className="w-full py-1 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3 h-3" /> View Proof Document
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">No proof submitted</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                            {inv.amount}
                          </span>
                          {inv.tax !== undefined && inv.tax > 0 && (
                            <span className="block text-[10px] text-gray-400 font-semibold">
                              (Incl. ${inv.tax} tax)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {statusBadge(inv.status)}

                          <select
                            value={inv.status}
                            onChange={(e) => handleStatusChange(inv.id, e.target.value as InvoiceStatus)}
                            className="text-[11px] font-semibold bg-transparent border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            <option value="Paid">Mark Paid</option>
                            <option value="Pending Verification">Pending Verification</option>
                            <option value="Pending">Mark Pending</option>
                            <option value="Overdue">Mark Overdue</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => downloadInvoicePDF(inv)}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                          title="Download lightweight PDF invoice"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Proof Inspector Modal */}
        {inspectingInvoice && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                      Inspect Payment Proof
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Invoice: {inspectingInvoice.invoiceNumber} • {inspectingInvoice.clientCompany}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingInvoice(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Payment Details Metadata Box */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface/60 border border-gray-200 dark:border-dark-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Billed Amount:</span>
                  <span className="font-extrabold text-gray-900 dark:text-white text-sm">{inspectingInvoice.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Txn Ref #:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{inspectingInvoice.transactionId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Payment Method:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{inspectingInvoice.paymentMethod || 'Bank Wire'}</span>
                </div>
                {inspectingInvoice.paymentSubmittedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Submitted On:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{inspectingInvoice.paymentSubmittedAt}</span>
                  </div>
                )}
                {inspectingInvoice.paymentNotes && (
                  <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
                    <span className="text-gray-500 font-medium block mb-0.5">Client Note / Feedback:</span>
                    <p className="text-gray-900 dark:text-white italic">"{inspectingInvoice.paymentNotes}"</p>
                  </div>
                )}
              </div>

              {/* Document / Receipt Screenshot Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Bank Receipt / Document Proof
                  </span>
                  {inspectingInvoice.proofUrl && (
                    <a
                      href={inspectingInvoice.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
                    >
                      Open Full Size <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border max-h-64 bg-gray-100 dark:bg-dark-surface flex items-center justify-center">
                  {inspectingInvoice.proofUrl ? (
                    <img
                      src={inspectingInvoice.proofUrl}
                      alt="Payment Receipt Proof"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full py-16 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <ExternalLink className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-xs font-medium">No document proof uploaded by client.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex flex-col gap-3">
                {rejectMode ? (
                  <div className="w-full space-y-3 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Reason for Rejection
                    </label>
                    <textarea
                      rows={2}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. The document is blurry, or the transaction reference does not match our records."
                      className="w-full px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-900/40 bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 transition-all"
                    />
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRejectMode(false);
                          setRejectReason('');
                        }}
                        className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!rejectReason.trim()}
                        onClick={async () => {
                          const updated = await invoiceService.rejectPaymentProof(inspectingInvoice.id, rejectReason.trim());
                          setInvoices(updated);
                          setInspectingInvoice(null);
                          setRejectMode(false);
                          setRejectReason('');
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setInspectingInvoice(null);
                        setRejectMode(false);
                        setRejectReason('');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-dark-surface cursor-pointer mr-auto"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={() => setRejectMode(true)}
                      className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 cursor-pointer"
                    >
                      Reject Proof
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(inspectingInvoice.id, 'Paid')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" /> Approve Payment & Mark Paid
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Modal for Creating New Invoice (Advanced Multi-Item & Tax Builder) */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                      Issue Client Invoice — Itemized & Tax Builder
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Configure client details, deliverable scope, tax rates, payment terms, and billing totals.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-6">
                
                {/* Client & Invoice Main Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Assigned Client Company / User
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 transition-all appearance-none cursor-pointer"
                      >
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.company || c.fullName} ({c.fullName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Invoice Title / Main Scope
                    </label>
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Brand Identity Kit & Design Guidelines"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Initial Payment Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-600 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Pending">Pending Payment</option>
                      <option value="Paid">Paid in Full</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                {/* Itemized Deliverables & Pricing List */}
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-dark-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Itemized Deliverables & Pricing List
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Add line items with descriptions, quantities, and rates.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 hover:bg-brand-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Line Item
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {lineItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface/60 border border-gray-200 dark:border-dark-border grid grid-cols-12 gap-2 items-center text-xs"
                      >
                        <div className="col-span-6">
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                            placeholder={`e.g. Deliverable item #${index + 1} scope`}
                            className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-full px-2 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white text-center"
                          />
                        </div>

                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            required
                            value={item.rate}
                            onChange={(e) => handleLineItemChange(item.id, 'rate', e.target.value)}
                            placeholder="Rate ($)"
                            className="w-full px-2 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white text-right font-mono"
                          />
                        </div>

                        <div className="col-span-2 flex items-center justify-between pl-1">
                          <span className="font-extrabold text-gray-900 dark:text-white font-mono">
                            ${item.amount.toLocaleString()}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            disabled={lineItems.length === 1}
                            className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tax Calculation Section */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface/60 border border-gray-200 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-900 dark:text-white">
                        Tax Rate (%)
                      </label>
                      <p className="text-[11px] text-gray-500">
                        Specify VAT or sales tax percentage (0% for no tax)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value) || 0))}
                      className="w-20 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white text-center font-mono font-bold text-sm"
                    />
                    <span className="font-bold text-gray-500">%</span>
                  </div>
                </div>

                {/* Totals Telemetry Summary Banner */}
                <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <span>Deliverables Subtotal:</span>
                    <span className="font-mono text-gray-900 dark:text-white">${calculatedSubtotal.toLocaleString()}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <span>Tax ({taxRate}%):</span>
                      <span className="font-mono text-brand-600 dark:text-brand-400">+${calculatedTaxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-brand-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Total Invoice Amount Due
                      </span>
                      <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                        Calculated from {lineItems.length} line item(s) + {taxRate}% tax
                      </p>
                    </div>

                    <span className="text-2xl font-heading font-extrabold text-brand-600 dark:text-brand-400">
                      ${calculatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Customize Payment Terms & Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Customize Payment Terms & PDF Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Custom payment instructions, bank account transfer details, or billing terms..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-dark-surface cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Issue Invoice & Send Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default AdminInvoices;
