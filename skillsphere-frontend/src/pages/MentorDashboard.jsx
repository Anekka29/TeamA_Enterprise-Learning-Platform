import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import DashboardService from '../services/DashboardService';
import ProfileService from '../services/ProfileService';
import { useAuth } from '../hooks/useAuth';
import '../styles/dashboard-layout.css';

// Subcomponents
import CourseManagement from '../components/Dashboard/Mentor/CourseManagement';
import LessonManagement from '../components/Dashboard/Mentor/LessonManagement';
import AssignmentManagement from '../components/Dashboard/Mentor/AssignmentManagement';
import QuizManagement from '../components/Dashboard/Mentor/QuizManagement';
import SessionScheduler from '../components/Dashboard/Mentor/SessionScheduler';
import AttendanceTracker from '../components/Dashboard/Mentor/AttendanceTracker';
import MentorAnalytics from '../components/Dashboard/Mentor/MentorAnalytics';
import MentorMessages from '../components/Dashboard/Mentor/MentorMessages';


const SIDEBAR_LINKS = [
  { icon: 'bi-house-fill', label: 'Dashboard', href: '#dashboard' },
  { icon: 'bi-collection-play-fill', label: 'My Courses', href: '#courses' },
  { icon: 'bi-folder-fill', label: 'Lessons', href: '#modules' },
  { icon: 'bi-file-earmark-text-fill', label: 'Assignments & Grading', href: '#assignments' },
  { icon: 'bi-patch-question-fill', label: 'Quizzes', href: '#quizzes' },
  { icon: 'bi-calendar-event-fill', label: 'Sessions', href: '#sessions' },
  { icon: 'bi-journal-check', label: 'Roster', href: '#analytics' },
  { icon: 'bi-graph-up-arrow', label: 'Metrics', href: '#mentor-analytics' },
  { icon: 'bi-chat-left-text-fill', label: 'Inbox', href: '#messages' },
  { icon: 'bi-gear-fill', label: 'Settings', href: '#settings' },
];

export default function MentorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('#dashboard');
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  const mentorEmail = profile?.email || user?.email || 'mentor@skillsphere.com';

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => setAlertInfo({ show: false, type: '', message: '' }), 4000);
  };

  useEffect(() => {
    Promise.all([
      ProfileService.getCurrentProfile(),
      DashboardService.getMentorDashboard(),
    ])
      .then(([profileRes, dashboardRes]) => {
        setProfile(profileRes.data);
        setDashboard(dashboardRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load mentor dashboard', err);
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
  const recentActivity = dashboard?.recentStudentActivity || [];
  const upcomingSessions = dashboard?.upcomingSessions || [];

  return (
    <div className="dashboard-wrapper-sim">
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        searchPlaceholder="Search students, resources..."
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
                  <h1 className="fw-bold mb-2">Welcome back, {dashboard?.mentorName || profile?.fullName || user?.name || 'Mentor'}!</h1>
                  <p className="mb-0 text-white-50 fs-5">Guide your students on their career path. Review current pending submissions below.</p>
                </div>
                <div className="d-none d-md-block fs-1"><i className="bi bi-mortarboard text-white-50"></i></div>
              </div>
            </div>



            {/* Quick stats grid */}
            <div className="row g-4 mb-4">
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-success"><i className="bi bi-people"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Total Students</h5>
                  <div className="fs-4 fw-bold text-success">{dashboard?.totalStudents ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-primary"><i className="bi bi-journal-bookmark-fill"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Courses Created</h5>
                  <div className="fs-4 fw-bold text-success">{dashboard?.coursesCreated ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-warning"><i className="bi bi-file-earmark-text-fill"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Pending Assignments</h5>
                  <div className="fs-4 fw-bold text-warning">{dashboard?.pendingAssignments ?? 0}</div>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-danger"><i className="bi bi-patch-question-fill"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Pending Quizzes</h5>
                  <div className="fs-4 fw-bold text-danger">{dashboard?.pendingQuizzes ?? 0}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-success"><i className="bi bi-globe2"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Published Courses</h5>
                  <div className="fs-4 fw-bold text-success">{dashboard?.publishedCourses ?? 0}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-secondary"><i className="bi bi-file-earmark-fill"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Draft Courses</h5>
                  <div className="fs-4 fw-bold text-dark">{dashboard?.draftCourses ?? 0}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-center">
                  <div className="fs-3 mb-2 text-info"><i className="bi bi-collection-fill"></i></div>
                  <h5 className="fw-bold text-dark mb-1">Total Enrollments</h5>
                  <div className="fs-4 fw-bold text-info">{dashboard?.totalEnrollments ?? 0}</div>
                </div>
              </div>
            </div>

            {/* Row Layout */}
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
                  <h5 className="fw-bold text-dark mb-3">Recent Student Activity</h5>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-activity fs-1 mb-3 text-success"></i>
                      <p className="mb-0">No recent student activity yet.</p>
                    </div>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={`${activity.type}-${activity.timestamp}-${activity.title}`} className="p-3 bg-light rounded-4 border mb-2 small text-muted d-flex align-items-start gap-2">
                        <i className="bi bi-pin-angle text-success mt-1"></i>
                        <div>
                          <div className="fw-semibold text-dark">{activity.title}</div>
                          <div>{activity.description}</div>
                          <div className="small mt-1">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">Notifications</h5>
                    <span className="badge bg-success-subtle text-success rounded-pill">{dashboard?.unreadNotificationCount ?? 0} unread</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-muted small">No notifications available.</div>
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

                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
                  <h5 className="fw-bold text-dark mb-3">Upcoming Sessions</h5>
                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-4 text-muted small">No upcoming mentor sessions are scheduled yet.</div>
                  ) : (
                    upcomingSessions.map((session) => (
                      <div key={`${session.title}-${session.scheduledAt}`} className="p-3 bg-light rounded-4 border mb-2">
                        <div className="fw-semibold text-dark small">{session.title}</div>
                        <div className="text-muted small">{session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : 'To be scheduled'}</div>
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
        {activeTab === '#courses' && <CourseManagement mentorEmail={mentorEmail} onShowToast={showAlert} />}

        {activeTab === '#modules' && <LessonManagement mentorEmail={mentorEmail} onShowToast={showAlert} />}

        {activeTab === '#assignments' && <AssignmentManagement mentorEmail={mentorEmail} onShowToast={showAlert} />}

        {activeTab === '#quizzes' && <QuizManagement mentorEmail={mentorEmail} onShowToast={showAlert} />}

        {activeTab === '#sessions' && <SessionScheduler mentorEmail={mentorEmail} onShowToast={showAlert} />}

        {activeTab === '#analytics' && <AttendanceTracker />}

        {activeTab === '#mentor-analytics' && <MentorAnalytics />}

        {activeTab === '#messages' && <MentorMessages mentorEmail={mentorEmail} onShowToast={showAlert} />}

        {/* ======================================================== */}
        {/* TAB: SETTINGS */}
        {/* ======================================================== */}
        {activeTab === '#settings' && (
          <div className="fade-in-quick text-start">
            <div className="mb-4">
              <h2 className="fw-bold text-dark mb-1">Preferences & Account</h2>
              <p className="text-muted">Configure notification channels, themes, and password keys.</p>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
              <h3 className="fs-5 fw-bold text-dark mb-4">Instructor profile info</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name</label>
                  <input type="text" className="form-control rounded-3" value={profile?.fullName || user?.name || ''} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Specialty</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={profile?.profileData?.specialization || profile?.profileData?.expertise || 'No specialty added yet'}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </DashboardLayout>
    </div>
  );
}
