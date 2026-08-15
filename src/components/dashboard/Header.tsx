import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_VERSION } from '../../constants/version';
import { useTheme } from '../../context/ThemeContext';
import { notificationService, formatNotificationTime } from '../../services/notificationService';
import { searchService, type SearchResultItem } from '../../services/searchService';
import type { NotificationItem } from '../../types/notification';
import { resolveAssetUrl, handleImageError } from '../../utils/imageUtils';
import {
  Search, Bell, Sun, Moon, Menu, LogOut, User, CheckCheck, Trash2, ArrowRight, X, Command,
  Layers, Users, CreditCard, FileText, Wrench, Loader2
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export function Header({ onToggleMobileSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Inline Search State (No Popup Modal)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const userMenuContainerRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener to focus inline search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search fetch
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);
    const timer = setTimeout(async () => {
      const data = await searchService.searchAll(searchQuery, role || undefined, user?.email);
      setSearchResults(data);
      setIsSearchLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, role, user]);

  // Click outside to close inline search, notification bell, and user menu dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuContainerRef.current && !userMenuContainerRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Fetch real notifications filtered by user role and email
  const fetchNotifications = async () => {
    const list = await notificationService.getNotifications(user?.email, role || undefined);
    setNotifications(list);
  };

  useEffect(() => {
    fetchNotifications();
    const handleUpdate = () => fetchNotifications();
    window.addEventListener('studio_notifications_updated', handleUpdate);
    const interval = setInterval(handleUpdate, 15000);
    return () => {
      window.removeEventListener('studio_notifications_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const currentTheme = theme || localStorage.getItem('studio_theme') || 'dark';
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
    navigate('/login');
  };

  const getPortalHeaderInfo = () => {
    if (role === 'admin') {
      return {
        title: 'Executive Control Workspace',
        tagline: 'Real-time studio operations, analytics & client telemetry',
      };
    }
    if (role === 'author') {
      return {
        title: 'Editorial Content Workspace',
        tagline: 'Articles, media assets & blog publishing management',
      };
    }
    return {
      title: 'Client Deliverables Workspace',
      tagline: 'Active projects, milestones & direct studio telemetry',
    };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'projects':
        return <Layers className="w-3.5 h-3.5 text-blue-500" />;
      case 'clients':
        return <Users className="w-3.5 h-3.5 text-emerald-500" />;
      case 'invoices':
        return <CreditCard className="w-3.5 h-3.5 text-brand-500" />;
      case 'blogs':
        return <FileText className="w-3.5 h-3.5 text-purple-500" />;
      case 'tools':
        return <Wrench className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Search className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const headerInfo = getPortalHeaderInfo();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4 font-sans shadow-xs transition-colors">

      {/* Left: Mobile Sidebar Trigger & Executive Workspace Header */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
          title="Open Mobile Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block min-w-0">
          <h1 className="text-sm md:text-lg font-heading font-extrabold text-gray-900 dark:text-white leading-tight truncate">
            {headerInfo.title}
          </h1>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 hidden md:block truncate">
            {headerInfo.tagline}
          </p>
        </div>
      </div>

      {/* Right Cluster: Compact Desktop Search Bar & Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
        {/* Real Interactive Search Bar */}
        <div ref={searchContainerRef} className="w-full max-w-[160px] xs:max-w-[200px] sm:max-w-none sm:w-64 md:w-72 relative">
          <div className="relative flex items-center w-full">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 absolute left-2.5 sm:left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Search..."
              className="w-full pl-7 sm:pl-9 pr-7 sm:pr-10 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-xs"
            />
            {isSearchLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-brand-500 animate-spin absolute right-2.5 sm:right-3" />
            ) : searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-2.5 sm:right-3 p-0.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-dark-card border border-gray-300 dark:border-dark-border font-mono text-[9px] font-bold text-gray-500 dark:text-gray-400 absolute right-2 pointer-events-none">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            )}
          </div>

          {/* Floating Inline Dropdown Menu (Fixed & responsive on mobile, anchored on desktop) */}
          {isSearchFocused && searchQuery.trim() !== '' && (
            <div className="fixed left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-full w-auto sm:w-96 mt-2 z-50 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl p-2 max-h-80 overflow-y-auto space-y-1 font-sans">
              {isSearchLoading && searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  Searching database...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No matching records found for "{searchQuery}".
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={`${item.category}-${item.id}`}
                    onClick={() => {
                      setIsSearchFocused(false);
                      setSearchQuery('');
                      navigate(item.link);
                    }}
                    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-dark-surface flex items-center justify-center shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-dark-surface">
                            {item.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Working Theme Switcher Button */}
          <button
            onClick={handleToggleTheme}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
          </button>

        {/* Live Notifications Dropdown Trigger */}
        {role !== 'author' && (
          <div ref={notifContainerRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-dark-border">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-500" />
                    <h3 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                      Live Notifications
                    </h3>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto my-2 divide-y divide-gray-100 dark:divide-dark-border">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 rounded-xl transition-colors cursor-pointer relative group flex justify-between items-start gap-2 ${!notif.read
                            ? 'bg-brand-500/5 dark:bg-brand-500/10 hover:bg-brand-500/10'
                            : 'hover:bg-gray-50 dark:hover:bg-dark-surface'
                          }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${!notif.read ? 'bg-brand-500' : 'bg-transparent'}`} />
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                              {notif.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-4">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-gray-400 pl-4 block pt-0.5">
                            {formatNotificationTime(notif.createdAt)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteSingle(e, notif.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-gray-150 dark:border-dark-border flex justify-between items-center text-xs font-medium">
                  <button
                    onClick={handleClearNotifications}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-[11px]"
                  >
                    Clear history
                  </button>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(role === 'admin' ? '/admin/notifications' : '/client/notifications');
                    }}
                    className="text-brand-600 dark:text-brand-400 font-bold hover:underline text-[11px] flex items-center gap-1"
                  >
                    View notifications hub <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Account Avatar & Dropdown */}
        <div ref={userMenuContainerRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
          >
            {user?.avatarUrl ? (
              <img
                src={resolveAssetUrl(user.avatarUrl, 'avatar')}
                alt={user.fullName || 'User Profile'}
                onError={(e) => handleImageError(e, 'avatar')}
                className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-dark-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
                {(user?.fullName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-100">
              <div className="p-3 border-b border-gray-100 dark:border-dark-border">
                <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                  {user?.fullName || 'Studio User'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  {role}
                </span>
              </div>

              <div className="pt-2 text-xs">
                {role !== 'author' && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate(role === 'admin' ? '/admin/settings' : '/client/profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface cursor-pointer text-left font-medium"
                  >
                    <User className="w-4 h-4 text-gray-400" /> Account Settings
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer text-left font-bold"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>

                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-dark-border text-center text-[10px] text-gray-400 dark:text-gray-500 font-mono font-bold">
                  {APP_VERSION}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
  );
}

export default Header;
