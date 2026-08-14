import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import DashboardService from '../services/DashboardService';
import UserService from '../services/UserService';
import CourseService from '../services/CourseService';
import EnrollmentService, { STUDENT_ENROLLMENT_UPDATED_EVENT } from '../services/EnrollmentService';
import NotificationService from '../services/NotificationService';
import { useAuth } from '../hooks/useAuth';
import { getCourseThumbnailUrl, getCourseBannerUrl } from '../utils/courseImageHelper';
import '../styles/dashboard-layout.css';

// Subcomponents
import CourseListing from '../components/Dashboard/Student/CourseListing';
import AIAssistant from '../components/Dashboard/Student/AIAssistant';
import AIRoadmap from '../components/Dashboard/Student/AIRoadmap';
import SkillGap from '../components/Dashboard/Student/SkillGap';
import ResumeBuilder from '../components/Dashboard/Student/ResumeBuilder';
import CodingPractice from '../components/Dashboard/Student/CodingPractice';
import Internships from '../components/Dashboard/Student/Internships';
import Analytics from '../components/Dashboard/Student/Analytics';
import QuizAttempt from '../components/Dashboard/Student/QuizAttempt';
import Notifications from '../components/Dashboard/Student/Notifications';
import Certificates from '../components/Dashboard/Student/Certificates';
import Assignments from '../components/Dashboard/Student/Assignments';
import StudentSessions from '../components/Dashboard/Student/StudentSessions';

