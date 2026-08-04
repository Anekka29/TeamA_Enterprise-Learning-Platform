import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';
import AuthLayout from '../layouts/AuthLayout';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import AuthService from '../services/AuthService';
import { ROUTES } from '../constants/routes';
import '../styles/login.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, showToast, removeToast } = useToast();
  
  const [token, setToken] = useState(null);
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const cardRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    
    if (!tokenParam) {
      setTokenError(true);
      setValidating(false);
      return;
    }

    setToken(tokenParam);
    
    // Validate token
    const validateToken = async () => {
      try {
        await AuthService.validateResetToken(tokenParam);
        setValidating(false);
      } catch (err) {
        setTokenError(true);
        setValidating(false);
      }
    };
    validateToken();
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(token, password);
      cardRef.current?.classList.add('success-animation');
      showToast('Password updated successfully!', 'success');
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <AuthLayout>
        <div className="auth-wrapper d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
             <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (tokenError) {
    return (
      <AuthLayout>
        <div className="auth-wrapper">
          <Link to={ROUTES.LOGIN} className="back-home">
            <i className="bi bi-arrow-left"></i> Back to login
          </Link>
          <div className="auth-card">
            <div className="text-center mt-4">
              <div className="mb-4">
                <i className="bi bi-x-circle text-danger" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="mb-3">Invalid Link</h5>
              <p className="text-muted mb-4">
                The password reset link is invalid or has expired.
              </p>
              <Link to="/forgot-password" className="btn-nexus-primary w-100">
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="auth-wrapper">
        <div className="auth-card" ref={cardRef}>
          <div className="auth-header">
            <a href="#" className="brand-logo">
              <img src={logoImg} className="brand-img" alt="Logo" />
            </a>
            <h1>Create new password</h1>
            <p>Your new password must be different from previous used passwords.</p>
          </div>
          
          <form id="resetForm" noValidate onSubmit={handleSubmit}>
            <div className={`input-nexus-group${error ? ' has-error' : ''}`}>
              <label className="form-label-nexus" htmlFor="password">New Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password" name="password"
                  className="form-control-nexus pwd-field"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                />
                <i className="bi bi-lock input-icon"></i>
                <button
                  type="button" className="toggle-pwd"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className={`input-nexus-group${error ? ' has-error' : ''}`}>
              <label className="form-label-nexus" htmlFor="confirmPassword">Confirm Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword" name="confirmPassword"
                  className="form-control-nexus pwd-field"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                />
                <i className="bi bi-lock input-icon"></i>
              </div>
              <div className={`field-error${error ? ' show' : ''}`}>
                <i className="bi bi-exclamation-circle"></i> {error}
              </div>
            </div>
            
            <button type="submit" className={`btn-nexus-primary${loading ? ' loading' : ''}`} disabled={loading}>
              <span className="spinner-border" role="status" aria-hidden="true"></span>
              <span className="btn-text">Reset Password</span>
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
