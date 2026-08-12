import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { emailRecordService, type SentEmailRecord } from '../../services/emailRecordService';
import InlineEmailComposer from '../../components/dashboard/InlineEmailComposer';
import SEO from '../../components/common/SEO';
import {
  Mail,
  Search,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  X,
  Server,
  ListFilter,
} from 'lucide-react';

import ConfirmModal from '../../components/common/ConfirmModal';

export function AdminEmailPage() {
  const [viewMode, setViewMode] = useState<'logs' | 'composer'>('logs');
  const [sentEmails, setSentEmails] = useState<SentEmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewRecord, setPreviewRecord] = useState<SentEmailRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSentEmails = async () => {
    setLoading(true);
    const data = await emailRecordService.getSentEmails();
    setSentEmails(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSentEmails();
  }, []);

  const handleDeleteRecord = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDeleteRecord = async () => {
    if (!deletingId) return;
    await emailRecordService.deleteSentEmailRecord(deletingId);
    setSentEmails((prev) => prev.filter((item) => item.id !== deletingId));
    if (previewRecord?.id === deletingId) {
      setPreviewRecord(null);
    }
    setDeletingId(null);
  };

  const filteredEmails = sentEmails.filter(
    (item) =>
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.recipient_name && item.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const uniqueRecipientsCount = new Set(sentEmails.map((e) => e.recipient_email)).size;

  return (
    <>
      <SEO
        title="Email Studio & Dispatch Center - GM Digital Studio Admin"
        description="Compose custom emails, dispatch announcements, and view sent email logs."
      />

      <div className="space-y-6 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-brand-600" /> Email Studio
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Send custom emails and track dispatched logs from <span className="font-semibold text-gray-800 dark:text-gray-200">support@gmdigitalstudio.app</span>
            </p>
          </div>

          {viewMode === 'logs' ? (
            <button
              onClick={() => setViewMode('composer')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Compose New Email
            </button>
          ) : (
            <button
              onClick={() => {
                setViewMode('logs');
                loadSentEmails();
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-dark-surface hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer border border-gray-800"
            >
              <ListFilter className="w-4 h-4 text-brand-400" /> Sent Email Logs ({sentEmails.length})
            </button>
          )}
        </div>

        {/* View Switcher: Composer Window vs Sent Email Logs */}
        {viewMode === 'composer' ? (
          <InlineEmailComposer
            onSentSuccess={() => {
              loadSentEmails();
              setViewMode('logs');
            }}
            onCancel={() => setViewMode('logs')}
          />
        ) : (
          <>
            {/* Executive Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Dispatched Emails</p>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{sentEmails.length}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 font-bold flex items-center justify-center border border-brand-500/20">
                  <Send className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verified Sender Domain</p>
                  <p className="text-xs font-extrabold text-brand-600 dark:text-brand-400 mt-1 font-mono">support@gmdigitalstudio.app</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center border border-emerald-500/20">
                  <Server className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unique Client Recipients</p>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{uniqueRecipientsCount}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center border border-blue-500/20">
                  <Mail className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Filter & Search Controls */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sent emails by subject or recipient..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-semibold"
                  />
                </div>

                <div className="text-xs text-gray-500 font-semibold self-end sm:self-center">
                  Showing {filteredEmails.length} of {sentEmails.length} Dispatched Records
                </div>
              </div>

              {/* Sent Emails Log Table */}
              {loading ? (
                <div className="p-12 text-center text-xs text-gray-400 italic">
                  Loading dispatched email audit logs...
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="p-12 text-center space-y-3 bg-gray-50 dark:bg-dark-surface rounded-2xl border border-dashed border-gray-200 dark:border-dark-border">
                  <Mail className="w-10 h-10 mx-auto text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No sent email records found.</p>
                  <button
                    onClick={() => setViewMode('composer')}
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                  >
                    Open Live Email Studio Composer
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Target Recipient</th>
                        <th className="py-3 px-4">Subject Line</th>
                        <th className="py-3 px-4">Dispatched Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-xs">
                      {filteredEmails.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-surface/50 transition-colors">
                          
                          {/* Recipient */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-900 dark:text-white">{item.recipient_name || 'Client Recipient'}</p>
                            <p className="text-gray-400 text-[11px] font-mono font-normal">{item.recipient_email}</p>
                          </td>

                          {/* Subject Line */}
                          <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                            <p className="max-w-xs truncate">{item.subject}</p>
                          </td>

                          {/* Dispatched Date */}
                          <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span>{new Date(item.sent_at).toLocaleString()}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                              <CheckCircle2 className="w-3 h-3" /> Dispatched
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setPreviewRecord(item)}
                                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                                title="View exact email preview"
                              >
                                <Eye className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                                <span>View Email</span>
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(item.id)}
                                className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer flex-shrink-0"
                                title="Delete Email Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* View Email Preview Modal with Full z-[99999] Fixed Backdrop (Portal to document.body) */}
      {previewRecord && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans">
          <div className="relative w-full max-w-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 text-white flex items-center justify-between border-b border-gray-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-400" /> Sent Email Record Details
                </h3>
                <p className="text-xs text-gray-400">
                  To: <strong className="text-white">{previewRecord.recipient_email}</strong> &bull; Dispatched on {new Date(previewRecord.sent_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setPreviewRecord(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs space-y-1">
                <p><strong>Subject:</strong> {previewRecord.subject}</p>
                <p><strong>Sender:</strong> {previewRecord.sender}</p>
                <p><strong>Recipient:</strong> {previewRecord.recipient_name ? `${previewRecord.recipient_name} (${previewRecord.recipient_email})` : previewRecord.recipient_email}</p>
              </div>

              <div className="w-full h-[320px] md:h-[380px] rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-100 p-2">
                <iframe
                  title="Sent Email Rendered HTML"
                  srcDoc={previewRecord.raw_html || previewRecord.body_message}
                  className="w-full h-full rounded-xl bg-white border-0"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleDeleteRecord(previewRecord.id)}
                  className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-900 font-bold text-xs hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete Record
                </button>
                <button
                  onClick={() => setPreviewRecord(null)}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Branded Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Email Record"
        message="Are you sure you want to delete this dispatched email log? This record will be permanently removed from your dashboard database."
        confirmText="Yes, Delete Record"
        cancelText="Keep Record"
        variant="danger"
        onConfirm={confirmDeleteRecord}
        onClose={() => setDeletingId(null)}
      />
    </>
  );
}

export default AdminEmailPage;
