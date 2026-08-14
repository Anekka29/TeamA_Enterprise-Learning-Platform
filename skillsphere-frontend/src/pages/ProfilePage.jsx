import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import ProfileService from '../services/ProfileService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../constants/routes';
import Toast from '../components/Toast';
import '../styles/dashboard-layout.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  
  // Form state based on role
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await ProfileService.getCurrentProfile();
      setProfileData(response.data);
      
      // Initialize form data based on existing profile
      if (response.data) {
        const baseUser = {
          fullName: response.data.fullName || user?.name || '',
          email: response.data.email || user?.email || '',
          profileImage: response.data.profileImage || user?.profileImage || '',
        };
        const pData = response.data.profileData || {};
        setFormData({ ...baseUser, ...pData });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(true);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      showToast('Profile image updated!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfileImage = async () => {
    try {
      setSaving(true);
      const updatedFormData = { ...formData, profileImage: '' };
      setFormData(updatedFormData);

      const role = (user?.role || profileData?.role || 'STUDENT').toUpperCase();
      let response;
      if (role === 'STUDENT') {
        response = await ProfileService.updateStudentProfile(updatedFormData);
      } else if (role === 'MENTOR') {
        response = await ProfileService.updateMentorProfile(updatedFormData);
      } else if (role === 'ADMIN') {
        response = await ProfileService.updateAdminProfile(updatedFormData);
      }

      if (response?.data) {
        setProfileData(response.data);
      }
      if (refreshUser) {
        await refreshUser();
      }
      window.dispatchEvent(new Event('profileUpdated'));
      showToast('Profile picture permanently removed from database.', 'success');
    } catch (err) {
      console.error('Failed to remove profile picture:', err);
      showToast('Failed to remove profile picture from database.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const role = (user?.role || profileData?.role || 'STUDENT').toUpperCase();
    const name = formData.fullName?.trim();
    const phone = formData.phoneNumber?.trim();

    if (!name) {
      showToast('Full Name is required.', 'error');
      return;
    }

    if (phone) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;
      if (!phoneRegex.test(phone)) {
        showToast('Please enter a valid Phone Number (7 to 15 digits).', 'error');
        return;
      }
    }

    if (role === 'STUDENT') {
      const college = formData.college?.trim();
      const department = formData.department?.trim();
      const year = (formData.currentYear || formData.year)?.toString()?.trim();
      if (!college) {
        showToast('College / University is required for students.', 'error');
        return;
      }
      if (!department) {
        showToast('Department is required for students.', 'error');
        return;
      }
      if (!year) {
        showToast('Current Year is required for students.', 'error');
        return;
      }
    } else if (role === 'MENTOR') {
      const organization = formData.organization?.trim();
      const jobTitle = formData.jobTitle?.trim();
      if (!organization) {
        showToast('Company / Organization is required for mentors.', 'error');
        return;
      }
      if (!jobTitle) {
        showToast('Job Title is required for mentors.', 'error');
        return;
      }
    } else if (role === 'ADMIN') {
      const designation = formData.designation?.trim();
      const department = formData.department?.trim();
      if (!designation) {
        showToast('Designation is required for admins.', 'error');
        return;
      }
      if (!department) {
        showToast('Department is required for admins.', 'error');
        return;
      }
    }

    setSaving(true);
    
    try {
      let response;
      if (role === 'STUDENT') {
        response = await ProfileService.updateStudentProfile(formData);
      } else if (role === 'MENTOR') {
        response = await ProfileService.updateMentorProfile(formData);
      } else if (role === 'ADMIN') {
        response = await ProfileService.updateAdminProfile(formData);
      }
      
      setProfileData(response.data);
      if (refreshUser) {
        await refreshUser();
      }
      window.dispatchEvent(new Event('profileUpdated'));
      showToast('Profile updated successfully!', 'success');
      navigate(ROUTES.MY_PROFILE);
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast(err?.response?.data?.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderStudentForm = () => {
    const steps = [
      { title: 'Personal Information', icon: 'bi-person' },
      { title: 'Academic Information', icon: 'bi-mortarboard' },
      { title: 'Skills & Career Goals', icon: 'bi-lightbulb' },
      { title: 'Professional Links', icon: 'bi-link-45deg' }
    ];

    return (
      <div className="fade-in-quick">
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {steps.map((step, index) => (
              <div key={index} className="d-flex align-items-center" style={{ flex: 1 }}>
                <div className={`step-indicator ${activeStep === index + 1 ? 'active' : activeStep > index + 1 ? 'completed' : ''}`}>
                  <i className={`bi ${step.icon}`}></i>
                </div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between">
            {steps.map((step, index) => (
              <small key={index} className={`step-label ${activeStep === index + 1 ? 'active' : ''}`}>
                {step.title}
              </small>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave}>
          {activeStep === 1 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Personal Information</h3>
              
              <div className="col-12 mb-4">
                <label className="form-label small fw-bold">Profile Picture</label>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <div className="profile-img-preview rounded-circle border border-2 border-success-subtle overflow-hidden d-flex align-items-center justify-content-center bg-light shadow-sm position-relative" style={{ width: '84px', height: '84px', flexShrink: 0 }}>
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-person fs-1 text-muted"></i>
                    )}
                  </div>
                  <div className="d-flex flex-column gap-2 flex-grow-1" style={{ maxWidth: '420px' }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <input type="file" accept="image/*" className="form-control form-control-sm rounded-3" onChange={handleImageFileChange} style={{ maxWidth: '280px' }} />
                      {formData.profileImage && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-3 px-3 fw-bold d-flex align-items-center gap-1 shadow-xs"
                          onClick={handleRemoveProfileImage}
                          title="Remove profile picture"
                        >
                          <i className="bi bi-trash-fill"></i> Remove Photo
                        </button>
                      )}
                    </div>
                    <small className="text-muted d-block">JPG, PNG, or WEBP (Max 5MB)</small>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Alex Johnson"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Email Address (Read-only)</label>
                  <input
                    type="email"
                    className="form-control rounded-3 bg-light"
                    value={formData.email || user?.email || ''}
                    readOnly
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Phone Number <span className="text-danger">*</span></label>
                  <input
                    type="tel"
                    className="form-control rounded-3"
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Location</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Mumbai, India"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Personal Bio</label>
                  <textarea
                    className="form-control rounded-3"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Academic Information</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">College / University <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="college"
                    value={formData.college || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. National Institute of Technology"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Degree / Program</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="degree"
                    value={formData.degree || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. B.Tech in Computer Science"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Department / Branch <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Computer Science & Engineering"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Current Year / Semester <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="currentYear"
                    value={formData.currentYear || formData.year || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 3rd Year"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Expected Graduation Year</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    name="graduationYear"
                    value={formData.graduationYear || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 2026"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Skills & Career Goals</h3>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">Skills (comma-separated)</label>
                  <textarea
                    className="form-control rounded-3"
                    name="skills"
                    value={formData.skills || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g. Java, Python, React, Data Structures, SQL"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Interests (comma-separated)</label>
                  <textarea
                    className="form-control rounded-3"
                    name="interests"
                    value={formData.interests || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g. Web Development, Machine Learning, Open Source"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Career Goal / Target Role</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="careerGoal"
                    value={formData.careerGoal || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Full Stack Developer, Data Scientist"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Preferred Learning Topics (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="preferredLearningTopics"
                    value={formData.preferredLearningTopics || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Microservices, Cloud Native, System Architecture"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Professional Links</h3>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-bold">LinkedIn URL</label>
                  <input
                    type="url"
                    className="form-control rounded-3"
                    name="linkedinUrl"
                    value={formData.linkedinUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">GitHub URL</label>
                  <input
                    type="url"
                    className="form-control rounded-3"
                    name="githubUrl"
                    value={formData.githubUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Portfolio URL</label>
                  <input
                    type="url"
                    className="form-control rounded-3"
                    name="portfolioUrl"
                    value={formData.portfolioUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-3 px-4"
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
            >
              <i className="bi bi-arrow-left me-2"></i> Previous
            </button>
            {activeStep < steps.length ? (
              <button
                type="button"
                className="btn btn-success rounded-3 px-4"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Next <i className="bi bi-arrow-right ms-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary rounded-3 px-4"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i> Save Profile
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };

  const renderMentorForm = () => {
    const steps = [
      { title: 'Personal Information', icon: 'bi-person' },
      { title: 'Professional Experience', icon: 'bi-briefcase' },
      { title: 'Mentorship Preferences', icon: 'bi-people' },
      { title: 'Professional Links', icon: 'bi-link-45deg' }
    ];

    return (
      <div className="fade-in-quick">
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {steps.map((step, index) => (
              <div key={index} className="d-flex align-items-center" style={{ flex: 1 }}>
                <div className={`step-indicator ${activeStep === index + 1 ? 'active' : activeStep > index + 1 ? 'completed' : ''}`}>
                  <i className={`bi ${step.icon}`}></i>
                </div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between">
            {steps.map((step, index) => (
              <small key={index} className={`step-label ${activeStep === index + 1 ? 'active' : ''}`}>
                {step.title}
              </small>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave}>
          {activeStep === 1 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Personal Information</h3>
              
              <div className="col-12 mb-4">
                <label className="form-label small fw-bold">Profile Picture</label>
                <div className="d-flex align-items-center gap-3">
                  <div className="profile-img-preview rounded-circle border overflow-hidden d-flex align-items-center justify-content-center bg-light" style={{ width: '80px', height: '80px' }}>
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-person fs-1 text-muted"></i>
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" className="form-control form-control-sm rounded-3 mb-1" onChange={handleImageFileChange} />
                    <small className="text-muted d-block">JPG, PNG, or WEBP (Max 5MB)</small>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Email Address (Read-only)</label>
                  <input
                    type="email"
                    className="form-control rounded-3 bg-light"
                    value={formData.email || user?.email || ''}
                    readOnly
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control rounded-3"
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Professional Bio</label>
                  <textarea
                    className="form-control rounded-3"
                    name="professionalBio"
                    value={formData.professionalBio || ''}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe your professional background and expertise..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Professional Experience</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Current Job Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="jobTitle"
                    value={formData.jobTitle || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Company / Organization <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="organization"
                    value={formData.organization || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Google, Microsoft, Startup"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Years of Experience</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 5"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Area of Expertise (comma-separated)</label>
                  <textarea
                    className="form-control rounded-3"
                    name="expertise"
                    value={formData.expertise || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g. Java, Spring Boot, Microservices, System Design"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Core Skills (comma-separated)</label>
                  <textarea
                    className="form-control rounded-3"
                    name="skills"
                    value={formData.skills || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g. Java, React, Python, AWS, Kubernetes"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Specializations (comma-separated)</label>
                  <textarea
                    className="form-control rounded-3"
                    name="specializations"
                    value={formData.specializations || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g. Backend Development, Cloud Architecture, API Design"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Mentorship Preferences</h3>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">Topics You Can Mentor (comma-separated)</label>
                  <textarea
                    className="form-control rounded-3"
                    name="mentoringTopics"
                    value={formData.mentoringTopics || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g. Java Development, System Design, Career Guidance"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Mentoring & Teaching Background</label>
                  <textarea
                    className="form-control rounded-3"
                    name="mentoringExperience"
                    value={formData.mentoringExperience || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe your previous mentoring experience..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Preferred Mentoring Mode</label>
                  <select
                    className="form-select rounded-3"
                    name="preferredMentoringMode"
                    value={formData.preferredMentoringMode || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select mode</option>
                    <option value="Video Call">Video Call</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Email/Chat">Email/Chat</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Availability Summary & Working Hours</label>
                  <textarea
                    className="form-control rounded-3"
                    name="availabilitySummary"
                    value={formData.availabilitySummary || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g. Available weekdays 6-9 PM IST, weekends flexible"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Professional Links & Credentials</h3>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-bold">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    className="form-control rounded-3"
                    name="linkedinUrl"
                    value={formData.linkedinUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">GitHub Profile URL</label>
                  <input
                    type="url"
                    className="form-control rounded-3"
                    name="githubUrl"
                    value={formData.githubUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Portfolio / Website URL</label>
                  <input
                    type="url"
                    className="form-control rounded-3"
                    name="portfolioUrl"
                    value={formData.portfolioUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Certifications & Licenses (comma-separated)</label>
                  <textarea
                    className="form-control rounded-3"
                    name="certifications"
                    value={formData.certifications || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g. AWS Solutions Architect, Oracle Java Certified"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Key Achievements & Honors</label>
                  <textarea
                    className="form-control rounded-3"
                    name="achievements"
                    value={formData.achievements || ''}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="List your key professional achievements..."
                  />
                </div>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-3 px-4"
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
            >
              <i className="bi bi-arrow-left me-2"></i> Previous
            </button>
            {activeStep < steps.length ? (
              <button
                type="button"
                className="btn btn-success rounded-3 px-4"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Next <i className="bi bi-arrow-right ms-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary rounded-3 px-4"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i> Save Profile
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };

  const renderAdminForm = () => {
    const steps = [
      { title: 'Personal Information', icon: 'bi-person' },
      { title: 'Administrative Details', icon: 'bi-shield-lock' }
    ];

    return (
      <div className="fade-in-quick">
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {steps.map((step, index) => (
              <div key={index} className="d-flex align-items-center" style={{ flex: 1 }}>
                <div className={`step-indicator ${activeStep === index + 1 ? 'active' : activeStep > index + 1 ? 'completed' : ''}`}>
                  <i className={`bi ${step.icon}`}></i>
                </div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between">
            {steps.map((step, index) => (
              <small key={index} className={`step-label ${activeStep === index + 1 ? 'active' : ''}`}>
                {step.title}
              </small>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave}>
          {activeStep === 1 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Personal Information</h3>
              
              <div className="col-12 mb-4">
                <label className="form-label small fw-bold">Profile Picture</label>
                <div className="d-flex align-items-center gap-3">
                  <div className="profile-img-preview rounded-circle border overflow-hidden d-flex align-items-center justify-content-center bg-light" style={{ width: '80px', height: '80px' }}>
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-person fs-1 text-muted"></i>
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" className="form-control form-control-sm rounded-3 mb-1" onChange={handleImageFileChange} />
                    <small className="text-muted d-block">JPG, PNG, or WEBP (Max 5MB)</small>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Admin Administrator"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Email Address (Read-only)</label>
                  <input
                    type="email"
                    className="form-control rounded-3 bg-light"
                    value={formData.email || user?.email || ''}
                    readOnly
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control rounded-3"
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    className="form-control rounded-3"
                    name="linkedinUrl"
                    value={formData.linkedinUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Administrative Bio</label>
                  <textarea
                    className="form-control rounded-3"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Tell us about your role and platform oversight responsibilities..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Administrative Details</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Designation / Role Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="designation"
                    value={formData.designation || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Lead Platform Administrator"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Department / Division <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Operations & Tech Management"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Organization / Institute</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="organization"
                    value={formData.organization || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Enterprise Learning Platform with Skill and Career Guidance System"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Admin System Identifier (ID)</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="adminIdentifier"
                    value={formData.adminIdentifier || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. ADM-001"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-3 px-4"
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
            >
              <i className="bi bi-arrow-left me-2"></i> Previous
            </button>
            {activeStep < steps.length ? (
              <button
                type="button"
                className="btn btn-success rounded-3 px-4"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Next <i className="bi bi-arrow-right ms-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary rounded-3 px-4"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i> Save Profile
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };

  if (loading) return <LoadingOverlay visible />;
  if (error) return <ErrorOverlay visible />;

  const role = (user?.role || profileData?.role || 'STUDENT').toUpperCase();
  const isProfileComplete = profileData?.profileCompleted || false;

  return (
    <DashboardLayout>
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <style>{`
        .step-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #6c757d;
          transition: all 0.3s ease;
        }
        .step-indicator.active {
          background: #10b981;
          color: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }
        .step-indicator.completed {
          background: #10b981;
          color: white;
        }
        .step-connector {
          flex: 1;
          height: 2px;
          background: #e9ecef;
          margin: 0 8px;
        }
        .step-label {
          font-size: 0.75rem;
          color: #6c757d;
          text-align: center;
          flex: 1;
        }
        .step-label.active {
          color: #10b981;
          font-weight: 600;
        }
      `}</style>

      <div className="fade-in-quick">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="fw-bold text-dark mb-2">
              {isProfileComplete ? 'Edit Profile' : 'Complete Your Profile'}
            </h1>
            <p className="text-muted mb-0">
              {role === 'STUDENT' && 'Update your student profile to get personalized learning recommendations.'}
              {role === 'MENTOR' && 'Update your mentor profile to connect with students effectively.'}
              {role === 'ADMIN' && 'Update your admin profile for platform management.'}
            </p>
          </div>
          <button
            className="btn btn-outline-secondary rounded-3 px-4"
            onClick={() => navigate(ROUTES.MY_PROFILE)}
          >
            <i className="bi bi-arrow-left me-2"></i> Back
          </button>
        </div>

        {!isProfileComplete && profileData?.missingRequiredFields?.length > 0 && (
          <div className="alert alert-warning border-0 rounded-4 mb-4 d-flex align-items-center gap-3">
            <i className="bi bi-exclamation-triangle-fill fs-4"></i>
            <div>
              <strong className="text-dark">Missing Required Fields:</strong>
              <div className="small text-dark mt-1">
                {profileData.missingRequiredFields.join(', ')}
              </div>
            </div>
          </div>
        )}

        {role === 'STUDENT' && renderStudentForm()}
        {role === 'MENTOR' && renderMentorForm()}
        {role === 'ADMIN' && renderAdminForm()}
      </div>
    </DashboardLayout>
  );
}
