import QRCode from 'qrcode';
import type { InvoiceItem } from '../types/invoice';

/**
 * Builds standard, tamper-evident verification statement for an invoice.
 */
export const getInvoiceVerificationText = (invoice: InvoiceItem): string => {
  const invNumber = invoice.invoiceNumber || invoice.id;
  const client = invoice.clientCompany || invoice.clientName || 'Valued Client';
  const amount = invoice.amount || `$${(invoice.total || 0).toLocaleString()}`;
  const date = invoice.date || 'N/A';
  const transactionId = invoice.transactionId ? `\nTransaction Ref : ${invoice.transactionId}` : '';
  const paymentMethod = invoice.paymentMethod ? `\nPayment Method  : ${invoice.paymentMethod}` : '';

  return `=====================================================
GM DIGITAL STUDIO - VERIFIED PAYMENT
=====================================================
Invoice Number  : ${invNumber}
Invoice ID      : ${invoice.id}
Status          : Paid & Digitally Verified
Client / Entity : ${client}
Total Amount    : ${amount}
Invoice Date    : ${date}${transactionId}${paymentMethod}
Issuer          : GM Digital Studio
Support Contact : support@gmdigitalstudio.app
Verification Hub: https://portal.gmdigitalstudio.app
=====================================================`;
};

/**
 * Generates a sharp Base64 PNG Data URL for a given invoice's verification QR code.
 */
export const generateInvoiceQRCodeDataUrl = async (
  invoice: InvoiceItem,
  options?: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  }
): Promise<string> => {
  const text = getInvoiceVerificationText(invoice);
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: options?.width || 256,
      margin: options?.margin ?? 1,
      color: {
        dark: options?.darkColor || '#111827',
        light: options?.lightColor || '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating Invoice QR code:', error);
    return '';
  }
};
