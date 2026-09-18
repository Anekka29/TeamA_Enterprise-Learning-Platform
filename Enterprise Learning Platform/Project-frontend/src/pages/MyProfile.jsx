import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import ProfileService from '../services/ProfileService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../constants/routes';
import { getRoleSidebarLinks } from '../constants/studentSidebarLinks';
import Toast from '../components/Toast';
import '../styles/dashboard-layout.css';

function ProfileFieldDisplay({ label, value, icon, isLink = false }) {
  return (
    <div className="p-3 bg-light rounded-4 border text-start h-100 shadow-sm">
      <div className="text-uppercase text-muted fw-bold mb-1 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
        {icon && <i className={`bi ${icon} text-success fs-6`}></i>}
        <span>{label}</span>
      </div>
      <div className="fw-semibold text-dark fs-6 text-break">
        {isLink && value && value !== '-' ? (
          <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-success text-decoration-underline fw-bold">
            {value} <i className="bi bi-box-arrow-up-right ms-1 small"></i>
          </a>
        ) : (
          value || <span className="text-muted fw-normal fst-italic">Not provided</span>
        )}
      </div>
    </div>
  );
}

export default function MyProfile() {
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await ProfileService.getCurrentProfile();
      setProfileData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(true);
      setLoading(false);
    }
  };

  const renderStudentProfile = () => {
    const pd = profileData.profileData || {};
    return (
      <div className="fade-in-quick">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
          <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
            <i className="bi bi-person-badge text-success me-2"></i>Personal Information
          </h3>
          <div className="row g-3">
            <div className="col-md-6">
              <ProfileFieldDisplay label="Full Name" value={profileData.fullName} icon="bi-person-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Email Address" value={profileData.email} icon="bi-envelope-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Phone Number" value={pd.phoneNumber} icon="bi-telephone-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Location" value={pd.location} icon="bi-geo-alt-fill" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Bio / Summary" value={pd.bio} icon="bi-file-text-fill" />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
          <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
            <i className="bi bi-mortarboard-fill text-success me-2"></i>Academic Information
          </h3>
          <div className="row g-3">
            <div className="col-md-6">
              <ProfileFieldDisplay label="College / University" value={pd.college} icon="bi-building" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Degree / Program" value={pd.degree} icon="bi-journal-bookmark-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Department / Major" value={pd.department} icon="bi-diagram-3-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Academic Year" value={pd.currentYear} icon="bi-calendar-range-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Graduation Year" value={pd.graduationYear} icon="bi-calendar-check-fill" />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
          <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
            <i className="bi bi-lightbulb-fill text-success me-2"></i>Skills & Career Goals
          </h3>
          <div className="row g-3">
            <div className="col-12">
              <ProfileFieldDisplay label="Skills & Technical Expertise" value={pd.skills} icon="bi-tools" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Areas of Interest" value={pd.interests} icon="bi-star-fill" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Target Career Goal" value={pd.careerGoal} icon="bi-bullseye" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Preferred Learning Topics" value={pd.preferredLearningTopics} icon="bi-book-half" />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
          <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
            <i className="bi bi-link-45deg text-success me-2"></i>Professional Links
          </h3>
          <div className="row g-3">
            <div className="col-md-4">
              <ProfileFieldDisplay label="LinkedIn Profile" value={pd.linkedinUrl} icon="bi-linkedin" isLink={true} />
            </div>
            <div className="col-md-4">
              <ProfileFieldDisplay label="GitHub Profile" value={pd.githubUrl} icon="bi-github" isLink={true} />
            </div>
            <div className="col-md-4">
              <ProfileFieldDisplay label="Portfolio Website" value={pd.portfolioUrl} icon="bi-globe" isLink={true} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMentorProfile = () => {
    const pd = profileData.profileData || {};
    return (
      <div className="fade-in-quick">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
          <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
            <i className="bi bi-person-badge text-success me-2"></i>Personal Information
          </h3>
          <div className="row g-3">
            <div className="col-md-6">
              <ProfileFieldDisplay label="Full Name" value={profileData.fullName} icon="bi-person-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Email Address" value={profileData.email} icon="bi-envelope-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Phone Number" value={pd.phoneNumber} icon="bi-telephone-fill" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Professional Bio" value={pd.professionalBio} icon="bi-file-text-fill" />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
          <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
            <i className="bi bi-briefcase-fill text-success me-2"></i>Professional Experience
          </h3>
          <div className="row g-3">
            <div className="col-md-6">
              <ProfileFieldDisplay label="Job Title" value={pd.jobTitle} icon="bi-person-workspace" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Organization / Company" value={pd.organization} icon="bi-building" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Years of Experience" value={pd.yearsOfExperience} icon="bi-clock-history" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Primary Expertise" value={pd.expertise} icon="bi-star-fill" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Core Skills" value={pd.skills} icon="bi-tools" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Domain Specializations" value={pd.specializations} icon="bi-award-fill" />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
          <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
            <i className="bi bi-people-fill text-success me-2"></i>Mentorship Preferences
          </h3>
          <div className="row g-3">
            <div className="col-12">
              <ProfileFieldDisplay label="Mentoring Topics" value={pd.mentoringTopics} icon="bi-journal-richtext" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Mentoring Background" value={pd.mentoringExperience} icon="bi-chat-quote-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Preferred Mentoring Mode" value={pd.preferredMentoringMode} icon="bi-camera-video-fill" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Availability Summary" value={pd.availabilitySummary} icon="bi-calendar-check-fill" />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
          <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
            <i className="bi bi-link-45deg text-success me-2"></i>Professional Links & Achievements
          </h3>
          <div className="row g-3">
            <div className="col-md-4">
              <ProfileFieldDisplay label="LinkedIn Profile" value={pd.linkedinUrl} icon="bi-linkedin" isLink={true} />
            </div>
            <div className="col-md-4">
              <ProfileFieldDisplay label="GitHub Profile" value={pd.githubUrl} icon="bi-github" isLink={true} />
            </div>
            <div className="col-md-4">
              <ProfileFieldDisplay label="Portfolio Website" value={pd.portfolioUrl} icon="bi-globe" isLink={true} />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Certifications" value={pd.certifications} icon="bi-patch-check-fill" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Achievements & Awards" value={pd.achievements} icon="bi-trophy-fill" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminProfile = () => {
    const pd = profileData.profileData || {};
    return (
      <div className="fade-in-quick">
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
          <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
            <i className="bi bi-person-badge text-success me-2"></i>Personal Information
          </h3>
          <div className="row g-3">
            <div className="col-md-6">
              <ProfileFieldDisplay label="Full Name" value={profileData.fullName} icon="bi-person-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Email Address" value={profileData.email} icon="bi-envelope-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Phone Number" value={pd.phoneNumber} icon="bi-telephone-fill" />
            </div>
            <div className="col-12">
              <ProfileFieldDisplay label="Bio / Summary" value={pd.bio} icon="bi-file-text-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="LinkedIn Profile" value={pd.linkedinUrl} icon="bi-linkedin" isLink={true} />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
          <h3 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-3">
            <i className="bi bi-shield-lock-fill text-success me-2"></i>Administrative Scope & Details
          </h3>
          <div className="row g-3">
            <div className="col-md-6">
              <ProfileFieldDisplay label="Administrative Title / Role" value={pd.designation || 'System Administrator'} icon="bi-person-gear" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Department" value={pd.department || 'Operations & Governance'} icon="bi-diagram-3-fill" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Organization" value={pd.organization || 'Enterprise Learning Platform Enterprise'} icon="bi-building" />
            </div>
            <div className="col-md-6">
              <ProfileFieldDisplay label="Admin Identifier" value={pd.adminIdentifier || 'ADM-SYS-2026'} icon="bi-key-fill" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingOverlay visible />;
  if (error) return <ErrorOverlay visible />;

  const role = user?.role?.toUpperCase() || 'STUDENT';
  const completionPercentage = profileData?.profileCompletionPercentage || 0;
  const isProfileComplete = profileData?.profileCompleted || false;

  const sidebarLinks = getRoleSidebarLinks(role, 'Profile');

  return (
    <div className="dashboard-wrapper-sim">
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        navigationItems={sidebarLinks}
        user={user}
        role={role}
        activeRoute="/profile/me"
        searchPlaceholder="Search courses, roadmaps, mentors..."
      >
        <Toast toasts={toasts} removeToast={removeToast} />
        <div className="fade-in-quick">
          {/* Enterprise Profile Header Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4 text-start">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle overflow-hidden border shadow-sm d-flex align-items-center justify-content-center bg-success text-white fw-bold fs-3" style={{ width: '80px', height: '80px' }}>
                  {profileData?.profileImage || user?.profileImage ? (
                    <img src={profileData?.profileImage || user?.profileImage} alt={profileData?.fullName || user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (profileData?.fullName || user?.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h2 className="fw-bold text-dark mb-0">{profileData?.fullName || user?.name}</h2>
                    <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 fw-bold">{role}</span>
                  </div>
                  <div className="text-muted small">{profileData?.email || user?.email}</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div className="p-3 bg-light rounded-4 border" style={{ minWidth: '220px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-bold text-dark">Profile Completion</span>
                    <span className={`badge ${isProfileComplete ? 'bg-success' : 'bg-warning'}`}>{completionPercentage}%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: `${completionPercentage}%` }}></div>
                  </div>
                  <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                    {isProfileComplete ? 'Profile Complete!' : 'Complete your profile'}
                  </small>
                </div>

                <button className="btn btn-success rounded-pill fw-bold px-4 shadow-sm" onClick={() => navigate(ROUTES.EDIT_PROFILE)}>
                  <i className="bi bi-pencil me-2"></i> Edit Profile
                </button>
              </div>
            </div>
          </div>

          {role === 'STUDENT' && renderStudentProfile()}
          {role === 'MENTOR' && renderMentorProfile()}
          {role === 'ADMIN' && renderAdminProfile()}
        </div>
      </DashboardLayout>
    </div>
  );
}
