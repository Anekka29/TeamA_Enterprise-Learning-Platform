import apiClient from '../api/apiClient';

// Role-based Default Initial Notifications
const DEFAULT_ROLE_NOTIFICATIONS = {
  STUDENT: [
    {
      id: 'noti_std_1',
      title: 'Assignment Graded! 🎉',
      message: 'Your submission for "React & Redux E-Commerce Storefront Architecture" was graded A+ (95/100) with mentor feedback.',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
      read: false,
      type: 'success',
      icon: 'bi-check-circle-fill',
      color: '#10b981'
    },
    {
      id: 'noti_std_2',
      title: 'New Live Zoom Session Scheduled 📹',
      message: 'Mentor scheduled a live session "Deep Dive into React Hooks & State Management" for Aug 5 at 02:00 PM.',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      read: false,
      type: 'info',
      icon: 'bi-camera-video-fill',
      color: '#3b82f6'
    },
    {
      id: 'noti_std_3',
      title: 'Quiz Result Available 🏆',
      message: 'You scored 14/15 (93%) in "Java Core & OOP Quiz". Keep up the great work!',
      createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
      read: true,
      type: 'warning',
      icon: 'bi-trophy-fill',
      color: '#f59e0b'
    },
    {
      id: 'noti_std_4',
      title: 'Welcome to Enterprise Learning Platform with Skill and Career Guidance System! 🚀',
      message: 'Explore interactive courses, AI career roadmaps, DSA practice questions, and live mentor sessions.',
      createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
      read: true,
      type: 'primary',
      icon: 'bi-rocket-takeoff-fill',
      color: '#6366f1'
    }
  ],
  MENTOR: [
    {
      id: 'noti_mnt_1',
      title: 'New PDF Assignment Submitted 📄',
      message: 'Student Chandni Singh submitted solution "CHANDNI_REACT_STOREFRONT_SOLUTION.PDF" for review.',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      read: false,
      type: 'info',
      icon: 'bi-file-earmark-pdf-fill',
      color: '#ef4444'
    },
    {
      id: 'noti_mnt_2',
      title: 'Quiz Attempt Completed 📊',
      message: 'Student Rahul Sharma attempted "Database Schema & Window Queries Quiz" and scored 90% (Passed).',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      read: false,
      type: 'success',
      icon: 'bi-patch-check-fill',
      color: '#10b981'
    },
    {
      id: 'noti_mnt_3',
      title: 'Course Live & Published! ✨',
      message: 'Your course "Full-Stack Web Development with React & Spring Boot" is active for student enrollments.',
      createdAt: new Date(Date.now() - 1000 * 60 * 1200).toISOString(), // 20 hours ago
      read: true,
      type: 'primary',
      icon: 'bi-collection-play-fill',
      color: '#10b981'
    }
  ],
  ADMIN: [
    {
      id: 'noti_adm_1',
      title: 'Course Review Requested 📝',
      message: 'Mentor Dr. Sarah Jenkins submitted "Advanced Spring Cloud Microservices" for administrative review.',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      read: false,
      type: 'warning',
      icon: 'bi-patch-exclamation-fill',
      color: '#f59e0b'
    },
    {
      id: 'noti_adm_2',
      title: 'Platform System Health Normal 💚',
      message: 'All microservices operating normally with 99.9% API uptime and low latency across nodes.',
      createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
      read: true,
      type: 'success',
      icon: 'bi-shield-check',
      color: '#10b981'
    }
  ]
};

export const NotificationService = {
  // Get notifications for current user (API with local fallback)
  getNotifications: async (userEmail, role = 'STUDENT') => {
    try {
      const response = await apiClient.get('/api/notifications');
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (e) {
      // Fallback to role-specific local storage
    }

    const key = `skillsphere_notifications_${userEmail || 'user'}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fallback
      }
    }

    const roleKey = (role || 'STUDENT').toUpperCase();
    const defaults = DEFAULT_ROLE_NOTIFICATIONS[roleKey] || DEFAULT_ROLE_NOTIFICATIONS.STUDENT;
    try {
      localStorage.setItem(key, JSON.stringify(defaults));
    } catch (e) {}
    return defaults;
  },

  getUnreadNotifications: async (userEmail, role) => {
    const list = await NotificationService.getNotifications(userEmail, role);
    return list.filter(n => !n.read);
  },

  getUnreadCount: async (userEmail, role) => {
    const list = await NotificationService.getNotifications(userEmail, role);
    return list.filter(n => !n.read).length;
  },

  markAsRead: async (notificationId, userEmail, role) => {
    try {
      await apiClient.put(`/api/notifications/${notificationId}/read`);
    } catch (e) {}

    const key = `skillsphere_notifications_${userEmail || 'user'}`;
    const list = await NotificationService.getNotifications(userEmail, role);
    const updated = list.map(n => n.id === notificationId ? { ...n, read: true } : n);
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event('skillsphere_notification_updated'));
    return updated;
  },

  markAllAsRead: async (userEmail, role) => {
    try {
      await apiClient.put('/api/notifications/read-all');
    } catch (e) {}

    const key = `skillsphere_notifications_${userEmail || 'user'}`;
    const list = await NotificationService.getNotifications(userEmail, role);
    const updated = list.map(n => ({ ...n, read: true }));
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event('skillsphere_notification_updated'));
    return updated;
  },

  dispatchNotification: (targetEmail, notificationObj) => {
    const key = `skillsphere_notifications_${targetEmail || 'user'}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newNoti = {
      id: `noti_${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notificationObj
    };
    const updated = [newNoti, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event('skillsphere_notification_updated'));
  },

  broadcastNotification: async (broadcastForm) => {
    try {
      await apiClient.post('/api/notifications/broadcast', broadcastForm);
    } catch (e) {
      console.warn('API Broadcast warning:', e);
    }

    // Always dispatch to local storage as well for real-time sync across sessions
    const newNoti = {
      id: `noti_bc_${Date.now()}`,
      title: broadcastForm.title,
      message: broadcastForm.message,
      link: broadcastForm.link || '',
      type: 'ANNOUNCEMENT',
      icon: 'bi-megaphone-fill',
      color: '#3b82f6',
      createdAt: new Date().toISOString(),
      read: false
    };

    const keys = Object.keys(localStorage).filter(k => k.startsWith('skillsphere_notifications_'));
    keys.forEach(key => {
      try {
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(key, JSON.stringify([newNoti, ...list]));
      } catch (err) {}
    });

    window.dispatchEvent(new Event('skillsphere_notification_updated'));
    window.dispatchEvent(new Event('storage'));
    return { success: true };
  }
};

export default NotificationService;
