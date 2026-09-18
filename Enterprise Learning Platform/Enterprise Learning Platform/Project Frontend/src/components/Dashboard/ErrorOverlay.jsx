import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

/**
 * Full-screen error overlay — exact port from dashboard HTML files.
 */
export default function ErrorOverlay({
  visible = false,
  title = "Unable to load dashboard",
  message = "Please try again or contact support if the problem persists.",
  buttonText = "Back to Login",
  buttonLink = ROUTES.LOGIN,
}) {
  if (!visible) return null;
  return (
    <div className="error-overlay" id="errorOverlay" style={{ display: 'flex' }}>
      <div className="error-card">
        <i className="bi bi-exclamation-triangle error-icon"></i>
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{message}</p>
        <Link to={buttonLink} className="btn btn-primary">{buttonText}</Link>
      </div>
    </div>
  );
}
