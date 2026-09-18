import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserService from '../services/UserService';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import { useState } from 'react';

function normalizeRole(role) {
  if (!role || typeof role !== 'string') {
    return null;
  }

  return role.replace(/^ROLE_/i, '').toUpperCase();
}

/**
 * Dashboard redirect page — fetches current user role then navigates to correct dashboard.
 * Matches original dashboard.html behavior exactly.
 */
export default function DashboardRedirect() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    UserService.getCurrentUser()
      .then(response => {
        const role = normalizeRole(response?.data?.role);
        const dashboardMap = {
          [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
          [ROLES.MENTOR]: ROUTES.MENTOR_DASHBOARD,
          [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
        };

        if (!role) {
          console.error('Dashboard redirect failed: authenticated user is missing a role.', {
            status: response?.status
          });
          setError(true);
          return;
        }

        const targetRoute = dashboardMap[role];
        if (!targetRoute) {
          console.error('Dashboard redirect failed: unsupported role returned by backend.', {
            role,
            status: response?.status
          });
          setError(true);
          return;
        }

        navigate(targetRoute, { replace: true });
      })
      .catch(err => {
        console.error('Dashboard redirect failed while loading current user.', {
          status: err?.status,
          message: err?.message
        });
        setError(true);
      });
  }, []);

  return (
    <>
      <LoadingOverlay visible={!error} />
      <ErrorOverlay visible={error} />
    </>
  );
}
