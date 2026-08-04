import { useState } from 'react';

export default function ResumeBuilder({ profile }) {
  const [form, setForm] = useState({
    fullName: profile?.fullName || 'Alex Student',
    title: 'Junior Software Engineer',
    email: profile?.email || 'alex@skillsphere.com',
    phone: profile?.phoneNumber || '+91 98765 43210',
    website: 'https://github.com/alex-skillsphere',
    summary: 'Enthusiastic and detail-oriented engineer passionate about Full-Stack web services, relational database structures, and dynamic frontend components.',
    skills: 'React.js, Java Spring Boot, JavaScript (ES6), HTML/CSS, SQL database integration',
    experience: 'Academic Capstone Project Lead - SkillSphere Institute (2025)\n- Directed architectural layouts for learning modules and state integrations.\n- Configured relational entity schemas and user role logic.',
    education: `${profile?.college || 'SkillSphere Institute of Technology'}\n${profile?.department || 'Computer Science & Engineering'} (${profile?.year || '3rd Year'})`
  });

  const handlePrint = () => {
    // Print logic focusing on the preview container
    const printContent = document.getElementById('resume-preview-panel').innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Simple window replace to print clean document layout
    document.body.innerHTML = `
      <html>
        <head>
          <title>Resume - ${form.fullName}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
          <style>
            body { padding: 40px; font-family: 'Georgia', serif; }
            .resume-section-title { border-bottom: 2px solid #10b981; margin-bottom: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;
    window.print();
    window.location.reload(); // Reload to restore react states
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Interactive Resume Builder</h2>
        <p className="text-muted">Fill out your professional credentials and instantly download or print a premium, structured resume.</p>
      </div>

      <div className="row g-4">
        {/* Editor Inputs Form */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-4">Resume Fields</h5>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold">Full Name</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Professional Title</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Email</label>
                <input 
                  type="email" 
                  className="form-control rounded-3" 
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Phone</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Portfolio / Github URL</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Professional Summary</label>
                <textarea 
                  className="form-control rounded-3" 
                  rows="3"
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Core Competencies / Skills (comma separated)</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Projects & Experience</label>
                <textarea 
                  className="form-control rounded-3" 
                  rows="4"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Education Details</label>
                <textarea 
                  className="form-control rounded-3" 
                  rows="3"
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                />
              </div>
            </div>
            
            <button 
              className="btn btn-success rounded-pill fw-bold w-100 mt-4 py-2"
              onClick={handlePrint}
            >
              <i className="bi bi-printer me-2"></i> Export & Print PDF
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="col-lg-7">
          <div 
            className="card border-0 shadow-sm rounded-4 p-5 bg-white border text-start"
            style={{ 
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)', 
              minHeight: '750px',
              fontFamily: 'Georgia, serif' 
            }}
          >
            <div id="resume-preview-panel">
              {/* Header */}
              <div className="text-center border-bottom pb-4 mb-4">
                <h2 className="fw-bold mb-1" style={{ color: '#0d4a3a' }}>{form.fullName}</h2>
                <div className="text-muted fw-bold text-uppercase tracking-wider small mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>{form.title}</div>
                <div className="d-flex justify-content-center gap-3 flex-wrap small text-muted">
                  <span><i className="bi bi-envelope me-1 text-success"></i>{form.email}</span>
                  <span><i className="bi bi-telephone me-1 text-success"></i>{form.phone}</span>
                  <span><i className="bi bi-globe me-1 text-success"></i>{form.website}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-4">
                <h5 className="fw-bold mb-2 text-uppercase text-success" style={{ fontSize: '0.9rem', borderBottom: '2px solid #e6f7f2', pb: '4px', letterSpacing: '0.05em' }}>Profile Summary</h5>
                <p className="small text-dark" style={{ lineHeight: '1.6' }}>{form.summary}</p>
              </div>

              {/* Core Skills */}
              <div className="mb-4">
                <h5 className="fw-bold mb-2 text-uppercase text-success" style={{ fontSize: '0.9rem', borderBottom: '2px solid #e6f7f2', pb: '4px', letterSpacing: '0.05em' }}>Technical Competencies</h5>
                <div className="d-flex flex-wrap gap-2">
                  {form.skills.split(',').map((skill, index) => (
                    <span 
                      key={index} 
                      className="badge bg-light border text-dark rounded-pill px-3 py-2 small fw-semibold"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="mb-4">
                <h5 className="fw-bold mb-2 text-uppercase text-success" style={{ fontSize: '0.9rem', borderBottom: '2px solid #e6f7f2', pb: '4px', letterSpacing: '0.05em' }}>Experience & Academic Capstones</h5>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.85rem', color: '#333' }}>
                  {form.experience}
                </div>
              </div>

              {/* Education */}
              <div className="mb-4">
                <h5 className="fw-bold mb-2 text-uppercase text-success" style={{ fontSize: '0.9rem', borderBottom: '2px solid #e6f7f2', pb: '4px', letterSpacing: '0.05em' }}>Education</h5>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.85rem', color: '#333' }}>
                  {form.education}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
