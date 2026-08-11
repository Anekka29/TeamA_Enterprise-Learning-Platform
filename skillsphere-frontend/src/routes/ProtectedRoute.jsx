import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

/**
 * Protects routes that require authentication.
 * Optionally checks if the user has a specific role.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null; // Wait for auth state to initialise

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to their correct dashboard
    if (user?.role === 'ADMIN') return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    if (user?.role === 'MENTOR') return <Navigate to={ROUTES.MENTOR_DASHBOARD} replace />;
    return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
  }

  return children;
}
