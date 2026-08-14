import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import ProfileService from '../../services/ProfileService';

export default function ProfileCompletionBanner() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const response = await ProfileService.getCurrentProfile();
      setProfileData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading profile data:', err);
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage for this session
    localStorage.setItem('profileBannerDismissed', 'true');
  };

  // Check if banner was previously dismissed
  useEffect(() => {
    const wasDismissed = localStorage.getItem('profileBannerDismissed');
    if (wasDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  if (loading || dismissed || !profileData) return null;

  const { profileCompletionPercentage, profileCompleted } = profileData;

  // Don't show banner if profile is complete
  if (profileCompleted) return null;

  // Don't show banner if completion is above 80% (less intrusive)
  if (profileCompletionPercentage >= 80) return null;

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ 
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      border: '1px solid rgba(16, 185, 129, 0.2)'
    }}>
      <div className="d-flex justify-content-between align-items-start">
        <div className="d-flex gap-3">
          <div className="profile-banner-icon">
            <i className="bi bi-person-gear fs-3"></i>
          </div>
          <div>
            <h5 className="fw-bold text-dark mb-2">Complete your profile</h5>
            <p className="text-muted mb-3 small">
              Your profile is <strong>{profileCompletionPercentage}%</strong> complete. 
              Complete your information to personalize your Enterprise Learning Platform experience.
            </p>
            <Link 
              to={ROUTES.EDIT_PROFILE} 
              className="btn btn-success rounded-3 btn-sm"
            >
              <i className="bi bi-person-gear me-2"></i> Complete Profile
            </Link>
          </div>
        </div>
        <button 
          className="btn btn-link text-muted p-0" 
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      
      <style>{`
        .profile-banner-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
        }
      `}</style>
    </div>
  );
}
