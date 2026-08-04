import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import DashboardService from '../services/DashboardService';
import ProfileService from '../services/ProfileService';
import { useAuth } from '../hooks/useAuth';
import '../styles/dashboard-layout.css';

// Subcomponents
import UserManagement from '../components/Dashboard/Admin/UserManagement';
import RoleManagement from '../components/Dashboard/Admin/RoleManagement';
import CourseApproval from '../components/Dashboard/Admin/CourseApproval';
import ComplaintManagement from '../components/Dashboard/Admin/ComplaintManagement';
import PlatformAnalytics from '../components/Dashboard/Admin/PlatformAnalytics';
import AuditLogs from '../components/Dashboard/Admin/AuditLogs';
import CMSControl from '../components/Dashboard/Admin/CMSControl';
import AdminNotifications from '../components/Dashboard/Admin/AdminNotifications';


const SIDEBAR_LINKS = [
  { icon: 'bi-house-fill', label: 'Dashboard', href: '#dashboard' },
  { icon: 'bi-people-fill', label: 'Users', href: '#users' },
  { icon: 'bi-person-badge-fill', label: 'Roles', href: '#roles' },
  { icon: 'bi-check-circle-fill', label: 'Approvals', href: '#approvals' },
  { icon: 'bi-chat-left-text-fill', label: 'Tickets', href: '#complaints' },
  { icon: 'bi-bell-fill', label: 'Notifications', href: '#notifications' },
  { icon: 'bi-activity', label: 'Monitor', href: '#monitoring' },
  { icon: 'bi-shield-lock-fill', label: 'Audits', href: '#audits' },
  { icon: 'bi-file-richtext', label: 'CMS', href: '#cms' },
  { icon: 'bi-gear-fill', label: 'Settings', href: '#settings' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('#dashboard');
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => setAlertInfo({ show: false, type: '', message: '' }), 4000);
  };

  useEffect(() => {
    Promise.all([
      ProfileService.getCurrentProfile(),
      DashboardService.getAdminDashboard(),
    ])
      .then(([profileRes, dashboardRes]) => {
        setProfile(profileRes.data);
        setDashboard(dashboardRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin dashboard', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  // Listen to hash changes in browser URL for layout tabs
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#dashboard';
      setActiveTab(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) return <LoadingOverlay visible />;
  if (error) return <ErrorOverlay visible />;

  const sidebarLinks = SIDEBAR_LINKS.map(link => ({
    ...link,
    active: link.href === activeTab,
  }));

  const notifications = dashboard?.notifications || [];
  const auditLogs = dashboard?.auditLogs || [];

  return (
    <div className="dashboard-wrapper-sim">
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        searchPlaceholder="Search users, platform configurations..."
      >


        {/* Global alerts */}
        {alertInfo.show && (
          <div className={`premium-alert alert alert-${alertInfo.type === 'error' ? 'danger' : alertInfo.type} d-flex align-items-center gap-2`} style={{ maxWidth: '400px' }}>
            <i className={`bi ${alertInfo.type === 'success' ? 'bi-check-circle-fill' : alertInfo.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}`}></i>
            <span>{alertInfo.message}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === '#dashboard' && (
          <div className="fade-in-quick text-start">
            <div className="welcome-card mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="fw-bold mb-2">Welcome back, {dashboard?.adminName || profile?.fullName || user?.name || 'Admin'}!</h1>
                  <p className="mb-0 text-white-50 fs-5">System status operational. Review administrative KPIs and monitoring telemetry metrics.</p>
                </div>
                <div className="d-none d-md-block fs-1"><i className="bi bi-shield-lock text-white-50"></i></div>
              </div>
            </div>



            {/* Quick stats KPI grid */}
            <div className="row g-4 mb-4">
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-success"><i className="bi bi-people"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Total Users</h5>
                  <div className="fs-4 fw-bold text-success">{dashboard?.totalUsers ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-primary"><i className="bi bi-person"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Students</h5>
                  <div className="fs-4 fw-bold text-primary">{dashboard?.students ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-info"><i className="bi bi-mortarboard"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Mentors</h5>
                  <div className="fs-4 fw-bold text-info">{dashboard?.mentors ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-secondary"><i className="bi bi-shield-lock"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Admins</h5>
                  <div className="fs-4 fw-bold text-secondary">{dashboard?.admins ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-success"><i className="bi bi-book"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Total Courses</h5>
                  <div className="fs-4 fw-bold text-success">{dashboard?.totalCourses ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-warning"><i className="bi bi-hourglass-split"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Pending Approvals</h5>
                  <div className="fs-4 fw-bold text-warning">{dashboard?.pendingCourseApprovals ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-primary"><i className="bi bi-globe2"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Active Courses</h5>
                  <div className="fs-4 fw-bold text-primary">{dashboard?.activeCourses ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-danger"><i className="bi bi-chat-left-text-fill"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Complaints</h5>
                  <div className="fs-4 fw-bold text-danger">{dashboard?.complaints ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-dark"><i className="bi bi-flag-fill"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Reports</h5>
                  <div className="fs-4 fw-bold text-dark">{dashboard?.reports ?? 0}</div>
                </div>
              </div>
            </div>

            {/* System Overview reports */}
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
                  <h5 className="fw-bold text-dark mb-3">Audit Logs</h5>
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-shield-check fs-1 mb-3 text-success"></i>
                      <p className="mb-0">No persisted audit log records are available in Phase 1.</p>
                    </div>
                  ) : (
                    auditLogs.map((entry) => (
                      <div key={`${entry.type}-${entry.timestamp}-${entry.title}`} className="p-3 bg-light rounded-4 border mb-2 small text-muted d-flex align-items-start gap-2">
                        <i className="bi bi-shield-check text-success mt-1"></i>
                        <div>
                          <div className="fw-semibold text-dark">{entry.title}</div>
                          <div>{entry.description}</div>
                          <div className="small mt-1">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Recently'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">Notifications</h5>
                    <span className="badge bg-success-subtle text-success rounded-pill">{dashboard?.unreadNotificationCount ?? 0} unread</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-5 text-muted small">No notifications available.</div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-3 bg-light rounded-4 border mb-2">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div>
                            <div className="fw-semibold text-dark small">{notification.title}</div>
                            <div className="text-muted small">{notification.message}</div>
                          </div>
                          {!notification.read && <span className="badge bg-warning-subtle text-warning rounded-pill">New</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODULAR INTEGRATED TABS */}
        {/* ======================================================== */}
        {activeTab === '#users' && <UserManagement onShowToast={showAlert} />}

        {activeTab === '#roles' && <RoleManagement onShowToast={showAlert} />}

        {activeTab === '#approvals' && <CourseApproval onShowToast={showAlert} />}

        {activeTab === '#complaints' && <ComplaintManagement onShowToast={showAlert} />}

        {activeTab === '#notifications' && <AdminNotifications onShowToast={showAlert} />}

        {activeTab === '#monitoring' && <PlatformAnalytics />}

        {activeTab === '#audits' && <AuditLogs />}

        {activeTab === '#cms' && <CMSControl onShowToast={showAlert} />}

        {/* ======================================================== */}
        {/* TAB: SETTINGS */}
        {/* ======================================================== */}
        {activeTab === '#settings' && (
          <div className="fade-in-quick text-start">
            <div className="mb-4">
              <h2 className="fw-bold text-dark mb-1">Preferences & Account</h2>
              <p className="text-muted">Configure security preferences and profile layouts.</p>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
              <h3 className="fs-5 fw-bold text-dark mb-4">Administrator details</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name</label>
                  <input type="text" className="form-control rounded-3" value={profile?.fullName || user?.name || ''} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Designated Scope</label>
                  <input type="text" className="form-control rounded-3" value={profile?.role || 'ADMIN'} disabled />
                </div>
              </div>
            </div>
          </div>
        )}

      </DashboardLayout>
    </div>
  );
}
