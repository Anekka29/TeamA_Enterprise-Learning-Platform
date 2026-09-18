import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const role = params.get('role');

    if (token && email && role) {
      login(token, { email, role });

      const dashboardMap = {
        [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
        [ROLES.MENTOR]: ROUTES.MENTOR_DASHBOARD,
        [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
      };

      navigate(dashboardMap[role] || ROUTES.STUDENT_DASHBOARD, { replace: true });
    } else {
      sessionStorage.setItem('authMessage', 'Google authentication failed. Please try again.');
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [location, login, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
