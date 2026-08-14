import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';
import AuthLayout from '../layouts/AuthLayout';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import AuthService from '../services/AuthService';
import { isValidEmail } from '../utils/validators';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import '../styles/login.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('STUDENT');

  // Field error states as per user request
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [emailGroupError, setEmailGroupError] = useState(false);
  const [passwordGroupError, setPasswordGroupError] = useState(false);

  // Card success animation
  const cardRef = useRef(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get('redirect');
      const intendedCourse = localStorage.getItem('intendedCourse');
      if (intendedCourse) {
        navigate(`/student-dashboard/courses/${intendedCourse}`, { replace: true });
      } else if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else {
        const dashboardMap = {
          ADMIN: ROUTES.ADMIN_DASHBOARD,
          MENTOR: ROUTES.MENTOR_DASHBOARD,
          STUDENT: ROUTES.STUDENT_DASHBOARD,
        };
        navigate(dashboardMap[user.role] || ROUTES.STUDENT_DASHBOARD, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Check for saved Remember Me credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRole = localStorage.getItem('rememberedRole');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  // Check for session message on mount
  useEffect(() => {
    const msg = sessionStorage.getItem('authMessage');
    if (msg) {
      showToast(msg, 'warning');
      sessionStorage.removeItem('authMessage');
    }
  }, []);

  // Apply body class
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const clearErrors = () => {
    setErrors({ email: '', password: '' });
    setEmailGroupError(false);
    setPasswordGroupError(false);
  };

  const validate = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };
    
    if (!email.trim()) {
      newErrors.email = 'Please enter your email.';
      setEmailGroupError(true);
      valid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
      setEmailGroupError(true);
      valid = false;
    }
    
    if (!password.trim()) {
      newErrors.password = 'Please enter your password.';
      setPasswordGroupError(true);
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await AuthService.login(email.trim(), password, role, rememberMe);
      const data = response.data;

      // Handle Remember Me persistence
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim());
        localStorage.setItem('rememberedRole', data.role);
        localStorage.setItem('rememberMeActive', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedRole');
        localStorage.removeItem('rememberMeActive');
      }

      // Only use the role from backend response (actual database role)
      const actualRole = data.role;
      login(data.token, { email: data.email, role: actualRole, name: data.name || email.split('@')[0] });

      // Success animation
      cardRef.current?.classList.add('success-animation');
      showToast('Login successful!', 'success');

      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get('redirect');

      setTimeout(() => {
        const intendedCourse = localStorage.getItem('intendedCourse');
        if (intendedCourse) {
          navigate(`/student-dashboard/courses/${intendedCourse}`, { replace: true });
        } else if (redirectPath) {
          navigate(redirectPath, { replace: true });
        } else {
          const dashboardMap = {
            ADMIN: ROUTES.ADMIN_DASHBOARD,
            MENTOR: ROUTES.MENTOR_DASHBOARD,
            STUDENT: ROUTES.STUDENT_DASHBOARD,
          };
          navigate(dashboardMap[actualRole] || ROUTES.STUDENT_DASHBOARD, { replace: true });
        }
      }, 1000);
    } catch (error) {
      setLoading(false);
      const status = error?.status;
      const message = error?.message || 'An error occurred. Please try again.';

      if (status === 404) {
        // Email not found
        setErrors({ email: 'Account does not exist. Please register first.', password: '' });
        setEmailGroupError(true);
      } else if (status === 403) {
        // Role mismatch or access denied
        showToast(message || 'The selected login role does not match this account.', 'error');
      } else if (status === 401) {
        // Wrong password
        setErrors({ email: '', password: 'Wrong Password' });
        setPasswordGroupError(true);
      } else if (status === 400) {
        const newErrors = { email: '', password: '' };
        if (error?.errors?.email) {
          newErrors.email = error.errors.email;
          setEmailGroupError(true);
        }
        if (error?.errors?.password) {
          newErrors.password = error.errors.password;
          setPasswordGroupError(true);
        }
        setErrors(newErrors);
      }
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <AuthLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="auth-wrapper">
        <Link to={ROUTES.HOME} className="back-home">
          <i className="bi bi-arrow-left"></i> Back to home
        </Link>

        <div className="auth-card" ref={cardRef}>
          <div className="auth-header">
            <a href="#" className="brand-logo">
              <img src={logoImg} className="brand-img" alt="Logo" />
            </a>
            <h1>Welcome back</h1>
            <p>Log in to continue your career journey.</p>
          </div>



          <form id="loginForm" noValidate onSubmit={handleSubmit}>
            {/* Login Role Selection */}
            <div className="input-nexus-group" id="roleGroup">
              <label className="form-label-nexus" htmlFor="role">Login As <span className="req">*</span></label>
              <div className="position-relative">
                <select id="role" className="form-select-nexus" style={{ paddingLeft: '45px' }} value={role} onChange={e => setRole(e.target.value)}>
                  <option value="STUDENT">Student</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <i className="bi bi-person-badge input-icon"></i>
              </div>
            </div>

            {/* Email */}
            <div className={`input-nexus-group${emailGroupError ? ' has-error' : ''}`} id="emailGroup">
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
                    // Clear email error when user edits email
                    setErrors(prev => ({ ...prev, email: '' }));
                    if (emailGroupError) {
                      setEmailGroupError(false);
                    }
                  }}
                />
                <i className="bi bi-envelope input-icon"></i>
              </div>
              <div className={`field-error${emailGroupError ? ' show' : ''}`} id="emailError">
                <i className="bi bi-exclamation-circle"></i> {errors.email}
              </div>
            </div>

            {/* Password */}
            <div className={`input-nexus-group${passwordGroupError ? ' has-error' : ''}`} id="passwordGroup">
              <label className="form-label-nexus" htmlFor="password">Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password" name="password"
                  className="form-control-nexus pwd-field"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear password error when user edits password
                    setErrors(prev => ({ ...prev, password: '' }));
                    if (passwordGroupError) {
                      setPasswordGroupError(false);
                    }
                  }}
                />
                <i className="bi bi-lock input-icon"></i>
                <button
                  type="button" className="toggle-pwd" id="togglePwd"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} id="togglePwdIcon"></i>
                </button>
              </div>
              <div className={`field-error${passwordGroupError ? ' show' : ''}`} id="passwordError">
                <i className="bi bi-exclamation-circle"></i> {errors.password}
              </div>
            </div>

            {/* Options */}
            <div className="form-options-row">
              <label className="remember-check">
                <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Remember me
              </label>
              <a href="#" className="forgot-link" id="forgotLink" onClick={handleForgotPassword}>Forgot password?</a>
            </div>

            {/* Submit */}
            <button type="submit" className={`btn-nexus-primary${loading ? ' loading' : ''}`} id="loginBtn" disabled={loading}>
              <span className="spinner-border" role="status" aria-hidden="true"></span>
              <span className="btn-text">Login</span>
            </button>

            <div className="divider-row google-divider">OR</div>

            {/* Google */}
            <button type="button" className="btn-google" id="googleLoginBtn" aria-label="Continue with Google" onClick={handleGoogleLogin}>
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="btn-text">Continue with Google</span>
            </button>

            <div className="divider-row">New here?</div>

            <Link to={ROUTES.REGISTER} className="btn-nexus-outline d-inline-block text-center mb-3" id="registerBtn">
              Register
            </Link>
          </form>

          <p className="auth-footer-note">
            By continuing, you agree to Enterprise Learning Platform with Skill and Career Guidance System's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
