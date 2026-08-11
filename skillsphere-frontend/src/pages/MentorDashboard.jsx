import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import UserService from '../services/UserService';
import { useAuth } from '../hooks/useAuth';
import '../styles/dashboard-layout.css';

const SIDEBAR_LINKS = [
  { icon: 'bi-house-fill', label: 'Dashboard', href: '#dashboard', active: true },
  { icon: 'bi-people-fill', label: 'My Students', href: '#students' },
  { icon: 'bi-calendar-event', label: 'Sessions', href: '#sessions' },
  { icon: 'bi-bar-chart-fill', label: 'Analytics', href: '#analytics' },
  { icon: 'bi-chat-dots-fill', label: 'Messages', href: '#messages' },
  { icon: 'bi-file-earmark-text', label: 'Resources', href: '#resources' },
  { icon: 'bi-gear-fill', label: 'Settings', href: '#settings' },
];

export default function MentorDashboard() {
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

  const displayName = profile?.fullName || profile?.email || user?.email || 'Mentor';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <DashboardLayout
      sidebarLinks={SIDEBAR_LINKS}
      searchPlaceholder="Search students or resources..."
      notificationCount={5}
    >
      <div className="welcome-hero">
        <div className="hero-card">
          <h1>👋 Welcome back, {profile?.fullName || 'Mentor'}!</h1>
          <div className="hero-role">Mentor Dashboard</div>
          <p className="hero-email">{profile?.email || user?.email}</p>
          <p className="hero-description">Guide your students on their career path.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
