import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services/messageService';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  BarChart2,
  FolderOpen,
  MessageSquare,
  FileCheck2,
  LogOut,
  Wrench,
  Bell
} from 'lucide-react';
import logo from '../../assets/icon-logo.png';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const { role, user, logout } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchUnread = async () => {
      if (user) {
        const count = await messageService.getUnreadCount(
          isAdmin ? 'admin' : 'client',
          isAdmin ? undefined : user.id
        );
        setUnreadMessages(count);
      }
    };

    fetchUnread();
    
    window.addEventListener('gm_messages_updated', fetchUnread);
    const interval = setInterval(fetchUnread, 15000); // Poll every 15s for WhatsApp-like real-time feel

    return () => {
      window.removeEventListener('gm_messages_updated', fetchUnread);
      clearInterval(interval);
    };
  }, [user, isAdmin]);

  const isAuthor = role === 'author';

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Clients', path: '/admin/clients', icon: Users },
    { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { label: 'Invoices', path: '/admin/invoices', icon: FileText },
    { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    { label: 'Blog & CMS', path: '/admin/cms', icon: FileCheck2 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const authorNavItems = [
    { label: 'Blog & CMS', path: '/author/cms', icon: FileCheck2 },
  ];

  const clientNavItems = [
    { label: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Notifications', path: '/client/notifications', icon: Bell },
    { label: 'Studio Tools', path: '/client/tools', icon: Wrench },
    { label: 'My Projects', path: '/client/projects', icon: FolderKanban },
    { label: 'Invoices', path: '/client/invoices', icon: FileText },
    { label: 'Shared Files', path: '/client/files', icon: FolderOpen },
    { label: 'Messages', path: '/client/messages', icon: MessageSquare },
  ];

  const navItems = isAdmin 
    ? adminNavItems 
    : isAuthor 
      ? authorNavItems 
      : clientNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border transition-all duration-300 flex flex-col justify-between font-sans ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-dark-border">
            <Link to={isAdmin ? '/admin/dashboard' : isAuthor ? '/author/cms' : '/client/dashboard'} className="flex items-center gap-3">
              <img src={logo} alt="GM Studio" className="w-8 h-8 object-contain" />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-sm text-gray-900 dark:text-white leading-none">
                    GM STUDIO
                  </span>
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mt-0.5">
                    {isAdmin ? 'ADMIN CONTROL' : isAuthor ? 'AUTHOR PORTAL' : 'CLIENT PORTAL'}
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex w-7 h-7 rounded-xl bg-gray-100 dark:bg-dark-surface items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isMessages = item.label === 'Messages';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  
                  {/* Unread Messages Badge */}
                  {isMessages && unreadMessages > 0 && !isCollapsed && (
                    <span className="bg-white text-brand-600 dark:bg-brand-500 dark:text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm min-w-[20px] text-center">
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </span>
                  )}
                  {isMessages && unreadMessages > 0 && isCollapsed && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-dark-card shadow-sm"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-dark-border space-y-2">
          {!isCollapsed && (
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-xl object-cover border border-gray-200 dark:border-dark-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize truncate">
                    {role || 'Portal User'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
