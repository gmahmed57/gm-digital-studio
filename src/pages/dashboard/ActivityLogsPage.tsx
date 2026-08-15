import { useState, useEffect } from 'react';
import { activityLogService } from '../../services/activityLogService';
import type { ActivityLog, EntityType } from '../../types/activityLog';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Trash2, 
  Download, 
  FileText, 
  CreditCard, 
  Mail, 
  Layers, 
  Key, 
  Clock, 
  Wrench,
  MessageSquare
} from 'lucide-react';

import ConfirmModal from '../../components/common/ConfirmModal';

export function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEntity, setSelectedEntity] = useState<EntityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteSingleId, setPendingDeleteSingleId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState<boolean>(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState<boolean>(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await activityLogService.getActivityLogs({
        entity_type: selectedEntity,
        search_query: searchQuery,
        limit: 150
      });
      setLogs(data);
      setSelectedLogIds([]);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const handleEvent = () => fetchLogs();
    window.addEventListener('studio_activity_logged', handleEvent);
    return () => {
      window.removeEventListener('studio_activity_logged', handleEvent);
    };
  }, [selectedEntity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleToggleSelect = (logId: string) => {
    setSelectedLogIds((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedLogIds.length === logs.length) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(logs.map((l) => l.id));
    }
  };

  const handleDeleteSingle = async (logId: string) => {
    setPendingDeleteSingleId(logId);
  };

  const confirmDeleteSingle = async () => {
    if (!pendingDeleteSingleId) return;
    setDeletingId(pendingDeleteSingleId);
    const success = await activityLogService.deleteLog(pendingDeleteSingleId);
    if (success) {
      setLogs((prev) => prev.filter((l) => l.id !== pendingDeleteSingleId));
      setSelectedLogIds((prev) => prev.filter((id) => id !== pendingDeleteSingleId));
    }
    setDeletingId(null);
    setPendingDeleteSingleId(null);
  };

  const confirmDeleteSelected = async () => {
    if (selectedLogIds.length === 0) return;
    setIsBatchDeleting(true);
    const success = await activityLogService.deleteLogs(selectedLogIds);
    if (success) {
      setLogs((prev) => prev.filter((l) => !selectedLogIds.includes(l.id)));
      setSelectedLogIds([]);
    }
    setIsBatchDeleting(false);
    setShowDeleteSelectedConfirm(false);
  };

  const handleClearAll = async () => {
    setShowClearAllConfirm(true);
  };

  const confirmClearAll = async () => {
    const success = await activityLogService.clearAllLogs();
    if (success) {
      setLogs([]);
      setSelectedLogIds([]);
    }
    setShowClearAllConfirm(false);
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const escape = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = ['ID', 'Timestamp', 'User Name', 'User Email', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Details'];
    const lines = [
      headers.map(escape).join(','),
      ...logs.map((l) =>
        [
          l.id,
          new Date(l.created_at).toLocaleString(),
          l.user_name,
          l.user_email,
          l.user_role,
          l.action,
          l.entity_type,
          l.entity_id || '',
          l.details
        ].map(escape).join(',')
      )
    ];

    const csvData = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GM_Studio_Activity_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'auth':
        return <Key className="w-4 h-4 text-emerald-500" />;
      case 'project':
        return <Layers className="w-4 h-4 text-blue-500" />;
      case 'invoice':
        return <CreditCard className="w-4 h-4 text-brand-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-purple-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'file':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'tools':
        return <Wrench className="w-4 h-4 text-amber-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEntityBadgeStyle = (type: EntityType) => {
    switch (type) {
      case 'auth':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
      case 'project':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/40';
      case 'invoice':
        return 'bg-orange-50 text-orange-700 dark:bg-brand-950/40 dark:text-brand-300 border-orange-200 dark:border-brand-800/40';
      case 'email':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/40';
      case 'message':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40';
      case 'file':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-dark-surface dark:text-gray-300 border-gray-200 dark:border-dark-border';
    }
  };

  // Metrics
  const totalLogs = logs.length;
  const authEvents = logs.filter((l) => l.entity_type === 'auth').length;
  const financialEvents = logs.filter((l) => l.entity_type === 'invoice').length;
  const projectEvents = logs.filter((l) => l.entity_type === 'project').length;

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Header & Page Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-dark-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-heading font-extrabold text-gray-900 dark:text-white">
              Studio Audit & Activity Logs
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enterprise audit trail tracking user authentication, telemetry, financial operations, and system events.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedLogIds.length > 0 && (
            <button
              onClick={() => setShowDeleteSelectedConfirm(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer animate-fade-in"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedLogIds.length})
            </button>
          )}

          <button
            onClick={fetchLogs}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="px-3.5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-950 text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={handleClearAll}
            disabled={logs.length === 0}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>Total Recorded Logs</span>
            <Layers className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">{totalLogs}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>Auth & Security Events</span>
            <Key className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">{authEvents}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>Project Telemetry</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">{projectEvents}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>Financial Telemetry</span>
            <CreditCard className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">{financialEvents}</p>
        </div>
      </div>

      {/* Filter Tabs & Keyword Search Bar */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'auth', 'project', 'invoice', 'email', 'message', 'file', 'tools'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedEntity(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedEntity === tab
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter logs by keyword..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </form>
        </div>
      </div>

      {/* Log Activity Table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
            Loading audit trail records...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-base font-bold text-gray-900 dark:text-white">No activity logs recorded</p>
            <p className="text-xs mt-1">Activities will record automatically as users authenticate and manage resources.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={logs.length > 0 && selectedLogIds.length === logs.length}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-brand-600 border-gray-300 dark:border-dark-border focus:ring-brand-500 cursor-pointer"
                      title="Select all logs"
                    />
                  </th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-xs text-gray-700 dark:text-gray-300">
                {logs.map((log) => {
                  const isSelected = selectedLogIds.includes(log.id);
                  return (
                    <tr
                      key={log.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-brand-50/60 dark:bg-brand-950/20'
                          : 'hover:bg-gray-50/50 dark:hover:bg-dark-surface/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(log.id)}
                          className="w-4 h-4 rounded text-brand-600 border-gray-300 dark:border-dark-border focus:ring-brand-500 cursor-pointer"
                        />
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs uppercase">
                            {log.user_name ? log.user_name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white leading-tight">{log.user_name}</p>
                            <p className="text-[11px] text-gray-400">{log.user_email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Entity Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getEntityBadgeStyle(log.entity_type)}`}>
                          {getEntityIcon(log.entity_type)}
                          <span className="capitalize">{log.entity_type}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-gray-900 dark:text-gray-200">
                          {log.action}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 max-w-md text-gray-600 dark:text-gray-300">
                        <p className="line-clamp-2">{log.details}</p>
                      </td>

                      {/* Single Delete Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteSingle(log.id)}
                          disabled={deletingId === log.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete log record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Single Log Modal */}
      <ConfirmModal
        isOpen={Boolean(pendingDeleteSingleId)}
        title="Delete Activity Log Record"
        message="Are you sure you want to delete this activity log entry? This log record will be removed permanently."
        confirmText="Delete Record"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteSingle}
        onClose={() => setPendingDeleteSingleId(null)}
      />

      {/* Delete Multiple Selected Logs Modal */}
      <ConfirmModal
        isOpen={showDeleteSelectedConfirm}
        title={`Delete ${selectedLogIds.length} Selected Activity Log${selectedLogIds.length > 1 ? 's' : ''}`}
        message={`Are you sure you want to permanently delete the ${selectedLogIds.length} selected activity log entries? This action cannot be undone.`}
        confirmText={`Delete ${selectedLogIds.length} Logs`}
        cancelText="Cancel"
        variant="danger"
        isProcessing={isBatchDeleting}
        onConfirm={confirmDeleteSelected}
        onClose={() => setShowDeleteSelectedConfirm(false)}
      />

      {/* Clear All Logs Modal */}
      <ConfirmModal
        isOpen={showClearAllConfirm}
        title="Clear All Database Logs"
        message="WARNING: Are you sure you want to clear ALL activity logs from the database? This action cannot be undone."
        confirmText="Clear All Logs"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmClearAll}
        onClose={() => setShowClearAllConfirm(false)}
      />
    </div>
  );
}
