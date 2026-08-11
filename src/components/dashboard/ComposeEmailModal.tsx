import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clientService } from '../../services/clientService';
import { sendCustomComposeEmail, renderEmailShell } from '../../services/resendService';
import { notificationService } from '../../services/notificationService';
import type { ClientItem } from '../../types/client';
import {
  Mail,
  Send,
  X,
  Users,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  Eye,
  Code,
  Edit3,
} from 'lucide-react';

export interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipientEmail?: string;
  initialRecipientName?: string;
}

export const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({
  isOpen,
  onClose,
  initialRecipientEmail,
  initialRecipientName,
}) => {
  const [recipientMode, setRecipientMode] = useState<'single_client' | 'all_clients' | 'custom_email'>('single_client');
  const [composeMode, setComposeMode] = useState<'visual' | 'html_code'>('visual');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [bodyMessage, setBodyMessage] = useState<string>('');
  const [rawHtmlCode, setRawHtmlCode] = useState<string>('');

  const [ctaText, setCtaText] = useState<string>('Access Client Portal');
  const [ctaUrl, setCtaUrl] = useState<string>('https://gmdigitalstudio.app/login');
  const [includeCta, setIncludeCta] = useState<boolean>(true);

  const [isSending, setIsSending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      clientService.getClients().then((data) => {
        setClients(data);
        if (initialRecipientEmail) {
          const match = data.find((c) => c.email.toLowerCase() === initialRecipientEmail.toLowerCase());
          if (match) {
            setRecipientMode('single_client');
            setSelectedClientId(match.id);
          } else {
            setRecipientMode('custom_email');
            setCustomEmail(initialRecipientEmail);
          }
        } else if (data.length > 0) {
          setSelectedClientId(data[0].id);
        }
      });
    }
  }, [isOpen, initialRecipientEmail]);

  if (!isOpen) return null;

  // Calculate live preview HTML
  const getRenderedPreviewHtml = (): string => {
    if (composeMode === 'html_code' && rawHtmlCode.trim()) {
      return rawHtmlCode;
    }
    const formattedParagraphs = bodyMessage
      ? bodyMessage
          .split('\n')
          .filter((p) => p.trim())
          .map((p) => `<p style="margin-bottom: 12px; color: #334155; line-height: 1.6;">${p}</p>`)
          .join('')
      : '<p style="color: #94a3b8; font-style: italic;">[Your email body message will appear here in real-time...]</p>';

    let recipientDisplayName = initialRecipientName;
    if (recipientMode === 'single_client') {
      const selected = clients.find((c) => c.id === selectedClientId);
      if (selected) recipientDisplayName = selected.fullName;
    }

    const bodyContent = `
      ${recipientDisplayName ? `<p style="margin-bottom: 16px; font-size: 15px;">Dear <strong>${recipientDisplayName}</strong>,</p>` : ''}
      ${formattedParagraphs}
    `;

    return renderEmailShell(
      subject || 'Subject Line Preview',
      bodyContent,
      includeCta && ctaText ? ctaText : undefined,
      includeCta && ctaUrl ? ctaUrl : undefined
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!subject.trim()) {
      setFeedback({ type: 'error', message: 'Please enter an email subject line.' });
      return;
    }

    if (composeMode === 'visual' && !bodyMessage.trim()) {
      setFeedback({ type: 'error', message: 'Please enter the email body message.' });
      return;
    }

    if (composeMode === 'html_code' && !rawHtmlCode.trim()) {
      setFeedback({ type: 'error', message: 'Please paste your custom HTML code.' });
      return;
    }

    let recipients: string[] = [];
    let recipientName: string | undefined = undefined;

    if (recipientMode === 'single_client') {
      const client = clients.find((c) => c.id === selectedClientId);
      if (!client) {
        setFeedback({ type: 'error', message: 'Please select a valid client.' });
        return;
      }
      recipients = [client.email];
      recipientName = client.fullName;
    } else if (recipientMode === 'all_clients') {
      recipients = clients.map((c) => c.email).filter(Boolean);
      if (recipients.length === 0) {
        setFeedback({ type: 'error', message: 'No active client email addresses found.' });
        return;
      }
    } else {
      if (!customEmail.trim() || !customEmail.includes('@')) {
        setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
        return;
      }
      recipients = [customEmail.trim()];
      recipientName = initialRecipientName || undefined;
    }

    setIsSending(true);

    try {
      const res = await sendCustomComposeEmail({
        to: recipients,
        subject: subject.trim(),
        bodyMessage: bodyMessage.trim() || 'Custom HTML Template Email',
        rawHtml: composeMode === 'html_code' ? rawHtmlCode.trim() : undefined,
        ctaText: includeCta && ctaText.trim() ? ctaText.trim() : undefined,
        ctaUrl: includeCta && ctaUrl.trim() ? ctaUrl.trim() : undefined,
        recipientName,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Email dispatched & logged in Supabase for ${recipients.length} recipient(s) from support@gmdigitalstudio.app!`,
        });

        // Record system notification log
        await notificationService.addNotification({
          title: 'Custom Support Email Sent',
          message: `Admin sent support email "${subject.trim()}" to ${recipients.join(', ')}.`,
          type: 'system',
          targetRole: 'admin',
          link: '/admin/emails',
        });

        setTimeout(() => {
          setSubject('');
          setBodyMessage('');
          setRawHtmlCode('');
          setFeedback(null);
          onClose();
        }, 2000);
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to send email.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error dispatching custom email.' });
    } finally {
      setIsSending(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden font-sans">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex-shrink-0 p-5 sm:p-6 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold border border-brand-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-extrabold text-white flex items-center gap-2">
                Compose Custom Email Studio
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-600 text-white uppercase tracking-wider">
                  Live Dispatch & Logging
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Sender: <strong className="text-brand-400 font-mono">support@gmdigitalstudio.app</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Editor vs Preview Tabs */}
            <div className="flex items-center bg-gray-800 p-1 rounded-xl border border-gray-700">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'editor' ? 'bg-brand-600 text-white shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'preview' ? 'bg-brand-600 text-white shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Live Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSend} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {feedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              {feedback.message}
            </div>
          )}

          {activeTab === 'editor' ? (
            <div className="space-y-6">
              {/* Recipient Selection & Composer Mode Switcher */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Recipient Selection Mode */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Target Recipient Mode *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRecipientMode('single_client')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        recipientMode === 'single_client'
                          ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                          : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Single Client
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientMode('all_clients')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        recipientMode === 'all_clients'
                          ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                          : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> All Clients
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientMode('custom_email')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        recipientMode === 'custom_email'
                          ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                          : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" /> Custom Email
                    </button>
                  </div>
                </div>

                {/* Email Template Composer Mode */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Composer Mode *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setComposeMode('visual')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        composeMode === 'visual'
                          ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                          : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Visual Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposeMode('html_code')}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        composeMode === 'html_code'
                          ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                          : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" /> Custom HTML Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Recipient Input Details */}
              {recipientMode === 'single_client' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Select Client Account *
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.company}) &mdash; {c.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {recipientMode === 'all_clients' && (
                <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 text-xs font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  Broadcast email will be dispatched to all <strong>{clients.length} active client accounts</strong>.
                </div>
              )}

              {recipientMode === 'custom_email' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Recipient Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. client@company.com"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              )}

              {/* Subject Line */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Important Update Regarding Your GM Digital Studio Workspace"
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              {/* Body Message (Visual Mode) or HTML Code (Code Mode) */}
              {composeMode === 'visual' ? (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Email Message Body *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={bodyMessage}
                      onChange={(e) => setBodyMessage(e.target.value)}
                      placeholder="Type your message, announcement, support resolution, or project updates here..."
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs text-gray-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  {/* Action Button CTA Option */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <LinkIcon className="w-4 h-4 text-brand-600" /> Include Action Button CTA
                      </span>
                      <input
                        type="checkbox"
                        checked={includeCta}
                        onChange={(e) => setIncludeCta(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded-sm cursor-pointer"
                      />
                    </div>

                    {includeCta && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Button Label</label>
                          <input
                            type="text"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            placeholder="e.g. Access Client Portal"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-xs text-gray-900 dark:text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Button Target Link</label>
                          <input
                            type="url"
                            value={ctaUrl}
                            onChange={(e) => setCtaUrl(e.target.value)}
                            placeholder="e.g. https://gmdigitalstudio.app/login"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-xs text-gray-900 dark:text-white font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Paste Custom HTML Code *
                    </label>
                    <span className="text-[10px] text-brand-600 font-bold uppercase">Raw HTML Mode</span>
                  </div>
                  <textarea
                    required
                    rows={8}
                    value={rawHtmlCode}
                    onChange={(e) => setRawHtmlCode(e.target.value)}
                    placeholder="<!DOCTYPE html><html><body><h1>Custom Email</h1></body></html>"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Live Email Preview Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-100 dark:bg-dark-surface p-3 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300">
                <span>Live Rendered Email Template Preview</span>
                <span className="text-[10px] text-gray-400 font-mono">support@gmdigitalstudio.app</span>
              </div>
              <div className="w-full h-[380px] rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-gray-950 p-2 overflow-hidden shadow-inner">
                <iframe
                  title="Live Email Preview"
                  srcDoc={getRenderedPreviewHtml()}
                  className="w-full h-full rounded-xl bg-white border-0"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-border">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              {activeTab === 'editor' ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {activeTab === 'editor' ? 'Toggle Live Preview' : 'Back to Editor'}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  'Dispatching Email...'
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Email via support@gmdigitalstudio.app
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ComposeEmailModal;
