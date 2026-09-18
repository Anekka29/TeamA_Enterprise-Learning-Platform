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
import AuditLogs from '../components/Dashboard/Admin/AuditLogs';
import AdminNotifications from '../components/Dashboard/Admin/AdminNotifications';
import MentorInternships from '../components/Dashboard/Mentor/MentorInternships';
import DashboardSettings from '../components/Dashboard/Admin/DashboardSettings';


const SIDEBAR_LINKS = [
  { icon: 'bi-house-fill', label: 'Dashboard', href: '#dashboard' },
  { icon: 'bi-people-fill', label: 'Users', href: '#users' },
  { icon: 'bi-person-badge-fill', label: 'Roles', href: '#roles' },
  { icon: 'bi-check-circle-fill', label: 'Approvals', href: '#approvals' },
  { icon: 'bi-briefcase-fill', label: 'Internships & Hiring', href: '#internships' },
  { icon: 'bi-chat-left-text-fill', label: 'Complaints Desk', href: '#complaints' },
  { icon: 'bi-bell-fill', label: 'Notifications', href: '#notifications' },
  { icon: 'bi-shield-lock-fill', label: 'Audits', href: '#audits' },
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
            <div className="welcome-card mb-4 shadow-sm position-relative overflow-hidden">
              <div className="d-flex justify-content-between align-items-center w-100 position-relative" style={{ zIndex: 2 }}>
                <div>
                  <h1 className="fw-bold mb-2 welcome-hero-anim-title" style={{ fontSize: '1.85rem' }}>
                    Welcome, <span className="welcome-name-gradient">{dashboard?.adminName || profile?.fullName || user?.name || 'Admin'}</span>
                  </h1>
                  <p className="mb-0 fs-6 welcome-hero-anim-sub" style={{ maxWidth: '680px', lineHeight: '1.5' }}>
                    Empowering seamless platform operations, user governance, and real-time performance analytics.
                  </p>
                </div>
                <div className="d-none d-md-flex align-items-center justify-content-center p-3 rounded-circle" style={{ background: 'rgba(16,185,129,0.1)', width: '64px', height: '64px' }}>
                  <i className="bi bi-shield-lock-fill text-success fs-2"></i>
                </div>
              </div>
            </div>



            {/* Quick stats KPI grid */}
            <div className="row g-4 mb-4">
              {[
                { title: 'Total Users', value: dashboard?.totalUsers ?? 0, icon: 'bi-people-fill', color: 'text-success', bg: 'rgba(16,185,129,0.1)' },
                { title: 'Students', value: dashboard?.students ?? 0, icon: 'bi-person-fill', color: 'text-primary', bg: 'rgba(59,130,246,0.1)' },
                { title: 'Mentors', value: dashboard?.mentors ?? 0, icon: 'bi-mortarboard-fill', color: 'text-info', bg: 'rgba(6,182,212,0.1)' },
                { title: 'Admins', value: dashboard?.admins ?? 0, icon: 'bi-shield-lock-fill', color: 'text-secondary', bg: 'rgba(100,116,139,0.1)' },
                { title: 'Total Courses', value: dashboard?.totalCourses ?? 0, icon: 'bi-book-fill', color: 'text-success', bg: 'rgba(16,185,129,0.1)' },
                { title: 'Pending Approvals', value: dashboard?.pendingCourseApprovals ?? 0, icon: 'bi-hourglass-split', color: 'text-warning', bg: 'rgba(245,158,11,0.1)' },
                { title: 'Active Courses', value: dashboard?.activeCourses ?? 0, icon: 'bi-globe2', color: 'text-primary', bg: 'rgba(59,130,246,0.1)' },
                { title: 'Complaints', value: dashboard?.complaints ?? 0, icon: 'bi-chat-left-text-fill', color: 'text-danger', bg: 'rgba(239,68,68,0.1)' },
              ].map((kpi) => (
                <div key={kpi.title} className="col-md-6 col-xl-3">
                  <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100">
                    <div className="rounded-4 d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '56px', height: '56px', background: kpi.bg }}>
                      <i className={`bi ${kpi.icon} ${kpi.color} fs-3`}></i>
                    </div>
                    <div className="text-muted extra-small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.04em' }}>{kpi.title}</div>
                    <div className={`fs-3 fw-bold ${kpi.color}`}>{kpi.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Overview reports */}
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">Audit Logs</h5>
                    <a href="#audits" className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold">View All</a>
                  </div>
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-shield-check fs-1 mb-2 text-success d-block"></i>
                      <p className="mb-0 small">No audit logs recorded yet.</p>
                    </div>
                  ) : (
                    auditLogs.slice(0, 5).map((entry, index) => (
                      <div key={entry.id || `audit-${index}`} className="p-3 bg-light rounded-4 border mb-2 small text-muted d-flex align-items-start gap-2">
                        <i className="bi bi-shield-check text-success mt-1"></i>
                        <div className="w-100">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-semibold text-dark">{entry.title || entry.type || 'Audit Action'}</span>
                            <span className="extra-small text-muted">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Recently'}</span>
                          </div>
                          <div className="small text-muted mt-1">{entry.description || entry.details || '—'}</div>
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

        {activeTab === '#internships' && <MentorInternships onShowToast={showAlert} />}

        {activeTab === '#complaints' && <ComplaintManagement onShowToast={showAlert} />}

        {activeTab === '#notifications' && <AdminNotifications onShowToast={showAlert} />}

        {activeTab === '#audits' && <AuditLogs />}

        {/* ======================================================== */}
        {/* TAB: SETTINGS */}
        {/* ======================================================== */}
        {activeTab === '#settings' && <DashboardSettings onShowToast={showAlert} />}

      </DashboardLayout>
    </div>
  );
}
