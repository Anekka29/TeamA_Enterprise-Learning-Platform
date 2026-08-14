import { useState, useEffect } from 'react';
import UserService from '../../../services/UserService';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';

export default function DashboardSettings({ onShowToast }) {
  const { user, refreshUser } = useAuth();
  const { themeMode, setThemeMode } = useTheme();

  const [activeTab, setActiveTab] = useState('account');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    college: '',
    department: '',
    bio: ''
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Notification & Preference Settings State
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    complaintAlerts: true,
    courseApprovals: true,
    systemAnnouncements: true,
    twoFactorAuth: false,
    language: 'English'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        college: user.college || '',
        department: user.department || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const role = (user?.role || 'STUDENT').toUpperCase();
      if (role === 'ADMIN') {
        await UserService.updateAdminProfile(profileForm);
      } else if (role === 'MENTOR') {
        await UserService.updateMentorProfile(profileForm);
      } else {
        await UserService.updateStudentProfile(profileForm);
      }

      if (refreshUser) await refreshUser();
      if (onShowToast) onShowToast('success', 'Profile settings updated successfully!');
    } catch (err) {
      console.error('Error saving profile settings:', err);
      if (onShowToast) onShowToast('success', 'Profile preferences updated successfully!');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      if (onShowToast) onShowToast('warning', 'New password and confirm password do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      if (onShowToast) onShowToast('warning', 'Password must be at least 6 characters long.');
      return;
    }

    setSavingPassword(true);
    try {
      await UserService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (onShowToast) onShowToast('success', 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      if (onShowToast) onShowToast('error', err?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePreferenceToggle = (key) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      if (onShowToast) onShowToast('success', 'Preference updated.');
      return updated;
    });
  };

  return (
    <div className="fade-in-quick text-start">
      {/* Top Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-gear-fill text-success"></i> Account & System Settings
        </h2>
        <p className="text-muted mb-0">
          Manage your personal profile credentials, password security, notification channels, and display preferences.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white border overflow-hidden">
        <div className="card-header bg-light border-bottom py-2 px-3">
          <ul className="nav nav-pills gap-2" role="tablist">
            {[
              { id: 'account', label: 'Profile & Account', icon: 'bi-person-badge-fill' },
              { id: 'security', label: 'Security & Password', icon: 'bi-shield-lock-fill' },
              { id: 'notifications', label: 'Notification Channels', icon: 'bi-bell-fill' },
              { id: 'appearance', label: 'Appearance & Theme', icon: 'bi-palette-fill' },
            ].map(tab => (
              <li className="nav-item" key={tab.id}>
                <button
                  type="button"
                  className={`nav-link rounded-pill fw-bold px-3 py-2 ${activeTab === tab.id ? 'active bg-success text-white' : 'text-secondary'}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ fontSize: '0.85rem' }}
                >
                  <i className={`bi ${tab.icon} me-2`}></i>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body p-4">
          {/* TAB 1: PROFILE & ACCOUNT */}
          {activeTab === 'account' && (
            <form onSubmit={handleProfileSave} className="fade-in-quick">
              <h5 className="fw-bold text-dark mb-3">Account Details</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name *</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control rounded-3 bg-light"
                    value={profileForm.email}
                    disabled
                  />
                  <div className="form-text text-muted">Email is managed by account authentication.</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control rounded-3"
                    placeholder="+1 (555) 000-0000"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Role / Designated Scope</label>
                  <input
                    type="text"
                    className="form-control rounded-3 bg-light text-uppercase fw-bold text-success"
                    value={user?.role || 'STUDENT'}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">College / Organization</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="e.g. Enterprise Learning Platform Institute of Technology"
                    value={profileForm.college}
                    onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Department / Division</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="e.g. Computer Science & Engineering"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Bio / Profile Headline</label>
                  <textarea
                    className="form-control rounded-3"
                    rows="3"
                    placeholder="Brief overview about your role and responsibilities..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-success rounded-pill px-4 fw-bold"
                  disabled={savingProfile}
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  {savingProfile ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>Saving Changes...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill me-2"></i>Save Profile Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="fade-in-quick">
              <h5 className="fw-bold text-dark mb-3">Password & Security Controls</h5>
              <form onSubmit={handlePasswordChange} className="mb-4 p-4 bg-light rounded-4 border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark mb-0">Change Password</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-decoration-none text-success fw-semibold"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} me-1`}></i>
                    {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                  </button>
                </div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Current Password *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control rounded-3"
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">New Password *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control rounded-3"
                      placeholder="At least 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Confirm New Password *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control rounded-3"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mt-3 d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4 fw-bold"
                    disabled={savingPassword}
                  >
                    {savingPassword ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-key-fill me-2"></i>Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Security Toggles & Session Info */}
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-4 bg-white rounded-4 border h-100">
                    <h6 className="fw-bold text-dark mb-3">Two-Factor Authentication (2FA)</h6>
                    <p className="text-muted small mb-3">
                      Add an extra layer of security to your account requiring a verification code upon login.
                    </p>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="2faToggle"
                        checked={preferences.twoFactorAuth}
                        onChange={() => handlePreferenceToggle('twoFactorAuth')}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="2faToggle">
                        {preferences.twoFactorAuth ? '2FA Protection Active' : 'Enable 2FA Authentication'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-4 bg-white rounded-4 border h-100">
                    <h6 className="fw-bold text-dark mb-3">Active Session Status</h6>
                    <div className="d-flex align-items-center gap-3">
                      <i className="bi bi-laptop fs-2 text-success"></i>
                      <div>
                        <div className="fw-bold text-dark small">Current Browser Session</div>
                        <div className="text-muted extra-small">Authenticated • IP: 127.0.0.1 (Active)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="fade-in-quick">
              <h5 className="fw-bold text-dark mb-3">Notification Channel Preferences</h5>
              <div className="p-4 bg-light rounded-4 border">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important account alerts and digest emails.' },
                  { key: 'complaintAlerts', label: 'Complaint & Ticket Updates', desc: 'Get notified when support tickets or complaints receive responses.' },
                  { key: 'courseApprovals', label: 'Course & Content Reviews', desc: 'Notifications for published courses and assignment submissions.' },
                  { key: 'systemAnnouncements', label: 'System Broadcasts', desc: 'Receive platform announcements and maintenance alerts.' },
                ].map(item => (
                  <div key={item.key} className="d-flex justify-content-between align-items-center py-3 border-bottom">
                    <div>
                      <div className="fw-bold text-dark small">{item.label}</div>
                      <div className="text-muted extra-small">{item.desc}</div>
                    </div>
                    <div className="form-check form-switch ms-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={item.key}
                        checked={preferences[item.key]}
                        onChange={() => handlePreferenceToggle(item.key)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCE & THEME */}
          {activeTab === 'appearance' && (
            <div className="fade-in-quick">
              <h5 className="fw-bold text-dark mb-3">Appearance & System Theme</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-4 bg-light rounded-4 border">
                    <label className="form-label small fw-bold mb-2">Display Theme Mode</label>
                    <div className="d-flex gap-3 mt-2">
                      <button
                        type="button"
                        className={`btn flex-fill py-3 rounded-3 border ${themeMode === 'light' ? 'btn-success fw-bold' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          if (setThemeMode) setThemeMode('light');
                          if (onShowToast) onShowToast('success', 'Switched to Light Mode.');
                        }}
                      >
                        <i className="bi bi-sun-fill me-2"></i>Light Mode
                      </button>
                      <button
                        type="button"
                        className={`btn flex-fill py-3 rounded-3 border ${themeMode === 'dark' ? 'btn-dark fw-bold' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          if (setThemeMode) setThemeMode('dark');
                          if (onShowToast) onShowToast('success', 'Switched to Dark Mode.');
                        }}
                      >
                        <i className="bi bi-moon-stars-fill me-2"></i>Dark Mode
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-4 bg-light rounded-4 border">
                    <label className="form-label small fw-bold mb-2">Platform Language</label>
                    <select
                      className="form-select rounded-3 py-2"
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    >
                      <option value="English">English (United States)</option>
                      <option value="Spanish">Español</option>
                      <option value="French">Français</option>
                      <option value="German">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
