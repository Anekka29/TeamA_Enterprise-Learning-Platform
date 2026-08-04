import { useState, useEffect } from 'react';

const INTERNSHIP_LIST = [
  {
    id: 'job1',
    role: 'React Frontend Developer Intern',
    company: 'DevFlow Technologies',
    stipend: '₹20,000 - ₹25,000 / month',
    duration: '3 Months (Remote)',
    icon: '💻',
    skills: ['React.js', 'Bootstrap 5', 'CSS Layouts', 'REST Integration'],
    desc: 'Join our product UI development team to build next-generation glassmorphic user controls and integrate interactive chart APIs.'
  },
  {
    id: 'job2',
    role: 'Java Spring Backend Intern',
    company: 'FinSphere Systems',
    stipend: '₹25,000 - ₹30,000 / month',
    duration: '6 Months (Hybrid)',
    icon: '☕',
    skills: ['Java Core', 'Spring Boot JPA', 'SQL DB Schema', 'JUnit Testing'],
    desc: 'Collaborate on scalable data APIs, optimize entity queries, and write tests for bank transactional reconciliation servers.'
  },
  {
    id: 'job3',
    role: 'UI/UX & Product Design Intern',
    company: 'CreativeFlow Lab',
    stipend: '₹15,000 - ₹20,000 / month',
    duration: '3 Months (Remote)',
    icon: '🎨',
    skills: ['Figma', 'Grid typography', 'Wireframing', 'Color Contrast'],
    desc: 'Work closely with frontend engineers to construct components in Figma, design responsive navigation models, and review usability.'
  }
];

export default function Internships({ userEmail, onShowToast }) {
  const [jobs, setJobs] = useState(INTERNSHIP_LIST);
  const [appliedIds, setAppliedIds] = useState([]);
  const [applyingId, setApplyingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userEmail) return;
    const stored = localStorage.getItem(`applied_internships_${userEmail}`);
    if (stored) {
      setAppliedIds(JSON.parse(stored));
    }
  }, [userEmail]);

  const handleApply = (jobId) => {
    setApplyingId(jobId);
    
    // Simulate API delivery
    setTimeout(() => {
      const updated = [...appliedIds, jobId];
      setAppliedIds(updated);
      localStorage.setItem(`applied_internships_${userEmail}`, JSON.stringify(updated));
      setApplyingId(null);
      onShowToast('success', 'Application submitted! The company hiring manager has been sent your profile resume.');
    }, 1500);
  };

  const filteredJobs = jobs.filter(j => 
    j.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Internship Matchmaker</h2>
        <p className="text-muted">Explore partner developer and designer internship openings. Apply using your synced SkillSphere profile resume.</p>
      </div>

      {/* Search Filter bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="position-relative">
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          <input
            type="text"
            className="form-control rounded-pill ps-5"
            placeholder="Search roles, companies, or programming skills (e.g. React, Figma)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Internship Cards Grid */}
      <div className="row g-4">
        {filteredJobs.map(job => {
          const isApplied = appliedIds.includes(job.id);
          const isApplying = applyingId === job.id;

          return (
            <div key={job.id} className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white border" style={{ border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-1 p-2 rounded-3 bg-light border">{job.icon}</span>
                    <div>
                      <h5 className="fw-bold text-dark mb-1">{job.role}</h5>
                      <span className="text-success fw-semibold small">{job.company}</span>
                    </div>
                  </div>
                  <span className={`badge rounded-pill fw-bold text-uppercase ${
                    isApplied ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'
                  }`} style={{ fontSize: '0.65rem' }}>
                    {isApplied ? 'Applied' : 'Active'}
                  </span>
                </div>

                <div className="row g-2 mb-3 text-muted small">
                  <div className="col-sm-6">
                    <i className="bi bi-wallet2 me-2 text-success"></i>Stipend: {job.stipend}
                  </div>
                  <div className="col-sm-6">
                    <i className="bi bi-calendar-event me-2 text-success"></i>Duration: {job.duration}
                  </div>
                </div>

                <p className="text-muted small mb-3">{job.desc}</p>

                <div className="d-flex flex-wrap gap-1 mb-4">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="badge bg-light text-secondary border rounded-pill px-2 py-1 small" style={{ fontSize: '0.7rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="border-top pt-3 text-end">
                  {isApplied ? (
                    <button className="btn btn-outline-success btn-sm rounded-pill fw-bold" disabled>
                      <i className="bi bi-check-lg me-1"></i> Application Sent
                    </button>
                  ) : (
                    <button 
                      className="btn btn-success btn-sm rounded-pill fw-bold px-4" 
                      onClick={() => handleApply(job.id)}
                      disabled={isApplying}
                    >
                      {isApplying ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </span>
                      ) : 'Apply with SkillSphere Profile'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            <i className="bi bi-briefcase fs-1 mb-3 text-muted"></i>
            <p>No internships found matching your query filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
