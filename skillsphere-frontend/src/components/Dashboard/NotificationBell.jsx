import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationService from '../../services/NotificationService';
import { useAuth } from '../../hooks/useAuth';

export default function NotificationBell({ className = '' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userEmail = user?.email || 'user@skillsphere.com';
  const role = (user?.role || 'STUDENT').toUpperCase();

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await NotificationService.getUnreadCount(userEmail, role);
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, [userEmail, role]);

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread count every 20 seconds
    const interval = setInterval(fetchUnreadCount, 20000);

    const handleUpdate = () => {
      fetchUnreadCount();
    };

    window.addEventListener('skillsphere_notification_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('skillsphere_notification_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchUnreadCount]);

  const handleBellClick = () => {
    let dashboardPath = '/student-dashboard#notifications';
    if (role === 'ADMIN') {
      dashboardPath = '/admin-dashboard#notifications';
    } else if (role === 'MENTOR') {
      dashboardPath = '/mentor-dashboard#notifications';
    }

    // Set hash and dispatch hashchange event for smooth activeTab update
    window.location.hash = '#notifications';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    // Navigate to full path if on another route
    if (!window.location.pathname.includes('dashboard')) {
      navigate(dashboardPath);
    }
  };

  return (
    <div className={`position-relative d-inline-block ${className}`}>
      {/* Enterprise Bell Icon Button */}
      <button 
        type="button"
        className="btn p-0 position-relative border-0 shadow-sm d-flex align-items-center justify-content-center bell-btn-custom"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--bs-body-bg, #ffffff)',
          border: '1.5px solid rgba(16, 185, 129, 0.25)',
          color: 'var(--bs-body-color, #0f172a)',
          cursor: 'pointer'
        }}
        onClick={handleBellClick}
        title={unreadCount > 0 ? `${unreadCount} Unread Notifications — Click to view` : 'Notifications — Click to view'}
        aria-label="View Notifications"
      >
        <i className="bi bi-bell-fill fs-5 text-success"></i>

        {/* Pulse Badge Pill when unreadCount > 0 */}
        {unreadCount > 0 && (
          <span 
            className="position-absolute top-0 start-100 badge rounded-pill bell-badge-pill shadow-sm"
            style={{ 
              fontSize: '0.65rem', 
              padding: '0.28em 0.55em', 
              transform: 'translate(-35%, -15%)',
              letterSpacing: '0.02em'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
