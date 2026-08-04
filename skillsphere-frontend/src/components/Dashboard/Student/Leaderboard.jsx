import { useState, useEffect, useCallback } from 'react';
import DashboardService from '../../../services/DashboardService';
import courseBadgeImg from '../../../assets/images/course-completed-badge.jpg';

const LEVEL_THRESHOLDS = [
  { min: 1000, label: 'Grand Master', color: '#ef4444', emoji: '👑' },
  { min: 500, label: 'Expert Lead', color: '#f59e0b', emoji: '🏆' },
  { min: 250, label: 'Elite Scholar', color: '#8b5cf6', emoji: '💜' },
  { min: 100, label: 'Rising Star', color: '#3b82f6', emoji: '⭐' },
  { min: 0, label: 'Rising Learner', color: '#10b981', emoji: '🌱' },
];

function getLevel(xp) {
  return LEVEL_THRESHOLDS.find(l => xp >= l.min) || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

function getRankMedal(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

const STATIC_BADGES = [
  { id: 'b1', name: 'First Enrollment', desc: 'Enrolled in your first SkillSphere course.', icon: '🚀', condition: (data) => (data?.activeEnrolledCourses ?? 0) + (data?.completedCourses ?? 0) > 0 },
  { id: 'b2', name: 'Course Finisher', desc: 'Completed at least one full course.', isCustomBadgeImage: true, condition: (data) => (data?.completedCourses ?? 0) > 0 },
  { id: 'b3', name: '7-Day Streak', desc: 'Studied for 7 consecutive days.', icon: '🔥', condition: (data) => (data?.currentStreak ?? 0) >= 7 },
  { id: 'b4', name: 'Century XP', desc: 'Earned 100 or more XP points.', icon: '⚡', condition: (data) => (data?.xpPoints ?? 0) >= 100 },
  { id: 'b5', name: 'Quiz Champion', desc: 'Attempted all quizzes in an enrolled course.', icon: '🎯', condition: (data) => (data?.quizzesPendingCount ?? 1) === 0 },
  { id: 'b6', name: 'Certified', desc: 'Earned your first certificate.', isCustomBadgeImage: true, condition: (data) => (data?.certificatesCount ?? 0) > 0 },
];

export default function Leaderboard({ dashboard, xpPoints: xpProp = 0 }) {
  const [localDashboard, setLocalDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (dashboard) {
      setLocalDashboard(dashboard);
      setLoading(false);
      return;
    }
    try {
      const res = await DashboardService.getStudentDashboard();
      setLocalDashboard(res.data);
    } catch (err) {
      console.error('Leaderboard: failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [dashboard]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const data = localDashboard || dashboard;
  const standings = data?.leaderboardStandings || [];
  const xp = data?.xpPoints ?? xpProp;
  const rank = data?.leaderboardRank ?? '—';
  const currentLevel = getLevel(xp);
  const nextThreshold = LEVEL_THRESHOLDS.find(l => l.min > xp) || null;
  const xpToNext = nextThreshold ? nextThreshold.min - xp : 0;

  const unlockedBadges = STATIC_BADGES.filter(b => b.condition(data));
  const lockedBadges = STATIC_BADGES.filter(b => !b.condition(data));

  return (
    <div className="fade-in-quick text-start">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
          <i className="bi bi-trophy-fill text-warning me-2"></i>
          Leaderboard & Achievements
        </h2>
        <p className="text-muted mb-0">
          Study courses, complete quizzes, and maintain streaks to climb the leaderboard and earn badges.
        </p>
      </div>

      {/* Personal XP card */}
      <div
        className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-white"
        style={{ background: 'linear-gradient(135deg, #0d4a3a, #166534)' }}
      >
        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <div style={{ fontSize: '0.8rem', opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
              {currentLevel.emoji} Your Level
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
              {currentLevel.label}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>
              {xp.toLocaleString()} XP
            </div>
            {nextThreshold && (
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '8px' }}>
                {xpToNext} XP to reach next level
              </div>
            )}
          </div>
          <div className="col-md-6 text-md-end">
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>Leaderboard Rank</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fcd34d' }}>
              {rank !== '—' ? `#${rank}` : '—'}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Among {standings.length} students
            </div>
          </div>
        </div>
        {nextThreshold && (
          <div className="mt-3">
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              <span>{currentLevel.label}</span>
              <span>{nextThreshold.label} ({nextThreshold.min} XP)</span>
            </div>
            <div className="progress rounded-pill" style={{ height: '6px', background: 'rgba(255,255,255,0.2)' }}>
              <div
                className="progress-bar rounded-pill"
                style={{
                  width: `${Math.min(100, Math.round((xp / nextThreshold.min) * 100))}%`,
                  background: 'linear-gradient(90deg, #4ade80, #86efac)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Leaderboard Table */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-4">
              <i className="bi bi-bar-chart-steps me-2 text-success"></i>
              Platform Leaderboard
            </h5>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-success mb-2" role="status"></div>
                <div className="text-muted small">Loading rankings…</div>
              </div>
            ) : standings.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-people fs-1 mb-2 d-block text-success opacity-25"></i>
                No leaderboard data yet. Complete lessons to appear here!
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle" style={{ fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ width: '50px', paddingLeft: '8px' }}>Rank</th>
                      <th>Student</th>
                      <th>Level</th>
                      <th className="text-end" style={{ paddingRight: '8px' }}>XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.slice(0, 10).map(student => {
                      const level = getLevel(student.xp);
                      return (
                        <tr
                          key={student.studentId || student.rank}
                          style={{
                            background: student.active ? 'rgba(16,185,129,0.06)' : 'transparent',
                            borderLeft: student.active ? '4px solid #10b981' : '4px solid transparent',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <td className="fw-bold" style={{ paddingLeft: '12px', fontSize: '1rem' }}>
                            {getRankMedal(student.rank)}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  fontSize: '0.75rem',
                                  background: student.rank <= 3
                                    ? ['#eab308', '#94a3b8', '#b45309'][student.rank - 1]
                                    : student.active ? '#10b981' : '#6b7280',
                                }}
                              >
                                {student.initial}
                              </div>
                              <div>
                                <div className={`fw-${student.active ? 'bold' : 'semibold'} ${student.active ? 'text-success' : 'text-dark'}`}>
                                  {student.name}
                                </div>
                                {student.active && (
                                  <div style={{ fontSize: '0.7rem', color: '#10b981' }}>← You</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.72rem', color: level.color, fontWeight: 600 }}>
                              {level.emoji} {level.label}
                            </span>
                          </td>
                          <td className="text-end fw-bold" style={{ color: student.active ? '#10b981' : '#374151', paddingRight: '12px' }}>
                            {student.xp.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-2">
              <i className="bi bi-patch-check-fill me-2 text-success"></i>
              Badges & Achievements
            </h5>
            <p className="text-muted small mb-4">{unlockedBadges.length} of {STATIC_BADGES.length} badges unlocked</p>

            {/* Progress bar */}
            <div className="progress rounded-pill mb-4" style={{ height: '6px', background: '#f3f4f6' }}>
              <div
                className="progress-bar rounded-pill"
                style={{
                  width: `${Math.round((unlockedBadges.length / STATIC_BADGES.length) * 100)}%`,
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                }}
              />
            </div>

            <div className="d-flex flex-column gap-2">
              {STATIC_BADGES.map(badge => {
                const unlocked = unlockedBadges.some(b => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className="d-flex align-items-center gap-3 p-3 rounded-3"
                    style={{
                      background: unlocked ? '#f0fdf4' : '#f9fafb',
                      border: `1.5px solid ${unlocked ? '#bbf7d0' : '#e5e7eb'}`,
                      opacity: unlocked ? 1 : 0.55,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unlocked ? (
                        badge.isCustomBadgeImage ? (
                          <img
                            src={courseBadgeImg}
                            alt={badge.name}
                            style={{
                              width: '38px',
                              height: '38px',
                              objectFit: 'contain',
                              borderRadius: '50%',
                            }}
                          />
                        ) : (
                          badge.icon
                        )
                      ) : (
                        '🔒'
                      )}
                    </div>
                    <div>
                      <div className={`fw-bold ${unlocked ? 'text-dark' : 'text-muted'}`} style={{ fontSize: '0.88rem' }}>
                        {badge.name}
                        {unlocked && (
                          <i className="bi bi-check-circle-fill text-success ms-1" style={{ fontSize: '0.78rem' }}></i>
                        )}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{badge.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
