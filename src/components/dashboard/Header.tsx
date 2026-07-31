import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationService, formatNotificationTime } from '../../services/notificationService';
import type { NotificationItem } from '../../types/notification';
import { Search, Bell, Sun, Moon, Menu, LogOut, User, CheckCheck, Trash2, ArrowRight, X } from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export function Header({ onToggleMobileSidebar }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Live Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Fetch real notifications filtered by user role and email
  const fetchNotifications = async () => {
    const list = await notificationService.getNotifications(user?.email, role || undefined);
    setNotifications(list);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 8 seconds for live dashboard updates
    const timer = setInterval(() => {
      fetchNotifications();
    }, 8000);

    const handleUpdate = () => fetchNotifications();
    window.addEventListener('gm_notifications_updated', handleUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('gm_notifications_updated', handleUpdate);
    };
  }, [user, role]);

  useEffect(() => {
    const currentTheme = theme || localStorage.getItem('gm_studio_theme') || 'dark';
    setIsDarkMode(currentTheme === 'dark');
  }, [theme]);

  const handleToggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
    setIsDarkMode(!isDarkMode);
  };

  const handleMarkAllRead = async () => {
    const updated = await notificationService.markAllAsRead(user?.email, role || undefined);
    setNotifications(updated);
  };

  const handleClearNotifications = async () => {
    const updated = await notificationService.clearNotifications(user?.email, role || undefined);
    setNotifications(updated);
  };

  const handleDeleteSingle = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    const updated = await notificationService.deleteNotification(notifId, user?.email, role || undefined);
    setNotifications(updated);
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    await notificationService.markAsRead(notif.id);
    fetchNotifications();
    setShowNotifications(false);

    if (notif.link) {
      navigate(notif.link);
    } else {
      navigate(role === 'admin' ? '/admin/notifications' : '/client/notifications');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/portal-login');
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/notifications')) return 'Notifications & Activity Log';
    if (path.includes('/admin/clients/edit')) return 'Client Account Provisioning';
    if (path.includes('/admin/clients')) return 'Client Directory & Accounts';
    if (path.includes('/admin/projects/edit')) return 'Project Workspace Builder';
    if (path.includes('/admin/projects')) return 'Project Directory & Roadmap';
    if (path.includes('/admin/invoices')) return 'Invoices & Billing Telemetry';
    if (path.includes('/admin/analytics')) return 'Platform Performance Analytics';
    if (path.includes('/admin/tools')) return 'Studio Tools Access Engine';
    if (path.includes('/client/projects/view')) return 'Client Project Deliverables';
    if (path.includes('/client/projects')) return 'Client Assigned Workspace';
    if (path.includes('/client/invoices')) return 'Client Invoices & Statements';
    if (path.includes('/client/tools')) return 'Client Granted Tools Suite';
    if (path.includes('/client/profile')) return 'Account Profile & Security';
    if (path.includes('/admin')) return 'Executive Studio Control Center';
    if (path.includes('/client')) return 'Client Operational Portal';
    return 'GM Digital Studio Portal';
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border px-4 md:px-6 flex items-center justify-between font-sans shadow-xs transition-colors">
      
      {/* Left: Mobile Sidebar Trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
          title="Open Mobile Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
            {getBreadcrumb()}
          </h1>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">
            GM Digital Studio Platform • Live Operational Workspace
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications, Theme Toggle & User Avatar */}
      <div className="flex items-center gap-3">
        
        {/* Search Bar */}
        <div className="relative hidden md:block w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search projects, invoices..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Working Theme Switcher Button */}
        <button
          onClick={handleToggleTheme}
          className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
        </button>

        {/* Live Notifications Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-brand-600 text-white text-[9px] font-extrabold shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl py-3 px-4 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-gray-500 hover:text-brand-600 flex items-center gap-1 cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3" /> Read All
                  </button>
                  <button
                    onClick={handleClearNotifications}
                    className="text-[10px] font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                    title="Clear all"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">No notifications present.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 group relative ${
                        !notif.read
                          ? 'border-brand-500/30 bg-brand-500/5 dark:bg-brand-500/10'
                          : 'border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900 dark:text-white text-xs pr-4">{notif.title}</p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[10px] font-medium text-gray-400">
                            {formatNotificationTime(notif.timestamp, notif.createdAt)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSingle(e, notif.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Delete notification"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed pr-2">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* View All Notifications Footer Button */}
              <div className="pt-2.5 mt-2 border-t border-gray-100 dark:border-dark-border text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate(role === 'admin' ? '/admin/notifications' : '/client/notifications');
                  }}
                  className="w-full py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  View All Notifications <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-9 h-9 rounded-xl object-cover border border-gray-200 dark:border-dark-border shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                {user?.fullName || 'User Profile'}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                {role || 'Portal User'}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border">
                <p className="font-bold text-gray-900 dark:text-white">{user?.fullName}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    navigate(role === 'admin' ? '/admin/profile' : '/client/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface cursor-pointer text-left font-medium"
                >
                  <User className="w-4 h-4 text-gray-400" /> Account Settings
                </button>

                <div className="border-t border-gray-100 dark:border-dark-border my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer text-left font-bold"
                >
                  <LogOut className="w-4 h-4" /> Sign Out Portal
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;