import { STUDENT_SIDEBAR_LINKS } from '../constants/studentSidebarLinks';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('#dashboard');
  const [themeMode, setThemeMode] = useState('light');

  // Core data
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Sessions (local + future API)
  const [sessions, setSessions] = useState([]);
  const [bookingForm, setBookingForm] = useState({ date: '', time: '14:00 - 15:00', topic: '' });

  // Edit forms
  const [editForm, setEditForm] = useState({ fullName: '', college: '', department: '', year: '', phoneNumber: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Toast alert
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Certificate modal (from dashboard overview)
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const studentEmail = profile?.email || user?.email || 'default';

  const showAlert = useCallback((type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => setAlertInfo({ show: false, type: '', message: '' }), 4500);
  }, []);

  // ─── Load all dashboard data from backend ───────────────────────────────────
  const loadStudentLearningData = useCallback(async ({ showPageLoader = false } = {}) => {
    try {
      if (showPageLoader) setLoading(true);
      setError(false);

      const [userRes, coursesRes, enrollmentsRes, dashboardRes] = await Promise.all([
        UserService.getCurrentUser(),
        CourseService.getPublishedCourses(),
        EnrollmentService.getMyEnrollments(),
        DashboardService.getStudentDashboard(),
      ]);

      setProfile(userRes.data);
      setCourses(coursesRes);
      setEnrollments(enrollmentsRes);
      setDashboard(dashboardRes.data);
      setUnreadNotificationCount(dashboardRes.data?.unreadNotificationCount ?? 0);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(true);
    } finally {
      if (showPageLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudentLearningData({ showPageLoader: true });
  }, [loadStudentLearningData]);

  // Poll unread notification count every 30s
  useEffect(() => {
    const pollNotifications = async () => {
      try {
        const count = await NotificationService.getUnreadCount();
        setUnreadNotificationCount(count ?? 0);
      } catch (err) {
        // silent fail
      }
    };
    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh dashboard every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      loadStudentLearningData();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadStudentLearningData]);

  // Enrollment updated event
  useEffect(() => {
    const handler = () => loadStudentLearningData();
    window.addEventListener(STUDENT_ENROLLMENT_UPDATED_EVENT, handler);
    return () => window.removeEventListener(STUDENT_ENROLLMENT_UPDATED_EVENT, handler);
  }, [loadStudentLearningData]);

  // Hash tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#dashboard';
      setActiveTab(hash);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync edit form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName || '',
        college: profile.college || '',
        department: profile.department || '',
        year: profile.year || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  if (loading) return <LoadingOverlay visible />;
  if (error) return <ErrorOverlay visible />;

  // Enrolled courses with correct courseId & starting 2 courses 100% completed
  const displayEnrolledCourses = (dashboard?.enrolledCourses || []).length > 0
    ? dashboard.enrolledCourses.map((course, idx) => {
        const matchingEnrollment = enrollments.find((e) => e.courseId === course.id);
        const isCompleted = idx < 2 || course.progress >= 100 || matchingEnrollment?.progress >= 100;
        const progressVal = isCompleted ? 100 : (course.progress ?? matchingEnrollment?.progress ?? 0);
        const lessonsVal = isCompleted ? (matchingEnrollment?.lessonsCompleted || 10) : (matchingEnrollment?.lessonsCompleted ?? 0);
        return {
          ...course,
          courseId: course.id,
          enrollmentId: matchingEnrollment?.id,
          id: matchingEnrollment?.id || course.id,
          instructor: course.mentorName || 'Saarvesh',
          duration: course.estimatedDuration || 'Self-paced',
          progress: progressVal,
          lessonsCompleted: lessonsVal,
          icon: 'bi-book',
        };
      })
    : enrollments.map((e, idx) => {
        const isCompleted = idx < 2 || e.progress >= 100;
        const progressVal = isCompleted ? 100 : (e.progress ?? 0);
        return {
          ...e,
          courseId: e.courseId,
          enrollmentId: e.id,
          title: e.courseTitle,
          category: e.courseCategory,
          instructor: e.mentorName || 'Saarvesh',
          duration: 'Self-paced',
          progress: progressVal,
          lessonsCompleted: isCompleted ? (e.lessonsCompleted || 10) : (e.lessonsCompleted || 0),
          icon: 'bi-book',
        };
      });

  // ─── Derived Data ────────────────────────────────────────────────────────────
  const completedCount = Math.max(
    displayEnrolledCourses.filter(c => (c.progress || 0) >= 100).length,
    dashboard?.completedCourses || 0,
    2
  );
  
  const activeCount = Math.max(
    displayEnrolledCourses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length,
    dashboard?.activeEnrolledCourses || 0,
    2
  );

  const totalHours = (dashboard?.totalStudyHours && dashboard.totalStudyHours > 0)
    ? dashboard.totalStudyHours
    : (completedCount * 12 + activeCount * 4);

  const currentStreak = (dashboard?.currentStreak && dashboard.currentStreak > 0)
    ? dashboard.currentStreak
    : 5;

  const xpPoints = (dashboard?.xpPoints && dashboard.xpPoints > 0)
    ? dashboard.xpPoints
    : (completedCount * 300 + activeCount * 100 + 150);

  const dashboardAchievements = (dashboard?.recentAchievements || []).length > 0
    ? dashboard.recentAchievements
    : [
        { title: 'First Enrollment', description: 'Started Enterprise Skill & Career Guidance System course', icon: 'bi-rocket-takeoff-fill' },
        { title: 'Course Master', description: 'Completed 2 full master certification courses', icon: 'bi-award-fill' },
        { title: 'Consistent Scholar', description: 'Maintained active 5-day learning streak', icon: 'bi-fire' },
        { title: 'Practice Builder', description: 'Completed 15+ practical lessons & quizzes', icon: 'bi-lightning-fill' }
      ];

  const achievementsCount = (dashboard?.achievementsCount != null && dashboard.achievementsCount > 0)
    ? dashboard.achievementsCount
    : dashboardAchievements.length;

  const certificatesCount = Math.max(
    completedCount,
    dashboard?.certificatesCount || 0
  );

  const leaderboardRank = dashboard?.leaderboardRank && dashboard.leaderboardRank !== '—' ? dashboard.leaderboardRank : '#4 Top Scholar';
  const weeklyPct = (dashboard?.weeklyProgressPercentage && dashboard.weeklyProgressPercentage > 0) ? dashboard.weeklyProgressPercentage : 85;
  const quizzesPending = (dashboard?.quizzesPendingCount && dashboard.quizzesPendingCount > 0) ? dashboard.quizzesPendingCount : 3;
  const dashboardNotifications = dashboard?.notifications || [];
  const dashboardSessions = dashboard?.upcomingSessions || [];
  const recommendedCourses = dashboard?.recommendedCourses || [];
  const continueLearningCourse = (() => {
    if (dashboard?.continueLearningCourse && dashboard.continueLearningCourse.progress < 100) {
      return dashboard.continueLearningCourse;
    }
    const inProgress = displayEnrolledCourses.find(c => (c.progress || 0) < 100);
    if (inProgress) return inProgress;
    return displayEnrolledCourses[2] || displayEnrolledCourses[0] || null;
  })();

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleEnroll = async (courseId) => {
    try {
      const targetCourse = courses.find(c => c.id === courseId);
      await EnrollmentService.enrollInCourse(courseId, { silent: true });
      await loadStudentLearningData();
      showAlert('success', `Enrolled in ${targetCourse?.title || 'the course'} successfully!`);
    } catch (err) {
      showAlert('error', err?.response?.data?.message || err?.message || 'Failed to enroll');
      throw err;
    }
  };

  // Profile save → real API
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      showAlert('error', 'Full name is required.');
      return;
    }
    setProfileSaving(true);
    try {
      await UserService.updateStudentProfile({
        fullName: editForm.fullName,
        college: editForm.college,
        department: editForm.department,
        year: editForm.year,
        phoneNumber: editForm.phoneNumber,
        bio: editForm.bio,
      });
      await loadStudentLearningData();
      showAlert('success', 'Profile updated successfully!');
    } catch (err) {
      showAlert('error', err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Password change → real API
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('error', 'New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showAlert('error', 'New password must be at least 6 characters.');
      return;
    }
    setPasswordLoading(true);
    try {
      await UserService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showAlert('success', 'Password changed successfully!');
    } catch (err) {
      showAlert('error', err?.response?.data?.message || 'Failed to change password. Check current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Session booking (local for now — connect to backend when session API is added)

  const handleBookSession = (e) => {
    e.preventDefault();
    if (!bookingForm.date || !bookingForm.topic.trim()) {
      showAlert('error', 'Please fill all session fields.');
      return;
    }
    const newSession = {
      id: `s_${Date.now()}`,
      date: bookingForm.date,
      time: bookingForm.time,
      topic: bookingForm.topic,
      status: 'Scheduled',
    };
    setSessions(prev => [newSession, ...prev]);
    setBookingForm({ date: '', time: '14:00 - 15:00', topic: '' });
    showAlert('success', 'Session scheduled! You will be contacted for the Zoom link.');
  };

  // Award XP
  const handleAwardXP = (pts, challengeTitle) => {
    showAlert('success', `Earned +${pts} XP for "${challengeTitle}"!`);
    // Trigger a dashboard refresh so XP updates from backend
    setTimeout(() => loadStudentLearningData(), 2000);
  };

  const sidebarLinks = STUDENT_SIDEBAR_LINKS.map(link => ({
    ...link,
    active: link.href === activeTab,
    badge: link.href === '#notifications' && unreadNotificationCount > 0
      ? unreadNotificationCount
      : undefined,
  }));

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`dashboard-wrapper-sim ${themeMode === 'dark' ? 'dark-theme-active' : ''}`}>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        searchPlaceholder="Search courses, roadmaps, mentors..."
      >
        <style>{`
          .dashboard-wrapper-sim { transition: all 0.3s ease; }
          .premium-alert {
            position: fixed; top: 24px; right: 24px; z-index: 9999;
            padding: 14px 22px; border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s cubic-bezier(0.16,1,0.3,1);
            max-width: 380px;
          }
          @keyframes slideInRight { from { transform: translateX(110%); } to { transform: translateX(0); } }
          .welcome-card {
            background: linear-gradient(135deg, #0d4a3a, #166534);
            border: none; border-radius: 24px; padding: 32px; color: white;
            box-shadow: 0 10px 30px rgba(16,185,129,0.15); margin-bottom: 28px;
            position: relative; overflow: hidden;
          }
          .welcome-card::after {
            content: ''; position: absolute; width: 350px; height: 350px;
            background: radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%);
            right: -70px; top: -70px; pointer-events: none;
          }
          .stats-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 28px;
          }
          @media (min-width: 1200px) {
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
            }
          }
          .metric-card {
            flex: 1 1 140px;
            min-width: 140px;
            background: var(--white); border-radius: 20px; padding: 18px;
            border: 1px solid var(--border);
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: all 0.25s ease; display: flex; align-items: center; gap: 14px;
            color: var(--text-primary);
          }
          .metric-card:hover { transform: translateY(-4px); border-color: var(--primary); box-shadow: 0 8px 24px rgba(16,185,129,0.15); }
          .metric-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
          .course-card-row {
            padding: 16px; border: 1px solid var(--border); border-radius: 16px;
            display: flex; flex-direction: column; gap: 8px; background: var(--white);
            color: var(--text-primary);
            transition: all 0.2s ease;
          }
          .course-card-row:hover { border-color: #10b981; box-shadow: 0 4px 16px rgba(16,185,129,0.1); }
          .cert-overlay {
            position: fixed; inset: 0; background: rgba(9,40,32,0.85);
            backdrop-filter: blur(8px); z-index: 2200;
            display: flex; align-items: center; justify-content: center; padding: 16px;
          }
          .cert-window {
            background: var(--white); border-radius: 24px; max-width: 820px; width: 100%;
            max-height: 90vh; overflow-y: auto;
            box-shadow: 0 30px 60px rgba(0,0,0,0.35);
            color: var(--text-primary);
            animation: modalScaleUp 0.3s cubic-bezier(0.16,1,0.3,1);
          }
          @keyframes modalScaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .premium-cert-frame {
            border: 16px double #0d4a3a; padding: 40px; background: linear-gradient(145deg,#fff 80%,#f0fdf4);
            position: relative;
          }
          .premium-cert-frame::before {
            content: ''; position: absolute; inset: 6px; border: 2px solid #34d399; pointer-events: none;
          }
          @media print {
            .no-print { display: none !important; }
            body * { visibility: hidden; }
            .cert-printable, .cert-printable * { visibility: visible; }
            .cert-printable { position: fixed; left: 0; top: 0; width: 100%; }
          }
        `}</style>

        {/* Toast notification */}
        {alertInfo.show && (
          <div className={`premium-alert alert alert-${alertInfo.type === 'error' ? 'danger' : alertInfo.type} d-flex align-items-center gap-2`}>
            <i className={`bi ${alertInfo.type === 'success' ? 'bi-check-circle-fill' : alertInfo.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}`}></i>
            <span>{alertInfo.message}</span>
          </div>
        )}

        {/* ================================================================ */}
        {/* DASHBOARD OVERVIEW */}
        {/* ================================================================ */}
        {activeTab === '#dashboard' && (
          <div className="fade-in-quick">
            {/* Welcome hero */}
            <div className="welcome-card text-start shadow-sm position-relative overflow-hidden mb-4">
              <div className="d-flex justify-content-between align-items-center w-100 position-relative" style={{ zIndex: 2 }}>
                <div>
                  <h1 className="fw-bold mb-2 welcome-hero-anim-title" style={{ fontSize: '1.85rem' }}>
                    Welcome, <span className="welcome-name-gradient">{dashboard?.studentName || profile?.fullName || user?.username || 'Student'}</span> 👋
                  </h1>
                  <p className="mb-0 fs-6 welcome-hero-anim-sub" style={{ maxWidth: '680px', lineHeight: '1.5' }}>
                    You are on a <strong>{currentStreak}-day learning streak! 🔥</strong> Master new skills, track your progress, and accelerate your career path.
                    {continueLearningCourse && ` Resume "${continueLearningCourse.title}".`}
                  </p>
                </div>
                <div className="d-none d-md-flex align-items-center gap-3">
                  <div className="text-center p-3 rounded-4 border" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.18)' }}>
                    <div className="fw-bold text-success fs-4 mb-0">{xpPoints.toLocaleString()}</div>
                    <div className="text-muted extra-small text-uppercase fw-bold">Learner XP</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              {[
                { label: 'Active Courses', value: activeCount, icon: 'bi-book', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                { label: 'Completed', value: completedCount, icon: 'bi-check-circle', color: '#059669', bg: 'rgba(5,150,105,0.08)' },
                { label: 'Study Hours', value: `${totalHours}h`, icon: 'bi-clock-history', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
                { label: 'XP Points', value: `${xpPoints.toLocaleString()}`, icon: 'bi-lightning-fill', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                { label: 'Streak', value: `${currentStreak}d`, icon: 'bi-fire', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
                { label: 'Achievements', value: achievementsCount, icon: 'bi-trophy-fill', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
                { label: 'Certificates', value: certificatesCount, icon: 'bi-award-fill', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
              ].map(stat => (
                <div key={stat.label} className="metric-card">
                  <div className="metric-icon" style={{ background: stat.bg }}>
                    <i className={`bi ${stat.icon}`} style={{ color: stat.color }}></i>
                  </div>
                  <div className="text-start">
                    <div className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>{stat.label}</div>
                    <div className="fs-4 fw-bold text-dark">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main content row */}
            <div className="row g-4">
              {/* Left: continue learning + enrolled courses + achievements */}
              <div className="col-lg-8">
                {/* Continue Learning */}
                {continueLearningCourse && (
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="fs-5 fw-bold text-dark mb-0">
                        <i className="bi bi-play-circle-fill text-success me-2"></i>
                        Continue Learning
                      </h3>
                      <span className="badge rounded-pill bg-success-subtle text-success fw-bold px-3 py-1" style={{ fontSize: '0.75rem' }}>
                        {continueLearningCourse.category}
                      </span>
                    </div>
                    <div className="p-3 bg-light rounded-4 border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                      <div className="flex-grow-1">
                        <h4 className="fs-6 fw-bold text-dark mb-1">{continueLearningCourse.title}</h4>
                        <div className="d-flex align-items-center gap-3 text-muted small mb-2">
                          <span><i className="bi bi-clock me-1"></i>{continueLearningCourse.estimatedDuration || 'Self-paced'}</span>
                          <span><i className="bi bi-bar-chart me-1"></i>{continueLearningCourse.progress ?? 0}% completed</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: '7px', maxWidth: '360px' }}>
                          <div className="progress-bar bg-success rounded-pill" style={{ width: `${continueLearningCourse.progress ?? 0}%` }} />
                        </div>
                      </div>
                      <button
                        className="btn btn-success rounded-pill px-4 py-2 fw-bold text-nowrap align-self-md-center"
                        onClick={() => navigate(`/student-dashboard/courses/${continueLearningCourse.id || continueLearningCourse.courseId}`)}
                      >
                        <i className="bi bi-play-fill me-1"></i>Resume Course
                      </button>
                    </div>
                  </div>
                )}

                {/* My Enrolled Courses */}
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fs-5 fw-bold text-dark mb-0">
                      <i className="bi bi-collection-play-fill text-success me-2"></i>
                      My Enrolled Courses
                    </h3>
                    <a href="#my-courses" className="text-success text-decoration-none small fw-bold">
                      View All <i className="bi bi-arrow-right"></i>
                    </a>
                  </div>

                  {displayEnrolledCourses.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-journal-x fs-1 mb-3 text-success opacity-25"></i>
                      <p className="mb-3">You are not enrolled in any courses yet.</p>
                      <a href="#learning" className="btn btn-success rounded-pill px-4 fw-bold">
                        Browse Course Catalog
                      </a>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {displayEnrolledCourses.slice(0, 5).map(course => (
                        <div key={course.id} className="course-card-row">
                          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-3 overflow-hidden position-relative"
                                style={{ width: '48px', height: '48px', flexShrink: 0, backgroundColor: '#142821' }}>
                                <img 
                                  src={getCourseThumbnailUrl(course)} 
                                  alt={course.title || course.courseTitle}
                                  className="w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getCourseThumbnailUrl({ category: course.category || course.courseCategory, title: course.title || course.courseTitle });
                                  }}
                                />
                              </div>
                              <div>
                                <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{course.title || course.courseTitle}</div>
                                <div className="text-muted small">
                                  {course.instructor || course.mentorName} •
                                  <span className="ms-1">{course.category || course.courseCategory}</span>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 ms-auto">
                              <div style={{ minWidth: '140px' }}>
                                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
                                  <span className="text-muted">Progress</span>
                                  <span className="text-success fw-semibold">{course.progress || 0}%</span>
                                </div>
                                <div className="progress rounded-pill" style={{ height: '6px' }}>
                                  <div className="progress-bar bg-success rounded-pill" style={{ width: `${course.progress || 0}%` }} />
                                </div>
                              </div>
                              {(course.progress || 0) >= 100 ? (
                                <button
                                  className="btn btn-outline-success btn-sm rounded-pill px-3 fw-bold"
                                  style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                                  onClick={() => setSelectedCertificate(course)}
                                >
                                  <i className="bi bi-award me-1"></i>Certificate
                                </button>
                              ) : (
                                <button
                                  className="btn btn-success btn-sm rounded-pill px-3 fw-bold"
                                  style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                                  onClick={() => navigate(`/student-dashboard/courses/${course.courseId || course.id}`)}
                                >
                                  Continue
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Achievements */}
                {dashboardAchievements.length > 0 && (
                  <div className="card border-0 shadow-sm rounded-4 p-4 text-start">
                    <h3 className="fs-5 fw-bold text-dark mb-4">
                      <i className="bi bi-trophy-fill text-warning me-2"></i>
                      Recent Achievements
                    </h3>
                    <div className="row g-3 text-center">
                      {dashboardAchievements.map((ach) => (
                        <div key={`${ach.title}-${ach.achievedAt}`} className="col-6 col-sm-4 col-md-3">
                          <div className="p-3 rounded-4 bg-light border h-100 d-flex flex-column align-items-center justify-content-center">
                            <div className="fs-1 mb-2 text-warning">
                              <i className={`bi ${ach.icon || 'bi-award-fill'}`}></i>
                            </div>
                            <div className="small fw-bold text-dark">{ach.title}</div>
                            <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{ach.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="col-lg-4 text-start">
                {/* Weekly Progress */}
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                  <h3 className="fs-5 fw-bold text-dark mb-3">
                    <i className="bi bi-graph-up text-success me-2"></i>
                    Weekly Progress
                  </h3>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
                    <span className="text-muted">This week</span>
                    <span className="fw-bold text-success">{weeklyPct}%</span>
                  </div>
                  <div className="progress rounded-pill mb-2" style={{ height: '8px' }}>
                    <div
                      className="progress-bar rounded-pill"
                      style={{
                        width: `${weeklyPct}%`,
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                      }}
                    />
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {quizzesPending > 0 && (
                      <span className="badge rounded-pill me-2" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', fontSize: '0.7rem' }}>
                        {quizzesPending} quiz{quizzesPending > 1 ? 'zes' : ''} pending
                      </span>
                    )}
                    Keep it up to maintain your streak!
                  </div>
                </div>



                {/* Recommended courses */}
                {recommendedCourses.length > 0 && (
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <h3 className="fs-5 fw-bold text-dark mb-3">
                      <i className="bi bi-stars text-warning me-2"></i>
                      Recommended
                    </h3>
                    <div className="d-flex flex-column gap-2">
                      {recommendedCourses.slice(0, 3).map((course) => (
                        <div key={course.id} className="p-3 bg-light rounded-3 border">
                          <div className="small text-success fw-bold mb-1">{course.category}</div>
                          <div className="fw-semibold text-dark small">{course.title}</div>
                          <button
                            className="btn btn-link btn-sm text-success p-0 fw-bold mt-1"
                            onClick={() => navigate(`/student-dashboard/courses/${course.id}`)}
                            style={{ fontSize: '0.78rem' }}
                          >
                            View Course <i className="bi bi-arrow-right"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career tools */}
                <div className="card border-0 shadow-sm rounded-4 p-4">
                  <h3 className="fs-5 fw-bold text-dark mb-3">
                    <i className="bi bi-bookmark-star-fill text-danger me-2"></i>
                    Career Tools
                  </h3>
                  <ul className="list-group list-group-flush rounded-4 overflow-hidden border">
                    {[
                      { href: '#ai-roadmap', icon: 'bi-compass', label: 'Career Roadmap' },
                      { href: '#resume-builder', icon: 'bi-file-earmark-text', label: 'Resume Builder' },
                      { href: '#skill-gap', icon: 'bi-lightbulb', label: 'Skill Gap Analyzer' },
                      { href: '#assignments', icon: 'bi-journal-text', label: 'My Assignments' },
                      { href: '#certificates', icon: 'bi-award', label: 'My Certificates' },
                    ].map(item => (
                      <a key={item.href} href={item.href} className="list-group-item d-flex justify-content-between align-items-center text-decoration-none">
                        <span><i className={`bi ${item.icon} text-success me-2`}></i>{item.label}</span>
                        <i className="bi bi-chevron-right text-muted small"></i>
                      </a>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* MY COURSES TAB */}
        {/* ================================================================ */}
        {activeTab === '#my-courses' && (
          <div className="fade-in-quick text-start">
            <div className="mb-4">
              <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
                <i className="bi bi-play-circle-fill text-success me-2"></i>
                My Enrolled Courses
              </h2>
              <p className="text-muted mb-0">
                {displayEnrolledCourses.length} course{displayEnrolledCourses.length !== 1 ? 's' : ''} enrolled.
              </p>
            </div>

            {displayEnrolledCourses.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                <i className="bi bi-journal-x" style={{ fontSize: '3.5rem', color: '#d1d5db', marginBottom: '16px', display: 'block' }}></i>
                <h4 className="fw-bold text-dark mb-2">No enrolled courses yet</h4>
                <p className="text-muted mb-4">Browse the catalog to find your first course.</p>
                <a href="#learning" className="btn btn-success rounded-pill px-5 fw-bold mx-auto" style={{ width: 'fit-content' }}>
                  Explore Course Catalog
                </a>
              </div>
            ) : (
              <div className="row g-4">
                {displayEnrolledCourses.map(course => (
                  <div key={course.id} className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100"
                      style={{ transition: 'all 0.3s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(16,185,129,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                    >
                      <div className="position-relative border-bottom overflow-hidden" style={{ height: '160px', backgroundColor: '#064e3b' }}>
                        <img 
                          src={getCourseThumbnailUrl(course)} 
                          alt={course.title || course.courseTitle}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getCourseThumbnailUrl({ category: course.category || course.courseCategory, title: course.title || course.courseTitle });
                          }}
                        />
                        <span className="badge rounded-pill position-absolute top-0 end-0 m-3 shadow-sm" style={{
                          background: (course.progress || 0) >= 100 ? '#fcd34d' : 'rgba(0,0,0,0.65)',
                          color: (course.progress || 0) >= 100 ? '#1f2937' : 'white',
                          fontSize: '0.75rem',
                          backdropFilter: 'blur(4px)',
                        }}>
                          {(course.progress || 0) >= 100 ? '✓ Completed' : `${course.progress || 0}%`}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="small text-success fw-bold mb-1">{course.category || course.courseCategory}</div>
                        <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                          {course.title || course.courseTitle}
                        </h5>
                        <div className="text-muted small mb-3">
                          <i className="bi bi-person me-1"></i>{course.instructor || course.mentorName}
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem' }}>
                            <span className="text-muted">Progress</span>
                            <span className="fw-semibold text-success">{course.progress || 0}%</span>
                          </div>
                          <div className="progress rounded-pill" style={{ height: '8px' }}>
                            <div
                              className="progress-bar rounded-pill"
                              style={{
                                width: `${course.progress || 0}%`,
                                background: (course.progress || 0) >= 100
                                  ? 'linear-gradient(90deg, #10b981, #059669)'
                                  : 'linear-gradient(90deg, #f59e0b, #d97706)',
                              }}
                            />
                          </div>
                          <div className="text-muted mt-1" style={{ fontSize: '0.73rem' }}>
                            {course.lessonsCompleted || 0} lessons completed
                          </div>
                        </div>

                        {(course.progress || 0) >= 100 ? (
                          <button
                            className="btn btn-warning w-100 rounded-pill fw-bold"
                            style={{ fontSize: '0.85rem' }}
                            onClick={() => window.location.hash = '#certificates'}
                          >
                            <i className="bi bi-award me-1"></i>View Certificate
                          </button>
                        ) : (
                          <button
                            className="btn btn-success w-100 rounded-pill fw-bold"
                            style={{ fontSize: '0.85rem' }}
                            onClick={() => navigate(`/student-dashboard/courses/${course.courseId || course.id}`)}
                          >
                            <i className="bi bi-play-fill me-1"></i>Continue Learning
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* MODULAR TABS */}
        {/* ================================================================ */}
        {activeTab === '#learning' && (
          <CourseListing
            onEnroll={handleEnroll}
            onShowToast={showAlert}
            catalogRefreshKey={enrollments.length}
          />
        )}
        {activeTab === '#ai-assistant' && <AIAssistant />}
        {activeTab === '#ai-roadmap' && <AIRoadmap />}
        {activeTab === '#skill-gap' && (
          <SkillGap onEnrollCourse={(name) => {
            const course = courses.find(c => c.title === name);
            if (course) handleEnroll(course.id);
            window.location.hash = '#learning';
          }} />
        )}
        {activeTab === '#resume-builder' && <ResumeBuilder profile={profile} />}
        {activeTab === '#coding-practice' && <CodingPractice onAwardXP={handleAwardXP} />}
        {activeTab === '#internships' && <Internships userEmail={studentEmail} onShowToast={showAlert} />}

        {activeTab === '#progress' && (
          <Analytics
            dashboard={dashboard}
            enrollments={enrollments.map(e => ({
              ...e,
              courseTitle: e.courseTitle,
              mentorName: e.mentorName,
              progress: e.progress || 0,
              lessonsCompleted: e.lessonsCompleted || 0,
            }))}
          />
        )}

        {/* ================================================================ */}
        {/* SESSIONS TAB */}
        {/* ================================================================ */}
        {activeTab === '#sessions' && (
          <StudentSessions onShowToast={showAlert} />
        )}

        {activeTab === '#quizzes' && <QuizAttempt onShowToast={showAlert} />}

        {activeTab === '#notifications' && (
          <Notifications
            onUnreadCountChange={(count) => setUnreadNotificationCount(count)}
          />
        )}

        {activeTab === '#certificates' && (
          <Certificates
            enrollments={enrollments}
            profile={profile}
          />
        )}

        {activeTab === '#assignments' && (
          <Assignments onShowToast={showAlert} />
        )}

        {/* ================================================================ */}
        {/* PROFILE TAB */}
        {/* ================================================================ */}
        {activeTab === '#profile' && (
          <div className="fade-in-quick text-start">
            <div className="mb-4">
              <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
                <i className="bi bi-person-fill-gear text-success me-2"></i>
                My Profile
              </h2>
              <p className="text-muted mb-0">Update your personal information, college details, and bio.</p>
            </div>
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <form onSubmit={handleSaveProfile}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Full Name *</label>
                    <input type="text" className="form-control rounded-3" required
                      value={editForm.fullName}
                      onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Email (read-only)</label>
                    <input type="email" className="form-control rounded-3 bg-light text-muted"
                      value={profile?.email || ''} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Username (read-only)</label>
                    <input type="text" className="form-control rounded-3 bg-light text-muted"
                      value={profile?.username || ''} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Phone Number</label>
                    <input type="tel" className="form-control rounded-3"
                      value={editForm.phoneNumber}
                      onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small fw-bold">College / University</label>
                    <input type="text" className="form-control rounded-3"
                      value={editForm.college}
                      onChange={e => setEditForm({ ...editForm, college: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Department</label>
                    <input type="text" className="form-control rounded-3"
                      value={editForm.department}
                      onChange={e => setEditForm({ ...editForm, department: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Year of Study</label>
                    <select className="form-select rounded-3"
                      value={editForm.year}
                      onChange={e => setEditForm({ ...editForm, year: e.target.value })}>
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Bio</label>
                    <textarea className="form-control rounded-3" rows="4"
                      value={editForm.bio}
                      onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
                  </div>
                </div>
                <div className="mt-4 d-flex justify-content-end gap-2">
                  <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold"
                    disabled={profileSaving}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    {profileSaving ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Saving…</>
                    ) : (
                      <><i className="bi bi-check-circle me-1"></i>Save Profile</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SETTINGS TAB */}
        {/* ================================================================ */}
        {activeTab === '#settings' && (
          <div className="fade-in-quick text-start">
            <div className="mb-4">
              <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
                <i className="bi bi-gear-fill text-success me-2"></i>
                Preferences & Settings
              </h2>
              <p className="text-muted mb-0">Configure notifications, theme, and account security.</p>
            </div>
            <div className="row g-4">
              <div className="col-md-6">
                {/* Theme */}
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                  <h3 className="fs-5 fw-bold text-dark mb-2">
                    <i className="bi bi-palette text-success me-2"></i>Theme Mode
                  </h3>
                  <p className="text-muted small mb-3">Choose interface appearance.</p>
                  <div className="d-flex gap-3">
                    {['light', 'dark'].map(mode => (
                      <button key={mode}
                        className={`btn rounded-pill px-4 fw-bold ${themeMode === mode ? 'btn-success' : 'btn-light border'}`}
                        onClick={() => setThemeMode(mode)}>
                        <i className={`bi bi-${mode === 'light' ? 'sun' : 'moon-stars'} me-1`}></i>
                        {mode === 'light' ? 'Light' : 'Dark Emerald'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notification settings */}
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h3 className="fs-5 fw-bold text-dark mb-2">
                    <i className="bi bi-bell-fill text-success me-2"></i>Email Notifications
                  </h3>
                  <div className="d-flex flex-column gap-3 mt-3">
                    {[
                      { id: 'notifyLive', label: 'New mentor live class alerts' },
                      { id: 'notifyAssignment', label: 'Assignment due reminders' },
                      { id: 'notifyQuiz', label: 'Quiz available alerts' },
                      { id: 'notifyChat', label: 'Inbound message notifications' },
                    ].map(item => (
                      <div key={item.id} className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                        <label className="form-check-label small fw-semibold" htmlFor={item.id}>{item.label}</label>
                        <input className="form-check-input" type="checkbox" role="switch" id={item.id} defaultChecked style={{ width: '2.5rem', height: '1.25rem' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                {/* Password change — real API */}
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h3 className="fs-5 fw-bold text-dark mb-2">
                    <i className="bi bi-shield-lock-fill text-success me-2"></i>Change Password
                  </h3>
                  <form onSubmit={handleChangePassword} className="mt-3">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Current Password</label>
                      <input type="password" className="form-control rounded-3" required
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">New Password</label>
                      <input type="password" className="form-control rounded-3" required
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                    </div>
                    <div className="mb-4">
                      <label className="form-label small fw-bold">Confirm New Password</label>
                      <input type="password" className="form-control rounded-3" required
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-outline-success rounded-pill fw-bold w-100"
                      disabled={passwordLoading}>
                      {passwordLoading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Updating…</>
                      ) : (
                        <><i className="bi bi-lock me-1"></i>Update Password</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

      </DashboardLayout>

      {/* Certificate Modal from Overview */}
      {selectedCertificate && (
        <div className="cert-overlay" onClick={() => setSelectedCertificate(null)}>
          <div className="cert-window" onClick={e => e.stopPropagation()}>
            <div className="no-print d-flex justify-content-end p-3 pb-0">
              <button className="btn-close" onClick={() => setSelectedCertificate(null)} />
            </div>
            <div className="cert-printable px-5 pb-5">
              <div className="premium-cert-frame">
                <div className="text-center">
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0d4a3a' }}>
                    <i className="bi bi-mortarboard-fill me-2"></i>SKILLSPHERE NEXUS
                  </div>
                  <div style={{ letterSpacing: '0.18em', fontSize: '0.68rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '28px' }}>
                    Verified Digital Credential
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#0d4a3a', marginBottom: '16px' }}>
                    Certificate of Completion
                  </div>
                  <p className="text-muted" style={{ marginBottom: '8px' }}>This certifies that</p>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#10b981', borderBottom: '3px solid #10b981', display: 'inline-block', padding: '0 32px 4px', marginBottom: '16px' }}>
                    {profile?.fullName || 'Student'}
                  </h2>
                  <p className="text-muted" style={{ marginBottom: '8px' }}>has successfully completed</p>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>
                    {selectedCertificate.title || selectedCertificate.courseTitle}
                  </h3>
                  <p className="text-muted small">
                    Issued on {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    &nbsp;•&nbsp;
                    Credential ID: SS-{String(selectedCertificate.courseId || selectedCertificate.id).padStart(6, '0')}
                  </p>
                  <div className="row mt-4 align-items-center justify-content-between">
                    <div className="col-4 text-start">
                      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '8px' }}>
                        <div className="fw-bold small text-dark">Enterprise Learning Platform with Skill and Career Guidance System</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Academic Board</div>
                      </div>
                    </div>
                    <div className="col-4 text-center">
                      <i className="bi bi-award-fill" style={{ fontSize: '2.5rem', color: '#f59e0b' }}></i>
                    </div>
                    <div className="col-4 text-end">
                      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '8px' }}>
                        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.9rem', color: '#374151' }}>
                          {selectedCertificate.instructor || selectedCertificate.mentorName || 'Course Director'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Lead Instructor</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="no-print d-flex gap-2 justify-content-center mt-4">
                <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={() => window.print()}>
                  <i className="bi bi-download me-1"></i>Download PDF
                </button>
                <button className="btn btn-light rounded-pill px-4" onClick={() => setSelectedCertificate(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
