import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import UserService from '../services/UserService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../constants/routes';
import Toast from '../components/Toast';

import { useTheme } from '../hooks/useTheme';

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const { theme, themeMode, setTheme, setThemeMode } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  // Settings data
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    profileVisible: true,
    courseProgressVisible: true,
    achievementsVisible: true,
    theme: theme || 'light',
    language: 'en'
  });

  // Form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  const [loginHistory, setLoginHistory] = useState([]);

  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    loadSettings();
    loadLoginHistory();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await UserService.getSettings();
      setSettings(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(true);
      setLoading(false);
    }
  };

  const loadLoginHistory = async () => {
    try {
      const response = await UserService.getLoginHistory();
      setLoginHistory(response.data);
    } catch (err) {
      console.error('Error loading login history:', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await UserService.updateSettings(settings);
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving settings:', err);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setSaving(true);
    try {
      await UserService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showToast('Password changed successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      showToast('Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await UserService.updateEmail(emailData);
      showToast('Email update request sent! Check your inbox for verification.', 'success');
      setEmailData({ newEmail: '', password: '' });
    } catch (err) {
      console.error('Error updating email:', err);
      showToast('Failed to update email', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('Are you sure you want to log out from all devices?')) {
      return;
    }
    try {
      await UserService.logoutAllDevices();
      showToast('Logged out from all devices!', 'success');
      logout();
      navigate(ROUTES.LOGIN);
    } catch (err) {
      console.error('Error logging out all devices:', err);
      showToast('Failed to log out from all devices', 'error');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirm !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error');
      return;
    }
    if (!window.confirm('This action is irreversible! Are you absolutely sure?')) {
      return;
    }
    try {
      await UserService.deleteAccount();
      showToast('Account deleted successfully!', 'success');
      logout();
      navigate(ROUTES.HOME);
    } catch (err) {
      console.error('Error deleting account:', err);
      showToast('Failed to delete account', 'error');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'security', label: 'Security' },
    { id: 'danger', label: 'Danger Zone' }
  ];

  if (loading) return <LoadingOverlay visible />;
  if (error) return <ErrorOverlay visible />;

  return (
    <DashboardLayout>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="fade-in-quick">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="fw-bold text-dark mb-2">Settings</h1>
            <p className="text-muted mb-0">Manage your account preferences</p>
          </div>
          <button
            className="btn btn-outline-secondary rounded-3 px-4"
            onClick={() => navigate(ROUTES.MY_PROFILE)}
          >
            <i className="bi bi-arrow-left me-2"></i> Back to Profile
          </button>
        </div>

        <div className="card border-0 shadow-sm rounded-4 bg-white border">
          <div className="card-header bg-white border-bottom-0 pt-4 px-4">
            <ul className="nav nav-tabs nav-justified" id="settingsTabs" role="tablist">
              {tabs.map(tab => (
                <li className="nav-item" key={tab.id}>
                  <button
                    className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-body p-4">
            <div className="tab-content">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="fade-in-quick">
                  <h4 className="mb-4">Account Information</h4>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Full Name</label>
                      <p className="form-control-plaintext">{user?.name || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Email</label>
                      <p className="form-control-plaintext">{user?.email || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Role</label>
                      <p className="form-control-plaintext">{user?.role || '-'}</p>
                    </div>
                  </div>
                  <hr />
                  <h5 className="mb-3">Change Email</h5>
                  <form onSubmit={handleChangeEmail} className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">New Email</label>
                      <input
                        type="email"
                        className="form-control rounded-3"
                        value={emailData.newEmail}
                        onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                        placeholder="Enter new email"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Confirm with Password</label>
                      <input
                        type="password"
                        className="form-control rounded-3"
                        value={emailData.password}
                        onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary rounded-3 px-4"
                        disabled={saving}
                      >
                        {saving ? 'Updating...' : 'Update Email'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="fade-in-quick">
                  <h4 className="mb-4">Notification Preferences</h4>
                  <form onSubmit={handleSaveSettings}>
                    <div className="mb-4">
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          checked={settings.emailNotifications}
                          onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        />
                        <label className="form-check-label" for="emailNotifications">
                          Email Notifications
                        </label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="pushNotifications"
                          checked={settings.pushNotifications}
                          onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                        />
                        <label className="form-check-label" for="pushNotifications">
                          Push Notifications
                        </label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="inAppNotifications"
                          checked={settings.inAppNotifications}
                          onChange={(e) => setSettings({ ...settings, inAppNotifications: e.target.checked })}
                        />
                        <label className="form-check-label" for="inAppNotifications">
                          In-App Notifications
                        </label>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 px-4"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </form>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="fade-in-quick">
                  <h4 className="mb-4">Privacy Settings</h4>
                  <form onSubmit={handleSaveSettings}>
                    <div className="mb-4">
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="profileVisible"
                          checked={settings.profileVisible}
                          onChange={(e) => setSettings({ ...settings, profileVisible: e.target.checked })}
                        />
                        <label className="form-check-label" for="profileVisible">
                          Profile Visible to Others
                        </label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="courseProgressVisible"
                          checked={settings.courseProgressVisible}
                          onChange={(e) => setSettings({ ...settings, courseProgressVisible: e.target.checked })}
                        />
                        <label className="form-check-label" for="courseProgressVisible">
                          Show Course Progress
                        </label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="achievementsVisible"
                          checked={settings.achievementsVisible}
                          onChange={(e) => setSettings({ ...settings, achievementsVisible: e.target.checked })}
                        />
                        <label className="form-check-label" for="achievementsVisible">
                          Show Achievements
                        </label>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 px-4"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </form>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="fade-in-quick">
                  <h4 className="mb-4">Appearance Settings</h4>
                  <form onSubmit={handleSaveSettings}>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Theme</label>
                        <select
                          className="form-select rounded-3"
                          value={themeMode || 'light'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings({ ...settings, theme: val });
                            if (setThemeMode) setThemeMode(val);
                            else setTheme(val);
                          }}
                        >
                          <option value="light">Light Mode</option>
                          <option value="dark">Dark Mode</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Language</label>
                        <select
                          className="form-select rounded-3"
                          value={settings.language}
                          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="zh">中文</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 px-4"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="fade-in-quick">
                  <h4 className="mb-4">Security</h4>
                  <div className="mb-5">
                    <h5 className="mb-3">Change Password</h5>
                    <form onSubmit={handleChangePassword} className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Current Password</label>
                        <input
                          type="password"
                          className="form-control rounded-3"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">New Password</label>
                        <input
                          type="password"
                          className="form-control rounded-3"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter new password"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control rounded-3"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-primary rounded-3 px-4"
                          disabled={saving}
                        >
                          {saving ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                  <hr />
                  <div>
                    <h5 className="mb-3">Login History</h5>
                    {loginHistory.length === 0 ? (
                      <p className="text-muted">No login history available</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Date/Time</th>
                              <th>IP Address</th>
                              <th>User Agent</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loginHistory.map((entry, index) => (
                              <tr key={index}>
                                <td>{new Date(entry.timestamp).toLocaleString()}</td>
                                <td>{entry.ipAddress || '-'}</td>
                                <td>{entry.userAgent || '-'}</td>
                                <td>
                                  <span className={`badge ${entry.success ? 'bg-success' : 'bg-danger'}`}>
                                    {entry.success ? 'Success' : 'Failed'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="mt-4">
                      <button
                        type="button"
                        className="btn btn-warning rounded-3 px-4"
                        onClick={handleLogoutAllDevices}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Log Out from All Devices
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div className="fade-in-quick">
                  <h4 className="mb-4 text-danger">Danger Zone</h4>
                  <div className="alert alert-danger border-0 rounded-4 mb-4">
                    <h5 className="alert-heading">Delete Account</h5>
                    <p className="mb-0">
                      Once you delete your account, there is no going back. This action is irreversible.
                    </p>
                  </div>
                  <form onSubmit={handleDeleteAccount} className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">
                        To confirm, type <strong>DELETE</strong> in the box below
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder="Type DELETE"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-danger rounded-3 px-4"
                      >
                        <i className="bi bi-trash me-2"></i> Delete My Account
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
