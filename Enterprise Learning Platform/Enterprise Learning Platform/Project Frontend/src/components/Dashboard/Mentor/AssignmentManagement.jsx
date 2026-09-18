import { useState, useEffect } from 'react';
import CourseService from '../../../services/CourseService';

export default function AssignmentManagement({ mentorEmail, onShowToast }) {
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'created'
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [mentorCourses, setMentorCourses] = useState([]);

  // Create Assignment Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAsg, setNewAsg] = useState({
    courseId: '',
    title: '',
    desc: '',
    dueDate: '',
    totalMarks: 100
  });

  // Grade Modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', grade: 'A', feedback: '' });

  // Load persistent data & mentor's real courses
  useEffect(() => {
    // 1. Fetch Mentor's Created Courses
    CourseService.getMentorCourses()
      .then(res => {
        const list = res?.data || res || [];
        if (list.length > 0) {
          const formatted = list.map(c => ({
            id: c.id || `c_${c.title}`,
            title: c.title || 'Untitled Course'
          }));
          setMentorCourses(formatted);
          if (formatted.length > 0) {
            setNewAsg(prev => ({ ...prev, courseId: formatted[0].id }));
          }
        } else {
          // Fallback to published courses if mentor hasn't created custom courses
          CourseService.getPublishedCourses()
            .then(pubRes => {
              const pubList = pubRes?.data || pubRes || [];
              const formattedPub = pubList.map(c => ({
                id: c.id || `c_${c.title}`,
                title: c.title || 'Published Course'
              }));
              setMentorCourses(formattedPub);
              if (formattedPub.length > 0) {
                setNewAsg(prev => ({ ...prev, courseId: formattedPub[0].id }));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    // 2. Load Assignments
    const DEFAULT_INITIAL_ASSIGNMENTS = [
      {
        id: 'asg_101',
        courseId: '1',
        courseTitle: 'Python Programming',
        title: 'Python Assignment 1: Data Structures & OOP',
        desc: 'Implement a banking system class hierarchy with encapsulation, inheritance, and custom exception handling in Python.',
        dueDate: '2026-08-25',
        totalMarks: 100,
        createdAt: '2026-08-01'
      },
      {
        id: 'asg_102',
        courseId: '2',
        courseTitle: 'Content Marketing',
        title: 'Content Strategy Brief & SEO Copywriting',
        desc: 'Develop a 3-month multi-channel content strategy brief and draft a 1,200-word SEO-optimized blog article.',
        dueDate: '2026-08-28',
        totalMarks: 100,
        createdAt: '2026-08-05'
      }
    ];

    const DEFAULT_INITIAL_SUBMISSIONS = [
      {
        id: 'sub_101',
        assignmentId: 'asg_101',
        courseTitle: 'Python Programming',
        assignmentTitle: 'Python Assignment 1: Data Structures & OOP',
        studentName: 'Srimathi',
        studentEmail: 'srimathi@skillsphere.com',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        pdfFileName: 'Srimathi_Python_Assignment_1.pdf',
        fileName: 'Srimathi_Python_Assignment_1.pdf',
        pdfFileUrl: '#',
        status: 'SUBMITTED',
        score: '',
        grade: '',
        feedback: ''
      }
    ];

    try {
      const storedAsgs = localStorage.getItem('skillsphere_global_assignments');
      if (storedAsgs) {
        setAssignments(JSON.parse(storedAsgs));
      } else {
        setAssignments(DEFAULT_INITIAL_ASSIGNMENTS);
        localStorage.setItem('skillsphere_global_assignments', JSON.stringify(DEFAULT_INITIAL_ASSIGNMENTS));
      }

      // 3. Load Submissions
      const storedSubs = localStorage.getItem('skillsphere_assignment_submissions');
      if (storedSubs) {
        setSubmissions(JSON.parse(storedSubs));
      } else {
        setSubmissions(DEFAULT_INITIAL_SUBMISSIONS);
        localStorage.setItem('skillsphere_assignment_submissions', JSON.stringify(DEFAULT_INITIAL_SUBMISSIONS));
      }
    } catch (e) {
      console.warn('Error loading assignment data:', e);
    }
  }, []);

  // Save assignments to storage
  const saveAssignments = (updated) => {
    setAssignments(updated);
    try {
      localStorage.setItem('skillsphere_global_assignments', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save assignments', e);
    }
  };

  // Save submissions to storage
  const saveSubmissions = (updated) => {
    setSubmissions(updated);
    try {
      localStorage.setItem('skillsphere_assignment_submissions', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save submissions', e);
    }
  };

  // Create Assignment Handler
  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!newAsg.title.trim() || !newAsg.desc.trim() || !newAsg.dueDate || !newAsg.courseId) {
      if (onShowToast) onShowToast('warning', 'Please select a course and fill in all assignment fields.');
      return;
    }

    const selectedCourseObj = mentorCourses.find(c => String(c.id) === String(newAsg.courseId)) || {
      id: newAsg.courseId,
      title: 'General Course'
    };

    const created = {
      id: `asg_${Date.now()}`,
      courseId: selectedCourseObj.id,
      courseTitle: selectedCourseObj.title,
      title: newAsg.title.trim(),
      desc: newAsg.desc.trim(),
      dueDate: newAsg.dueDate,
      totalMarks: Number(newAsg.totalMarks) || 100,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [created, ...assignments];
    saveAssignments(updated);

    setShowCreateModal(false);
    setNewAsg(prev => ({ ...prev, title: '', desc: '', dueDate: '', totalMarks: 100 }));
    if (onShowToast) onShowToast('success', `Assignment created for "${selectedCourseObj.title}"!`);
  };

  // Grade Submission Handler
  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (!gradeForm.score || !gradeForm.feedback.trim()) {
      if (onShowToast) onShowToast('warning', 'Please provide a score and feedback.');
      return;
    }

    const updated = submissions.map(sub => {
      if (sub.id === selectedSub.id) {
        // Dispatch notification to student
        const notiKey = `notifications_${sub.studentEmail}`;
        const existingNotis = JSON.parse(localStorage.getItem(notiKey) || '[]');
        const newNoti = {
          id: `grade_${Date.now()}`,
          title: 'Assignment Graded! 🎉',
          text: `Your submission for "${sub.assignmentTitle}" in ${sub.courseTitle} was reviewed: Score ${gradeForm.score}/100 (Grade ${gradeForm.grade}).`,
          type: 'success',
          read: false,
          time: 'Just now'
        };
        localStorage.setItem(notiKey, JSON.stringify([newNoti, ...existingNotis]));

        return {
          ...sub,
          status: 'REVIEWED',
          grade: gradeForm.grade,
          score: gradeForm.score,
          feedback: gradeForm.feedback
        };
      }
      return sub;
    });

    saveSubmissions(updated);
    setSelectedSub(null);
    setGradeForm({ score: '', grade: 'A', feedback: '' });
    if (onShowToast) onShowToast('success', 'Student assignment reviewed and graded successfully!');
  };

  const pendingCount = submissions.filter(s => s.status === 'SUBMITTED').length;
  const reviewedCount = submissions.filter(s => s.status === 'REVIEWED').length;

  // Helper to determine file icon and badge styling
  const getFileStyle = (fileName = '') => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return {
        icon: 'bi-file-earmark-word-fill',
        textColor: 'text-primary',
        badgeClass: 'bg-primary-subtle text-primary',
        label: 'Word Submission'
      };
    }
    return {
      icon: 'bi-file-earmark-pdf-fill',
      textColor: 'text-danger',
      badgeClass: 'bg-danger-subtle text-danger',
      label: 'PDF Submission'
    };
  };

  return (
    <div className="fade-in-quick text-start">
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <span className="badge bg-success-subtle text-success fw-bold rounded-pill mb-2 px-3 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
            MENTOR ACADEMIC HUB
          </span>
          <h2 className="fw-bold text-dark mb-1">Course Assignment Management</h2>
          <p className="text-muted mb-0 small">Create assignments per course, review PDF/Word submissions, and assign scores with feedback.</p>
        </div>

        <button
          className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-circle-fill me-2"></i>Create New Assignment
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-primary-subtle text-primary rounded-circle">
                <i className="bi bi-journal-text fs-4"></i>
              </div>
              <div>
                <span className="text-muted text-xs font-bold text-uppercase d-block">Created Assignments</span>
                <strong className="text-dark fs-4">{assignments.length}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-warning-subtle text-warning rounded-circle">
                <i className="bi bi-clock-history fs-4"></i>
              </div>
              <div>
                <span className="text-muted text-xs font-bold text-uppercase d-block">Pending Review</span>
                <strong className="text-dark fs-4">{pendingCount}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-success-subtle text-success rounded-circle">
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
              <div>
                <span className="text-muted text-xs font-bold text-uppercase d-block">Reviewed & Graded</span>
                <strong className="text-dark fs-4">{reviewedCount}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <ul className="nav nav-pills gap-2" style={{ fontSize: '0.85rem' }}>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-4 fw-bold ${activeTab === 'submissions' ? 'active bg-success text-white' : 'text-muted'}`}
              onClick={() => setActiveTab('submissions')}
            >
              <i className="bi bi-file-earmark-arrow-up me-2"></i>Student Submissions ({submissions.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-4 fw-bold ${activeTab === 'created' ? 'active bg-success text-white' : 'text-muted'}`}
              onClick={() => setActiveTab('created')}
            >
              <i className="bi bi-folder-check me-2"></i>Course Assignments ({assignments.length})
            </button>
          </li>
        </ul>
      </div>

      {/* TAB 1: Student Submissions Table */}
      {activeTab === 'submissions' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <h5 className="fw-bold text-dark mb-3">
            <i className="bi bi-table text-success me-2"></i>Submitted Student Assignments
          </h5>

          {submissions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small" style={{ fontSize: '0.75rem' }}>
                  <tr>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Assignment Title</th>
                    <th>Submission Date</th>
                    <th>Solution File</th>
                    <th>Status</th>
                    <th>Grade / Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.84rem' }}>
                  {submissions.map((sub) => {
                    const fName = sub.pdfFileName || sub.fileName || 'Submission.pdf';
                    const fStyle = getFileStyle(fName);
                    return (
                      <tr key={sub.id}>
                        <td>
                          <strong className="text-dark d-block">{sub.studentName}</strong>
                          <span className="text-muted small">{sub.studentEmail}</span>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary rounded-pill text-truncate" style={{ maxWidth: '160px' }}>
                            {sub.courseTitle}
                          </span>
                        </td>
                        <td className="fw-bold text-dark">{sub.assignmentTitle}</td>
                        <td className="text-muted small">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td>
                          <span className={`badge rounded-pill fw-semibold ${fStyle.badgeClass}`}>
                            <i className={`bi ${fStyle.icon} me-1`}></i>{fName}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill fw-bold text-uppercase ${
                            sub.status === 'REVIEWED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
                          }`} style={{ fontSize: '0.68rem' }}>
                            {sub.status === 'REVIEWED' ? 'REVIEWED ✔' : 'PENDING REVIEW'}
                          </span>
                        </td>
                        <td>
                          {sub.status === 'REVIEWED' ? (
                            <span className="fw-bold text-success">
                              {sub.grade} ({sub.score}/100)
                            </span>
                          ) : (
                            <span className="text-muted">--</span>
                          )}
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm rounded-pill fw-bold px-3 ${
                              sub.status === 'REVIEWED' ? 'btn-outline-secondary' : 'btn-success'
                            }`}
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedSub(sub);
                              setGradeForm({
                                score: sub.score || '90',
                                grade: sub.grade || 'A',
                                feedback: sub.feedback || ''
                              });
                            }}
                          >
                            {sub.status === 'REVIEWED' ? 'Edit Grade' : 'Grade & Review'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 mb-2 text-secondary d-block"></i>
              <h6 className="fw-bold">No Submissions Found</h6>
              <p className="small mb-0">Student PDF and Word submissions will appear here once submitted.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Created Assignments List */}
      {activeTab === 'created' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <h5 className="fw-bold text-dark mb-3">
            <i className="bi bi-journal-check text-success me-2"></i>Active Course Assignments
          </h5>

          {assignments.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {assignments.map((asg) => (
                <div key={asg.id} className="p-3 rounded-4 border bg-light d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-success-subtle text-success rounded-pill fw-bold" style={{ fontSize: '0.65rem' }}>
                        {asg.courseTitle}
                      </span>
                      <span className="text-muted small">• Due: {asg.dueDate}</span>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">{asg.title}</h6>
                    <p className="text-muted small mb-0 lh-base">{asg.desc}</p>
                  </div>

                  <div className="text-end">
                    <span className="badge bg-dark text-white rounded-pill px-3 py-1 mb-2 d-block">
                      Total Marks: {asg.totalMarks}
                    </span>
                    <span className="text-muted text-xs">Created: {asg.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-journal-plus fs-1 mb-2 text-success d-block"></i>
              <h6 className="fw-bold">No Course Assignments Created Yet</h6>
              <p className="small mb-3">Click "+ Create New Assignment" above to publish an assignment for your course students.</p>
              <button
                className="btn btn-success rounded-pill px-4 fw-bold shadow-sm btn-sm"
                onClick={() => setShowCreateModal(true)}
              >
                + Create First Assignment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Create New Assignment */}
      {showCreateModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card border-0 rounded-4 p-4 shadow-lg text-start" style={{ maxWidth: '580px', width: '90%' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-plus-circle-fill text-success me-2"></i>Create New Course Assignment
              </h5>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}></button>
            </div>

            <form onSubmit={handleCreateAssignment}>
              <div className="mb-3">
                <label className="form-label fw-bold small">Select Target Course:</label>
                {mentorCourses.length > 0 ? (
                  <select
                    className="form-select rounded-3"
                    value={newAsg.courseId}
                    onChange={(e) => setNewAsg({ ...newAsg, courseId: e.target.value })}
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
                    value={newAsg.courseId}
                    onChange={(e) => setNewAsg({ ...newAsg, courseId: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small">Assignment Title:</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. React Storefront Architecture"
                  value={newAsg.title}
                  onChange={(e) => setNewAsg({ ...newAsg, title: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small">Description & Instructions:</label>
                <textarea
                  className="form-control rounded-3"
                  rows="3"
                  placeholder="Describe problem statement and submission requirements..."
                  value={newAsg.desc}
                  onChange={(e) => setNewAsg({ ...newAsg, desc: e.target.value })}
                  required
                />
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Due Date:</label>
                  <input
                    type="date"
                    className="form-control rounded-3"
                    value={newAsg.dueDate}
                    onChange={(e) => setNewAsg({ ...newAsg, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Total Marks:</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    value={newAsg.totalMarks}
                    onChange={(e) => setNewAsg({ ...newAsg, totalMarks: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Grade & Review Submission */}
      {selectedSub && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card border-0 rounded-4 p-4 shadow-lg text-start" style={{ maxWidth: '580px', width: '90%' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">Grade Submission</h5>
                <span className="text-muted small">Student: {selectedSub.studentName} ({selectedSub.studentEmail})</span>
              </div>
              <button className="btn-close" onClick={() => setSelectedSub(null)}></button>
            </div>

            <div className="p-3 bg-light rounded-3 border mb-3">
              <span className="badge bg-secondary-subtle text-secondary rounded-pill mb-1">{selectedSub.courseTitle}</span>
              <h6 className="fw-bold text-dark mb-1">{selectedSub.assignmentTitle}</h6>
              {(() => {
                const fName = selectedSub.pdfFileName || selectedSub.fileName || 'Submission.pdf';
                const style = getFileStyle(fName);
                return (
                  <div className={`${style.textColor} small mt-2 fw-semibold`}>
                    <i className={`bi ${style.icon} me-1`}></i>Solution File: {fName}
                  </div>
                );
              })()}
            </div>

            <form onSubmit={handleGradeSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Score (out of 100):</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    placeholder="e.g. 95"
                    value={gradeForm.score}
                    onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Letter Grade:</label>
                  <select
                    className="form-select rounded-3"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Good)</option>
                    <option value="B">B (Satisfactory)</option>
                    <option value="C">C (Needs Improvement)</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small">Mentor Constructive Feedback:</label>
                <textarea
                  className="form-control rounded-3"
                  rows="3"
                  placeholder="Provide constructive feedback for the student..."
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  required
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedSub(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">
                  Save & Dispatch Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
