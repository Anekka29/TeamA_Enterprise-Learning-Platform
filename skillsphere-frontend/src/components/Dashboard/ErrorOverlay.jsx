import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

/**
 * Full-screen error overlay — exact port from dashboard HTML files.
 */
export default function ErrorOverlay({ visible = false }) {
  if (!visible) return null;
  return (
    <div className="error-overlay" id="errorOverlay" style={{ display: 'flex' }}>
      <div className="error-card">
        <i className="bi bi-exclamation-triangle error-icon"></i>
        <h3 className="error-title">Unable to load dashboard</h3>
        <p className="error-message">Please try again or contact support if the problem persists.</p>
        <Link to={ROUTES.LOGIN} className="btn btn-primary">Back to Login</Link>
      </div>
    </div>
  );
}
