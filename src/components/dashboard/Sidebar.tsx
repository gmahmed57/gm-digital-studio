import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  FileText, 
  Settings, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  BarChart2,
  FolderOpen,
  MessageSquare,
  FileCheck2,
  LogOut,
  ShieldCheck,
  UserCheck
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

  const isAdmin = role === 'admin';

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Clients', path: '/admin/clients', icon: Users },
    { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { label: 'Invoices', path: '/admin/invoices', icon: FileText },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    { label: 'Blog & CMS', path: '/admin/cms', icon: FileCheck2 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const clientNavItems = [
    { label: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', path: '/client/projects', icon: FolderKanban },
    { label: 'Invoices', path: '/client/invoices', icon: FileText },
    { label: 'Shared Files', path: '/client/files', icon: FolderOpen },
    { label: 'Messages', path: '/client/messages', icon: MessageSquare },
    { label: 'Support', path: '/client/support', icon: HelpCircle },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Official Brand Logo PNG */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-dark-border">
            <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
              <img src={logo} alt="GM Digital Studio Logo" className="h-8 w-auto object-contain flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-sm tracking-tight text-gray-900 dark:text-white leading-none">
                    GM DIGITAL
                  </span>
                  <span className="text-[10px] text-brand-600 font-semibold uppercase tracking-wider mt-0.5">
                    {isAdmin ? 'Admin Console' : 'Client Portal'}
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex w-7 h-7 rounded-lg bg-gray-100 dark:bg-dark-surface items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* User Profile Summary */}
          {!isCollapsed && (
            <div className="mx-4 mt-4 p-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border flex items-center gap-2.5">
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
              ) : (
                <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {user?.fullName || 'Active User'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize truncate">
                  {role} Account
                </p>
              </div>
            </div>
          )}

          {/* Navigation Links (Matching User Reference Image 1 Layout) */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gray-950 text-white dark:bg-brand-600 dark:text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-400 dark:text-white' : ''}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Support Button & Sign Out */}
        <div className="p-3 border-t border-gray-100 dark:border-dark-border space-y-2">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
              <p className="text-xs font-bold text-gray-900 dark:text-white">Need Support?</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">24/7 Priority Desk</p>
              <a
                href="mailto:support@gmdigitalstudio.com"
                className="inline-block w-full py-1.5 px-3 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white border border-gray-200 dark:border-dark-border text-xs font-bold hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
              >
                Contact Helpdesk
              </a>
            </div>
          ) : (
            <a
              href="mailto:support@gmdigitalstudio.com"
              className="flex items-center justify-center p-2.5 rounded-xl bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:text-brand-600"
              title="Support"
            >
              <HelpCircle className="w-5 h-5" />
            </a>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
