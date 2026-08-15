import type { InvoiceItem, InvoiceStatus } from '../types/invoice';
import type { UserProfile } from '../types/auth';
import { supabase } from './supabase';
import { notificationService } from './notificationService';
import { activityLogService } from './activityLogService';

// Helper to filter out legacy dummy/seed data explicitly by known legacy IDs
const isLegacyDummy = (inv: InvoiceItem | any): boolean => {
  if (!inv) return true;
  if (inv.id === 'inv-1001' || inv.id === 'inv-1002' || inv.id === 'inv-1003') return true;
  if (inv.invoiceNumber === 'INV-2026-042' || inv.invoiceNumber === 'INV-2026-089') return true;
  return false;
};

export const invoiceService = {
  // Get invoices with server-side query isolation for non-admin client users
  getInvoices: async (user?: UserProfile | null): Promise<InvoiceItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized');

    let query = supabase.from('invoices').select('*').order('created_at', { ascending: false });

    // Enforce server-side query isolation for client role users
    if (user && user.role !== 'admin') {
      const email = user.email ? user.email.toLowerCase().trim() : '';
      const userId = user.id || '';

      const filterConditions: string[] = [];
      if (email) filterConditions.push(`client_email.ilike.%${email}%`, `client_email.eq.${email}`);
      if (userId) filterConditions.push(`client_id.eq.${userId}`);

      if (filterConditions.length > 0) {
        query = query.or(filterConditions.join(','));
      } else {
        return [];
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Invoice Service] Database query error:', error.message);
      return [];
    }

    if (data) {
      return data
        .map((row: any) => ({
          id: row.id,
          invoiceNumber: row.invoice_number || row.invoiceNumber || row.invoicenumber || row.id,
          clientId: row.client_id || row.clientId || row.clientid || '',
          clientName: row.client_name || row.clientName || row.clientname || row.full_name || row.fullName || 'Client User',
          clientCompany: row.client_company || row.clientCompany || row.clientcompany || row.company || 'Client Organization',
          clientEmail: row.client_email || row.clientEmail || row.clientemail || row.email || '',
          description: row.description || 'Studio Professional Services',
          amount: row.amount || '$0',
          subtotal: row.subtotal ?? (parseFloat((row.amount || '0').replace(/[^0-9.]/g, '')) || 0),
          taxRate: row.tax_rate ?? row.taxRate ?? 0,
          tax: row.tax ?? 0,
          total: row.total ?? (parseFloat((row.amount || '0').replace(/[^0-9.]/g, '')) || 0),
          status: (row.status as InvoiceStatus) || 'Pending',
          date: row.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          dueDate: row.due_date || row.dueDate || row.duedate || '',
          pdfUrl: row.pdf_url || row.pdfUrl || row.pdfurl || undefined,
          items: row.items || undefined,
          requestedByClient: Boolean(row.requested_by_client || row.requestedByClient || row.requestedbyclient),
          notes: row.notes || '',
          clientMessage: row.client_message || row.clientMessage || row.clientmessage || undefined,
          transactionId: row.transaction_id || row.transactionId || row.transactionid || undefined,
          paymentMethod: row.payment_method || row.paymentMethod || row.paymentmethod || undefined,
          paymentNotes: row.payment_notes || row.paymentNotes || row.paymentnotes || undefined,
          paymentSubmittedAt: row.payment_submitted_at || row.paymentSubmittedAt || row.paymentsubmittedat || undefined,
          proofUrl: row.proof_url || row.proofUrl || row.proofurl || undefined,
          adminRejectionReason: row.admin_rejection_reason || row.adminRejectionReason || row.adminrejectionreason || undefined,
          tipAmount: row.tip_amount ?? row.tipAmount ?? 0,
        }))
        .filter((inv) => !isLegacyDummy(inv));
    }

    return [];
  },

  // Save new invoice or update existing invoice
  saveInvoice: async (invoice: Partial<InvoiceItem>): Promise<InvoiceItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const numAmount = parseFloat((invoice.amount || '0').replace(/[^0-9.]/g, '')) || 5000;
    let targetItem: InvoiceItem;

    if (invoice.id && invoice.id !== 'new') {
      const existing = await invoiceService.getInvoices();
      const current = existing.find((i) => i.id === invoice.id);
      targetItem = {
        ...current,
        ...invoice,
        subtotal: invoice.subtotal ?? numAmount,
        total: invoice.total ?? numAmount,
      } as InvoiceItem;
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
        notes: invoice.notes || 'Please submit payment before the specified due date.',
        clientMessage: invoice.clientMessage,
        proofUrl: invoice.proofUrl,
        items: invoice.items || [
          { id: '1', description: invoice.description || 'Studio Digital Services', quantity: 1, rate: numAmount, amount: numAmount }
        ]
      };
    }

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
      tip_amount: targetItem.tipAmount || 0,
    };

    const { error: upsertError } = await supabase.from('invoices').upsert(dbPayload);
    if (upsertError) {
      console.error('Supabase invoice sync ERROR:', upsertError);
      throw upsertError;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_invoice_updated'));
    }

    return await invoiceService.getInvoices();
  },

  // Client requests an invoice statement from Admin with itemized deliverables, project selection/custom name, and optional tip
  requestInvoiceFromAdmin: async (payload: {
    clientEmail: string;
    clientCompany: string;
    clientName?: string;
    projectName?: string;
    customProjectName?: string;
    clientMessage?: string;
    items?: any[];
    tipAmount?: number;
  }): Promise<InvoiceItem[]> => {
    const targetProjectName = payload.customProjectName?.trim() || payload.projectName?.trim() || 'Custom Project Build';

    const items = payload.items && payload.items.length > 0
      ? payload.items
      : [{ id: 'item-1', description: `Services for ${targetProjectName}`, quantity: 1, rate: 0, amount: 0 }];

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tip = payload.tipAmount && payload.tipAmount > 0 ? payload.tipAmount : 0;
    const total = subtotal + tip;
    const formattedAmount = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const newRequestItem: Partial<InvoiceItem> = {
      id: `inv-req-${Date.now()}`,
      invoiceNumber: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: `client-${Date.now()}`,
      clientName: payload.clientName || payload.clientCompany,
      clientCompany: payload.clientCompany,
      clientEmail: payload.clientEmail,
      description: `Invoice Requested: ${targetProjectName}`,
      amount: formattedAmount,
      subtotal,
      total,
      status: 'Under Approval',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      dueDate: 'Pending Admin Approval',
      requestedByClient: true,
      clientMessage: payload.clientMessage || undefined,
      customProjectName: payload.customProjectName,
      tipAmount: tip,
      items,
      notes: payload.clientMessage ? `Client Request Note: "${payload.clientMessage}"` : 'Client submitted itemized invoice billing request for studio approval.',
    };

    await invoiceService.saveInvoice(newRequestItem);

    // Send targeted real-time alert to Admin
    await notificationService.addNotification({
      title: 'New Client Invoice Request (Awaiting Approval)',
      message: `${payload.clientCompany} requested invoice billing for "${targetProjectName}" (${formattedAmount}).`,
      type: 'client',
      targetRole: 'admin',
      link: '/admin/invoices',
    });

    return await invoiceService.getInvoices();
  },

  // Admin approves client invoice request (with optional customizations)
  approveInvoiceRequest: async (
    id: string,
    customizedData?: Partial<InvoiceItem>
  ): Promise<InvoiceItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const existingList = await invoiceService.getInvoices();
    const existing = existingList.find((inv) => inv.id === id);

    const dueDateStr = customizedData?.dueDate || new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const items = customizedData?.items || existing?.items || [];
    const subtotal = customizedData?.subtotal ?? (items.reduce((sum, item) => sum + (item.quantity * item.rate), 0));
    const taxRate = customizedData?.taxRate ?? existing?.taxRate ?? 0;
    const tax = Math.round((subtotal * taxRate) / 100);
    const tip = customizedData?.tipAmount ?? existing?.tipAmount ?? 0;
    const total = subtotal + tax + tip;
    const formattedAmount = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const { error } = await supabase.from('invoices').update({
      status: 'Pending',
      due_date: dueDateStr,
      description: customizedData?.description || existing?.description || 'Approved Studio Billing Statement',
      items: items,
      subtotal: subtotal,
      tax_rate: taxRate,
      tax: tax,
      total: total,
      tip_amount: tip,
      amount: formattedAmount,
      notes: customizedData?.notes || existing?.notes || 'Invoice request approved by Admin. Please submit payment before the specified due date.',
      admin_rejection_reason: null,
    }).eq('id', id);

    if (error) throw error;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_invoice_updated'));
    }

    const updatedList = await invoiceService.getInvoices();
    const target = updatedList.find((i) => i.id === id);

    if (target && target.clientEmail) {
      await notificationService.addNotification({
        title: 'Invoice Request Approved',
        message: `Admin approved your invoice statement ${target.invoiceNumber} (${formattedAmount}). You can now submit payment proof.`,
        type: 'system',
        targetRole: 'client',
        targetEmail: target.clientEmail,
        link: '/client/invoices',
      });
    }

    return updatedList;
  },

  // Admin rejects client invoice request with reason
  rejectInvoiceRequest: async (id: string, reason: string): Promise<InvoiceItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const { error } = await supabase.from('invoices').update({
      status: 'Request Rejected',
      admin_rejection_reason: reason || 'Invoice request declined by studio admin.',
    }).eq('id', id);

    if (error) throw error;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_invoice_updated'));
    }

    const updatedList = await invoiceService.getInvoices();
    const target = updatedList.find((i) => i.id === id);

    if (target && target.clientEmail) {
      await notificationService.addNotification({
        title: 'Invoice Request Declined',
        message: `Admin declined invoice request ${target.invoiceNumber}. Reason: "${reason}".`,
        type: 'system',
        targetRole: 'client',
        targetEmail: target.clientEmail,
        link: '/client/invoices',
      });
    }

    return updatedList;
  },


  // Client submits payment proof, transaction reference & proof document/image
  submitPaymentProof: async (
    idOrNum: string,
    transactionId: string,
    paymentMethod: string,
    paymentNotes: string,
    proofUrl?: string
  ): Promise<InvoiceItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    // Find existing invoice by id or invoice_number to get exact DB primary key id & invoice_number
    const existingList = await invoiceService.getInvoices();
    const targetInv = existingList.find(i => i.id === idOrNum || i.invoiceNumber === idOrNum);
    const targetId = targetInv?.id || idOrNum;
    const targetNum = targetInv?.invoiceNumber || idOrNum;

    const submittedDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const primaryPayload: Record<string, any> = {
      status: 'Pending Verification',
      transaction_id: transactionId,
      payment_method: paymentMethod,
      payment_notes: paymentNotes,
      payment_submitted_at: submittedDateStr,
      proof_url: proofUrl || null,
      admin_rejection_reason: null
    };

    // Try primary update by ID first, then by invoice_number
    let { error } = await supabase.from('invoices').update(primaryPayload).eq('id', targetId);
    if (error) {
      const { error: err2 } = await supabase.from('invoices').update(primaryPayload).eq('invoice_number', targetNum);
      if (err2) {
        const camelPayload: Record<string, any> = {
          status: 'Pending Verification',
          transactionId: transactionId,
          paymentMethod: paymentMethod,
          paymentNotes: paymentNotes,
          paymentSubmittedAt: submittedDateStr,
          proofUrl: proofUrl || null,
          adminRejectionReason: null
        };
        const { error: err3 } = await supabase.from('invoices').update(camelPayload).eq('id', targetId);
        if (err3) {
          const { error: err4 } = await supabase.from('invoices').update(camelPayload).eq('invoice_number', targetNum);
          if (err4) {
            throw new Error(`Database update failed: ${err4.message}`);
          }
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_invoice_updated'));
    }

    const updatedList = await invoiceService.getInvoices();
    const target = updatedList.find(i => i.id === targetId || i.invoiceNumber === targetNum);

    if (target) {
      await notificationService.addNotification({
        title: 'Payment Submitted for Verification',
        message: `${target.clientCompany} submitted payment proof for Invoice ${target.invoiceNumber} (Txn Ref: ${transactionId}).`,
        type: 'client',
        targetRole: 'admin',
        link: '/admin/invoices',
      });

      activityLogService.logActivity({
        user_name: target.clientName || 'Client User',
        user_email: target.clientEmail || 'client@company.com',
        user_role: 'client',
        action: 'PAYMENT_SUBMITTED',
        entity_type: 'invoice',
        entity_id: target.id,
        details: `Client ${target.clientName} (${target.clientCompany}) submitted payment proof for Invoice #${target.invoiceNumber} (Ref: ${transactionId}).`
      });
    }

    return updatedList;
  },

  // Reject submitted payment proof and notify client
  rejectPaymentProof: async (idOrNum: string, reason?: string): Promise<InvoiceItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const existingList = await invoiceService.getInvoices();
    const targetInv = existingList.find(i => i.id === idOrNum || i.invoiceNumber === idOrNum);
    const targetId = targetInv?.id || idOrNum;
    const targetNum = targetInv?.invoiceNumber || idOrNum;

    const payload = {
      status: 'Pending',
      admin_rejection_reason: reason || null,
    };

    let { error } = await supabase.from('invoices').update(payload).eq('id', targetId);
    if (error) {
      await supabase.from('invoices').update(payload).eq('invoice_number', targetNum);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_invoice_updated'));
    }

    const updatedList = await invoiceService.getInvoices();
    const target = updatedList.find(i => i.id === targetId || i.invoiceNumber === targetNum);

    if (target && target.clientEmail) {
      await notificationService.addNotification({
        title: 'Payment Proof Rejected',
        message: `Admin could not verify your payment proof for Invoice ${target.invoiceNumber}.${reason ? ` Reason: "${reason}"` : ''} Please review and resubmit.`,
        type: 'system',
        targetRole: 'client',
        targetEmail: target.clientEmail,
        link: '/client/invoices',
      });
    }

    return updatedList;
  },

  // Update specific invoice status
  updateInvoiceStatus: async (idOrNum: string, status: InvoiceStatus): Promise<InvoiceItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    const existingList = await invoiceService.getInvoices();
    const targetInv = existingList.find(i => i.id === idOrNum || i.invoiceNumber === idOrNum);
    const targetId = targetInv?.id || idOrNum;
    const targetNum = targetInv?.invoiceNumber || idOrNum;

    const payload = { status, requested_by_client: false };

    let { error } = await supabase.from('invoices').update(payload).eq('id', targetId);
    if (error) {
      await supabase.from('invoices').update(payload).eq('invoice_number', targetNum);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_invoice_updated'));
    }

    return await invoiceService.getInvoices();
  },

  // Delete invoice
  deleteInvoice: async (idOrNum: string): Promise<InvoiceItem[]> => {
    if (!supabase) throw new Error('Database service is not initialized.');

    // Find the invoice to check if we need to clean up a proof image
    const existing = await invoiceService.getInvoices();
    const targetInvoice = existing.find(inv => inv.id === idOrNum || inv.invoiceNumber === idOrNum);
    const targetId = targetInvoice?.id || idOrNum;
    const targetNum = targetInvoice?.invoiceNumber || idOrNum;
    
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

    let { error } = await supabase.from('invoices').delete().eq('id', targetId);
    if (error) {
      await supabase.from('invoices').delete().eq('invoice_number', targetNum);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studio_invoice_updated'));
    }

    return await invoiceService.getInvoices();
  },

  // Utility to clear all local invoice database storage for testing
  clearAllInvoices: () => {
    // No-op for Supabase backend
  },
};
