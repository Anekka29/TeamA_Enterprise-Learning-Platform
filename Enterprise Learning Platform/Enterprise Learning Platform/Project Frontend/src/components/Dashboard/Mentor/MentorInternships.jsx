import { useState, useEffect } from 'react';
import InternshipService from '../../../services/InternshipService';

export default function MentorInternships({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'create'
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form for posting new internship
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: 'Frontend',
    locationType: 'Remote',
    locationCity: 'Remote',
    stipendMin: '20000',
    stipendMax: '30000',
    durationMonths: '3',
    description: '',
    requiredSkills: 'React.js, JavaScript, REST APIs',
    responsibilities: 'Build interactive UI components\nIntegrate backend APIs\nParticipate in code reviews',
    perks: 'Certificate, Letter of Recommendation, Flexible Hours',
    deadline: '2026-10-30',
  });
  const [submitting, setSubmitting] = useState(false);

  // Candidate Dossier Modal
  const [selectedDossierApp, setSelectedDossierApp] = useState(null);

  // Decision Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await InternshipService.getMentorApplications();
      if (Array.isArray(res.data)) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Error fetching mentor applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (app, status) => {
    setSelectedApp(app);
    setTargetStatus(status);
    setReviewNotes(
      status === 'ACCEPTED' ? 'Congratulations! We are excited to offer you the internship position. Our HR team will reach out with the offer letter.' :
      status === 'SHORTLISTED' ? 'Your profile and ATS resume have been shortlisted for the technical interview round.' :
      'Thank you for applying. Unfortunately, we have moved forward with another candidate at this time.'
    );
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedApp || !targetStatus) return;

    try {
      const updated = await InternshipService.updateApplicationStatus(selectedApp.id, targetStatus, reviewNotes);
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? updated.data : a));
      
      // Dispatch global event for instant student dashboard update
      window.dispatchEvent(new CustomEvent('internshipStatusUpdated', { detail: updated.data }));
      
      if (selectedDossierApp && selectedDossierApp.id === selectedApp.id) {
        setSelectedDossierApp(updated.data);
      }

      setSelectedApp(null);
      if (onShowToast) {
        onShowToast('success', `Application status updated to ${targetStatus}!`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      if (onShowToast) {
        onShowToast('error', 'Failed to update status.');
      }
    }
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        company: formData.company,
        category: formData.category,
        locationType: formData.locationType,
        locationCity: formData.locationCity,
        stipendMin: parseFloat(formData.stipendMin) || 20000,
        stipendMax: parseFloat(formData.stipendMax) || 30000,
        durationMonths: parseInt(formData.durationMonths) || 3,
        description: formData.description,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        responsibilities: formData.responsibilities.split('\n').map(r => r.trim()).filter(Boolean),
        perks: formData.perks.split(',').map(p => p.trim()).filter(Boolean),
        deadline: formData.deadline,
        active: true,
        icon: formData.category === 'Backend' ? '☕' : formData.category === 'AI/ML' ? '🤖' : formData.category === 'UI/UX' ? '🎨' : '💼'
      };

      const createdRes = await InternshipService.createInternship(payload);
      
      // Dispatch global event for instant student dashboard sync
      window.dispatchEvent(new CustomEvent('internshipCreated', { detail: createdRes.data }));

      if (onShowToast) {
        onShowToast('success', `New internship opening "${formData.title}" published successfully!`);
      }

      setFormData({
        title: '',
        company: '',
        category: 'Frontend',
        locationType: 'Remote',
        locationCity: 'Remote',
        stipendMin: '20000',
        stipendMax: '30000',
        durationMonths: '3',
        description: '',
        requiredSkills: '',
        responsibilities: '',
        perks: '',
        deadline: '',
      });
      setActiveTab('review');
    } catch (err) {
      console.error('Error creating internship:', err);
      if (onShowToast) {
        onShowToast('error', 'Failed to publish internship posting.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold text-dark mb-0">Internship & Hiring Management</h2>
            <span className="badge bg-primary rounded-pill px-3 py-1">Mentor / Recruiter Portal</span>
          </div>
          <p className="text-muted mb-0">Post new partner internship openings and review/shortlist/accept student applicants.</p>
        </div>

        <div className="bg-light p-1 rounded-pill border d-flex gap-1">
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold ${activeTab === 'review' ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'}`}
            onClick={() => setActiveTab('review')}
          >
            <i className="bi bi-people-fill me-1"></i> Applicant Queue ({applications.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-4 fw-bold ${activeTab === 'create' ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'}`}
            onClick={() => setActiveTab('create')}
          >
            <i className="bi bi-plus-circle-fill me-1"></i> Post New Internship
          </button>
        </div>
      </div>

      {/* TAB 1: APPLICANT REVIEW QUEUE */}
      {activeTab === 'review' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <h5 className="fw-bold text-dark mb-3"><i className="bi bi-person-lines-fill text-success me-2"></i>Student Applications Review Queue</h5>
          
          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-success mb-2" role="status"></div>
              <p className="fw-semibold">Loading applicant submissions...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 text-muted mb-2"></i>
              <p className="fw-bold mb-1">No applications submitted yet.</p>
              <span className="small text-muted">Posted internships will receive applications here.</span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Student Applicant</th>
                    <th>Role & Company</th>
                    <th>College & Links</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th className="text-end">Recruiter Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td>
                        <div className="fw-bold text-dark">{app.fullName || app.user?.fullName || app.user?.username || 'Student'}</div>
                        <div className="small text-muted">{app.email || app.user?.email}</div>
                        {app.phone && <div className="extra-small text-muted"><i className="bi bi-telephone me-1"></i>{app.phone}</div>}
                      </td>
                      <td>
                        <div className="fw-bold text-success">{app.internship?.title}</div>
                        <span className="extra-small badge bg-light text-dark border">{app.internship?.company}</span>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <div className="small text-dark fw-semibold">{app.college || 'University Student'}</div>
                        <div className="d-flex gap-2 mt-1">
                          {app.linkedInUrl && (
                            <a href={app.linkedInUrl} target="_blank" rel="noreferrer" className="badge bg-primary text-white text-decoration-none extra-small">
                              <i className="bi bi-linkedin me-1"></i>LinkedIn
                            </a>
                          )}
                          {app.githubUrl && (
                            <a href={app.githubUrl} target="_blank" rel="noreferrer" className="badge bg-dark text-white text-decoration-none extra-small">
                              <i className="bi bi-github me-1"></i>GitHub
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="small text-muted">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}
                      </td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-2 fw-bold extra-small ${
                          app.status === 'ACCEPTED' ? 'bg-success text-white' :
                          app.status === 'SHORTLISTED' ? 'bg-warning text-dark' :
                          app.status === 'REJECTED' ? 'bg-danger text-white' : 'bg-primary text-white'
                        }`}>
                          {app.status || 'APPLIED'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-success fw-bold"
                            onClick={() => setSelectedDossierApp(app)}
                          >
                            <i className="bi bi-person-bounding-box me-1"></i> Candidate Dossier
                          </button>
                          <button 
                            className="btn btn-outline-warning fw-bold"
                            onClick={() => handleOpenActionModal(app, 'SHORTLISTED')}
                          >
                            Shortlist
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FULL CANDIDATE DOSSIER MODAL */}
      {selectedDossierApp && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg text-start">
              <div className="modal-header border-bottom bg-light p-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="fs-3 p-3 rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-1">{selectedDossierApp.fullName || selectedDossierApp.user?.fullName || 'Student Applicant'}</h4>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-success fw-bold">{selectedDossierApp.internship?.title} Candidate</span>
                      <span className={`badge rounded-pill px-3 py-1 fw-bold ${
                        selectedDossierApp.status === 'ACCEPTED' ? 'bg-success text-white' :
                        selectedDossierApp.status === 'SHORTLISTED' ? 'bg-warning text-dark' :
                        selectedDossierApp.status === 'REJECTED' ? 'bg-danger text-white' : 'bg-primary text-white'
                      }`}>
                        {selectedDossierApp.status || 'APPLIED'}
                      </span>
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedDossierApp(null)}></button>
              </div>

              <div className="modal-body p-4">
                {/* Candidate Info Summary Grid */}
                <div className="row g-3 mb-4 p-3 bg-light rounded-3 border">
                  <div className="col-md-4">
                    <span className="extra-small text-muted d-block fw-bold text-uppercase">Email & Phone</span>
                    <span className="fw-bold text-dark small d-block">{selectedDossierApp.email || selectedDossierApp.user?.email}</span>
                    <span className="text-muted extra-small">{selectedDossierApp.phone || '+91 98765 43210'}</span>
                  </div>
                  <div className="col-md-4">
                    <span className="extra-small text-muted d-block fw-bold text-uppercase">College & Graduation</span>
                    <span className="fw-bold text-dark small d-block">{selectedDossierApp.college || 'University Student'}</span>
                    <span className="text-muted extra-small">Class of {selectedDossierApp.graduationYear || '2026'}</span>
                  </div>
                  <div className="col-md-4">
                    <span className="extra-small text-muted d-block fw-bold text-uppercase">Location & Availability</span>
                    <span className="fw-bold text-dark small d-block">{selectedDossierApp.currentCity || 'Bangalore'}</span>
                    <span className="text-success extra-small fw-bold">Start: {selectedDossierApp.startDate || 'Immediate'}</span>
                  </div>
                </div>

                {/* Resume & Portfolio Links */}
                <h6 className="fw-bold text-dark mb-2"><i className="bi bi-link-45deg text-success me-1"></i>Verified Profiles & Resume</h6>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 small fw-bold">
                    <i className="bi bi-file-earmark-person me-1"></i> {selectedDossierApp.resumeUrl || 'Enterprise Learning Platform ATS Resume Sync'}
                  </span>

                  {selectedDossierApp.linkedInUrl && (
                    <a href={selectedDossierApp.linkedInUrl} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold">
                      <i className="bi bi-linkedin me-1"></i> LinkedIn Profile
                    </a>
                  )}

                  {selectedDossierApp.githubUrl && (
                    <a href={selectedDossierApp.githubUrl} target="_blank" rel="noreferrer" className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold">
                      <i className="bi bi-github me-1"></i> GitHub Portfolio
                    </a>
                  )}
                </div>

                {/* Screening Answers */}
                <h6 className="fw-bold text-dark mb-2"><i className="bi bi-patch-question text-success me-1"></i>Candidate Screening Responses</h6>
                
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <span className="extra-small text-muted d-block fw-bold text-uppercase">Why interested in this role at {selectedDossierApp.internship?.company}?</span>
                  <p className="small text-dark mb-0 mt-1" style={{ lineHeight: '1.6' }}>
                    {selectedDossierApp.whyInterested || 'Passionate about applying software skills in production.'}
                  </p>
                </div>

                <div className="p-3 bg-light rounded-3 border mb-3">
                  <span className="extra-small text-muted d-block fw-bold text-uppercase">Relevant Experience & Projects</span>
                  <p className="small text-dark mb-0 mt-1" style={{ lineHeight: '1.6' }}>
                    {selectedDossierApp.relevantExperience || 'Built verified full-stack applications with React & Spring Boot.'}
                  </p>
                </div>

                {/* Cover Letter */}
                <h6 className="fw-bold text-dark mb-2"><i className="bi bi-file-earmark-text text-success me-1"></i>Cover Letter / Pitch</h6>
                <div className="p-3 bg-white border rounded-3 text-muted small" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {selectedDossierApp.coverLetter || 'No cover letter provided.'}
                </div>
              </div>

              <div className="modal-footer border-top p-3 bg-light justify-content-between">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => setSelectedDossierApp(null)}>Close Dossier</button>
                <div className="btn-group">
                  <button 
                    className="btn btn-warning fw-bold text-dark"
                    onClick={() => {
                      const app = selectedDossierApp;
                      handleOpenActionModal(app, 'SHORTLISTED');
                    }}
                  >
                    Shortlist Candidate
                  </button>
                  <button 
                    className="btn btn-success fw-bold"
                    onClick={() => {
                      const app = selectedDossierApp;
                      handleOpenActionModal(app, 'ACCEPTED');
                    }}
                  >
                    Accept & Offer
                  </button>
                  <button 
                    className="btn btn-danger fw-bold"
                    onClick={() => {
                      const app = selectedDossierApp;
                      handleOpenActionModal(app, 'REJECTED');
                    }}
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POST NEW INTERNSHIP FORM */}
      {activeTab === 'create' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <h5 className="fw-bold text-dark mb-3"><i className="bi bi-plus-circle text-success me-2"></i>Post Partner Internship Opening</h5>
          <form onSubmit={handleCreateInternship}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Internship Role Title *</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  placeholder="e.g. Node.js Backend Developer Intern" 
                  required
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Company Name *</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  placeholder="e.g. Acme Tech Solutions" 
                  required
                  value={formData.company} 
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold">Category</label>
                <select 
                  className="form-select rounded-3"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="AI/ML">AI / ML</option>
                  <option value="UI/UX">UI / UX Design</option>
                  <option value="Full-Stack">Full-Stack</option>
                  <option value="Data">Data Analytics</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Work Mode</label>
                <select 
                  className="form-select rounded-3"
                  value={formData.locationType}
                  onChange={e => setFormData({ ...formData, locationType: e.target.value })}
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-Site">On-Site</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">City / Location</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  value={formData.locationCity} 
                  onChange={e => setFormData({ ...formData, locationCity: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold">Min Stipend (₹ / mo)</label>
                <input 
                  type="number" 
                  className="form-control rounded-3" 
                  value={formData.stipendMin} 
                  onChange={e => setFormData({ ...formData, stipendMin: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Max Stipend (₹ / mo)</label>
                <input 
                  type="number" 
                  className="form-control rounded-3" 
                  value={formData.stipendMax} 
                  onChange={e => setFormData({ ...formData, stipendMax: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Duration (Months)</label>
                <input 
                  type="number" 
                  className="form-control rounded-3" 
                  value={formData.durationMonths} 
                  onChange={e => setFormData({ ...formData, durationMonths: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Role Description</label>
                <textarea 
                  className="form-control rounded-3" 
                  rows="3" 
                  placeholder="Describe the role expectations..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Required Skills (Comma separated)</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  placeholder="React.js, Node.js, SQL, REST APIs" 
                  value={formData.requiredSkills}
                  onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Key Responsibilities (One per line)</label>
                <textarea 
                  className="form-control rounded-3" 
                  rows="3" 
                  value={formData.responsibilities}
                  onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Perks & Benefits (Comma separated)</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  value={formData.perks}
                  onChange={e => setFormData({ ...formData, perks: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold mt-4 shadow-sm" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Internship Opening'}
            </button>
          </form>
        </div>
      )}

      {/* HIRING DECISION MODAL */}
      {selectedApp && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg text-start">
              <div className="modal-header border-bottom bg-light p-4">
                <h5 className="fw-bold text-dark mb-0">Update Candidate Decision ({targetStatus})</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedApp(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="small text-muted mb-3">
                  Updating status for <strong className="text-dark">{selectedApp.fullName || selectedApp.user?.email}</strong> for role <strong className="text-success">{selectedApp.internship?.title}</strong>.
                </p>

                <label className="form-label small fw-bold">Recruiter Review Note / Feedback</label>
                <textarea 
                  className="form-control rounded-3" 
                  rows="4" 
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer border-top p-3 bg-light">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => setSelectedApp(null)}>Cancel</button>
                <button 
                  type="button" 
                  className={`btn rounded-pill px-4 fw-bold ${
                    targetStatus === 'ACCEPTED' ? 'btn-success' :
                    targetStatus === 'SHORTLISTED' ? 'btn-warning text-dark' : 'btn-danger'
                  }`}
                  onClick={handleConfirmStatusUpdate}
                >
                  Confirm {targetStatus}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
