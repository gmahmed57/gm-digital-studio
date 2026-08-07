import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/clientService';
import { sendCustomComposeEmail, renderEmailShell } from '../../services/resendService';
import { notificationService } from '../../services/notificationService';
import type { ClientItem } from '../../types/client';
import {
  Send,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  Eye,
  Code,
  Edit3,
} from 'lucide-react';

export interface InlineEmailComposerProps {
  initialRecipientEmail?: string;
  initialRecipientName?: string;
  onSentSuccess?: () => void;
  onCancel?: () => void;
}

export const InlineEmailComposer: React.FC<InlineEmailComposerProps> = ({
  initialRecipientEmail,
  initialRecipientName,
  onSentSuccess,
  onCancel,
}) => {
  const [recipientMode, setRecipientMode] = useState<'single_client' | 'all_clients' | 'custom_email'>('single_client');
  const [composeMode, setComposeMode] = useState<'visual' | 'html_code'>('visual');
  const [previewTabMobile, setPreviewTabMobile] = useState<'form' | 'preview'>('form');

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
  }, [initialRecipientEmail]);

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
      : '<p style="color: #94a3b8; font-style: italic;">[Your email body message will render here...]</p>';

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
          message: `Email dispatched and logged for ${recipients.length} recipient(s) from support@gmdigitalstudio.app`,
        });

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
          if (onSentSuccess) onSentSuccess();
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to send email.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error dispatching custom email.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-xs overflow-hidden font-sans">
      
      {/* Clean Corporate Bar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Compose Message
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sender Address: <span className="font-mono text-gray-900 dark:text-white font-semibold">support@gmdigitalstudio.app</span>
          </p>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setPreviewTabMobile('form')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              previewTabMobile === 'form' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-dark-surface text-gray-600'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setPreviewTabMobile('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              previewTabMobile === 'preview' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-dark-surface text-gray-600'
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Main Workspace Form */}
      <form onSubmit={handleSend} className="p-6">
        {feedback && (
          <div
            className={`p-3.5 mb-6 rounded-xl text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Editor Controls */}
          <div className={`lg:col-span-7 space-y-5 ${previewTabMobile === 'preview' ? 'hidden md:block' : 'block'}`}>
            
            {/* Segment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Recipient Segment */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Recipient Mode
                </label>
                <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border w-full">
                  <button
                    type="button"
                    onClick={() => setRecipientMode('single_client')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      recipientMode === 'single_client'
                        ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Single Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientMode('all_clients')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      recipientMode === 'all_clients'
                        ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    All Clients
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientMode('custom_email')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      recipientMode === 'custom_email'
                        ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Custom Email
                  </button>
                </div>
              </div>

              {/* Template Segment */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Editor Mode
                </label>
                <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border w-full">
                  <button
                    type="button"
                    onClick={() => setComposeMode('visual')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      composeMode === 'visual'
                        ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Visual Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposeMode('html_code')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      composeMode === 'html_code'
                        ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" /> Raw HTML
                  </button>
                </div>
              </div>

            </div>

            {/* Recipient Details */}
            {recipientMode === 'single_client' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Select Client
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white font-semibold focus:ring-1 focus:ring-brand-500 outline-none"
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
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs text-gray-600 dark:text-gray-400 font-medium">
                Broadcast email will be dispatched to all <strong>{clients.length} active client accounts</strong>.
              </div>
            )}

            {recipientMode === 'custom_email' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Recipient Email
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. client@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>
            )}

            {/* Subject Line */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Subject Line
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Project Progress Update"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>

            {/* Body Editor or Code Input */}
            {composeMode === 'visual' ? (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Message Content
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={bodyMessage}
                    onChange={(e) => setBodyMessage(e.target.value)}
                    placeholder="Write your email message here..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white leading-relaxed focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                {/* Call-to-Action Link Bar */}
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-gray-500" /> Action Button Link
                    </span>
                    <input
                      type="checkbox"
                      checked={includeCta}
                      onChange={(e) => setIncludeCta(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded-sm cursor-pointer"
                    />
                  </div>

                  {includeCta && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Button Text</label>
                        <input
                          type="text"
                          value={ctaText}
                          onChange={(e) => setCtaText(e.target.value)}
                          placeholder="Access Client Portal"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target URL</label>
                        <input
                          type="url"
                          value={ctaUrl}
                          onChange={(e) => setCtaUrl(e.target.value)}
                          placeholder="https://gmdigitalstudio.app/login"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Custom HTML Code
                </label>
                <textarea
                  required
                  rows={9}
                  value={rawHtmlCode}
                  onChange={(e) => setRawHtmlCode(e.target.value)}
                  placeholder="<!DOCTYPE html><html><body><h1>Custom Email</h1></body></html>"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-dark-border">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Send Email
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Live Rendered Email Preview */}
          <div className={`lg:col-span-5 space-y-2 ${previewTabMobile === 'form' ? 'hidden md:block' : 'block'}`}>
            <div className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-gray-500" /> Email Live Preview
              </span>
              <span className="text-[10px] text-gray-400 font-mono">support@gmdigitalstudio.app</span>
            </div>

            <div className="w-full h-[530px] rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-gray-900 p-2 overflow-hidden shadow-inner">
              <iframe
                title="Email Preview"
                srcDoc={getRenderedPreviewHtml()}
                className="w-full h-full rounded-xl bg-white border-0"
              />
            </div>
          </div>

        </div>
      </form>

    </div>
  );
};

export default InlineEmailComposer;
