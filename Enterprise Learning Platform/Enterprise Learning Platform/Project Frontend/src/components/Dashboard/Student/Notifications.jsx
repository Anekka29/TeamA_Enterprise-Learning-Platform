import { useState, useEffect, useCallback } from 'react';
import NotificationService from '../../../services/NotificationService';
import { useAuth } from '../../../hooks/useAuth';

const TYPE_ICON = {
  COURSE_APPROVED: { icon: 'bi-check-circle-fill', color: '#10b981', bg: '#f0fdf4' },
  COURSE_REJECTED: { icon: 'bi-x-circle-fill', color: '#ef4444', bg: '#fef2f2' },
  ASSIGNMENT_DUE: { icon: 'bi-clock-fill', color: '#f59e0b', bg: '#fffbeb' },
  QUIZ_AVAILABLE: { icon: 'bi-question-circle-fill', color: '#3b82f6', bg: '#eff6ff' },
  QUIZ_RESULT: { icon: 'bi-trophy-fill', color: '#8b5cf6', bg: '#f5f3ff' },
  CERTIFICATE_EARNED: { icon: 'bi-award-fill', color: '#f59e0b', bg: '#fffbeb' },
  XP_GAINED: { icon: 'bi-lightning-fill', color: '#10b981', bg: '#f0fdf4' },
  STREAK_REMINDER: { icon: 'bi-fire', color: '#ef4444', bg: '#fef2f2' },
  ANNOUNCEMENT: { icon: 'bi-megaphone-fill', color: '#3b82f6', bg: '#eff6ff' },
  NEW_MESSAGE: { icon: 'bi-chat-fill', color: '#10b981', bg: '#f0fdf4' },
  ENROLLMENT: { icon: 'bi-book-fill', color: '#10b981', bg: '#f0fdf4' },
  default: { icon: 'bi-bell-fill', color: '#6b7280', bg: '#f9fafb' },
};

function getTypeStyle(type) {
  return TYPE_ICON[type] || TYPE_ICON.default;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications({ onUnreadCountChange }) {
  const { user } = useAuth();
  const userEmail = user?.email;
  const role = (user?.role || 'STUDENT').toUpperCase();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await NotificationService.getNotifications(userEmail, role);
      setNotifications(data || []);
      const unread = (data || []).filter(n => !n.read).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userEmail, role, onUnreadCountChange]);

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('skillsphere_notification_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Poll every 20 seconds
    const interval = setInterval(loadNotifications, 20000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('skillsphere_notification_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    setActionLoading(id);
    try {
      const updated = await NotificationService.markAsRead(id, userEmail, role);
      setNotifications(updated || []);
      const unread = (updated || []).filter(n => !n.read).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading('all');
    try {
      const updated = await NotificationService.markAllAsRead(userEmail, role);
      setNotifications(updated || []);
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(`del-${id}`);
    try {
      await NotificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      const remaining = notifications.filter(n => n.id !== id && !n.read).length;
      if (onUnreadCountChange) onUnreadCountChange(remaining);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fade-in-quick text-start">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
            <i className="bi bi-bell-fill text-warning me-2"></i>
            Notifications
          </h2>
          <p className="text-muted mb-0">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up! No new notifications.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-outline-success rounded-pill fw-bold px-4"
            style={{ fontSize: '0.85rem' }}
            onClick={handleMarkAllRead}
            disabled={actionLoading === 'all'}
          >
            {actionLoading === 'all' ? (
              <span className="spinner-border spinner-border-sm me-1"></span>
            ) : (
              <i className="bi bi-check2-all me-1"></i>
            )}
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4">
        {['all', 'unread', 'read'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="btn rounded-pill fw-semibold"
            style={{
              fontSize: '0.85rem',
              padding: '6px 20px',
              background: filter === tab ? '#10b981' : 'white',
              color: filter === tab ? 'white' : '#6b7280',
              border: filter === tab ? 'none' : '1.5px solid #e5e7eb',
              transition: 'all 0.2s ease',
            }}
          >
            {tab === 'all' && `All (${notifications.length})`}
            {tab === 'unread' && `Unread (${unreadCount})`}
            {tab === 'read' && `Read (${notifications.length - unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border text-success mb-3" role="status"></div>
            <div>Loading notifications…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-bell-slash fs-1 mb-3 d-block" style={{ color: '#d1d5db' }}></i>
            <div className="fw-semibold text-dark mb-1">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
            </div>
            <div className="small">
              {filter === 'unread'
                ? "You're all caught up! Check back later."
                : "Activity notifications will appear here."}
            </div>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {filtered.map((notification, idx) => {
              const style = getTypeStyle(notification.type);
              const isDeleting = actionLoading === `del-${notification.id}`;
              const isMarking = actionLoading === notification.id;

              return (
                <div
                  key={notification.id}
                  className="list-group-item list-group-item-action d-flex gap-3 align-items-start"
                  style={{
                    padding: '16px 20px',
                    background: notification.read ? '#fff' : `${style.bg}`,
                    borderLeft: notification.read ? '4px solid transparent' : `4px solid ${style.color}`,
                    transition: 'background 0.2s ease',
                    opacity: isDeleting ? 0.4 : 1,
                    animation: 'none',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{
                      width: '42px',
                      height: '42px',
                      background: style.bg,
                      border: `1.5px solid ${style.color}20`,
                    }}
                  >
                    <i className={`bi ${style.icon}`} style={{ color: style.color, fontSize: '1rem' }}></i>
                  </div>

                  {/* Content */}
                  <div className="flex-grow-1 min-width-0">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                          {notification.title}
                          {!notification.read && (
                            <span
                              className="ms-2 rounded-pill"
                              style={{
                                background: style.color,
                                color: 'white',
                                fontSize: '0.65rem',
                                padding: '2px 8px',
                                fontWeight: 700,
                                verticalAlign: 'middle',
                              }}
                            >
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="text-muted mt-1" style={{ fontSize: '0.85rem', lineHeight: 1.45 }}>
                          {notification.message}
                        </div>
                        <div className="mt-1" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          {timeAgo(notification.createdAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            className="btn btn-sm rounded-pill"
                            style={{
                              fontSize: '0.7rem',
                              padding: '3px 10px',
                              background: '#f0fdf4',
                              color: '#10b981',
                              border: '1px solid #bbf7d0',
                            }}
                            onClick={() => handleMarkRead(notification.id)}
                            disabled={isMarking}
                            title="Mark as read"
                          >
                            {isMarking ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <i className="bi bi-check2"></i>
                            )}
                          </button>
                        )}
                        <button
                          className="btn btn-sm rounded-pill"
                          style={{
                            fontSize: '0.7rem',
                            padding: '3px 10px',
                            background: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                          }}
                          onClick={() => handleDelete(notification.id)}
                          disabled={isDeleting}
                          title="Delete"
                        >
                          {isDeleting ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="bi bi-trash3"></i>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Optional link */}
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="small fw-semibold text-decoration-none mt-1 d-inline-block"
                        style={{ color: style.color, fontSize: '0.78rem' }}
                      >
                        View Details <i className="bi bi-arrow-right"></i>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Refresh note */}
      <div className="text-center mt-3" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
        <i className="bi bi-arrow-clockwise me-1"></i>
        Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}
