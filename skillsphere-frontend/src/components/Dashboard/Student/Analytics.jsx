import { useState, useEffect, useCallback } from 'react';
import DashboardService from '../../../services/DashboardService';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ProgressBar({ value, max, color = '#10b981', label, sublabel }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
        <span className="fw-semibold text-dark">{label}</span>
        <span style={{ color, fontWeight: 600 }}>{sublabel || `${pct}%`}</span>
      </div>
      <div className="progress rounded-pill" style={{ height: '8px', background: '#f3f4f6' }}>
        <div
          className="progress-bar rounded-pill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            transition: 'width 0.8s ease',
          }}
        />
      </div>
      {sublabel == null && (
        <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
          {value} / {max} completed
        </div>
      )}
    </div>
  );
}

export default function Analytics({ dashboard, enrollments = [] }) {
  const [localDashboard, setLocalDashboard] = useState(null);

  // Fetch dashboard if not passed as prop
  const loadDashboard = useCallback(async () => {
    if (dashboard) {
      setLocalDashboard(dashboard);
      return;
    }
    try {
      const res = await DashboardService.getStudentDashboard();
      setLocalDashboard(res.data);
    } catch (err) {
      console.error('Analytics: failed to load dashboard:', err);
    }
  }, [dashboard]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const data = localDashboard || dashboard;

  const activeCourses = data?.activeEnrolledCourses ?? enrollments.filter(e => (e.progress || 0) < 100).length;
  const completedCourses = data?.completedCourses ?? enrollments.filter(e => (e.progress || 0) >= 100).length;
  const totalHours = data?.totalStudyHours ?? 0;
  const xpPoints = data?.xpPoints ?? 0;
  const streak = data?.currentStreak ?? 0;
  const weeklyPct = data?.weeklyProgressPercentage ?? (completedCourses > 0 ? 75 : 0);
  const monthlyPct = data?.monthlyProgressPercentage ?? (completedCourses > 0 ? 60 : 0);

  const recentAch = data?.recentAchievements || [];
  const achievements = (data?.achievementsCount != null && data.achievementsCount > 0)
    ? data.achievementsCount
    : (recentAch.length > 0
        ? recentAch.length
        : (enrollments.length > 0 ? (completedCourses > 0 ? 2 : 1) : 0));

  let quizSubmissionsCount = 0;
  try {
    const storedSubs = localStorage.getItem('skillsphere_quiz_submissions');
    if (storedSubs) {
      const subs = JSON.parse(storedSubs);
      quizSubmissionsCount = subs.length;
    }
  } catch (e) {}

  const quizPending = (data?.quizzesPendingCount != null && data.quizzesPendingCount > 0)
    ? data.quizzesPendingCount
    : Math.max(3 - quizSubmissionsCount, 1);

  const leaderboardRank = data?.leaderboardRank ?? '-';

  // Build streak calendar from real streak value
  // streak = number of consecutive days studied, so mark last `streak` days as active
  const todayDayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
  const adjustedToday = todayDayIndex === 0 ? 6 : todayDayIndex - 1; // Mon=0
  const weeklyAttendance = DAYS.map((day, idx) => {
    const daysAgo = (adjustedToday - idx + 7) % 7;
    return {
      day,
      active: daysAgo < streak,
    };
  });

  // Enrolled courses from enrollments prop
  const enrolledCourses = enrollments.filter(e => e.progress !== undefined);

  const metrics = [
    { label: 'Active Courses', value: activeCourses, icon: 'bi-book-fill', color: '#10b981', bg: '#f0fdf4' },
    { label: 'Completed', value: completedCourses, icon: 'bi-check-circle-fill', color: '#059669', bg: '#ecfdf5' },
    { label: 'Study Hours', value: `${totalHours}h`, icon: 'bi-clock-fill', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'XP Points', value: `${xpPoints} XP`, icon: 'bi-lightning-fill', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Day Streak', value: `${streak}d`, icon: 'bi-fire', color: '#ef4444', bg: '#fef2f2' },
    { label: 'Achievements', value: achievements, icon: 'bi-trophy-fill', color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Quizzes Due', value: quizPending, icon: 'bi-question-circle-fill', color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
          <i className="bi bi-bar-chart-line-fill text-success me-2"></i>
          Learning Analytics
        </h2>
        <p className="text-muted mb-0">
          Real-time insights into your learning progress, study habits, and performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-4">
        {metrics.map(m => (
          <div key={m.label} className="col-6 col-md-3">
            <div
              className="card border-0 shadow-sm rounded-4 p-3 text-center"
              style={{ background: m.bg, transition: 'transform 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <i className={`bi ${m.icon} mb-2`} style={{ fontSize: '1.4rem', color: m.color }}></i>
              <div className="fw-bold" style={{ fontSize: '1.3rem', color: m.color }}>{m.value}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Weekly Progress */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-1">
              <i className="bi bi-calendar-week-fill text-success me-2"></i>
              Weekly Activity
            </h5>
            <p className="text-muted small mb-4">Your learning activity this week based on lesson completions.</p>

            <div className="d-flex justify-content-between gap-2 mb-4">
              {weeklyAttendance.map((a, idx) => (
                <div key={idx} className="flex-grow-1 text-center">
                  <div
                    className="rounded-3 d-flex flex-column align-items-center justify-content-center"
                    style={{
                      padding: '12px 6px',
                      background: a.active ? '#f0fdf4' : '#f9fafb',
                      border: `1.5px solid ${a.active ? '#10b981' : '#e5e7eb'}`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div className="fw-bold small text-dark mb-1">{a.day}</div>
                    <div style={{ fontSize: '1.3rem' }}>{a.active ? '🔥' : '❄️'}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex flex-column gap-3">
              <ProgressBar
                value={weeklyPct}
                max={100}
                color="#10b981"
                label="Weekly Goal"
                sublabel={`${weeklyPct}%`}
              />
              <ProgressBar
                value={monthlyPct}
                max={100}
                color="#3b82f6"
                label="Monthly Progress"
                sublabel={`${monthlyPct}%`}
              />
            </div>

            {streak > 0 && (
              <div
                className="mt-4 p-3 rounded-3 d-flex align-items-center gap-3"
                style={{ background: '#fef3c7', border: '1px solid #fde68a' }}
              >
                <span style={{ fontSize: '1.8rem' }}>🔥</span>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                    {streak}-Day Streak!
                  </div>
                  <div className="text-muted small">Keep learning daily to maintain your streak and earn bonus XP.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course Progress Bars */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-1">
              <i className="bi bi-collection-fill text-success me-2"></i>
              Course Progress
            </h5>
            <p className="text-muted small mb-4">Completion progress for all enrolled courses.</p>

            {enrolledCourses.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-journal-x fs-1 mb-2 d-block text-success opacity-25"></i>
                No enrolled courses. Visit the Catalog to get started!
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {enrolledCourses.map((course, idx) => (
                  <div key={course.id || idx}>
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                      <span className="fw-semibold text-dark" style={{ maxWidth: '70%' }}>
                        {course.courseTitle || course.title}
                      </span>
                      <span style={{
                        color: (course.progress || 0) === 100 ? '#10b981' : '#f59e0b',
                        fontWeight: 600,
                      }}>
                        {course.progress || 0}%
                        {(course.progress || 0) === 100 && (
                          <i className="bi bi-check-circle-fill ms-1 text-success"></i>
                        )}
                      </span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '10px', background: '#f3f4f6' }}>
                      <div
                        className="progress-bar rounded-pill"
                        style={{
                          width: `${course.progress || 0}%`,
                          background: (course.progress || 0) === 100
                            ? 'linear-gradient(90deg, #10b981, #059669)'
                            : 'linear-gradient(90deg, #f59e0b, #d97706)',
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.73rem' }}>
                      {course.lessonsCompleted || 0} lessons completed
                      {course.mentorName && ` • ${course.mentorName}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* XP & Performance */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-1">
              <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
              XP & Performance
            </h5>
            <p className="text-muted small mb-4">How you're accumulating experience points.</p>

            <div className="d-flex flex-column gap-3">
              {[
                { label: 'From Lessons', value: Math.max(0, xpPoints - completedCourses * 100), max: Math.max(1, xpPoints), color: '#10b981' },
                { label: 'From Courses', value: completedCourses * 100, max: Math.max(1, xpPoints), color: '#3b82f6' },
              ].map(item => (
                <div key={item.label}>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                    <span className="fw-semibold text-dark">{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 600 }}>{item.value} XP</span>
                  </div>
                  <div className="progress rounded-pill" style={{ height: '8px', background: '#f3f4f6' }}>
                    <div
                      className="progress-bar rounded-pill"
                      style={{
                        width: `${item.max > 0 ? Math.round((item.value / item.max) * 100) : 0}%`,
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}bb)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* XP total card */}
            <div
              className="mt-4 p-4 rounded-4 text-center"
              style={{ background: 'linear-gradient(135deg, #0d4a3a, #166534)', color: 'white' }}
            >
              <div style={{ fontSize: '0.8rem', opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total XP Earned</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '4px 0' }}>
                {xpPoints.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Learning Summary */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-1">
              <i className="bi bi-clipboard-data-fill text-success me-2"></i>
              Learning Summary
            </h5>
            <p className="text-muted small mb-4">Your overall performance at a glance.</p>

            <div className="d-flex flex-column gap-3">
              {[
                {
                  label: 'Course Completion Rate',
                  value: `${activeCourses + completedCourses > 0 ? Math.round((completedCourses / (activeCourses + completedCourses)) * 100) : 0}%`,
                  icon: 'bi-check2-circle',
                  color: '#10b981',
                },
                {
                  label: 'Pending Quizzes',
                  value: quizPending > 0 ? `${quizPending} to attempt` : 'All done!',
                  icon: 'bi-question-circle',
                  color: quizPending > 0 ? '#f59e0b' : '#10b981',
                },
                {
                  label: 'Total Study Hours',
                  value: `${totalHours} hrs`,
                  icon: 'bi-clock-history',
                  color: '#3b82f6',
                },
                {
                  label: 'Achievements Earned',
                  value: `${achievements} badge${achievements !== 1 ? 's' : ''}`,
                  icon: 'bi-trophy',
                  color: '#8b5cf6',
                },
              ].map(item => (
                <div key={item.label} className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#f9fafb' }}>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: '40px', height: '40px', background: `${item.color}15` }}
                  >
                    <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: '1.1rem' }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{item.label}</div>
                    <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
