import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService, formatNotificationTime } from '../../services/notificationService';
import type { NotificationItem } from '../../types/notification';
import {
  Bell,
  CheckCheck,
  Trash2,
  FolderGit2,
  User,
  MessageSquare,
  Filter,
  ExternalLink,
  X,
} from 'lucide-react';
import SEO from '../../components/common/SEO';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await notificationService.getNotifications(user?.email, role || undefined);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener('gm_notifications_updated', handleUpdate);

    return () => {
      window.removeEventListener('gm_notifications_updated', handleUpdate);
    };
  }, [user, role]);

  const handleMarkAllRead = async () => {
    const updated = await notificationService.markAllAsRead(user?.email, role || undefined);
    setNotifications(updated);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      const updated = await notificationService.clearNotifications(user?.email, role || undefined);
      setNotifications(updated);
    }
  };

  const handleDeleteSingle = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation(); // Stop card navigation click
    const updated = await notificationService.deleteNotification(notifId, user?.email, role || undefined);
    setNotifications(updated);
  };

  const handleItemClick = async (notif: NotificationItem) => {
    await notificationService.markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'unread' && !notif.read) ||
      (filterStatus === 'read' && notif.read);

    const matchesType = filterType === 'all' || notif.type === filterType;

    return matchesStatus && matchesType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'review':
        return <MessageSquare className="w-5 h-5 text-amber-500" />;
      case 'client':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'project':
        return <FolderGit2 className="w-5 h-5 text-brand-500" />;
      default:
        return <Bell className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <>
      <SEO
        title={isAdmin ? 'Notifications & Activity Log - GM Admin' : 'My Notifications - Client Portal'}
        description="View live platform activity alerts, project milestone updates, tool access grants, and system notifications."
      />

      <div className="space-y-6 font-sans">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Notifications & Activity Feed
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Track live milestone approvals, tool access grants, revision feedback, and studio updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" /> Mark All Read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilterStatus('unread')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'unread'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterStatus('read')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'read'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>

          {/* Type Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-brand-600 transition-all appearance-none"
            >
              <option value="all">All Notification Types</option>
              <option value="review">Milestone Reviews & Approvals</option>
              <option value="client">Client & Tool Requests</option>
              <option value="project">Project Updates</option>
              <option value="system">System Alerts</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-semibold text-sm">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Notifications Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              You're all caught up! No recent activity notifications match your filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                  !notif.read
                    ? 'bg-white dark:bg-dark-card border-brand-500/40 shadow-sm hover:border-brand-500'
                    : 'bg-gray-50/60 dark:bg-dark-surface/40 border-gray-200 dark:border-dark-border opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center flex-shrink-0 mt-0.5 border border-gray-200 dark:border-dark-border">
                    {getIcon(notif.type)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-brand-500 text-white uppercase">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-400">
                      {formatNotificationTime(notif.timestamp, notif.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSingle(e, notif.id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {notif.link && (
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
                      View Page <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}

export default NotificationsPage;
