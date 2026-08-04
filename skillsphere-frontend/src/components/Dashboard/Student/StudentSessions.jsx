import { useState, useEffect } from 'react';
import EnrollmentService from '../../../services/EnrollmentService';

export default function StudentSessions({ onShowToast }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // 1. Fetch Enrolled Courses
    EnrollmentService.getMyEnrollments()
      .then(res => {
        const list = res?.data || res || [];
        setEnrolledCourses(list);
      })
      .catch(() => {
        setEnrolledCourses([]);
      });

    // 2. Load Global Live Sessions
    try {
      const stored = localStorage.getItem('skillsphere_global_live_sessions');
      if (stored) {
        setSessions(JSON.parse(stored));
      } else {
        setSessions([]);
      }
    } catch (e) {
      console.warn('Could not load global live sessions', e);
    }
  }, []);

  // Filter live sessions strictly to student's enrolled courses
  const studentEnrolledTitles = new Set(enrolledCourses.map(c => String(c.courseTitle || c.course?.title || '').toLowerCase().trim()));
  const studentEnrolledIds = new Set(enrolledCourses.map(c => String(c.courseId || c.course?.id).trim()));

  const filteredSessions = sessions.filter(session => {
    const matchId = studentEnrolledIds.has(String(session.courseId).trim());
    const matchTitle = studentEnrolledTitles.has(String(session.courseTitle).toLowerCase().trim());
    // If student has 0 enrolled courses listed, show created sessions so student can test
    return matchId || matchTitle || enrolledCourses.length === 0;
  });

  return (
    <div className="fade-in-quick text-start">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <span className="badge bg-success-subtle text-success fw-bold rounded-pill mb-2 px-3 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
            ENROLLED COURSE LIVE CLASSES
          </span>
          <h2 className="fw-bold text-dark mb-1">Live Interactive Sessions</h2>
          <p className="text-muted mb-0 small">Join upcoming live Zoom sessions hosted by your course mentors for live lectures, Q&A, and code reviews.</p>
        </div>

        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold">
          <i className="bi bi-broadcast me-1 text-danger"></i> {filteredSessions.length} Active Sessions
        </span>
      </div>

      {/* Live Sessions List */}
      <div className="d-flex flex-column gap-3 mb-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div key={session.id} className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-start">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-2">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-success-subtle text-success rounded-pill fw-bold" style={{ fontSize: '0.65rem' }}>
                      {session.courseTitle}
                    </span>
                    <span className="badge bg-danger text-white rounded-pill animate-pulse" style={{ fontSize: '0.65rem' }}>
                      LIVE SESSION 🔴
                    </span>
                  </div>
                  <h4 className="fw-bold text-dark mb-1">{session.topic}</h4>
                  <p className="text-muted small mb-0 lh-base" style={{ fontSize: '0.88rem' }}>
                    {session.agenda}
                  </p>
                </div>

                <div className="text-end">
                  <div className="badge bg-dark text-white rounded-pill px-3 py-2 fw-bold mb-1" style={{ fontSize: '0.75rem' }}>
                    <i className="bi bi-calendar3 me-1"></i>{session.date}
                  </div>
                  <div className="text-muted text-xs font-semibold">{session.timeWindow}</div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <i className="bi bi-camera-video-fill text-primary"></i>
                  <span>Host Platform: <strong>Zoom Video Communications</strong></span>
                </div>

                <a
                  href={session.zoomLink || 'https://zoom.us'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                  onClick={() => {
                    if (onShowToast) onShowToast('info', 'Opening Zoom Meeting Room...');
                  }}
                >
                  <i className="bi bi-camera-video-fill fs-6"></i>
                  Join Live Zoom Session 📹
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="card border-0 shadow-sm rounded-4 p-5 bg-white border text-center text-muted">
            <i className="bi bi-camera-video-off fs-1 mb-2 text-secondary d-block"></i>
            <h6 className="fw-bold">No Live Sessions Scheduled</h6>
            <p className="small mb-0">Live Zoom classes scheduled by your mentor for your enrolled courses will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
