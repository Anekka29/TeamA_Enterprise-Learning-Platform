import { useState } from 'react';

export default function ResumeBuilder({ profile }) {
  const [personal, setPersonal] = useState({
    fullName: profile?.fullName || 'Alex Webb',
    phone: profile?.phoneNumber || '555-123-4567',
    email: profile?.email || 'alex@email.com',
    linkedin: 'linkedin.com/in/alexwebbc',
    github: 'github.com/alexwebbc',
  });

  const [summary, setSummary] = useState(
    'Passionate AI/ML engineer with a strong background in deep learning, computer vision, and natural language processing. Skilled in Python, TensorFlow, PyTorch, and various ML libraries. Excellent problem-solving, research, and collaboration abilities. Seeking a challenging role to develop cutting-edge AI solutions.'
  );

  const [skills, setSkills] = useState({
    programming: 'Python, C++, SQL, MATLAB',
    frameworks: 'TensorFlow, PyTorch, Keras, Caffe',
    libraries: 'NumPy, Pandas, Scikit-learn, OpenCV, NLTK, Git, Docker',
  });

  const [projects, setProjects] = useState([
    {
      title: 'Image Captioning System',
      date: 'Jan 2023 - Present',
      subline: 'Deep Learning Project',
      techStack: 'Python, TensorFlow, OpenCV',
      bullets: [
        'Developed an end-to-end system for generating descriptive captions for images',
        'Utilized CNN and LSTM models for image feature extraction and caption generation',
        'Achieved state-of-the-art performance on the COCO dataset',
      ],
    },
    {
      title: 'Sentiment Analysis API',
      date: 'Aug 2022 - Dec 2022',
      subline: 'Natural Language Processing',
      techStack: 'Python, Flask, NLTK, Hugging Face',
      bullets: [
        'Built a RESTful API for sentiment analysis of text data',
        'Implemented pre-trained transformer models using Hugging Face',
        'Deployed the API on a cloud platform for easy integration',
      ],
    },
  ]);

  const [experiences, setExperiences] = useState([
    {
      title: 'AI Research Intern',
      date: 'June 2022 - Aug 2022',
      company: 'DeepMind',
      location: 'London, UK',
      bullets: [
        'Conducted research on reinforcement learning algorithms for robotics',
        'Implemented and evaluated deep RL models using PyTorch and Ray RLLib',
        'Presented findings at weekly research meetings',
      ],
    },
    {
      title: 'Machine Learning Engineer',
      date: 'Jan 2021 - May 2022',
      company: 'Acme AI Solutions',
      location: 'San Francisco, CA',
      bullets: [
        'Developed and deployed machine learning models for various industries',
        'Optimized model performance and ensured data quality',
        'Collaborated with cross-functional teams to deliver AI solutions',
      ],
    },
  ]);

  const [educations, setEducations] = useState([
    {
      institution: 'Stanford University',
      location: 'Stanford, CA',
      degree: 'M.S. in Computer Science, Artificial Intelligence',
      date: 'Aug 2019 - May 2021',
    },
    {
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      degree: 'B.S. in Electrical Engineering and Computer Science',
      date: 'Aug 2015 - May 2019',
    },
  ]);

  const [certifications, setCertifications] = useState([
    'AWS Certified Machine Learning - Specialty',
    'TensorFlow Developer Certificate',
  ]);

  const [activeTab, setActiveTab] = useState('personal');

  // Helper functions for dynamic entries
  const handleProjectChange = (index, field, value) => {
    const updated = [...projects];
    if (field === 'bullets') {
      updated[index].bullets = value.split('\n');
    } else {
      updated[index][field] = value;
    }
    setProjects(updated);
  };

  const addProject = () => {
    setProjects([
      ...projects,
      { title: 'New Project Name', date: 'Date Range', subline: 'Project Type', techStack: 'Tech Stack Used', bullets: ['Bullet point 1'] },
    ]);
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...experiences];
    if (field === 'bullets') {
      updated[index].bullets = value.split('\n');
    } else {
      updated[index][field] = value;
    }
    setExperiences(updated);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { title: 'Job Title', date: 'Date Range', company: 'Company Name', location: 'Location', bullets: ['Key responsibility or achievement'] },
    ]);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...educations];
    updated[index][field] = value;
    setEducations(updated);
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      { institution: 'University Name', location: 'Location', degree: 'Degree Program', date: 'Dates' },
    ]);
  };

  const removeEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    const printElement = document.getElementById('ats-resume-paper');
    if (!printElement) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${personal.fullName} - Resume</title>
          <style>
            @page { size: letter; margin: 0.5in; }
            body { 
              font-family: 'Times New Roman', Times, serif !important; 
              color: #000 !important; 
              margin: 0; 
              padding: 0;
              font-size: 11pt;
              line-height: 1.35;
            }
            .header-name { text-align: center; font-size: 24pt; font-weight: bold; margin-bottom: 4px; font-family: 'Times New Roman', Times, serif !important; text-transform: uppercase; }
            .contact-bar { text-align: center; font-size: 9.5pt; margin-bottom: 14px; font-family: 'Times New Roman', Times, serif !important; }
            .section-title { 
              font-family: 'Times New Roman', Times, serif !important; 
              font-size: 11pt; 
              font-weight: bold; 
              text-transform: uppercase; 
              border-bottom: 1.5px solid #000; 
              margin-top: 14px; 
              margin-bottom: 6px; 
              padding-bottom: 2px;
              letter-spacing: 0.05em;
            }
            .flex-between { display: flex; justify-content: space-between; align-items: baseline; }
            .entry-title { font-weight: bold; font-size: 10.5pt; }
            .entry-date { font-style: italic; font-size: 9.5pt; }
            .entry-subline { font-style: italic; font-size: 10pt; margin-bottom: 3px; }
            .skills-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
            .skills-table td { padding: 2px 0; vertical-align: top; }
            .skills-label { font-weight: bold; width: 32%; }
            ul { margin: 3px 0 8px 0; padding-left: 20px; font-size: 10pt; }
            li { margin-bottom: 2px; }
          </style>
        </head>
        <body>
          ${printElement.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">ATS Resume Builder</h2>
          <p className="text-muted mb-0">Edit your details and download/print an ATS-optimized, single-column professional resume.</p>
        </div>
        <button 
          className="btn btn-success rounded-pill fw-bold px-4 py-2 shadow-sm"
          onClick={handlePrint}
        >
          <i className="bi bi-printer-fill me-2"></i> Export & Print Resume PDF
        </button>
      </div>

      <div className="row g-4">
        {/* Editor Inputs Panel */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
            {/* Section Tab Buttons */}
            <div className="d-flex flex-wrap gap-1 mb-4 p-1 bg-light rounded-3">
              {[
                { id: 'personal', label: 'Contact' },
                { id: 'summary', label: 'Summary' },
                { id: 'skills', label: 'Skills' },
                { id: 'projects', label: 'Projects' },
                { id: 'experience', label: 'Experience' },
                { id: 'education', label: 'Education' },
                { id: 'certs', label: 'Certs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`btn btn-sm rounded-2 flex-fill fw-semibold ${activeTab === tab.id ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'}`}
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: PERSONAL CONTACT */}
            {activeTab === 'personal' && (
              <div className="row g-3">
                <h6 className="fw-bold text-dark mb-2">Header & Contact Info</h6>
                <div className="col-12">
                  <label className="form-label extra-small fw-bold text-muted">Full Name</label>
                  <input type="text" className="form-control rounded-3" value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label extra-small fw-bold text-muted">Phone Number</label>
                  <input type="text" className="form-control rounded-3" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label extra-small fw-bold text-muted">Email Address</label>
                  <input type="email" className="form-control rounded-3" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label extra-small fw-bold text-muted">LinkedIn URL</label>
                  <input type="text" className="form-control rounded-3" value={personal.linkedin} onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label extra-small fw-bold text-muted">GitHub / Portfolio URL</label>
                  <input type="text" className="form-control rounded-3" value={personal.github} onChange={(e) => setPersonal({ ...personal, github: e.target.value })} />
                </div>
              </div>
            )}

            {/* TAB 2: SUMMARY */}
            {activeTab === 'summary' && (
              <div className="row g-3">
                <h6 className="fw-bold text-dark mb-2">Professional Summary</h6>
                <div className="col-12">
                  <label className="form-label extra-small fw-bold text-muted">Summary Paragraph</label>
                  <textarea className="form-control rounded-3" rows="6" value={summary} onChange={(e) => setSummary(e.target.value)} />
                </div>
              </div>
            )}

            {/* TAB 3: SKILLS */}
            {activeTab === 'skills' && (
              <div className="row g-3">
                <h6 className="fw-bold text-dark mb-2">Technical Skills (Grouped)</h6>
                <div className="col-12">
                  <label className="form-label extra-small fw-bold text-muted">Programming Languages</label>
                  <input type="text" className="form-control rounded-3" value={skills.programming} onChange={(e) => setSkills({ ...skills, programming: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label extra-small fw-bold text-muted">Deep Learning / Frameworks</label>
                  <input type="text" className="form-control rounded-3" value={skills.frameworks} onChange={(e) => setSkills({ ...skills, frameworks: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label extra-small fw-bold text-muted">Libraries & Tools</label>
                  <input type="text" className="form-control rounded-3" value={skills.libraries} onChange={(e) => setSkills({ ...skills, libraries: e.target.value })} />
                </div>
              </div>
            )}

            {/* TAB 4: PROJECTS */}
            {activeTab === 'projects' && (
              <div className="d-flex flex-column gap-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold text-dark mb-0">Projects ({projects.length})</h6>
                  <button className="btn btn-outline-success btn-sm rounded-pill" onClick={addProject}>
                    <i className="bi bi-plus-lg me-1"></i> Add Project
                  </button>
                </div>
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-3 bg-light rounded-3 border position-relative">
                    <button type="button" className="btn-close position-absolute top-0 end-0 m-2" onClick={() => removeProject(idx)}></button>
                    <div className="row g-2">
                      <div className="col-md-7">
                        <label className="form-label extra-small fw-bold text-muted">Project Name</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={proj.title} onChange={(e) => handleProjectChange(idx, 'title', e.target.value)} />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label extra-small fw-bold text-muted">Date Range</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={proj.date} onChange={(e) => handleProjectChange(idx, 'date', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label extra-small fw-bold text-muted">Sub-Role / Project Type</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={proj.subline} onChange={(e) => handleProjectChange(idx, 'subline', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label extra-small fw-bold text-muted">Technologies Used</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={proj.techStack} onChange={(e) => handleProjectChange(idx, 'techStack', e.target.value)} />
                      </div>
                      <div className="col-12">
                        <label className="form-label extra-small fw-bold text-muted">Bullets (One per line)</label>
                        <textarea className="form-control form-control-sm rounded-2" rows="3" value={proj.bullets.join('\n')} onChange={(e) => handleProjectChange(idx, 'bullets', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="d-flex flex-column gap-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold text-dark mb-0">Experience ({experiences.length})</h6>
                  <button className="btn btn-outline-success btn-sm rounded-pill" onClick={addExperience}>
                    <i className="bi bi-plus-lg me-1"></i> Add Experience
                  </button>
                </div>
                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-3 bg-light rounded-3 border position-relative">
                    <button type="button" className="btn-close position-absolute top-0 end-0 m-2" onClick={() => removeExperience(idx)}></button>
                    <div className="row g-2">
                      <div className="col-md-7">
                        <label className="form-label extra-small fw-bold text-muted">Job Title</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={exp.title} onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)} />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label extra-small fw-bold text-muted">Date Range</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={exp.date} onChange={(e) => handleExperienceChange(idx, 'date', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label extra-small fw-bold text-muted">Company Name</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={exp.company} onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label extra-small fw-bold text-muted">Location</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={exp.location} onChange={(e) => handleExperienceChange(idx, 'location', e.target.value)} />
                      </div>
                      <div className="col-12">
                        <label className="form-label extra-small fw-bold text-muted">Bullets (One per line)</label>
                        <textarea className="form-control form-control-sm rounded-2" rows="3" value={exp.bullets.join('\n')} onChange={(e) => handleExperienceChange(idx, 'bullets', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 6: EDUCATION */}
            {activeTab === 'education' && (
              <div className="d-flex flex-column gap-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold text-dark mb-0">Education ({educations.length})</h6>
                  <button className="btn btn-outline-success btn-sm rounded-pill" onClick={addEducation}>
                    <i className="bi bi-plus-lg me-1"></i> Add Education
                  </button>
                </div>
                {educations.map((edu, idx) => (
                  <div key={idx} className="p-3 bg-light rounded-3 border position-relative">
                    <button type="button" className="btn-close position-absolute top-0 end-0 m-2" onClick={() => removeEducation(idx)}></button>
                    <div className="row g-2">
                      <div className="col-md-7">
                        <label className="form-label extra-small fw-bold text-muted">Institution / University</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={edu.institution} onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)} />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label extra-small fw-bold text-muted">Location</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={edu.location} onChange={(e) => handleEducationChange(idx, 'location', e.target.value)} />
                      </div>
                      <div className="col-md-7">
                        <label className="form-label extra-small fw-bold text-muted">Degree & Major</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={edu.degree} onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)} />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label extra-small fw-bold text-muted">Dates / Year</label>
                        <input type="text" className="form-control form-control-sm rounded-2" value={edu.date} onChange={(e) => handleEducationChange(idx, 'date', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 7: CERTIFICATIONS */}
            {activeTab === 'certs' && (
              <div className="row g-3">
                <h6 className="fw-bold text-dark mb-2">Certifications</h6>
                <div className="col-12">
                  <label className="form-label extra-small fw-bold text-muted">Certificates List (One per line)</label>
                  <textarea className="form-control rounded-3" rows="5" value={certifications.join('\n')} onChange={(e) => setCertifications(e.target.value.split('\n'))} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live ATS Resume Preview Panel */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-start overflow-auto" style={{ minHeight: '800px' }}>
            <div 
              id="ats-resume-paper" 
              className="mx-auto bg-white p-4"
              style={{
                width: '100%',
                maxWidth: '750px',
                fontFamily: "'Times New Roman', Times, serif",
                color: '#000',
                fontSize: '10.5pt',
                lineHeight: '1.35',
              }}
            >
              {/* Header Name & Contact Bar */}
              <div className="text-center mb-3">
                <h1 className="fw-bold text-uppercase mb-1" style={{ fontSize: '22pt', letterSpacing: '0.02em', fontFamily: "'Times New Roman', Times, serif" }}>
                  {personal.fullName}
                </h1>
                <div className="small text-muted" style={{ fontSize: '9.5pt', fontFamily: "'Times New Roman', Times, serif", color: '#333' }}>
                  {personal.phone} | {personal.email} | {personal.linkedin} | {personal.github}
                </div>
              </div>

              {/* SUMMARY */}
              {summary && (
                <div className="mb-3">
                  <div className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-2" style={{ fontSize: '11pt', fontFamily: "'Times New Roman', Times, serif", letterSpacing: '0.05em' }}>
                    Summary
                  </div>
                  <p className="mb-0" style={{ fontSize: '10pt', textAlign: 'justify', fontFamily: "'Times New Roman', Times, serif" }}>{summary}</p>
                </div>
              )}

              {/* TECHNICAL SKILLS */}
              {(skills.programming || skills.frameworks || skills.libraries) && (
                <div className="mb-3">
                  <div className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-2" style={{ fontSize: '11pt', fontFamily: "'Times New Roman', Times, serif", letterSpacing: '0.05em' }}>
                    Technical Skills
                  </div>
                  <table style={{ width: '100%', fontSize: '10pt', fontFamily: "'Times New Roman', Times, serif" }}>
                    <tbody>
                      {skills.programming && (
                        <tr>
                          <td style={{ fontWeight: 'bold', width: '32%', verticalAlign: 'top' }}>Programming Languages:</td>
                          <td>{skills.programming}</td>
                        </tr>
                      )}
                      {skills.frameworks && (
                        <tr>
                          <td style={{ fontWeight: 'bold', width: '32%', verticalAlign: 'top' }}>Deep Learning Frameworks:</td>
                          <td>{skills.frameworks}</td>
                        </tr>
                      )}
                      {skills.libraries && (
                        <tr>
                          <td style={{ fontWeight: 'bold', width: '32%', verticalAlign: 'top' }}>Libraries & Tools:</td>
                          <td>{skills.libraries}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PROJECTS */}
              {projects.length > 0 && (
                <div className="mb-3">
                  <div className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-2" style={{ fontSize: '11pt', fontFamily: "'Times New Roman', Times, serif", letterSpacing: '0.05em' }}>
                    Projects
                  </div>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="mb-2" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                      <div className="d-flex justify-content-between align-items-baseline">
                        <span className="fw-bold" style={{ fontSize: '10.5pt' }}>{proj.title}</span>
                        <span className="fst-italic small text-muted" style={{ fontSize: '9pt', color: '#444' }}>{proj.date}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-baseline fst-italic small text-muted mb-1" style={{ fontSize: '9.5pt', color: '#444' }}>
                        <span>{proj.subline}</span>
                        <span>{proj.techStack}</span>
                      </div>
                      {proj.bullets && proj.bullets.length > 0 && (
                        <ul className="mb-0 ps-3" style={{ fontSize: '9.5pt' }}>
                          {proj.bullets.filter(b => b.trim()).map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* EXPERIENCE */}
              {experiences.length > 0 && (
                <div className="mb-3">
                  <div className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-2" style={{ fontSize: '11pt', fontFamily: "'Times New Roman', Times, serif", letterSpacing: '0.05em' }}>
                    Experience
                  </div>
                  {experiences.map((exp, idx) => (
                    <div key={idx} className="mb-2" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                      <div className="d-flex justify-content-between align-items-baseline">
                        <span className="fw-bold" style={{ fontSize: '10.5pt' }}>{exp.title}</span>
                        <span className="fst-italic small text-muted" style={{ fontSize: '9pt', color: '#444' }}>{exp.date}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-baseline fst-italic small text-muted mb-1" style={{ fontSize: '9.5pt', color: '#444' }}>
                        <span>{exp.company}</span>
                        <span>{exp.location}</span>
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="mb-0 ps-3" style={{ fontSize: '9.5pt' }}>
                          {exp.bullets.filter(b => b.trim()).map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* EDUCATION */}
              {educations.length > 0 && (
                <div className="mb-3">
                  <div className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-2" style={{ fontSize: '11pt', fontFamily: "'Times New Roman', Times, serif", letterSpacing: '0.05em' }}>
                    Education
                  </div>
                  {educations.map((edu, idx) => (
                    <div key={idx} className="mb-2" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                      <div className="d-flex justify-content-between align-items-baseline">
                        <span className="fw-bold" style={{ fontSize: '10.5pt' }}>{edu.institution}</span>
                        <span className="fst-italic small text-muted" style={{ fontSize: '9pt', color: '#444' }}>{edu.location}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-baseline fst-italic small text-muted" style={{ fontSize: '9.5pt', color: '#444' }}>
                        <span>{edu.degree}</span>
                        <span>{edu.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CERTIFICATIONS */}
              {certifications.length > 0 && certifications.some(c => c.trim()) && (
                <div className="mb-3">
                  <div className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-2" style={{ fontSize: '11pt', fontFamily: "'Times New Roman', Times, serif", letterSpacing: '0.05em' }}>
                    Certifications
                  </div>
                  <ul className="mb-0 ps-3" style={{ fontSize: '9.5pt', fontFamily: "'Times New Roman', Times, serif" }}>
                    {certifications.filter(c => c.trim()).map((cert, idx) => (
                      <li key={idx}>{cert.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
