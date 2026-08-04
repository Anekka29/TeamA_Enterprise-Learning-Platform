import { useState, useEffect } from 'react';
import CourseService from '../../../services/CourseService';

export default function SessionScheduler({ mentorEmail, onShowToast }) {
  const [mentorCourses, setMentorCourses] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [newSession, setNewSession] = useState({
    courseId: '',
    topic: '',
    agenda: '',
    date: '',
    timeWindow: '14:00 - 15:30',
    zoomLink: 'https://zoom.us/j/98765432101?pwd=skillsphere_live'
  });

  useEffect(() => {
    // 1. Fetch Mentor's Courses
    CourseService.getMentorCourses()
      .then(res => {
        const list = res?.data || res || [];
        if (list.length > 0) {
          const formatted = list.map(c => ({
            id: c.id || `c_${c.title}`,
            title: c.title || 'Untitled Course'
          }));
          setMentorCourses(formatted);
          setNewSession(prev => ({ ...prev, courseId: formatted[0].id }));
        } else {
          // Fallback to published courses
          CourseService.getPublishedCourses()
            .then(pubRes => {
              const pubList = pubRes?.data || pubRes || [];
              const formattedPub = pubList.map(c => ({
                id: c.id || `c_${c.title}`,
                title: c.title || 'Published Course'
              }));
              setMentorCourses(formattedPub);
              if (formattedPub.length > 0) {
                setNewSession(prev => ({ ...prev, courseId: formattedPub[0].id }));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    // 2. Load Global Live Sessions
    try {
      const stored = localStorage.getItem('skillsphere_global_live_sessions');
      if (stored) {
        setSessions(JSON.parse(stored));
      } else {
        setSessions([]);
      }
    } catch (e) {
      console.warn('Could not load live sessions', e);
    }
  }, [mentorEmail]);

  const saveSessions = (updated) => {
    setSessions(updated);
    try {
      localStorage.setItem('skillsphere_global_live_sessions', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save live sessions', e);
    }
  };

  const handlePublishSession = (e) => {
    e.preventDefault();
    if (!newSession.date || !newSession.topic.trim() || !newSession.courseId) {
      if (onShowToast) onShowToast('warning', 'Please select a course, date, and enter a session topic.');
      return;
    }

    const selectedCourseObj = mentorCourses.find(c => String(c.id) === String(newSession.courseId)) || {
      id: newSession.courseId,
      title: 'General Course'
    };

    const createdSession = {
      id: `session_${Date.now()}`,
      courseId: selectedCourseObj.id,
      courseTitle: selectedCourseObj.title,
      topic: newSession.topic.trim(),
      agenda: newSession.agenda.trim() || 'Interactive Q&A, live code walkthrough, and concepts review.',
      date: newSession.date,
      timeWindow: newSession.timeWindow,
      zoomLink: newSession.zoomLink.trim() || 'https://zoom.us/j/98765432101?pwd=skillsphere_live',
      status: 'UPCOMING',
      mentorName: 'Mentor',
      createdAt: new Date().toISOString()
    };

    const updated = [createdSession, ...sessions];
    saveSessions(updated);

    setNewSession(prev => ({
      ...prev,
      topic: '',
      agenda: '',
      date: '',
      zoomLink: 'https://zoom.us/j/98765432101?pwd=skillsphere_live'
    }));

    if (onShowToast) onShowToast('success', `Live Zoom session published for "${selectedCourseObj.title}"!`);
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <span className="badge bg-success-subtle text-success fw-bold rounded-pill mb-2 px-3 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
          LIVE ACADEMIC BROADCAST HUB
        </span>
        <h2 className="fw-bold text-dark mb-1">Live Session Scheduler</h2>
        <p className="text-muted mb-0 small">Schedule course-linked live Zoom sessions, broadcast meeting links, and manage upcoming interactive classes.</p>
      </div>

      <div className="row g-4">
        {/* Session Creator Column */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-camera-video-fill text-success me-2"></i>Schedule Live Zoom Session
            </h5>

            <form onSubmit={handlePublishSession}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Select Target Course:</label>
                {mentorCourses.length > 0 ? (
                  <select
                    className="form-select rounded-3"
                    value={newSession.courseId}
                    onChange={(e) => setNewSession({ ...newSession, courseId: e.target.value })}
                    required
                  >
                    {mentorCourses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Enter Course Title..."
                    value={newSession.courseId}
                    onChange={(e) => setNewSession({ ...newSession, courseId: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Session Topic / Title:</label>
                <input
                  type="text"
                  required
                  className="form-control rounded-3"
                  placeholder="e.g. Deep Dive into React Hooks & Redux"
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Topic Agenda & Description:</label>
                <textarea
                  className="form-control rounded-3"
                  rows="2"
                  placeholder="What topics will be covered during this live class?"
                  value={newSession.agenda}
                  onChange={(e) => setNewSession({ ...newSession, agenda: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Session Date:</label>
                  <input
                    type="date"
                    required
                    className="form-control rounded-3"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Time Window:</label>
                  <select
                    className="form-select rounded-3"
                    value={newSession.timeWindow}
                    onChange={(e) => setNewSession({ ...newSession, timeWindow: e.target.value })}
                  >
                    <option value="09:00 - 10:30 AM">09:00 AM - 10:30 AM</option>
                    <option value="11:00 - 12:30 PM">11:00 AM - 12:30 PM</option>
                    <option value="02:00 - 03:30 PM">02:00 PM - 03:30 PM</option>
                    <option value="04:00 - 05:30 PM">04:00 PM - 05:30 PM</option>
                    <option value="07:00 - 08:30 PM">07:00 PM - 08:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Zoom Meeting Link (URL):</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-primary"><i className="bi bi-camera-video"></i></span>
                  <input
                    type="url"
                    required
                    className="form-control rounded-end-3"
                    placeholder="https://zoom.us/j/123456789..."
                    value={newSession.zoomLink}
                    onChange={(e) => setNewSession({ ...newSession, zoomLink: e.target.value })}
                  />
                </div>
                <span className="text-muted text-xs d-block mt-1">Students enrolled in this course will click this link to join the session.</span>
              </div>

              <button type="submit" className="btn btn-success rounded-pill fw-bold w-100 shadow-sm py-2">
                <i className="bi bi-broadcast me-2"></i>Publish Live Session
              </button>
            </form>
          </div>
        </div>

        {/* Scheduled Sessions Calendar Column */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-calendar-event text-success me-2"></i>Scheduled Live Sessions ({sessions.length})
            </h5>

            {sessions.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {sessions.map(session => (
                  <div key={session.id} className="p-3 border rounded-4 bg-light text-start">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-success-subtle text-success rounded-pill fw-bold" style={{ fontSize: '0.65rem' }}>
                        {session.courseTitle}
                      </span>
                      <span className="badge bg-primary text-white rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '0.68rem' }}>
                        {session.date} • {session.timeWindow}
                      </span>
                    </div>

                    <h6 className="fw-bold text-dark mb-1">{session.topic}</h6>
                    <p className="text-muted small mb-3">{session.agenda}</p>

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top">
                      <span className="text-muted text-xs">
                        <i className="bi bi-link-45deg me-1"></i>Zoom Meeting URL Attached
                      </span>
                      <a
                        href={session.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success btn-sm rounded-pill fw-bold px-4"
                      >
                        <i className="bi bi-camera-video-fill me-1"></i>Launch Zoom Room
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-calendar-x fs-1 mb-2 text-secondary d-block"></i>
                <h6 className="fw-bold">No Live Sessions Scheduled</h6>
                <p className="small mb-0">Use the form on the left to schedule course-linked Zoom live classes for your students.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
