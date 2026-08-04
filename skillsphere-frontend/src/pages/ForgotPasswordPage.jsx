import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';
import AuthLayout from '../layouts/AuthLayout';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import AuthService from '../services/AuthService';
import { isValidEmail } from '../utils/validators';
import { ROUTES } from '../constants/routes';
import '../styles/login.css';

export default function ForgotPasswordPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.forgotPassword(email.trim());
      setSuccess(true);
      cardRef.current?.classList.add('success-animation');
      showToast('Password reset link sent!', 'success');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="auth-wrapper">
        <Link to={ROUTES.LOGIN} className="back-home">
          <i className="bi bi-arrow-left"></i> Back to login
        </Link>
        <div className="auth-card" ref={cardRef}>
          <div className="auth-header">
            <a href="#" className="brand-logo">
              <img src={logoImg} className="brand-img" alt="Logo" />
            </a>
            <h1>Forgot password</h1>
            <p>Enter your email to receive a password reset link.</p>
          </div>
          
          {success ? (
            <div className="text-center mt-4">
              <div className="mb-4">
                <i className="bi bi-envelope-check text-success" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="mb-3">Check your email</h5>
              <p className="text-muted mb-4">
                We sent a password reset link to <br/><strong>{email}</strong>
              </p>
              <Link to={ROUTES.LOGIN} className="btn-nexus-primary w-100">
                Return to Login
              </Link>
            </div>
          ) : (
            <form id="forgotForm" noValidate onSubmit={handleSubmit}>
              <div className={`input-nexus-group${error ? ' has-error' : ''}`}>
                <label className="form-label-nexus" htmlFor="email">Email</label>
                <div className="position-relative">
                  <input
                    type="email" id="email" name="email"
                    className="form-control-nexus"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                  />
                  <i className="bi bi-envelope input-icon"></i>
                </div>
                <div className={`field-error${error ? ' show' : ''}`}>
                  <i className="bi bi-exclamation-circle"></i> {error}
                </div>
              </div>
              <button type="submit" className={`btn-nexus-primary${loading ? ' loading' : ''}`} disabled={loading}>
                <span className="spinner-border" role="status" aria-hidden="true"></span>
                <span className="btn-text">Send Reset Link</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
