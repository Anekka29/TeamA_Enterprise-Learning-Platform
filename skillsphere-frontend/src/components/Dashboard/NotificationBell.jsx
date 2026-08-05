import { useState, useEffect, useRef, useCallback } from 'react';
import NotificationService from '../../services/NotificationService';
import { useAuth } from '../../hooks/useAuth';

export default function NotificationBell({ className = '' }) {
  const { user } = useAuth();
  const userEmail = user?.email || 'user@skillsphere.com';
  const role = (user?.role || 'STUDENT').toUpperCase();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications(userEmail, role);
      setNotifications(data);
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail, role]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await NotificationService.getUnreadCount(userEmail, role);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, [userEmail, role]);

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('skillsphere_notification_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('skillsphere_notification_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadNotifications]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    const updated = await NotificationService.markAsRead(notificationId, userEmail, role);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  const handleMarkAllAsRead = async () => {
    const updated = await NotificationService.markAllAsRead(userEmail, role);
    setNotifications(updated);
    setUnreadCount(0);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`position-relative d-inline-block ${className}`} ref={dropdownRef}>
      {/* Bell Button with Badge */}
      <button 
        type="button"
        className="btn p-0 position-relative border-0 shadow-sm d-flex align-items-center justify-content-center"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50px',
          background: 'var(--bs-body-bg, #ffffff)',
          border: '1px solid var(--bs-border-color, #e2e8f0)',
          color: 'var(--bs-body-color, #0f172a)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onClick={() => {
          setShowDropdown(prev => !prev);
          if (!showDropdown) loadNotifications();
        }}
        title="View Notifications"
        aria-label="View Notifications"
      >
        <i className="bi bi-bell-fill fs-5 text-primary"></i>
        {unreadCount > 0 && (
          <span 
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-xs border border-white fw-bold"
            style={{ fontSize: '0.65rem', padding: '0.25em 0.5em', transform: 'translate(-35%, 15%)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notifications Dropdown */}
      {showDropdown && (
        <div 
          className="card border-0 shadow-lg rounded-4 position-absolute end-0 mt-2 text-start border overflow-hidden" 
          style={{ minWidth: '360px', maxWidth: '400px', zIndex: 1060, background: 'var(--bs-body-bg, #ffffff)' }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-light">
            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0 fw-bold text-dark">Notifications</h6>
              {unreadCount > 0 && (
                <span className="badge bg-danger-subtle text-danger rounded-pill fw-bold" style={{ fontSize: '0.68rem' }}>
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                type="button"
                className="btn btn-sm btn-link text-success text-decoration-none fw-bold p-0"
                style={{ fontSize: '0.78rem' }}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List Body */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-4 text-muted small">
                <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-5 text-muted small">
                <i className="bi bi-bell-slash fs-2 d-block mb-2 text-secondary"></i>
                No notifications right now
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`px-4 py-3 border-bottom transition-all ${!notification.read ? 'bg-success-subtle bg-opacity-10' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="d-flex gap-3 align-items-start">
                    <div 
                      className="rounded-circle p-2 d-flex align-items-center justify-content-center text-white flex-shrink-0 mt-1 shadow-xs"
                      style={{ 
                        width: '34px', 
                        height: '34px', 
                        backgroundColor: notification.color || (notification.read ? '#94a3b8' : '#10b981') 
                      }}
                    >
                      <i className={`bi ${notification.icon || 'bi-bell-fill'} small`}></i>
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-baseline mb-1">
                        <strong className={`small ${!notification.read ? 'text-dark fw-bold' : 'text-secondary'}`}>
                          {notification.title}
                        </strong>
                        <span className="text-muted text-xs ms-2 flex-shrink-0" style={{ fontSize: '0.7rem' }}>
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-muted small mb-0 lh-sm" style={{ fontSize: '0.8rem' }}>
                        {notification.message || notification.text}
                      </p>

                      {!notification.read && (
                        <span className="badge bg-success rounded-pill mt-2" style={{ fontSize: '0.6rem', padding: '0.2em 0.6em' }}>
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-3 py-2 border-top bg-light text-center">
              <a 
                href={role === 'STUDENT' ? '/student-dashboard#notifications' : '#'}
                className="text-success text-decoration-none fw-bold small"
                style={{ fontSize: '0.8rem' }}
                onClick={() => setShowDropdown(false)}
              >
                View all notifications <i className="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
