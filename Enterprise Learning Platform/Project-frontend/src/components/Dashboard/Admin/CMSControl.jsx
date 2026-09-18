import { useState, useEffect } from 'react';
import AdminService from '../../../services/AdminService';
import { useTheme } from '../../../hooks/useTheme';

export default function CMSControl({ onShowToast }) {
  const { setThemeMode } = useTheme();

  const [settings, setSettings] = useState({
    platformName: 'Enterprise Learning Platform with Skill and Career Guidance System',
    supportEmail: 'support@skillsphere.com',
    logoUrl: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    defaultLanguage: 'English',
    theme: 'Dark Mode',
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);

  const mapThemeToMode = (themeStr) => {
    if (!themeStr) return 'system';
    const lower = themeStr.toLowerCase();
    if (lower.includes('light')) return 'light';
    if (lower.includes('dark')) return 'dark';
    return 'system';
  };

  const mapLangToCode = (langStr) => {
    switch (langStr) {
      case 'Spanish': return 'es';
      case 'Hindi': return 'hi';
      case 'French': return 'fr';
      case 'German': return 'de';
      default: return 'en';
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getSettings();
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load system settings', err);
      onShowToast?.('error', 'Failed to fetch settings from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await AdminService.updateSettings(settings);
      
      // Actively apply theme mode
      const activeMode = mapThemeToMode(settings.theme);
      setThemeMode(activeMode);

      // Actively apply language settings
      const langCode = mapLangToCode(settings.defaultLanguage);
      document.documentElement.setAttribute('lang', langCode);
      localStorage.setItem('skillsphere-language', settings.defaultLanguage);
      window.dispatchEvent(new CustomEvent('skillsphere-language-changed', { detail: settings.defaultLanguage }));

      onShowToast?.('success', 'Platform settings, live system theme, and default language updated in MySQL!');
      fetchSettings();
    } catch (err) {
      console.error('Failed to update system settings', err);
      onShowToast?.('error', 'Failed to save system settings');
    }
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">System Settings & CMS Management</h2>
        <p className="text-muted">Configure enterprise branding, support email, SMTP credentials, default language, and system maintenance toggle.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
        <h5 className="fw-bold text-dark mb-4">Platform Configuration</h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading settings from MySQL...</p>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Platform Name</label>
                <input
                  type="text"
                  required
                  className="form-control rounded-3"
                  value={settings.platformName || ''}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Support Email</label>
                <input
                  type="email"
                  required
                  className="form-control rounded-3"
                  value={settings.supportEmail || ''}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Logo URL</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="https://..."
                value={settings.logoUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-8">
                <label className="form-label small fw-bold">SMTP Host</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  value={settings.smtpHost || ''}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">SMTP Port</label>
                <input
                  type="number"
                  className="form-control rounded-3"
                  value={settings.smtpPort ?? 587}
                  onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 587 })}
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label small fw-bold">Default Language</label>
                <select
                  className="form-select rounded-3"
                  value={settings.defaultLanguage || 'English'}
                  onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Hindi">Hindi</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">System Theme</label>
                <select
                  className="form-select rounded-3"
                  value={settings.theme || 'Dark Mode'}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                >
                  <option value="Dark Mode">Dark Emerald</option>
                  <option value="Light Mode">Light Mode</option>
                  <option value="System Default">System Default</option>
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check form-switch mb-2 ms-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="maintenanceSwitch"
                    checked={settings.maintenanceMode || false}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  />
                  <label className="form-check-label fw-bold small text-dark" htmlFor="maintenanceSwitch">
                    Maintenance Mode
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary rounded-pill fw-bold w-100 py-2">
              Save Platform Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
