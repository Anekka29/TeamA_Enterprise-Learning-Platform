import { useState } from 'react';
import DashboardNavbar from '../components/Dashboard/DashboardNavbar';
import Sidebar from '../components/Dashboard/Sidebar';

/**
 * Dashboard layout — grid of sidebar + main content.
 * Matches the dashboard-layout.css .dashboard-layout grid.
 * Accepts sidebarLinks and navbarProps for per-dashboard customization.
 */
export default function DashboardLayout({ children, sidebarLinks = [], searchPlaceholder, notificationCount }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((o) => !o);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout-wrapper">
      <div className="dashboard-layout">
        <Sidebar links={sidebarLinks} isOpen={sidebarOpen} />

      <div className="main-layout">
        <DashboardNavbar
          searchPlaceholder={searchPlaceholder}
          notificationCount={notificationCount}
          onMobileMenuToggle={toggleSidebar}
        />

        {/* Mobile overlay to close sidebar */}
        {sidebarOpen && (
          <div
            onClick={handleOverlayClick}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
        )}

          <main className="dashboard-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
