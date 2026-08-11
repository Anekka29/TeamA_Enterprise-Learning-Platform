import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../api/apiClient';

export default function AttendanceTracker() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [coursesList, setCoursesList] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState({});

  const todayKey = new Date().toISOString().split('T')[0];

  const loadMentorRoster = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/mentor/enrollments');
      const data = res?.data || [];
      setStudents(data);

      // Extract unique courses for filter
      const uniqueCourses = Array.from(new Set(data.map(item => item.courseTitle).filter(Boolean)));
      setCoursesList(uniqueCourses);

      // Load saved attendance for today
      const savedKey = `skillsphere_attendance_${todayKey}`;
      const savedState = JSON.parse(localStorage.getItem(savedKey) || '{}');
      setTodayAttendance(savedState);
    } catch (err) {
      console.error('Failed to load mentor roster:', err);
    } finally {
      setLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    loadMentorRoster();
  }, [loadMentorRoster]);

  const toggleAttended = (enrollmentId) => {
    setTodayAttendance(prev => {
      const updated = { ...prev, [enrollmentId]: !prev[enrollmentId] };
      const savedKey = `skillsphere_attendance_${todayKey}`;
      localStorage.setItem(savedKey, JSON.stringify(updated));
      return updated;
    });
  };

  const filteredStudents = students.filter(student => {
    if (selectedCourse === 'ALL') return true;
    return student.courseTitle === selectedCourse;
  });

  return (
    <div className="fade-in-quick text-start">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Attendance Ledger & Student Analytics</h2>
          <p className="text-muted mb-0">Monitor real student progress benchmarks, log classroom attendance, and trace course completion rates.</p>
        </div>

        {/* Course Filter Dropdown */}
        {coursesList.length > 0 && (
          <div style={{ minWidth: '220px' }}>
            <label className="form-label extra-small fw-bold text-muted mb-1">FILTER BY COURSE</label>
            <select
              className="form-select rounded-3 shadow-xs"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="ALL">All Enrolled Courses ({students.length})</option>
              {coursesList.map(cTitle => (
                <option key={cTitle} value={cTitle}>{cTitle}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold text-dark mb-0">
                Classroom Roster ({new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })})
              </h5>
              <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '0.78rem' }}>
                {filteredStudents.length} Active Enrolled Student{filteredStudents.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-success mb-3" role="status"></div>
                <div>Loading student roster details...</div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-people fs-1 d-block mb-2 text-secondary"></i>
                <div className="fw-bold text-dark mb-1">No enrolled students found</div>
                <div className="small">When students enroll in your published courses, their real-time progress and attendance will appear here.</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      <th>Student Details</th>
                      <th>Enrolled Course</th>
                      <th>Course Completion</th>
                      <th>Lessons Progress</th>
                      <th className="text-center">Attended Today</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => {
                      const isAttended = Boolean(todayAttendance[student.id]);
                      const progressPct = student.progress ?? 0;
                      const lessonsCompleted = student.lessonsCompleted ?? 0;

                      return (
                        <tr key={student.id}>
                          <td>
                            <span className="fw-bold text-dark small">{student.studentName || 'Enrolled Student'}</span>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{student.studentEmail || 'student@skillsphere.com'}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border fw-semibold" style={{ fontSize: '0.78rem' }}>
                              {student.courseTitle || 'Interactive Course'}
                            </span>
                          </td>
                          <td style={{ width: '220px' }}>
                            <div className="d-flex align-items-center gap-3">
                              <div className="progress rounded-pill flex-grow-1" style={{ height: '6px', backgroundColor: '#e2e8f0' }}>
                                <div className="progress-bar bg-success" style={{ width: `${progressPct}%` }}></div>
                              </div>
                              <span className="fw-bold text-dark small" style={{ fontSize: '0.75rem' }}>{progressPct}%</span>
                            </div>
                          </td>
                          <td>
                            <span className="fw-bold text-dark small">{lessonsCompleted} lessons completed</span>
                            <div className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>
                              Enrolled {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : 'Recently'}
                            </div>
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input text-success cursor-pointer"
                              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                              checked={isAttended}
                              onChange={() => toggleAttended(student.id)}
                            />
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
      </div>
    </div>
  );
}
