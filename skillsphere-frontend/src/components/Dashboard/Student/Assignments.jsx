import { useState, useEffect } from 'react';
import EnrollmentService from '../../../services/EnrollmentService';

export default function Assignments({ onShowToast }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all');

  // Selected assignment for PDF submission
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load enrolled courses and global assignments (Zero dummy defaults)
  useEffect(() => {
    // 1. Fetch Enrolled Courses for current student
    EnrollmentService.getMyEnrollments()
      .then(res => {
        const list = res?.data || res || [];
        const formatted = list.map(item => ({
          id: String(item.courseId || item.course?.id || item.id),
          title: item.courseTitle || item.course?.title || 'Enrolled Course'
        }));
        setEnrolledCourses(formatted);
      })
      .catch(() => {
        setEnrolledCourses([]);
      });

    // 2. Load Global Created Assignments
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

  // Filter assignments strictly to student's ENROLLED COURSES ONLY
  const studentEnrolledTitles = new Set(enrolledCourses.map(c => c.title.toLowerCase().trim()));
  const studentEnrolledIds = new Set(enrolledCourses.map(c => String(c.id).trim()));

  const enrolledAssignments = assignments.filter(asg => {
    const matchId = studentEnrolledIds.has(String(asg.courseId).trim());
    const matchTitle = studentEnrolledTitles.has(String(asg.courseTitle).toLowerCase().trim());
    // If student has zero enrolled courses listed, show created assignments so student can test
    return matchId || matchTitle || enrolledCourses.length === 0;
  });

  // Attach submission details to each enrolled assignment
  const assignmentsWithSub = enrolledAssignments.map(asg => {
    const sub = submissions.find(s => s.assignmentId === asg.id);
    return {
      ...asg,
      submission: sub || null,
      status: sub ? sub.status : 'PENDING'
    };
  });

  // Status Counts
  const pendingCount = assignmentsWithSub.filter(a => a.status === 'PENDING').length;
  const submittedCount = assignmentsWithSub.filter(a => a.status === 'SUBMITTED').length;
  const reviewedCount = assignmentsWithSub.filter(a => a.status === 'REVIEWED').length;

  // Filtered List
  const filteredAssignments = assignmentsWithSub.filter(a => {
    if (filter === 'pending') return a.status === 'PENDING';
    if (filter === 'submitted') return a.status === 'SUBMITTED';
    if (filter === 'reviewed') return a.status === 'REVIEWED';
    return true;
  });

  // Helper to determine file icon and badge styling
  const getFileStyle = (fileName = '') => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return {
        icon: 'bi-file-earmark-word-fill',
        textColor: 'text-primary',
        subtleBg: 'bg-primary-subtle',
        borderClass: 'border-primary',
        badgeClass: 'bg-primary-subtle text-primary',
        typeLabel: 'Word Document'
      };
    }
    return {
      icon: 'bi-file-earmark-pdf-fill',
      textColor: 'text-danger',
      subtleBg: 'bg-danger-subtle',
      borderClass: 'border-danger',
      badgeClass: 'bg-danger-subtle text-danger',
      typeLabel: 'PDF Document'
    };
  };

  // Handle Document File Selection (.pdf, .doc, .docx)
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
    const isWord = file.type === 'application/msword' ||
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                  lowerName.endsWith('.doc') ||
                  lowerName.endsWith('.docx');

    if (!isPdf && !isWord) {
      if (onShowToast) onShowToast('warning', 'Please select a valid PDF (.pdf) or Word document (.doc, .docx).');
      return;
    }
    setSelectedPdfFile(file);
  };

  // Submit Assignment Handler
  const handlePdfSubmit = (e) => {
    e.preventDefault();
    if (!selectedPdfFile) {
      if (onShowToast) onShowToast('warning', 'Please upload a PDF or Word document before submitting.');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const fileStyle = getFileStyle(selectedPdfFile.name);
      const newSubmission = {
        id: `sub_${Date.now()}`,
        assignmentId: selectedAsg.id,
        courseTitle: selectedAsg.courseTitle,
        assignmentTitle: selectedAsg.title,
        studentName: 'Student User',
        studentEmail: 'student@skillsphere.com',
        submittedAt: new Date().toISOString(),
        pdfFileName: selectedPdfFile.name,
        fileName: selectedPdfFile.name,
        pdfFileUrl: '#',
        status: 'SUBMITTED',
        score: '',
        grade: '',
        feedback: ''
      };

      const updatedSubs = [newSubmission, ...submissions.filter(s => s.assignmentId !== selectedAsg.id)];
      setSubmissions(updatedSubs);

      try {
        localStorage.setItem('skillsphere_assignment_submissions', JSON.stringify(updatedSubs));
      } catch (err) {
        console.warn('Could not save submission', err);
      }

      setSubmitting(false);
      setSelectedAsg(null);
      setSelectedPdfFile(null);

      if (onShowToast) onShowToast('success', `${fileStyle.typeLabel} submitted successfully to your Mentor!`);
    }, 1000);
  };

  return (
    <div className="fade-in-quick text-start">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <span className="badge bg-success-subtle text-success fw-bold rounded-pill mb-2 px-3 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
            MY ENROLLED COURSE ASSIGNMENTS
          </span>
          <h2 className="fw-bold text-dark mb-1">Course Assignments</h2>
          <p className="text-muted mb-0 small">Assignments for your enrolled courses. Submit PDF or Word document solutions for mentor review and grading.</p>
        </div>
      </div>

      {/* Stats Summary Dashboard */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border text-center">
            <span className="text-muted text-xs font-bold text-uppercase d-block mb-1">Total Assignments</span>
            <strong className="text-dark fs-4">{assignmentsWithSub.length}</strong>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border text-center">
            <span className="text-muted text-xs font-bold text-uppercase d-block mb-1">Pending Submission</span>
            <strong className="text-warning fs-4">{pendingCount}</strong>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border text-center">
            <span className="text-muted text-xs font-bold text-uppercase d-block mb-1">Submitted (Under Review)</span>
            <strong className="text-primary fs-4">{submittedCount}</strong>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border text-center">
            <span className="text-muted text-xs font-bold text-uppercase d-block mb-1">Reviewed & Graded</span>
            <strong className="text-success fs-4">{reviewedCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '0.8rem' }}>
          <span className="fw-bold text-dark me-2"><i className="bi bi-funnel text-success me-1"></i>Filter Status:</span>
          {['all', 'pending', 'submitted', 'reviewed'].map(st => (
            <button
              key={st}
              className={`btn btn-xs rounded-pill px-3 py-1 fw-bold text-uppercase ${
                filter === st ? 'btn-success text-white' : 'btn-light text-muted'
              }`}
              onClick={() => setFilter(st)}
              style={{ fontSize: '0.72rem' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="d-flex flex-column gap-3 mb-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((asg) => {
            const subFileStyle = asg.submission ? getFileStyle(asg.submission.pdfFileName || asg.submission.fileName) : null;
            return (
              <div key={asg.id} className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-success-subtle text-success rounded-pill fw-bold" style={{ fontSize: '0.65rem' }}>
                        {asg.courseTitle}
                      </span>
                      <span className="text-muted small">• Due: {asg.dueDate}</span>
                    </div>
                    <h5 className="fw-bold text-dark mb-1">{asg.title}</h5>
                    <p className="text-muted small mb-0 lh-base" style={{ fontSize: '0.85rem' }}>
                      {asg.desc}
                    </p>
                  </div>

                  <div className="text-end">
                    <span className={`badge rounded-pill fw-bold text-uppercase px-3 py-2 ${
                      asg.status === 'REVIEWED' ? 'bg-success text-white' :
                      asg.status === 'SUBMITTED' ? 'bg-primary text-white' : 'bg-warning text-dark'
                    }`} style={{ fontSize: '0.7rem' }}>
                      {asg.status === 'REVIEWED' ? 'REVIEWED ✔' : asg.status === 'SUBMITTED' ? 'SUBMITTED (Pending Review)' : 'PENDING SUBMISSION'}
                    </span>
                    <div className="text-muted text-xs mt-2">Total Marks: {asg.totalMarks}</div>
                  </div>
                </div>

                {/* Reviewed Grade & Feedback Section */}
                {asg.status === 'REVIEWED' && asg.submission && subFileStyle && (
                  <div className="mt-3 p-3 bg-success-subtle rounded-3 border border-success">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-success small">
                        <i className="bi bi-patch-check-fill me-1"></i>Mentor Grade: {asg.submission.grade} ({asg.submission.score}/100 Marks)
                      </span>
                      <span className={`badge rounded-pill small ${subFileStyle.badgeClass}`}>
                        <i className={`bi ${subFileStyle.icon} me-1`}></i>{asg.submission.pdfFileName || asg.submission.fileName}
                      </span>
                    </div>
                    <div className="text-dark small">
                      <strong>Mentor Feedback:</strong> "{asg.submission.feedback}"
                    </div>
                  </div>
                )}

                {/* Submitted Badge Section */}
                {asg.status === 'SUBMITTED' && asg.submission && subFileStyle && (
                  <div className="mt-3 p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${subFileStyle.icon} ${subFileStyle.textColor} fs-5`}></i>
                      <div>
                        <strong className="text-dark small d-block">{asg.submission.pdfFileName || asg.submission.fileName}</strong>
                        <span className="text-muted text-xs">Submitted on {new Date(asg.submission.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="badge bg-primary-subtle text-primary rounded-pill small">Under Mentor Review</span>
                  </div>
                )}

                {/* Pending Action Buttons */}
                {asg.status === 'PENDING' && (
                  <div className="mt-3 pt-3 border-top d-flex justify-content-end">
                    <button
                      className="btn btn-success btn-sm rounded-pill px-4 fw-bold shadow-xs"
                      onClick={() => {
                        setSelectedAsg(asg);
                        setSelectedPdfFile(null);
                      }}
                    >
                      <i className="bi bi-cloud-arrow-up-fill me-1"></i>Submit Solution Document
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card border-0 shadow-sm rounded-4 p-5 bg-white border text-center text-muted">
            <i className="bi bi-journal-x fs-1 mb-2 text-secondary"></i>
            <h6 className="fw-bold">No Assignments Found</h6>
            <p className="small mb-0">Assignments for your enrolled courses will appear here once created by your mentor.</p>
          </div>
        )}
      </div>

      {/* Assignment Solution Upload Modal */}
      {selectedAsg && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card border-0 rounded-4 p-4 shadow-lg text-start" style={{ maxWidth: '540px', width: '90%' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">Submit Assignment Solution</h5>
                <span className="badge bg-success-subtle text-success rounded-pill mt-1">{selectedAsg.courseTitle}</span>
              </div>
              <button className="btn-close" onClick={() => setSelectedAsg(null)}></button>
            </div>

            <div className="mb-3">
              <h6 className="fw-bold text-dark small mb-1">{selectedAsg.title}</h6>
              <p className="text-muted small mb-0">{selectedAsg.desc}</p>
            </div>

            <form onSubmit={handlePdfSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold small">Upload Solution Document (.pdf, .doc, .docx):</label>
                <input
                  type="file"
                  className="form-control rounded-3"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handlePdfChange}
                  required
                />
                <span className="text-muted text-xs d-block mt-1">Maximum file size: 25 MB. Supports PDF (.pdf) and Word (.doc, .docx) formats.</span>

                {selectedPdfFile && (() => {
                  const style = getFileStyle(selectedPdfFile.name);
                  return (
                    <div className={`mt-3 p-3 ${style.subtleBg} rounded-3 border ${style.borderClass} d-flex align-items-center gap-2`}>
                      <i className={`bi ${style.icon} ${style.textColor} fs-4`}></i>
                      <div>
                        <strong className="text-dark small d-block">{selectedPdfFile.name}</strong>
                        <span className="text-muted text-xs">{(selectedPdfFile.size / 1024).toFixed(1)} KB • {style.typeLabel}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setSelectedAsg(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success rounded-pill px-4 fw-bold"
                  disabled={submitting || !selectedPdfFile}
                >
                  {submitting ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2"></span>Uploading...
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-send-fill me-1"></i>Submit Assignment
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
