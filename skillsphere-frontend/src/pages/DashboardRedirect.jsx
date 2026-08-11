import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserService from '../services/UserService';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import { useState } from 'react';

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
        const { role } = response.data;
        const dashboardMap = {
          [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
          [ROLES.MENTOR]: ROUTES.MENTOR_DASHBOARD,
          [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
        };
        navigate(dashboardMap[role] || ROUTES.STUDENT_DASHBOARD, { replace: true });
      })
      .catch(() => {
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
