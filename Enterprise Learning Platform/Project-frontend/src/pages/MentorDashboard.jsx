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
import MentorMessages from '../components/Dashboard/Mentor/MentorMessages';
import MentorInternships from '../components/Dashboard/Mentor/MentorInternships';
import AdminNotifications from '../components/Dashboard/Admin/AdminNotifications';
import DashboardSettings from '../components/Dashboard/Admin/DashboardSettings';


const SIDEBAR_LINKS = [
  { icon: 'bi-house-fill', label: 'Dashboard', href: '#dashboard' },
  { icon: 'bi-collection-play-fill', label: 'My Courses', href: '#courses' },
  { icon: 'bi-folder-fill', label: 'Lessons', href: '#modules' },
  { icon: 'bi-file-earmark-text-fill', label: 'Assignments & Grading', href: '#assignments' },
  { icon: 'bi-patch-question-fill', label: 'Quizzes', href: '#quizzes' },
  { icon: 'bi-calendar-event-fill', label: 'Sessions', href: '#sessions' },
  { icon: 'bi-briefcase-fill', label: 'Internships & Hiring', href: '#internships' },
  { icon: 'bi-journal-check', label: 'Roster', href: '#analytics' },
  { icon: 'bi-chat-left-text-fill', label: 'Inbox', href: '#messages' },
  { icon: 'bi-bell-fill', label: 'Notifications & Broadcast', href: '#notifications' },
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
  const getUpcomingSessions = () => {
    let sessions = dashboard?.upcomingSessions || [];
    try {
      const stored = localStorage.getItem('skillsphere_global_live_sessions');
      if (stored) {
        const local = JSON.parse(stored);
        if (Array.isArray(local) && local.length > 0) {
          const formattedLocal = local.map(s => ({
            id: s.id,
            title: s.topic ? `${s.courseTitle || 'Course'}: ${s.topic}` : s.title,
            mentorName: s.mentorName || 'Mentor',
            scheduledAt: s.date ? `${s.date} ${s.timeWindow || ''}` : s.scheduledAt,
            link: s.zoomLink || s.link,
            status: s.status || 'UPCOMING'
          }));
          sessions = [...formattedLocal, ...sessions];
        }
      }
    } catch (e) {}
    return sessions;
  };

  const upcomingSessionsList = getUpcomingSessions();

  const getPendingAssignmentsCount = () => {
    try {
      const storedSubs = localStorage.getItem('skillsphere_assignment_submissions');
      if (storedSubs) {
        const subs = JSON.parse(storedSubs);
        const pendingSubs = subs.filter(s => s.status === 'SUBMITTED').length;
        if (pendingSubs > 0) return pendingSubs;
      }
      const storedAsgs = localStorage.getItem('skillsphere_global_assignments');
      if (storedAsgs) {
        const asgs = JSON.parse(storedAsgs);
        if (asgs.length > 0) return asgs.length;
      }
    } catch (e) {
      console.warn('Error computing pending assignments count', e);
    }
    return dashboard?.pendingAssignments ?? 0;
  };

  const getPendingQuizzesCount = () => {
    if (dashboard?.pendingQuizzes !== undefined && dashboard.pendingQuizzes > 0) {
      return dashboard.pendingQuizzes;
    }
    try {
      const stored = localStorage.getItem('skillsphere_global_quizzes');
      if (stored) {
        const quizzes = JSON.parse(stored);
        if (quizzes.length > 0) return quizzes.length;
      }
    } catch (e) {}
    return dashboard?.pendingQuizzes ?? 0;
  };

  const getDraftCoursesCount = () => {
    if (dashboard?.draftCourses !== undefined && dashboard.draftCourses > 0) {
      return dashboard.draftCourses;
    }
    try {
      const stored = localStorage.getItem('skillsphere_global_courses');
      if (stored) {
        const courses = JSON.parse(stored);
        const drafts = courses.filter(c => c.status === 'DRAFT' || c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW');
        if (drafts.length > 0) return drafts.length;
      }
    } catch (e) {}
    return dashboard?.draftCourses ?? 0;
  };

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
            <div className="welcome-card mb-4 shadow-sm position-relative overflow-hidden">
              <div className="d-flex justify-content-between align-items-center w-100 position-relative" style={{ zIndex: 2 }}>
                <div>
                  <h1 className="fw-bold mb-2 welcome-hero-anim-title" style={{ fontSize: '1.85rem' }}>
                    Welcome, <span className="welcome-name-gradient">{dashboard?.mentorName || profile?.fullName || user?.name || 'Mentor'}</span>
                  </h1>
                  <p className="mb-0 fs-6 welcome-hero-anim-sub" style={{ maxWidth: '680px', lineHeight: '1.5' }}>
                    Inspiring future tech leaders, shaping career journeys, and delivering world-class mentorship.
                  </p>
                </div>
                <div className="d-none d-md-flex align-items-center justify-content-center p-3 rounded-circle" style={{ background: 'rgba(16,185,129,0.1)', width: '64px', height: '64px' }}>
                  <i className="bi bi-mortarboard-fill text-success fs-2"></i>
                </div>
              </div>
            </div>



            {/* Quick stats grid */}
            <div className="row g-4 mb-4">
              {[
                { title: 'Total Students', value: dashboard?.totalStudents ?? 0, icon: 'bi-people-fill', color: 'text-success', bg: 'rgba(16,185,129,0.1)', col: 'col-md-6 col-xl-3' },
                { title: 'Courses Created', value: dashboard?.coursesCreated ?? 0, icon: 'bi-journal-bookmark-fill', color: 'text-primary', bg: 'rgba(59,130,246,0.1)', col: 'col-md-6 col-xl-3' },
                { title: 'Pending Assignments', value: getPendingAssignmentsCount(), icon: 'bi-file-earmark-text-fill', color: 'text-warning', bg: 'rgba(245,158,11,0.1)', col: 'col-md-6 col-xl-3' },
                { title: 'Pending Quizzes', value: getPendingQuizzesCount(), icon: 'bi-patch-question-fill', color: 'text-danger', bg: 'rgba(239,68,68,0.1)', col: 'col-md-6 col-xl-3' },
                { title: 'Published Courses', value: dashboard?.publishedCourses ?? 0, icon: 'bi-globe2', color: 'text-success', bg: 'rgba(16,185,129,0.1)', col: 'col-md-4' },
                { title: 'Draft Courses', value: getDraftCoursesCount(), icon: 'bi-file-earmark-fill', color: 'text-secondary', bg: 'rgba(100,116,139,0.1)', col: 'col-md-4' },
                { title: 'Total Enrollments', value: dashboard?.totalEnrollments ?? 0, icon: 'bi-collection-fill', color: 'text-info', bg: 'rgba(6,182,212,0.1)', col: 'col-md-4' },
              ].map((kpi) => (
                <div key={kpi.title} className={kpi.col}>
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
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">Upcoming Sessions</h5>
                    <a href="#sessions" className="btn btn-xs btn-outline-success rounded-pill fw-bold" style={{ fontSize: '0.72rem' }}>
                      <i className="bi bi-calendar-plus me-1"></i>Schedule New
                    </a>
                  </div>
                  {upcomingSessionsList.length === 0 ? (
                    <div className="text-center py-4 text-muted small">No upcoming mentor sessions are scheduled yet.</div>
                  ) : (
                    upcomingSessionsList.map((session, idx) => (
                      <div key={session.id || `sess_${idx}`} className="p-3 bg-light rounded-4 border mb-2 text-start">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                          <span className="fw-bold text-dark small">{session.title}</span>
                          <span className="badge bg-success-subtle text-success rounded-pill" style={{ fontSize: '0.65rem' }}>{session.status || 'UPCOMING'}</span>
                        </div>
                        <div className="text-muted extra-small mb-2">
                          <i className="bi bi-clock me-1 text-success"></i>
                          {session.scheduledAt ? (typeof session.scheduledAt === 'string' && session.scheduledAt.includes('T') ? new Date(session.scheduledAt).toLocaleString() : session.scheduledAt) : 'Scheduled'}
                        </div>
                        {session.link && (
                          <a href={session.link} target="_blank" rel="noreferrer" className="btn btn-xs btn-success rounded-pill text-white fw-bold px-3 py-1 d-inline-block" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-camera-video-fill me-1"></i>Join Zoom Live Session
                          </a>
                        )}
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

        {activeTab === '#internships' && <MentorInternships onShowToast={showAlert} />}

        {activeTab === '#analytics' && <AttendanceTracker />}

        {activeTab === '#messages' && <MentorMessages mentorEmail={mentorEmail} onShowToast={showAlert} />}

        {activeTab === '#notifications' && <AdminNotifications onShowToast={showAlert} />}

        {/* ======================================================== */}
        {/* TAB: SETTINGS */}
        {/* ======================================================== */}
        {activeTab === '#settings' && <DashboardSettings onShowToast={showAlert} />}

      </DashboardLayout>
    </div>
  );
}
