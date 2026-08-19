import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { InvoiceItem } from '../../types/invoice';
import { generateInvoiceQRCodeDataUrl, getInvoiceVerificationText } from '../../utils/qrCodeGenerator';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';
import {
  X,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';

interface InvoiceQrModalProps {
  invoice: InvoiceItem | null;
  onClose: () => void;
}

export const InvoiceQrModal: React.FC<InvoiceQrModalProps> = ({ invoice, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (invoice) {
      generateInvoiceQRCodeDataUrl(invoice, { width: 320, margin: 1 }).then((url) => {
        if (isMounted) setQrCodeUrl(url);
      });
    } else {
      setQrCodeUrl('');
    }
    return () => {
      isMounted = false;
    };
  }, [invoice]);

  if (!invoice) return null;

  const handleCopyText = async () => {
    const text = getInvoiceVerificationText(invoice);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy verification text:', err);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDF(invoice);
    } catch (err) {
      console.error('Failed to download invoice PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const amountDisplay = invoice.amount || `$${(invoice.total || 0).toLocaleString()}`;
  const clientDisplay = invoice.clientCompany || invoice.clientName || 'Valued Client';

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                Verified Payment
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Digital payment statement and verification record
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Presentation Box */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
          <div className="relative p-3 bg-white rounded-2xl border border-gray-200 shadow-xs">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt={`QR Code verification for Invoice ${invoice.invoiceNumber || invoice.id}`}
                className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
              />
            ) : (
              <div className="w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> PAID & DIGITALLY VERIFIED
            </span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-1">
              Scan QR to verify invoice authenticity
            </p>
          </div>
        </div>

        {/* Invoice Verification Meta Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-gray-50 dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Invoice Statement
            </span>
            <span className="font-bold text-gray-900 dark:text-white mt-0.5 block truncate">
              {invoice.invoiceNumber || invoice.id}
            </span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Settled Amount
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
              {amountDisplay}
            </span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Client / Entity
            </span>
            <span className="font-medium text-gray-900 dark:text-white mt-0.5 block truncate">
              {clientDisplay}
            </span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Issued Date
            </span>
            <span className="font-medium text-gray-900 dark:text-white mt-0.5 block truncate">
              {invoice.date || 'N/A'}
            </span>
          </div>
        </div>

        {/* Transaction Reference & Verified Issuer Note */}
        <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span>Issuer:</span>
            <span>GM Digital Studio</span>
          </div>
          {invoice.transactionId && (
            <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300">
              <span>Txn Ref:</span>
              <span className="font-mono">{invoice.transactionId}</span>
            </div>
          )}
          {invoice.paymentMethod && (
            <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300">
              <span>Payment Channel:</span>
              <span>{invoice.paymentMethod}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 pt-0.5">
            <span>Support:</span>
            <a
              href="mailto:support@gmdigitalstudio.app"
              className="underline hover:text-emerald-900 dark:hover:text-emerald-100 font-medium"
            >
              support@gmdigitalstudio.app
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-dark-border text-gray-800 dark:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Verification Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Statement Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Verified PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
export default InvoiceQrModal;
