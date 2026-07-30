import type { InvoiceItem, InvoiceStatus } from '../types/invoice';
import { supabase } from './supabase';
import { notificationService } from './notificationService';

const STORAGE_KEY = 'gm_studio_invoices_db';

// Helper to filter out legacy dummy/seed data explicitly by known legacy IDs
const isLegacyDummy = (inv: InvoiceItem): boolean => {
  if (!inv) return true;
  if (inv.id === 'inv-1001' || inv.id === 'inv-1002' || inv.id === 'inv-1003') return true;
  if (inv.invoiceNumber === 'INV-2026-042' || inv.invoiceNumber === 'INV-2026-089') return true;
  return false;
};

export const invoiceService = {
  // Get all invoices
  getInvoices: async (): Promise<InvoiceItem[]> => {
    let cloudInvoices: InvoiceItem[] = [];

    // 1. Fetch Local Storage Invoices first
    const cached = localStorage.getItem(STORAGE_KEY);
    let localInvoices: InvoiceItem[] = [];
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        localInvoices = (Array.isArray(parsed) ? parsed : []).filter((inv) => !isLegacyDummy(inv));
      } catch (e) {
        localInvoices = [];
      }
    }

    // 2. Fetch Supabase Cloud Invoices
    try {
      if (supabase) {
        const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
        if (error) {
          console.warn('Supabase select invoices notice:', error.message || error);
        } else if (data && data.length > 0) {
          cloudInvoices = data
            .map((row: any) => {
              // Find matching local item to preserve full metadata
              const matchingLocal = localInvoices.find((l) => l.id === row.id);

              return {
                id: row.id,
                invoiceNumber: row.invoice_number || row.invoiceNumber || row.invoicenumber || matchingLocal?.invoiceNumber || row.id,
                clientId: row.client_id || row.clientId || row.clientid || matchingLocal?.clientId || '',
                clientName: row.client_name || row.clientName || row.clientname || row.full_name || row.fullName || matchingLocal?.clientName || 'Client User',
                clientCompany: row.client_company || row.clientCompany || row.clientcompany || row.company || matchingLocal?.clientCompany || 'Client Organization',
                clientEmail: row.client_email || row.clientEmail || row.clientemail || row.email || matchingLocal?.clientEmail || '',
                description: row.description || matchingLocal?.description || 'Studio Professional Services',
                amount: row.amount || matchingLocal?.amount || '$0',
                subtotal: row.subtotal ?? matchingLocal?.subtotal ?? (parseFloat((row.amount || '0').replace(/[^0-9.]/g, '')) || 0),
                taxRate: row.tax_rate ?? row.taxRate ?? matchingLocal?.taxRate ?? 0,
                tax: row.tax ?? matchingLocal?.tax ?? 0,
                total: row.total ?? matchingLocal?.total ?? (parseFloat((row.amount || '0').replace(/[^0-9.]/g, '')) || 0),
                status: (row.status as InvoiceStatus) || matchingLocal?.status || 'Pending',
                date: row.date || matchingLocal?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                dueDate: row.due_date || row.dueDate || row.duedate || matchingLocal?.dueDate || '',
                pdfUrl: row.pdf_url || row.pdfUrl || row.pdfurl || matchingLocal?.pdfUrl || undefined,
                items: row.items || matchingLocal?.items || undefined,
                requestedByClient: Boolean(row.requested_by_client || row.requestedByClient || row.requestedbyclient || matchingLocal?.requestedByClient),
                notes: row.notes || matchingLocal?.notes || '',
                clientMessage: row.client_message || row.clientMessage || row.clientmessage || matchingLocal?.clientMessage || undefined,
                transactionId: row.transaction_id || row.transactionId || row.transactionid || matchingLocal?.transactionId || undefined,
                paymentMethod: row.payment_method || row.paymentMethod || row.paymentmethod || matchingLocal?.paymentMethod || undefined,
                paymentNotes: row.payment_notes || row.paymentNotes || row.paymentnotes || matchingLocal?.paymentNotes || undefined,
                paymentSubmittedAt: row.payment_submitted_at || row.paymentSubmittedAt || row.paymentsubmittedat || matchingLocal?.paymentSubmittedAt || undefined,
                proofUrl: row.proof_url || row.proofUrl || row.proofurl || matchingLocal?.proofUrl || undefined,
                adminRejectionReason: row.admin_rejection_reason || row.adminRejectionReason || row.adminrejectionreason || matchingLocal?.adminRejectionReason || undefined,
              };
            })
            .filter((inv) => !isLegacyDummy(inv));
        }
      }
    } catch (e) {
      console.warn('Supabase invoices fetch failed, using local storage database.', e);
    }

    // 3. Seamlessly merge Cloud & Local invoices without losing newly created items
    const combinedMap = new Map<string, InvoiceItem>();
    
    // Add local first
    localInvoices.forEach((inv) => {
      if (!isLegacyDummy(inv)) combinedMap.set(inv.id, inv);
    });

    // Add cloud items (overriding or enriching)
    cloudInvoices.forEach((inv) => {
      if (!isLegacyDummy(inv)) combinedMap.set(inv.id, inv);
    });

    const mergedList = Array.from(combinedMap.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList));
    return mergedList;
  },

  // Save new invoice or update existing invoice
  saveInvoice: async (invoice: Partial<InvoiceItem>): Promise<InvoiceItem[]> => {
    const existing = await invoiceService.getInvoices();
    let updatedList: InvoiceItem[];
    let targetItem: InvoiceItem;

    const numAmount = parseFloat((invoice.amount || '0').replace(/[^0-9.]/g, '')) || 5000;

    if (invoice.id && invoice.id !== 'new') {
      const current = existing.find((i) => i.id === invoice.id);
      targetItem = {
        ...current,
        ...invoice,
        subtotal: invoice.subtotal ?? numAmount,
        total: invoice.total ?? numAmount,
      } as InvoiceItem;
      updatedList = existing.map((i) => (i.id === invoice.id ? targetItem : i));
    } else {
      const invNum = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
      targetItem = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invoice.invoiceNumber || invNum,
        clientId: invoice.clientId || 'client-1',
        clientName: invoice.clientName || 'Client User',
        clientCompany: invoice.clientCompany || 'Client Organization',
        clientEmail: invoice.clientEmail || 'client@company.com',
        description: invoice.description || 'Custom Web Development & Design Services',
        amount: invoice.amount || '$0',
        subtotal: invoice.subtotal ?? numAmount,
        taxRate: invoice.taxRate ?? 0,
        tax: invoice.tax ?? 0,
        total: invoice.total ?? numAmount,
        status: invoice.status || 'Pending',
        date: invoice.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        dueDate: invoice.dueDate || new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        requestedByClient: false,
        notes: invoice.notes || 'Payment due within 14 days of invoice issuance.',
        clientMessage: invoice.clientMessage,
        proofUrl: invoice.proofUrl,
        items: invoice.items || [
          { id: '1', description: invoice.description || 'Studio Digital Services', quantity: 1, rate: numAmount, amount: numAmount }
        ]
      };
      updatedList = [targetItem, ...existing];
    }

    // Filter out dummy items
    updatedList = updatedList.filter((inv) => !isLegacyDummy(inv));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    const dbPayload = {
      id: targetItem.id,
      invoice_number: targetItem.invoiceNumber,
      client_id: targetItem.clientId,
      client_name: targetItem.clientName,
      client_company: targetItem.clientCompany,
      client_email: targetItem.clientEmail,
      description: targetItem.description,
      amount: targetItem.amount,
      subtotal: targetItem.subtotal,
      tax_rate: targetItem.taxRate,
      tax: targetItem.tax,
      total: targetItem.total,
      status: targetItem.status,
      date: targetItem.date,
      due_date: targetItem.dueDate,
      items: targetItem.items,
      notes: targetItem.notes,
      client_message: targetItem.clientMessage,
      transaction_id: targetItem.transactionId,
      payment_method: targetItem.paymentMethod,
      payment_notes: targetItem.paymentNotes,
      proof_url: targetItem.proofUrl,
      admin_rejection_reason: targetItem.adminRejectionReason,
    };

    try {
      if (supabase) {
        const { error: upsertError } = await supabase.from('invoices').upsert(dbPayload);
        if (upsertError) {
          console.error('Supabase invoice sync ERROR:', upsertError);
          alert('Supabase Error: ' + upsertError.message);
        }
      }
    } catch (e) {
      console.warn('Supabase invoice sync notice:', e);
    }

    // Broadcast live event for real-time UI synchronization across components & tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gm_invoice_updated'));
    }

    return updatedList;
  },

  // Client requests an invoice statement from Admin with optional message
  requestInvoiceFromAdmin: async (
    clientEmail: string,
    clientCompany: string,
    projectName?: string,
    clientMessage?: string
  ): Promise<InvoiceItem[]> => {
    const existing = await invoiceService.getInvoices();
    const targetProjectName = projectName || 'Active Web Build';

    const newRequestItem: InvoiceItem = {
      id: `inv-req-${Date.now()}`,
      invoiceNumber: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: `client-${Date.now()}`,
      clientName: clientCompany,
      clientCompany: clientCompany,
      clientEmail: clientEmail,
      description: `Invoice Statement Requested for ${targetProjectName}`,
      amount: '$0',
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      dueDate: 'Pending Admin Provision',
      requestedByClient: true,
      clientMessage: clientMessage || undefined,
      notes: 'Client submitted a request for an official billing invoice.',
    };

    const updatedList = [newRequestItem, ...existing].filter((inv) => !isLegacyDummy(inv));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    // Send targeted real-time alert to Admin
    await notificationService.addNotification({
      title: 'New Invoice Requested by Client',
      message: `${clientCompany} (${clientEmail}) requested an invoice for "${targetProjectName}". ${
        clientMessage ? `Note: "${clientMessage}"` : ''
      }`,
      type: 'client',
      targetRole: 'admin',
      link: '/admin/invoices',
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gm_invoice_updated'));
    }

    return updatedList;
  },

  // Client submits payment proof, transaction reference & proof document/image
  submitPaymentProof: async (
    id: string,
    transactionId: string,
    paymentMethod: string,
    paymentNotes: string,
    proofUrl?: string
  ): Promise<InvoiceItem[]> => {
    const existing = await invoiceService.getInvoices();
    let updatedTarget: InvoiceItem | null = null;

    const submittedDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const updatedList = existing
      .map((inv) => {
        if (inv.id === id) {
          updatedTarget = {
            ...inv,
            status: 'Pending Verification' as InvoiceStatus,
            transactionId,
            paymentMethod,
            paymentNotes,
            paymentSubmittedAt: submittedDateStr,
            proofUrl: proofUrl || undefined,
            adminRejectionReason: undefined,
          };
          return updatedTarget;
        }
        return inv;
      })
      .filter((inv) => !isLegacyDummy(inv));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (updatedTarget) {
      const target = updatedTarget as InvoiceItem;
      // Send live notification to Admin
      await notificationService.addNotification({
        title: 'Payment Submitted for Verification',
        message: `${target.clientCompany} submitted payment proof for Invoice ${target.invoiceNumber} (Txn Ref: ${transactionId}).`,
        type: 'client',
        targetRole: 'admin',
        link: '/admin/invoices',
      });

      if (supabase) {
        try {
          await supabase.from('invoices').update({
            status: 'Pending Verification',
            transaction_id: transactionId,
            payment_method: paymentMethod,
            payment_notes: paymentNotes,
            payment_submitted_at: submittedDateStr,
            proof_url: proofUrl || null,
          }).eq('id', id);
        } catch (e) {
          // Ignore
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gm_invoice_updated'));
    }

    return updatedList;
  },

  // Reject submitted payment proof and notify client
  rejectPaymentProof: async (id: string, reason?: string): Promise<InvoiceItem[]> => {
    const existing = await invoiceService.getInvoices();
    let updatedTarget: InvoiceItem | null = null;

    const updatedList = existing
      .map((inv) => {
        if (inv.id === id) {
          updatedTarget = { 
            ...inv, 
            status: 'Pending',
            adminRejectionReason: reason 
          };
          return updatedTarget;
        }
        return inv;
      })
      .filter((inv) => !isLegacyDummy(inv));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (updatedTarget) {
      const target = updatedTarget as InvoiceItem;
      if (target.clientEmail) {
        await notificationService.addNotification({
          title: 'Payment Proof Rejected',
          message: `Admin could not verify your payment proof for Invoice ${target.invoiceNumber}.${reason ? ` Reason: "${reason}"` : ''} Please review and resubmit.`,
          type: 'system',
          targetRole: 'client',
          targetEmail: target.clientEmail,
          link: '/client/invoices',
        });
      }

      if (supabase) {
        try {
          await supabase.from('invoices').update({
            status: 'Pending',
            admin_rejection_reason: reason || null,
          }).eq('id', id);
        } catch (e) {
          // Ignore
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gm_invoice_updated'));
    }

    return updatedList;
  },

  // Update specific invoice status
  updateInvoiceStatus: async (id: string, status: InvoiceStatus): Promise<InvoiceItem[]> => {
    const existing = await invoiceService.getInvoices();
    let updatedTarget: InvoiceItem | null = null;

    const updatedList = existing
      .map((inv) => {
        if (inv.id === id) {
          updatedTarget = { ...inv, status, requestedByClient: false };
          return updatedTarget;
        }
        return inv;
      })
      .filter((inv) => !isLegacyDummy(inv));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    if (supabase && updatedTarget) {
      try {
        await supabase.from('invoices').update({ status: (updatedTarget as InvoiceItem).status }).eq('id', id);
      } catch (e) {
        // Ignore
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gm_invoice_updated'));
    }

    return updatedList;
  },

  // Delete invoice
  deleteInvoice: async (id: string): Promise<InvoiceItem[]> => {
    const existing = await invoiceService.getInvoices();
    const updatedList = existing.filter((inv) => inv.id !== id && !isLegacyDummy(inv));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    try {
      if (supabase) {
        // Find the invoice to check if we need to clean up a proof image
        const targetInvoice = existing.find(inv => inv.id === id);
        
        // Clean up orphaned payment proof image from bucket if it exists
        if (targetInvoice?.proofUrl && targetInvoice.proofUrl.includes('/storage/v1/object/public/invoices/')) {
          try {
            const oldFileName = targetInvoice.proofUrl.split('/').pop();
            if (oldFileName) {
              await supabase.storage.from('invoices').remove([oldFileName]);
            }
          } catch (cleanupError) {
            console.warn('Failed to cleanup proof image on invoice delete:', cleanupError);
          }
        }

        // Delete from database
        await supabase.from('invoices').delete().eq('id', id);
      }
    } catch (e) {
      // Ignore
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gm_invoice_updated'));
    }

    return updatedList;
  },

  // Utility to clear all local invoice database storage for testing
  clearAllInvoices: () => {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gm_invoice_updated'));
    }
  },
};
