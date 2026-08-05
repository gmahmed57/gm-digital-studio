export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Pending Verification' | 'Under Approval' | 'Request Rejected';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  description: string;
  amount: string;
  subtotal?: number;
  taxRate?: number;
  tax?: number;
  total?: number;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  pdfUrl?: string;
  items?: InvoiceLineItem[];
  requestedByClient?: boolean;
  notes?: string;
  customProjectName?: string;
  tipAmount?: number;
  // Messaging & Payment Verification fields:
  clientMessage?: string;
  adminRejectionReason?: string; // Reason provided when payment proof or request is rejected
  transactionId?: string;
  paymentMethod?: string;
  paymentNotes?: string;
  paymentSubmittedAt?: string;
  proofUrl?: string; // Visual image/document receipt proof URL
}

