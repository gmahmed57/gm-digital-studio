import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';

export function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white font-sans flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Workspace Wrapper */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Header Bar */}
        <Header onToggleMobileSidebar={() => setIsMobileOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
