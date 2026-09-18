import { useState, useEffect } from 'react';
import InternshipService from '../../../services/InternshipService';

export default function Internships({ userEmail, onShowToast }) {
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'applications'
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState('ALL');

  // Modals state
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [appStep, setAppStep] = useState(1); // 1: Personal, 2: Resume & Links, 3: Screening & Availability

  // 3-Step Form State
  const [applicantForm, setApplicantForm] = useState({
    fullName: '',
    email: '',
    phone: '+91 98765 43210',
    college: 'National Institute of Technology',
    graduationYear: '2026',
    currentCity: 'Bangalore',
    linkedInUrl: 'https://linkedin.com/in/student-profile',
    githubUrl: 'https://github.com/student-dev',
    portfolioUrl: '',
    resumeType: 'ATS_BUILDER',
    customResumeUrl: '',
    whyInterested: '',
    relevantExperience: '',
    coverLetter: '',
    startDate: 'Immediate',
    availabilityConfirmed: true,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInternshipsAndApplications();

    const handleUpdate = () => {
      fetchInternshipsAndApplications();
    };

    window.addEventListener('internshipCreated', handleUpdate);
    window.addEventListener('internshipStatusUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('internshipCreated', handleUpdate);
      window.removeEventListener('internshipStatusUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [userEmail]);

  const fetchInternshipsAndApplications = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.allSettled([
        InternshipService.getAllActiveInternships(),
        InternshipService.getMyApplications(),
      ]);

      if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value.data)) {
        setJobs(jobsRes.value.data);
      }

      if (appsRes.status === 'fulfilled' && Array.isArray(appsRes.value.data)) {
        setMyApplications(appsRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching internships:', err);
    } finally {
      setLoading(false);
    }
  };

  const isApplied = (jobId) => {
    return myApplications.some(app => app.internship?.id === jobId);
  };

  const getApplicationForJob = (jobId) => {
    return myApplications.find(app => app.internship?.id === jobId);
  };

  const handleOpenApplyModal = (job) => {
    setApplyJob(job);
    setAppStep(1);
    const defaultName = userEmail ? userEmail.split('@')[0].toUpperCase() : 'Student Applicant';
    
    setApplicantForm({
      fullName: defaultName,
      email: userEmail || 'student@skillsphere.com',
      phone: '+91 98765 43210',
      college: 'National Institute of Technology',
      graduationYear: '2026',
      currentCity: 'Bangalore',
      linkedInUrl: 'https://linkedin.com/in/student-profile',
      githubUrl: 'https://github.com/student-dev',
      portfolioUrl: 'https://myportfolio.dev',
      resumeType: 'ATS_BUILDER',
      customResumeUrl: '',
      whyInterested: `I am deeply interested in ${job.company}'s work in ${job.category || 'software engineering'}. I want to apply my technical knowledge in real production environments and learn from senior engineers.`,
      relevantExperience: `I have completed verified projects using ${job.requiredSkills ? job.requiredSkills.slice(0, 3).join(', ') : 'modern tech stacks'} on Enterprise Learning Platform with top marks.`,
      coverLetter: `Dear ${job.company} Hiring Team,\n\nI am writing to express my enthusiastic interest in the ${job.title} position. As a dedicated student at Enterprise Learning Platform, I have gained hands-on expertise in ${job.requiredSkills ? job.requiredSkills.join(', ') : 'core domain skills'}.\n\nI am confident I can add immediate value to your engineering team during this internship.`,
      startDate: 'Immediate',
      availabilityConfirmed: true,
    });
  };

  const handleConfirmSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyJob) return;

    setSubmitting(true);
    try {
      const applicationData = {
        fullName: applicantForm.fullName,
        email: applicantForm.email,
        phone: applicantForm.phone,
        college: applicantForm.college,
        graduationYear: applicantForm.graduationYear,
        currentCity: applicantForm.currentCity,
        linkedInUrl: applicantForm.linkedInUrl,
        githubUrl: applicantForm.githubUrl,
        portfolioUrl: applicantForm.portfolioUrl,
        resumeUrl: applicantForm.resumeType === 'ATS_BUILDER' 
          ? 'Enterprise Learning Platform ATS Resume Builder Sync' 
          : (applicantForm.customResumeUrl.trim() || 'Custom Resume Link'),
        coverLetter: applicantForm.coverLetter,
        whyInterested: applicantForm.whyInterested,
        relevantExperience: applicantForm.relevantExperience,
        startDate: applicantForm.startDate,
        availabilityConfirmed: applicantForm.availabilityConfirmed,
      };

      const res = await InternshipService.applyForInternship(applyJob.id, applicationData);
      
      setMyApplications(prev => [res.data, ...prev]);
      setApplyJob(null);
      
      if (onShowToast) {
        onShowToast('success', `Application submitted successfully for ${applyJob.title} at ${applyJob.company}!`);
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      if (onShowToast) {
        onShowToast('error', err?.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filter jobs
  const categories = ['ALL', 'Frontend', 'Backend', 'AI/ML', 'UI/UX', 'Full-Stack'];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.requiredSkills && job.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'ALL' || job.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesMode = selectedWorkMode === 'ALL' || job.locationType?.toLowerCase() === selectedWorkMode.toLowerCase();

    return matchesSearch && matchesCategory && matchesMode;
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED':
        return 'bg-success text-white';
      case 'SHORTLISTED':
        return 'bg-warning text-dark';
      case 'REJECTED':
        return 'bg-danger text-white';
      case 'UNDER_REVIEW':
        return 'bg-info text-dark';
      default:
        return 'bg-primary text-white';
    }
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold text-dark mb-0">Internship & Career Hub</h2>
            <span className="badge bg-success-subtle text-success rounded-pill px-3">Partner Hiring Platform</span>
          </div>
          <p className="text-muted mb-0">Explore developer & designer internship openings, apply with your ATS resume, and track applications live.</p>
        </div>

        {/* Tab Switchers */}
        <div className="bg-light p-1 rounded-pill border d-flex gap-1">
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold ${activeTab === 'explore' ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'}`}
            onClick={() => setActiveTab('explore')}
          >
            <i className="bi bi-compass me-1"></i> Explore Openings ({jobs.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold ${activeTab === 'applications' ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'}`}
            onClick={() => setActiveTab('applications')}
          >
            <i className="bi bi-briefcase-fill me-1"></i> My Applications ({myApplications.length})
          </button>
        </div>
      </div>

      {/* TAB 1: EXPLORE OPENINGS */}
      {activeTab === 'explore' && (
        <>
          {/* Search & Filter Bar */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white border">
            <div className="row g-3">
              <div className="col-lg-6">
                <div className="position-relative">
                  <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                  <input
                    type="text"
                    className="form-control rounded-pill ps-5"
                    placeholder="Search role, company, or skills (e.g. React, Java, Figma)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-lg-6 d-flex gap-2 flex-wrap align-items-center justify-content-end">
                <div className="d-flex gap-1 overflow-auto py-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`btn btn-xs rounded-pill px-3 fw-semibold ${selectedCategory === cat ? 'btn-dark text-white' : 'btn-outline-secondary'}`}
                      style={{ fontSize: '0.78rem' }}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Internship Cards Grid */}
          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <p className="fw-semibold">Loading partner internship openings...</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredJobs.map(job => {
                const applied = isApplied(job.id);
                const appData = getApplicationForJob(job.id);

                return (
                  <div key={job.id} className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white border transition-all hover-translate" style={{ border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="fs-2 p-2 rounded-3 bg-light border d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
                            {job.icon || '💼'}
                          </div>
                          <div>
                            <h5 className="fw-bold text-dark mb-1">{job.title}</h5>
                            <span className="text-success fw-semibold small">{job.company}</span>
                          </div>
                        </div>
                        <span className={`badge rounded-pill fw-bold text-uppercase px-3 py-1 ${applied ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`} style={{ fontSize: '0.7rem' }}>
                          {applied ? `Applied (${appData?.status || 'SUBMITTED'})` : `${job.locationType || 'Remote'}`}
                        </span>
                      </div>

                      <div className="row g-2 mb-3 text-muted small">
                        <div className="col-sm-6">
                          <i className="bi bi-wallet2 me-2 text-success"></i>Stipend: ₹{job.stipendMin ? job.stipendMin.toLocaleString() : '20,000'} - ₹{job.stipendMax ? job.stipendMax.toLocaleString() : '25,000'} / mo
                        </div>
                        <div className="col-sm-6">
                          <i className="bi bi-clock me-2 text-success"></i>Duration: {job.durationMonths || 3} Months
                        </div>
                      </div>

                      <p className="text-muted small mb-3 line-clamp-2" style={{ minHeight: '40px' }}>{job.description}</p>

                      <div className="d-flex flex-wrap gap-1 mb-4">
                        {job.requiredSkills && job.requiredSkills.map((skill, idx) => (
                          <span key={idx} className="badge bg-light text-secondary border rounded-pill px-2 py-1 small" style={{ fontSize: '0.7rem' }}>
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                        <button 
                          className="btn btn-link text-decoration-none btn-sm fw-semibold text-muted p-0"
                          onClick={() => setSelectedJobDetails(job)}
                        >
                          <i className="bi bi-info-circle me-1"></i> View Full Details
                        </button>

                        {applied ? (
                          <button className="btn btn-outline-success btn-sm rounded-pill fw-bold px-3" disabled>
                            <i className="bi bi-check2-circle me-1"></i> Application Submitted
                          </button>
                        ) : (
                          <button 
                            className="btn btn-success btn-sm rounded-pill fw-bold px-4 shadow-sm" 
                            onClick={() => handleOpenApplyModal(job)}
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredJobs.length === 0 && (
                <div className="col-12 text-center py-5 text-muted bg-white rounded-4 border">
                  <i className="bi bi-briefcase fs-1 mb-3 text-muted"></i>
                  <p className="fw-bold mb-1">No internships found</p>
                  <p className="small text-muted mb-0">Try expanding your search filter or selecting 'ALL' categories.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY APPLICATIONS TRACKER */}
      {activeTab === 'applications' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <h5 className="fw-bold text-dark mb-3"><i className="bi bi-journal-check text-success me-2"></i>My Internship Applications</h5>
          {myApplications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 mb-3 text-muted"></i>
              <p className="fw-bold mb-1">You haven't applied to any internships yet.</p>
              <button className="btn btn-success btn-sm rounded-pill fw-bold px-4 mt-2" onClick={() => setActiveTab('explore')}>
                Explore Active Openings
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Role & Company</th>
                    <th>Stipend & Mode</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Recruiter Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {myApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="fw-bold text-dark">{app.internship?.title}</div>
                        <div className="text-success small fw-semibold">{app.internship?.company}</div>
                      </td>
                      <td className="small text-muted">
                        <div>₹{app.internship?.stipendMin ? app.internship.stipendMin.toLocaleString() : '20,000'} / mo</div>
                        <span className="badge bg-light text-dark border">{app.internship?.locationType || 'Remote'}</span>
                      </td>
                      <td className="small text-muted">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}
                      </td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-2 fw-bold extra-small ${getStatusBadgeClass(app.status)}`}>
                          {app.status || 'APPLIED'}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {app.reviewNotes ? (
                          <span className="text-dark fw-semibold"><i className="bi bi-chat-left-text me-1 text-primary"></i>{app.reviewNotes}</span>
                        ) : (
                          <span className="fst-italic text-muted">Awaiting recruiter review...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FULL DETAILS MODAL */}
      {selectedJobDetails && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg text-start">
              <div className="modal-header border-bottom bg-light p-4">
                <div className="d-flex align-items-center gap-3">
                  <span className="fs-2 p-2 rounded-3 bg-white border">{selectedJobDetails.icon || '💼'}</span>
                  <div>
                    <h4 className="fw-bold text-dark mb-1">{selectedJobDetails.title}</h4>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-success fw-bold">{selectedJobDetails.company}</span>
                      <span className="badge bg-primary-subtle text-primary rounded-pill px-3">{selectedJobDetails.locationType}</span>
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedJobDetails(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4 p-3 bg-light rounded-3 border">
                  <div className="col-md-4">
                    <span className="extra-small text-muted d-block fw-bold text-uppercase">Monthly Stipend</span>
                    <span className="fw-bold text-dark fs-6">₹{selectedJobDetails.stipendMin ? selectedJobDetails.stipendMin.toLocaleString() : '20,000'} - ₹{selectedJobDetails.stipendMax ? selectedJobDetails.stipendMax.toLocaleString() : '25,000'}</span>
                  </div>
                  <div className="col-md-4">
                    <span className="extra-small text-muted d-block fw-bold text-uppercase">Duration</span>
                    <span className="fw-bold text-dark fs-6">{selectedJobDetails.durationMonths || 3} Months</span>
                  </div>
                  <div className="col-md-4">
                    <span className="extra-small text-muted d-block fw-bold text-uppercase">Deadline</span>
                    <span className="fw-bold text-dark fs-6">{selectedJobDetails.deadline || 'Open until filled'}</span>
                  </div>
                </div>

                <h6 className="fw-bold text-dark mb-2">Role Overview</h6>
                <p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>{selectedJobDetails.description}</p>

                <h6 className="fw-bold text-dark mb-2">Key Responsibilities</h6>
                <ul className="small text-muted mb-4 ps-3" style={{ lineHeight: '1.6' }}>
                  {selectedJobDetails.responsibilities ? (
                    selectedJobDetails.responsibilities.map((r, idx) => <li key={idx} className="mb-1">{r}</li>)
                  ) : (
                    <li>Deliver high-quality software features and participate in code reviews.</li>
                  )}
                </ul>

                <h6 className="fw-bold text-dark mb-2">Required Skills</h6>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {selectedJobDetails.requiredSkills && selectedJobDetails.requiredSkills.map((s, idx) => (
                    <span key={idx} className="badge bg-light text-dark border rounded-pill px-3 py-2 small fw-semibold">
                      {s}
                    </span>
                  ))}
                </div>

                <h6 className="fw-bold text-dark mb-2">Perks & Compensation Benefits</h6>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {selectedJobDetails.perks ? (
                    selectedJobDetails.perks.map((p, idx) => (
                      <span key={idx} className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 small fw-semibold">
                        <i className="bi bi-award me-1"></i> {p}
                      </span>
                    ))
                  ) : (
                    <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 small">Certificate & Letter of Recommendation</span>
                  )}
                </div>
              </div>

              <div className="modal-footer border-top p-3 bg-light">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => setSelectedJobDetails(null)}>Close</button>
                {isApplied(selectedJobDetails.id) ? (
                  <button className="btn btn-success rounded-pill px-4 fw-bold" disabled>Already Applied</button>
                ) : (
                  <button 
                    className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                    onClick={() => {
                      const jobToApply = selectedJobDetails;
                      setSelectedJobDetails(null);
                      handleOpenApplyModal(jobToApply);
                    }}
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-STEP REAL-WORLD APPLICATION WIZARD MODAL */}
      {applyJob && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg text-start">
              <div className="modal-header border-bottom bg-success text-white p-4">
                <div>
                  <h5 className="fw-bold mb-0">Apply to {applyJob.company}</h5>
                  <span className="small text-white-50">{applyJob.title} • Step {appStep} of 3</span>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setApplyJob(null)}></button>
              </div>

              {/* Progress Step Bar */}
              <div className="bg-light px-4 py-2 border-bottom d-flex justify-content-between text-muted small fw-semibold">
                <span className={appStep === 1 ? 'text-success fw-bold' : ''}><i className="bi bi-1-circle me-1"></i> Contact & College</span>
                <span className={appStep === 2 ? 'text-success fw-bold' : ''}><i className="bi bi-2-circle me-1"></i> Resume & Links</span>
                <span className={appStep === 3 ? 'text-success fw-bold' : ''}><i className="bi bi-3-circle me-1"></i> Screening & Pitch</span>
              </div>

              <form onSubmit={handleConfirmSubmitApplication}>
                <div className="modal-body p-4">
                  {/* Skill Match Banner */}
                  <div className="p-3 bg-success-subtle rounded-3 border border-success-subtle mb-4 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-lightning-charge-fill text-success fs-5"></i>
                      <div>
                        <span className="fw-bold text-success d-block small">Profile Skill Match</span>
                        <span className="extra-small text-muted">Synced with your Enterprise Learning Platform learning roadmap</span>
                      </div>
                    </div>
                    <span className="badge bg-success text-white rounded-pill px-3 py-2 fw-bold">95% Match</span>
                  </div>

                  {/* STEP 1: CONTACT & ACADEMIC INFO */}
                  {appStep === 1 && (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Full Name *</label>
                        <input 
                          type="text" 
                          className="form-control rounded-3" 
                          required
                          value={applicantForm.fullName}
                          onChange={e => setApplicantForm({ ...applicantForm, fullName: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Email Address *</label>
                        <input 
                          type="email" 
                          className="form-control rounded-3" 
                          required
                          value={applicantForm.email}
                          onChange={e => setApplicantForm({ ...applicantForm, email: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Phone / WhatsApp Number *</label>
                        <input 
                          type="text" 
                          className="form-control rounded-3" 
                          required
                          value={applicantForm.phone}
                          onChange={e => setApplicantForm({ ...applicantForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Current Location / City</label>
                        <input 
                          type="text" 
                          className="form-control rounded-3" 
                          value={applicantForm.currentCity}
                          onChange={e => setApplicantForm({ ...applicantForm, currentCity: e.target.value })}
                        />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label small fw-bold">College / University Name</label>
                        <input 
                          type="text" 
                          className="form-control rounded-3" 
                          value={applicantForm.college}
                          onChange={e => setApplicantForm({ ...applicantForm, college: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Graduation Year</label>
                        <input 
                          type="text" 
                          className="form-control rounded-3" 
                          value={applicantForm.graduationYear}
                          onChange={e => setApplicantForm({ ...applicantForm, graduationYear: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: RESUME & PROFESSIONAL LINKS */}
                  {appStep === 2 && (
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-bold">Select Resume</label>
                        <div className="form-check p-3 border rounded-3 mb-2 bg-light">
                          <input 
                            className="form-check-input ms-0 me-2" 
                            type="radio" 
                            name="resumeChoice" 
                            id="atsResume" 
                            checked={applicantForm.resumeType === 'ATS_BUILDER'}
                            onChange={() => setApplicantForm({ ...applicantForm, resumeType: 'ATS_BUILDER' })}
                          />
                          <label className="form-check-label small fw-bold text-dark" htmlFor="atsResume">
                            <i className="bi bi-file-earmark-person text-success me-1"></i> Enterprise Learning Platform ATS Resume Builder Sync
                          </label>
                          <span className="extra-small text-muted d-block ms-4">Attaches your verified single-column ATS Resume profile</span>
                        </div>

                        <div className="form-check p-3 border rounded-3 bg-light mb-3">
                          <input 
                            className="form-check-input ms-0 me-2" 
                            type="radio" 
                            name="resumeChoice" 
                            id="customLink" 
                            checked={applicantForm.resumeType === 'CUSTOM_URL'}
                            onChange={() => setApplicantForm({ ...applicantForm, resumeType: 'CUSTOM_URL' })}
                          />
                          <label className="form-check-label small fw-bold text-dark" htmlFor="customLink">
                            <i className="bi bi-link-45deg text-primary me-1"></i> Custom PDF / Portfolio Link
                          </label>
                          {applicantForm.resumeType === 'CUSTOM_URL' && (
                            <input 
                              type="text" 
                              className="form-control form-control-sm mt-2 rounded-2"
                              placeholder="Paste Google Drive / LinkedIn / Portfolio PDF URL..."
                              value={applicantForm.customResumeUrl}
                              onChange={(e) => setApplicantForm({ ...applicantForm, customResumeUrl: e.target.value })}
                            />
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold"><i className="bi bi-linkedin text-primary me-1"></i> LinkedIn Profile URL</label>
                        <input 
                          type="text" 
                          className="form-control rounded-3" 
                          placeholder="https://linkedin.com/in/..."
                          value={applicantForm.linkedInUrl}
                          onChange={e => setApplicantForm({ ...applicantForm, linkedInUrl: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold"><i className="bi bi-github text-dark me-1"></i> GitHub / Portfolio URL</label>
                        <input 
                          type="text" 
                          className="form-control rounded-3" 
                          placeholder="https://github.com/..."
                          value={applicantForm.githubUrl}
                          onChange={e => setApplicantForm({ ...applicantForm, githubUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SCREENING QUESTIONS & PITCH */}
                  {appStep === 3 && (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Earliest Availability / Start Date</label>
                        <select 
                          className="form-select rounded-3"
                          value={applicantForm.startDate}
                          onChange={e => setApplicantForm({ ...applicantForm, startDate: e.target.value })}
                        >
                          <option value="Immediate">Immediate (Within 3 Days)</option>
                          <option value="1 Week">In 1 Week</option>
                          <option value="2 Weeks">In 2 Weeks</option>
                          <option value="1 Month">Next Month</option>
                        </select>
                      </div>

                      <div className="col-md-6 d-flex align-items-center mt-4">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="confirmAvail" 
                            checked={applicantForm.availabilityConfirmed}
                            onChange={e => setApplicantForm({ ...applicantForm, availabilityConfirmed: e.target.checked })}
                          />
                          <label className="form-check-label small fw-bold text-dark" htmlFor="confirmAvail">
                            Confirm availability for {applyJob.durationMonths || 3} months
                          </label>
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold">Why are you interested in this role at {applyJob.company}?</label>
                        <textarea 
                          className="form-control rounded-3" 
                          rows="2"
                          value={applicantForm.whyInterested}
                          onChange={e => setApplicantForm({ ...applicantForm, whyInterested: e.target.value })}
                        ></textarea>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold">Highlight relevant experience with {applyJob.requiredSkills ? applyJob.requiredSkills.slice(0, 2).join(', ') : 'software development'}</label>
                        <textarea 
                          className="form-control rounded-3" 
                          rows="2"
                          value={applicantForm.relevantExperience}
                          onChange={e => setApplicantForm({ ...applicantForm, relevantExperience: e.target.value })}
                        ></textarea>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold">Cover Letter / Recruiter Pitch</label>
                        <textarea 
                          className="form-control rounded-3"
                          rows="4"
                          value={applicantForm.coverLetter}
                          onChange={(e) => setApplicantForm({ ...applicantForm, coverLetter: e.target.value })}
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer border-top p-3 bg-light d-flex justify-content-between">
                  {appStep > 1 ? (
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => setAppStep(prev => prev - 1)}>
                      Back
                    </button>
                  ) : (
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => setApplyJob(null)}>
                      Cancel
                    </button>
                  )}

                  {appStep < 3 ? (
                    <button type="button" className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={() => setAppStep(prev => prev + 1)}>
                      Next Step <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-sm" disabled={submitting}>
                      {submitting ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting Application...
                        </span>
                      ) : 'Submit Real Application'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
