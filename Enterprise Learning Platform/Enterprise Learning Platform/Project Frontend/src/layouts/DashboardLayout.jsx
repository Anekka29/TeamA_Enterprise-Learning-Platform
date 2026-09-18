import { createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardNavbar from '../components/Dashboard/DashboardNavbar';
import Sidebar from '../components/Dashboard/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { getRoleSidebarLinks } from '../constants/studentSidebarLinks';

export const DashboardLayoutContext = createContext(false);

/**
 * Dashboard layout — grid of sidebar + main content.
 * Matches the dashboard-layout.css .dashboard-layout grid.
 * Automatically resolves role-based navigation and active route when not explicitly passed.
 */
export default function DashboardLayout({
  children,
  sidebarLinks,
  navigationItems,
  user: propUser,
  role: propRole,
  activeRoute: propActiveRoute,
  searchPlaceholder = 'Search courses, roadmaps, mentors...',
  notificationCount,
}) {
  const isNested = useContext(DashboardLayoutContext);

  // If already wrapped in a parent DashboardLayout, return children cleanly to avoid duplicate sidebars
  if (isNested) {
    return <>{children}</>;
  }

  const { user: authUser } = useAuth();
  const location = useLocation();

  const user = propUser || authUser;
  const role = (propRole || user?.role || 'STUDENT').toUpperCase();
  const activeRoute = propActiveRoute || (location.pathname + location.hash);

  const rawLinks = navigationItems || (sidebarLinks && sidebarLinks.length > 0 ? sidebarLinks : null);
  const links = rawLinks || getRoleSidebarLinks(role, activeRoute);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((o) => !o);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => setSidebarOpen(false);

  return (
    <DashboardLayoutContext.Provider value={true}>
      <div className="dashboard-layout-wrapper">
        <div className="dashboard-layout">
          <Sidebar
            links={links}
            navigationItems={links}
            isOpen={sidebarOpen}
            user={user}
            role={role}
            activeRoute={activeRoute}
          />

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
    </DashboardLayoutContext.Provider>
  );
}
