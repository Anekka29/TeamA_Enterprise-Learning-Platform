import { useState, useEffect } from 'react';
import EnrollmentService from '../../../services/EnrollmentService';

const DEFAULT_SESSIONS = [
  {
    id: 'session_def_1',
    courseId: 'c_fullstack_dev',
    courseTitle: 'Full-Stack Web Development & Microservices',
    topic: 'Microservices Architecture & API Gateway Deep Dive',
    agenda: 'Interactive walkthrough of Spring Cloud Gateway, JWT stateless auth, Resilience4j circuit breakers, and dockerized microservice orchestration.',
    date: '2026-08-28',
    timeWindow: '02:00 PM - 03:30 PM',
    zoomLink: 'https://zoom.us/j/98765432101?pwd=skillsphere_live',
    status: 'UPCOMING',
    mentorName: 'Mentor',
    createdAt: new Date().toISOString()
  },
  {
    id: 'session_def_2',
    courseId: 'c_java_backend',
    courseTitle: 'Java Backend & Microservices Masterclass',
    topic: 'Spring Boot 3.x Performance Optimization & Heap Dump Analysis',
    agenda: 'Hands-on live session analyzing JVM memory leaks, optimizing JPA database queries, N+1 query elimination, and tuning connection pools.',
    date: '2026-08-30',
    timeWindow: '11:00 AM - 12:30 PM',
    zoomLink: 'https://zoom.us/j/98765432102?pwd=skillsphere_live',
    status: 'UPCOMING',
    mentorName: 'Mentor',
    createdAt: new Date().toISOString()
  },
  {
    id: 'session_def_3',
    courseId: 'c_react_arch',
    courseTitle: 'Advanced React 18 & Modern UI Engineering',
    topic: 'React 18 Concurrent Rendering & State Architecture',
    agenda: 'Live code review covering useTransition, useDeferredValue, Server Components, and architecting scalable React state with Zustand.',
    date: '2026-09-02',
    timeWindow: '04:00 PM - 05:30 PM',
    zoomLink: 'https://zoom.us/j/98765432103?pwd=skillsphere_live',
    status: 'UPCOMING',
    mentorName: 'Mentor',
    createdAt: new Date().toISOString()
  },
  {
    id: 'session_def_4',
    courseId: 'c_dsa_system',
    courseTitle: 'Data Structures, Algorithms & System Design',
    topic: 'High Scalability System Design: Distributed Cache & Rate Limiters',
    agenda: 'Designing a distributed cache system with Redis & LRU eviction, and implementing token bucket rate limiting for millions of requests.',
    date: '2026-09-05',
    timeWindow: '07:00 PM - 08:30 PM',
    zoomLink: 'https://zoom.us/j/98765432104?pwd=skillsphere_live',
    status: 'UPCOMING',
    mentorName: 'Mentor',
    createdAt: new Date().toISOString()
  }
];

export default function StudentSessions({ onShowToast }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

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
      let loadedSessions = [];
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedSessions = parsed;
          }
        } catch (e) {}
      }

      // Merge default sessions if not present
      const existingIds = new Set(loadedSessions.map(s => String(s.id)));
      const missingDefaults = DEFAULT_SESSIONS.filter(d => !existingIds.has(String(d.id)));
      const combined = [...loadedSessions, ...missingDefaults];

      setSessions(combined);
      localStorage.setItem('skillsphere_global_live_sessions', JSON.stringify(combined));
    } catch (e) {
      console.warn('Could not load global live sessions', e);
      setSessions(DEFAULT_SESSIONS);
    }
  }, []);

  const studentEnrolledTitles = new Set(enrolledCourses.map(c => String(c.courseTitle || c.course?.title || '').toLowerCase().trim()));
  const studentEnrolledIds = new Set(enrolledCourses.map(c => String(c.courseId || c.course?.id).trim()));

  const filteredSessions = sessions.filter(session => {
    if (activeFilter === 'enrolled') {
      const matchId = studentEnrolledIds.has(String(session.courseId).trim());
      const matchTitle = studentEnrolledTitles.has(String(session.courseTitle).toLowerCase().trim());
      return matchId || matchTitle;
    }
    return true; // 'all' shows all mentor dashboard scheduled live sessions
  });

  return (
    <div className="fade-in-quick text-start">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <span className="badge bg-success-subtle text-success fw-bold rounded-pill mb-2 px-3 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
            ACADEMIC LIVE BROADCAST HUB
          </span>
          <h2 className="fw-bold text-dark mb-1">Live Interactive Sessions</h2>
          <p className="text-muted mb-0 small">Join upcoming live Zoom sessions hosted by course mentors for live lectures, Q&A, and code reviews.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group bg-light rounded-pill p-1 border">
            <button
              className={`btn btn-sm rounded-pill fw-bold px-3 ${activeFilter === 'all' ? 'btn-success text-white' : 'btn-light text-muted'}`}
              onClick={() => setActiveFilter('all')}
            >
              All Live Sessions ({sessions.length})
            </button>
            <button
              className={`btn btn-sm rounded-pill fw-bold px-3 ${activeFilter === 'enrolled' ? 'btn-success text-white' : 'btn-light text-muted'}`}
              onClick={() => setActiveFilter('enrolled')}
            >
              Enrolled Courses
            </button>
          </div>
        </div>
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
            <h6 className="fw-bold">No Live Sessions Found</h6>
            <p className="small mb-0">Switch to "All Live Sessions" to view platform-wide scheduled mentor classes.</p>
          </div>
        )}
      </div>
    </div>
  );
}

