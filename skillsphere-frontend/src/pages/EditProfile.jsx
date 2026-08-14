import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import ProfileService from '../services/ProfileService';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../constants/routes';
import { getRoleSidebarLinks } from '../constants/studentSidebarLinks';
import Toast from '../components/Toast';
import '../styles/dashboard-layout.css';

export default function EditProfile() {
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

    try {
      const mediaFormData = new FormData();
      mediaFormData.append('file', file);
      const uploadRes = await apiClient.post('/api/media/upload', mediaFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (uploadRes.data && uploadRes.data.url) {
        setFormData((prev) => ({ ...prev, profileImage: uploadRes.data.url }));
        showToast('Profile picture uploaded successfully!', 'success');
        window.dispatchEvent(new Event('profileUpdated'));
        return;
      }
    } catch (uploadErr) {
      console.warn('Media upload endpoint fallback to Data URL', uploadErr);
    }

    // Local Data URL fallback if backend upload is unreachable
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      showToast('Profile image updated!', 'success');
      window.dispatchEvent(new Event('profileUpdated'));
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
        {/* Progress Steps */}
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
          {/* Step 1: Personal Information */}
          {activeStep === 1 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
                <i className="bi bi-person-badge text-success me-2"></i>Personal Information
              </h3>
              
              {/* Profile Image Container */}
              <div className="col-12 mb-4">
                <label className="form-label fw-bold text-dark d-block mb-2">
                  <i className="bi bi-camera text-success me-1"></i>Profile Picture
                </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-person-fill text-success me-1"></i>Full Name <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-envelope-fill text-success me-1"></i>Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    className="form-control rounded-3 bg-light"
                    value={formData.email || user?.email || ''}
                    readOnly
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-telephone-fill text-success me-1"></i>Phone Number <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-geo-alt-fill text-success me-1"></i>Location
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-file-text-fill text-success me-1"></i>Personal Bio
                  </label>
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

          {/* Step 2: Academic Information */}
          {activeStep === 2 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
                <i className="bi bi-mortarboard-fill text-success me-2"></i>Academic Information
              </h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-building text-success me-1"></i>College / University <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-journal-bookmark-fill text-success me-1"></i>Degree / Program
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-diagram-3-fill text-success me-1"></i>Department / Branch <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-calendar-range-fill text-success me-1"></i>Current Year / Semester <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-calendar-check-fill text-success me-1"></i>Expected Graduation Year
                  </label>
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

          {/* Step 3: Skills & Career Goals */}
          {activeStep === 3 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
                <i className="bi bi-lightbulb-fill text-success me-2"></i>Skills & Career Goals
              </h3>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-tools text-success me-1"></i>Skills (comma-separated)
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-star-fill text-success me-1"></i>Interests (comma-separated)
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-bullseye text-success me-1"></i>Career Goal / Target Role
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-book-half text-success me-1"></i>Preferred Learning Topics (comma-separated)
                  </label>
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

          {/* Step 4: Professional Links */}
          {activeStep === 4 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
                <i className="bi bi-link-45deg text-success me-2"></i>Professional Links
              </h3>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-linkedin text-success me-1"></i>LinkedIn URL
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-github text-success me-1"></i>GitHub URL
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-globe text-success me-1"></i>Portfolio URL
                  </label>
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

          {/* Navigation Buttons */}
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
        {/* Progress Steps */}
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
          {/* Step 1: Personal Information */}
          {activeStep === 1 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
                <i className="bi bi-person-badge text-success me-2"></i>Personal Information
              </h3>
              
              {/* Profile Image Container */}
              <div className="col-12 mb-4">
                <label className="form-label fw-bold text-dark d-block mb-2">
                  <i className="bi bi-camera text-success me-1"></i>Profile Picture
                </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-person-fill text-success me-1"></i>Full Name <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-envelope-fill text-success me-1"></i>Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    className="form-control rounded-3 bg-light"
                    value={formData.email || user?.email || ''}
                    readOnly
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-telephone-fill text-success me-1"></i>Phone Number
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-file-text-fill text-success me-1"></i>Professional Bio
                  </label>
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

          {/* Step 2: Professional Experience */}
          {activeStep === 2 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
                <i className="bi bi-briefcase-fill text-success me-2"></i>Professional Experience
              </h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-person-workspace text-success me-1"></i>Current Job Title <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-building text-success me-1"></i>Company / Organization <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-clock-history text-success me-1"></i>Years of Experience
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-star-fill text-success me-1"></i>Area of Expertise (comma-separated)
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-tools text-success me-1"></i>Core Skills (comma-separated)
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-award-fill text-success me-1"></i>Specializations (comma-separated)
                  </label>
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

          {/* Step 3: Mentorship Preferences */}
          {activeStep === 3 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
                <i className="bi bi-people-fill text-success me-2"></i>Mentorship Preferences
              </h3>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-journal-richtext text-success me-1"></i>Topics You Can Mentor (comma-separated)
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-chat-quote-fill text-success me-1"></i>Mentoring & Teaching Background
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-camera-video-fill text-success me-1"></i>Preferred Mentoring Mode
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-calendar-check-fill text-success me-1"></i>Availability Summary & Working Hours
                  </label>
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

          {/* Step 4: Professional Links & Credentials */}
          {activeStep === 4 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
                <i className="bi bi-link-45deg text-success me-2"></i>Professional Links & Credentials
              </h3>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-linkedin text-success me-1"></i>LinkedIn Profile URL
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-github text-success me-1"></i>GitHub Profile URL
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-globe text-success me-1"></i>Portfolio / Website URL
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-patch-check-fill text-success me-1"></i>Certifications & Licenses (comma-separated)
                  </label>
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
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    <i className="bi bi-trophy-fill text-success me-1"></i>Key Achievements & Honors
                  </label>
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

          {/* Navigation Buttons */}
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
        {/* Progress Steps */}
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
          {/* Step 1: Personal Information */}
          {activeStep === 1 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
              <h3 className="fs-5 fw-bold text-dark mb-4">Personal Information</h3>
              
              {/* Profile Image Container */}
              <div className="col-12 mb-4">
                <label className="form-label fw-bold text-dark d-block mb-2">
                  <i className="bi bi-camera text-success me-1"></i>Profile Picture
                </label>
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

          {/* Step 2: Administrative Details */}
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

          {/* Navigation Buttons */}
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
  const sidebarLinks = getRoleSidebarLinks(role, 'Profile');

  return (
    <div className="dashboard-wrapper-sim">
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        navigationItems={sidebarLinks}
        user={user}
        role={role}
        activeRoute="/profile/edit"
        searchPlaceholder="Search courses, roadmaps, mentors..."
      >
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

          {/* Missing Fields Warning */}
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

          {/* Role-specific Form */}
          {role === 'STUDENT' && renderStudentForm()}
          {role === 'MENTOR' && renderMentorForm()}
          {role === 'ADMIN' && renderAdminForm()}
        </div>
      </DashboardLayout>
    </div>
  );
}
