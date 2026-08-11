import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';
import AuthLayout from '../layouts/AuthLayout';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import AuthService from '../services/AuthService';
import { isValidEmail, isValidPhone, isValidUsername, getPasswordStrength } from '../utils/validators';
import { ROUTES } from '../constants/routes';
import '../styles/register.css';

const INITIAL_ERRORS = {
  fullName: '', email: '', username: '', password: '', confirmPassword: '',
  college: '', department: '', year: '', phoneNumber: '', terms: '',
};
const INITIAL_HAS_ERROR = Object.fromEntries(Object.keys(INITIAL_ERRORS).map(k => [k, false]));

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const cardRef = useRef(null);

  const [fields, setFields] = useState({
    fullName: '', email: '', username: '', password: '', confirmPassword: '',
    college: '', department: '', year: '', phoneNumber: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [hasError, setHasError] = useState(INITIAL_HAS_ERROR);
  const [hasSuccess, setHasSuccess] = useState(INITIAL_HAS_ERROR);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [pwdStrength, setPwdStrength] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authAlert, setAuthAlert] = useState({ show: false, text: '' });

  useEffect(() => {
    document.body.classList.add('register-page');
    return () => document.body.classList.remove('register-page');
  }, []);

  const updateProgress = (currentFields = fields, termsChecked = acceptTerms) => {
    const vals = Object.values(currentFields);
    const filled = vals.filter(v => v.trim() !== '').length + (termsChecked ? 1 : 0);
    setProgress(Math.round((filled / (vals.length + 1)) * 100));
  };

  const set = (key, value) => {
    const updated = { ...fields, [key]: value };
    setFields(updated);
    updateProgress(updated, acceptTerms);
  };

  const setError = (key, msg) => {
    setErrors(e => ({ ...e, [key]: msg }));
    setHasError(h => ({ ...h, [key]: true }));
    setHasSuccess(s => ({ ...s, [key]: false }));
  };
  const clearError = (key) => {
    setErrors(e => ({ ...e, [key]: '' }));
    setHasError(h => ({ ...h, [key]: false }));
  };
  const setSuccess = (key) => {
    setHasSuccess(s => ({ ...s, [key]: true }));
    setHasError(h => ({ ...h, [key]: false }));
  };

  // Validators
  const validateFullName = (v = fields.fullName) => {
    if (!v.trim()) { setError('fullName', 'Full name is required.'); return false; }
    if (v.trim().length < 3) { setError('fullName', 'Full name must be at least 3 characters.'); return false; }
    clearError('fullName'); setSuccess('fullName'); return true;
  };
  const validateEmail = (v = fields.email) => {
    if (!v.trim()) { setError('email', 'Email is required.'); return false; }
    if (!isValidEmail(v)) { setError('email', 'Enter a valid email address.'); return false; }
    clearError('email'); setSuccess('email'); return true;
  };
  const validateUsername = (v = fields.username) => {
    if (!v.trim()) { setError('username', 'Username is required.'); return false; }
    if (v.trim().length < 4) { setError('username', 'Username must be at least 4 characters.'); return false; }
    if (!isValidUsername(v)) { setError('username', 'Only letters, numbers, and underscores allowed.'); return false; }
    clearError('username'); setSuccess('username'); return true;
  };
  const validatePassword = (v = fields.password) => {
    if (!v) { setError('password', 'Password is required.'); setPwdStrength(''); return false; }
    if (v.length < 8) { setError('password', 'Password must be at least 8 characters.'); setPwdStrength(getPasswordStrength(v)); return false; }
    clearError('password'); setSuccess('password'); setPwdStrength(getPasswordStrength(v)); return true;
  };
  const validateConfirmPassword = (v = fields.confirmPassword) => {
    if (!v) { setError('confirmPassword', 'Please confirm your password.'); setConfirmSuccess(false); return false; }
    if (v !== fields.password) { setError('confirmPassword', 'Passwords do not match.'); setConfirmSuccess(false); return false; }
    clearError('confirmPassword'); setSuccess('confirmPassword'); setConfirmSuccess(true); return true;
  };
  const validateCollege = (v = fields.college) => {
    if (!v.trim()) { setError('college', 'College name is required.'); return false; }
    clearError('college'); setSuccess('college'); return true;
  };
  const validateDepartment = (v = fields.department) => {
    if (!v) { setError('department', 'Please select a department.'); return false; }
    clearError('department'); setSuccess('department'); return true;
  };
  const validateYear = (v = fields.year) => {
    if (!v) { setError('year', 'Please select your year.'); return false; }
    clearError('year'); setSuccess('year'); return true;
  };
  const validatePhone = (v = fields.phoneNumber) => {
    if (v.trim() !== '' && !isValidPhone(v)) { setError('phoneNumber', 'Please enter a valid phone number.'); return false; }
    clearError('phoneNumber'); if (v.trim()) setSuccess('phoneNumber'); return true;
  };
  const validateTerms = (checked = acceptTerms) => {
    if (!checked) { setError('terms', 'You must accept the Terms & Conditions to continue.'); return false; }
    clearError('terms'); return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthAlert({ show: false, text: '' });

    const validations = [
      validateFullName(), validateEmail(), validateUsername(), validatePassword(),
      validateConfirmPassword(), validateCollege(), validateDepartment(), validateYear(),
      validatePhone(), validateTerms(),
    ];

    if (!validations.every(Boolean)) {
      setAuthAlert({ show: true, text: 'Please fix the highlighted fields before continuing.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: fields.fullName.trim(),
        username: fields.username.trim(),
        email: fields.email.trim(),
        password: fields.password,
        college: fields.college.trim(),
        department: fields.department,
        year: fields.year,
      };
      if (fields.phoneNumber.trim()) payload.phoneNumber = fields.phoneNumber.trim();

      const response = await AuthService.register(payload);
      const data = response.data;

      cardRef.current?.classList.add('success-animation');
      showToast('Registration successful!', 'success');

      login(data.token, { email: data.email, role: data.role });

      setTimeout(() => {
        navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
      }, 1000);
    } catch (error) {
      setLoading(false);
      const message = error?.message || 'Registration failed. Please try again.';
      showToast(message, 'error');
      setAuthAlert({ show: true, text: message });
    }
  };

  const handleGoogleRegister = (e) => {
    e.preventDefault();
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <AuthLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="auth-wrapper register-wrapper">
        <Link to={ROUTES.HOME} className="back-home">
          <i className="bi bi-arrow-left"></i> Back to home
        </Link>

        <div className="auth-card register-card" ref={cardRef}>
          <div className="auth-header">
            <a href="#" className="brand-logo">
              <img src={logoImg} className="brand-img" alt="Logo" />
            </a>
            <h1>Create your student account</h1>
            <p>Start your personalized career journey in a few minutes.</p>
          </div>

          {/* Progress */}
          <div className="form-progress"><span id="progressBar" style={{ width: `${progress}%` }}></span></div>

          {/* Alert */}
          <div className={`auth-alert error${authAlert.show ? ' show' : ''}`} id="authAlert">
            <i className="bi bi-exclamation-circle-fill mt-1"></i>
            <span id="authAlertText">{authAlert.text}</span>
          </div>

          <form id="registerForm" noValidate onSubmit={handleSubmit}>
            <p className="section-tag">Personal Details</p>

            {/* Full Name */}
            <div className={`input-nexus-group${hasError.fullName ? ' has-error' : ''}${hasSuccess.fullName ? ' has-success' : ''}`} id="fullNameGroup">
              <label className="form-label-nexus" htmlFor="fullName">Full Name <span className="req">*</span></label>
              <div className="position-relative">
                <input type="text" id="fullName" className="form-control-nexus" placeholder="e.g. Ayesha Nair" autoComplete="name"
                  value={fields.fullName} onChange={e => { set('fullName', e.target.value); validateFullName(e.target.value); }} />
                <i className="bi bi-person input-icon"></i>
              </div>
              <div className={`field-error${hasError.fullName ? ' show' : ''}`}><i className="bi bi-exclamation-circle"></i><span> {errors.fullName}</span></div>
            </div>

            <div className="row">
              {/* Email */}
              <div className="col-md-6">
                <div className={`input-nexus-group${hasError.email ? ' has-error' : ''}${hasSuccess.email ? ' has-success' : ''}`} id="emailGroup">
                  <label className="form-label-nexus" htmlFor="email">Email <span className="req">*</span></label>
                  <div className="position-relative">
                    <input type="email" id="email" className="form-control-nexus" placeholder="you@college.edu" autoComplete="email"
                      value={fields.email} onChange={e => { set('email', e.target.value); validateEmail(e.target.value); }} />
                    <i className="bi bi-envelope input-icon"></i>
                  </div>
                  <div className={`field-error${hasError.email ? ' show' : ''}`}><i className="bi bi-exclamation-circle"></i><span> {errors.email}</span></div>
                </div>
              </div>
              {/* Username */}
              <div className="col-md-6">
                <div className={`input-nexus-group${hasError.username ? ' has-error' : ''}${hasSuccess.username ? ' has-success' : ''}`} id="usernameGroup">
                  <label className="form-label-nexus" htmlFor="username">Username <span className="req">*</span></label>
                  <div className="position-relative">
                    <input type="text" id="username" className="form-control-nexus" placeholder="Choose a username" autoComplete="username"
                      value={fields.username} onChange={e => { set('username', e.target.value); validateUsername(e.target.value); }} />
                    <i className="bi bi-at input-icon"></i>
                  </div>
                  <div className={`field-error${hasError.username ? ' show' : ''}`}><i className="bi bi-exclamation-circle"></i><span> {errors.username}</span></div>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Password */}
              <div className="col-md-6">
                <div className={`input-nexus-group${hasError.password ? ' has-error' : ''}${hasSuccess.password ? ' has-success' : ''}`} id="passwordGroup">
                  <label className="form-label-nexus" htmlFor="password">Password <span className="req">*</span></label>
                  <div className="position-relative">
                    <input type={showPwd ? 'text' : 'password'} id="password" className="form-control-nexus pwd-field" placeholder="Create a password" autoComplete="new-password"
                      value={fields.password} onChange={e => { set('password', e.target.value); validatePassword(e.target.value); if (fields.confirmPassword) validateConfirmPassword(); }} />
                    <i className="bi bi-lock input-icon"></i>
                    <button type="button" className="toggle-pwd" id="togglePwd" onClick={() => setShowPwd(v => !v)}>
                      <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  <div className={`password-strength${pwdStrength ? ` ${pwdStrength}` : ''}`} id="pwdStrength">
                    <div className="bar"></div><div className="bar"></div><div className="bar"></div>
                  </div>
                  <div className={`field-error${hasError.password ? ' show' : ''}`}><i className="bi bi-exclamation-circle"></i><span> {errors.password}</span></div>
                </div>
              </div>
              {/* Confirm Password */}
              <div className="col-md-6">
                <div className={`input-nexus-group${hasError.confirmPassword ? ' has-error' : ''}${hasSuccess.confirmPassword ? ' has-success' : ''}`} id="confirmPasswordGroup">
                  <label className="form-label-nexus" htmlFor="confirmPassword">Confirm Password <span className="req">*</span></label>
                  <div className="position-relative">
                    <input type={showConfirmPwd ? 'text' : 'password'} id="confirmPassword" className="form-control-nexus pwd-field" placeholder="Re-enter password" autoComplete="new-password"
                      value={fields.confirmPassword} onChange={e => { set('confirmPassword', e.target.value); validateConfirmPassword(e.target.value); }} />
                    <i className="bi bi-lock-fill input-icon"></i>
                    <button type="button" className="toggle-pwd" id="toggleConfirmPwd" onClick={() => setShowConfirmPwd(v => !v)}>
                      <i className={`bi ${showConfirmPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  <div className={`field-error${hasError.confirmPassword ? ' show' : ''}`}><i className="bi bi-exclamation-circle"></i><span> {errors.confirmPassword}</span></div>
                  <div className={`field-success${confirmSuccess ? ' show' : ''}`}><i className="bi bi-check-circle"></i><span> Passwords match.</span></div>
                </div>
              </div>
            </div>

            <p className="section-tag">Academic Details</p>

            {/* College */}
            <div className={`input-nexus-group${hasError.college ? ' has-error' : ''}${hasSuccess.college ? ' has-success' : ''}`} id="collegeGroup">
              <label className="form-label-nexus" htmlFor="college">College / University <span className="req">*</span></label>
              <div className="position-relative">
                <input type="text" id="college" className="form-control-nexus" placeholder="e.g. National Institute of Technology" autoComplete="organization"
                  value={fields.college} onChange={e => { set('college', e.target.value); validateCollege(e.target.value); }} />
                <i className="bi bi-building input-icon"></i>
              </div>
              <div className={`field-error${hasError.college ? ' show' : ''}`}><i className="bi bi-exclamation-circle"></i><span> {errors.college}</span></div>
            </div>

            <div className="row">
              {/* Department */}
              <div className="col-md-6">
                <div className={`input-nexus-group${hasError.department ? ' has-error' : ''}${hasSuccess.department ? ' has-success' : ''}`} id="departmentGroup">
                  <label className="form-label-nexus" htmlFor="department">Department <span className="req">*</span></label>
                  <div className="position-relative">
                    <select id="department" className="form-select-nexus" value={fields.department} onChange={e => { set('department', e.target.value); validateDepartment(e.target.value); }}>
                      <option value="" disabled>Select department</option>
                      <option>Computer Science</option>
                      <option>Information Technology</option>
                      <option>Electronics &amp; Communication</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                      <option>Business Administration</option>
                      <option>Other</option>
                    </select>
                    <i className="bi bi-mortarboard input-icon"></i>
                  </div>
                  <div className={`field-error${hasError.department ? ' show' : ''}`}><i className="bi bi-exclamation-circle"></i><span> {errors.department}</span></div>
                </div>
              </div>
              {/* Year */}
              <div className="col-md-6">
                <div className={`input-nexus-group${hasError.year ? ' has-error' : ''}${hasSuccess.year ? ' has-success' : ''}`} id="yearGroup">
                  <label className="form-label-nexus" htmlFor="year">Year <span className="req">*</span></label>
                  <div className="position-relative">
                    <select id="year" className="form-select-nexus" value={fields.year} onChange={e => { set('year', e.target.value); validateYear(e.target.value); }}>
                      <option value="" disabled>Select year</option>
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                      <option>Final Year</option>
                    </select>
                    <i className="bi bi-calendar3 input-icon"></i>
                  </div>
                  <div className={`field-error${hasError.year ? ' show' : ''}`}><i className="bi bi-exclamation-circle"></i><span> {errors.year}</span></div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className={`input-nexus-group${hasError.phoneNumber ? ' has-error' : ''}${hasSuccess.phoneNumber ? ' has-success' : ''}`} id="phoneNumberGroup">
              <label className="form-label-nexus" htmlFor="phoneNumber">Phone Number</label>
              <div className="position-relative">
                <input type="tel" id="phoneNumber" className="form-control-nexus" placeholder="e.g. +91 98765 43210" autoComplete="tel"
                  value={fields.phoneNumber} onChange={e => { set('phoneNumber', e.target.value); validatePhone(e.target.value); }} />
                <i className="bi bi-telephone input-icon"></i>
              </div>
              <div className={`field-error${hasError.phoneNumber ? ' show' : ''}`}><i className="bi bi-exclamation-circle"></i><span> {errors.phoneNumber}</span></div>
            </div>

            {/* Terms */}
            <div className="mt-2 mb-1">
              <label className="terms-check">
                <input type="checkbox" id="acceptTerms" checked={acceptTerms}
                  onChange={e => { setAcceptTerms(e.target.checked); validateTerms(e.target.checked); updateProgress(fields, e.target.checked); }} />
                I accept the <a href="#">Terms &amp; Conditions</a> and <a href="#">Privacy Policy</a>.
              </label>
              <div className={`field-error${hasError.terms ? ' show' : ''}`} id="termsError" style={{ marginLeft: '1.75rem' }}>
                <i className="bi bi-exclamation-circle"></i><span> {errors.terms}</span>
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className={`btn-nexus-primary${loading ? ' loading' : ''}`} id="registerBtn" disabled={loading}>
                <span className="spinner-border" role="status" aria-hidden="true"></span>
                <span className="btn-text">Register</span>
              </button>
            </div>

            <div className="divider-row google-divider">OR</div>

            <button type="button" className="btn-google" id="googleRegisterBtn" aria-label="Continue with Google" onClick={handleGoogleRegister}>
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="btn-text">Continue with Google</span>
            </button>

            <div className="divider-row">Already have an account?</div>

            <Link to={ROUTES.LOGIN} className="btn-nexus-outline" id="backToLoginBtn">
              <i className="bi bi-box-arrow-in-left"></i> Back to Login
            </Link>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
