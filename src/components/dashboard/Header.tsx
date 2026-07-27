import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Bell, Sun, Moon, Menu, LogOut, ShieldCheck, User } from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export function Header({ onToggleMobileSidebar }: HeaderProps) {
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive route breadcrumbs
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'Admin Overview';
    if (path.includes('/admin/clients')) return 'Client Management';
    if (path.includes('/admin/projects')) return 'Project Management';
    if (path.includes('/admin/invoices')) return 'Invoices & Financials';
    if (path.includes('/admin/analytics')) return 'Analytics & Metrics';
    if (path.includes('/admin/cms')) return 'Content Management';
    if (path.includes('/client/dashboard')) return 'Client Dashboard';
    if (path.includes('/client/projects')) return 'Assigned Projects';
    if (path.includes('/client/invoices')) return 'Invoices & Billing';
    if (path.includes('/client/files')) return 'Shared Files & Assets';
    if (path.includes('/client/messages')) return 'Project Messaging';
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 font-sans">
      
      {/* Left: Mobile Toggle & Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300"
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

      {/* Right: Search, Notifications, Theme Toggle & User Avatar (Matching User Sample 1) */}
      <div className="flex items-center gap-3">
        
        {/* Search Bar (Inspired by sample 1 top header) */}
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

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
        </button>

        {/* Notifications Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-dark-card" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-xl py-3 px-4 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-dark-border">
                <span className="text-xs font-bold text-gray-900 dark:text-white">Notifications</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                  2 New
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <p className="font-semibold text-gray-900 dark:text-white">Milestone Completed</p>
                  <p className="text-[11px] text-gray-500">Website Builder v2.0 phase delivered successfully.</p>
                </div>
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-dark-surface">
                  <p className="font-semibold text-gray-900 dark:text-white">New Invoice Created</p>
                  <p className="text-[11px] text-gray-500">Invoice #INV-2026-089 has been generated.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown (Matching Sample 1) */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-9 h-9 rounded-xl object-cover border border-gray-200 dark:border-dark-border shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-gray-100 dark:border-dark-border">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.fullName}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                  {role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {role}
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/"
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surface"
                >
                  Return to Public Website
                </Link>
              </div>

              <div className="pt-1 border-t border-gray-100 dark:border-dark-border">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
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
