import { useState } from 'react';
import Notifications from '../Student/Notifications';
import NotificationService from '../../../services/NotificationService';

export default function AdminNotifications({ onShowToast }) {
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    link: '',
    targetRole: 'ALL',
    sendEmail: false,
  });
  const [broadcasting, setBroadcasting] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      if (onShowToast) onShowToast('warning', 'Title and Message are required for broadcasting.');
      return;
    }

    try {
      setBroadcasting(true);
      await NotificationService.broadcastNotification(broadcastForm);
      if (onShowToast) onShowToast('success', 'Notification broadcasted successfully!');
      setBroadcastForm({
        title: '',
        message: '',
        link: '',
        targetRole: 'ALL',
        sendEmail: false,
      });
    } catch (err) {
      console.error('Failed to broadcast notification:', err);
      if (onShowToast) onShowToast('error', err?.message || 'Failed to broadcast notification.');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="fade-in-quick text-start">
      {/* Broadcast System Announcement Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border">
        <h4 className="fw-bold text-dark mb-2">
          <i className="bi bi-megaphone-fill text-success me-2"></i>
          Broadcast Platform Announcement
        </h4>
        <p className="text-muted small mb-4">
          Send real-time system notifications and optional email alerts to students, mentors, or all platform users.
        </p>

        <form onSubmit={handleBroadcast}>
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <label className="form-label small fw-bold">Notification Title *</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="e.g. Platform Maintenance Notice / New Feature Released"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Target Audience *</label>
              <select
                className="form-select rounded-3"
                value={broadcastForm.targetRole}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
              >
                <option value="ALL">All Users (Students & Mentors)</option>
                <option value="STUDENT">Students Only</option>
                <option value="MENTOR">Mentors Only</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Message Content *</label>
              <textarea
                className="form-control rounded-3"
                rows="3"
                placeholder="Write the announcement message details..."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                required
              ></textarea>
            </div>
            <div className="col-md-8">
              <label className="form-label small fw-bold">Target Link (Optional)</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="e.g. /student-dashboard#catalog or https://..."
                value={broadcastForm.link}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, link: e.target.value })}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="sendEmail"
                  checked={broadcastForm.sendEmail}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, sendEmail: e.target.checked })}
                />
                <label className="form-check-label small fw-semibold" htmlFor="sendEmail">
                  Send Email Alert
                </label>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-success rounded-pill px-5 fw-bold"
              disabled={broadcasting}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {broadcasting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>Broadcasting...
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill me-2"></i>Send Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Notifications List */}
      <Notifications />
    </div>
  );
}
