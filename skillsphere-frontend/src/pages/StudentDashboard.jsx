import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import UserService from '../services/UserService';
import { useAuth } from '../hooks/useAuth';
import '../styles/dashboard-layout.css';

const SIDEBAR_LINKS = [
  { icon: 'bi-house-fill', label: 'Dashboard', href: '#dashboard', active: true },
  { icon: 'bi-person-fill', label: 'My Profile', href: '#profile' },
  { icon: 'bi-graph-up', label: 'Progress', href: '#progress' },
  { icon: 'bi-book-fill', label: 'Learning', href: '#learning' },
  { icon: 'bi-calendar-check', label: 'Sessions', href: '#sessions' },
  { icon: 'bi-chat-dots-fill', label: 'Messages', href: '#messages' },
  { icon: 'bi-gear-fill', label: 'Settings', href: '#settings' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    UserService.getCurrentUser()
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.status !== 401 && err?.status !== 403) {
          setError(true);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingOverlay visible />;
  if (error) return <ErrorOverlay visible />;

  const displayName = profile?.fullName || profile?.email || user?.email || 'Student';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <DashboardLayout
      sidebarLinks={SIDEBAR_LINKS}
      searchPlaceholder="Search learning resources..."
      notificationCount={3}
    >
      <div className="welcome-hero">
        <div className="hero-card">
          <h1>👋 Welcome back, {profile?.fullName || 'Student'}!</h1>
          <div className="hero-role">Student Dashboard</div>
          <p className="hero-email">{profile?.email || user?.email}</p>
          <p className="hero-description">Continue your learning journey.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
