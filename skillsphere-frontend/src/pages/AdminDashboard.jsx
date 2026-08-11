import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import UserService from '../services/UserService';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import '../styles/dashboard-layout.css';

const SIDEBAR_LINKS = [
  { icon: 'bi-house-fill', label: 'Dashboard', href: '#dashboard', active: true },
  { icon: 'bi-people-fill', label: 'Users', href: '#users' },
  { icon: 'bi-person-badge-fill', label: 'Role Management', href: '/admin/role-management' },
  { icon: 'bi-bar-chart-fill', label: 'Analytics', href: '#analytics' },
  { icon: 'bi-shield-check', label: 'System', href: '#system' },
  { icon: 'bi-gear-fill', label: 'Settings', href: '#settings' },
];

export default function AdminDashboard() {
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

  const displayName = profile?.fullName || profile?.email || user?.email || 'Admin';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <DashboardLayout
      sidebarLinks={SIDEBAR_LINKS}
      searchPlaceholder="Search users, reports..."
      notificationCount={7}
    >
      <div className="welcome-hero">
        <div className="hero-card">
          <h1>👋 Welcome back, {profile?.fullName || 'Admin'}!</h1>
          <div className="hero-role">Admin Dashboard</div>
          <p className="hero-email">{profile?.email || user?.email}</p>
          <p className="hero-description">Manage the SkillSphere Nexus platform.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
