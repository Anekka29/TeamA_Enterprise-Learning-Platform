import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './Common/ThemeToggle';

/**
 * Enterprise-grade Luxury Floating Glassmorphism Navbar.
 * Features:
 * - Floating Frosted Glass Pill Container with Specular Edge Highlights
 * - Brand Logo with glowing Nexus Status Badge
 * - Centered Navigation Capsule Links with Subtle Micro-Animations
 * - User Session Chip & Role Badge Indicator
 * - Smooth Dark/Light Mode Seamless Adaptability
 */
export default function Navbar() {
  const navRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Scroll glassmorphic effect
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 20) {
          navRef.current.classList.add('navbar-scrolled');
        } else {
          navRef.current.classList.remove('navbar-scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileNav = () => {
    setIsMobileMenuOpen(false);
  };

  const roleDisplay = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Student';
  const userName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="floating-navbar-wrapper" ref={navRef}>
      <nav className="floating-navbar-pill">
        <div className="d-flex align-items-center justify-content-between w-100 position-relative">
          
          {/* FAR LEFT: Brand Logo (Only Logo as requested) */}
          <Link className="d-flex align-items-center text-decoration-none" to="/" onClick={closeMobileNav}>
            <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
              <div className="position-absolute w-100 h-100 rounded-circle" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)' }}></div>
              <img src={logoImg} alt="Enterprise Learning Platform with Skill and Career Guidance System" style={{ height: '38px', width: 'auto', objectFit: 'contain', zIndex: 1 }} />
            </div>
          </Link>

          {/* Mobile Hamburger Toggler */}
          <button
            className="navbar-toggler border-0 shadow-none d-lg-none p-1 text-dark ms-auto me-2"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
          >
            <i className={`bi ${isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-2`}></i>
          </button>

          {/* CENTERED: Luxury Navigation Links (Strict Horizontal Flex Row) */}
          <div className={`nav-links-horizontal ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <a className="nav-link-capsule" href="#home" onClick={closeMobileNav}>
              <i className="bi bi-house-door-fill text-success fs-6"></i> Home
            </a>
            <a className="nav-link-capsule" href="#features" onClick={closeMobileNav}>
              <i className="bi bi-stars text-warning fs-6"></i> Features
            </a>
            <a className="nav-link-capsule" href="#roadmaps" onClick={closeMobileNav}>
              <i className="bi bi-signpost-split-fill text-primary fs-6"></i> Roadmaps
            </a>
            <a className="nav-link-capsule" href="#about" onClick={closeMobileNav}>
              <i className="bi bi-info-circle-fill text-info fs-6"></i> About
            </a>
          </div>

          {/* FAR RIGHT: Mode Toggle & Action Cluster */}
          <div className="d-flex align-items-center gap-2 ms-auto ms-lg-0">
            {/* 1-Click Theme Toggle Button */}
            <div className="rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <div className="nav-user-chip d-none d-md-flex">
                  <div className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center shadow-xs" style={{ width: '28px', height: '28px', fontSize: '0.78rem' }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-bold text-dark small me-1">{userName}</span>
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small fw-semibold" style={{ fontSize: '0.68rem' }}>
                    {roleDisplay}
                  </span>
                </div>

                <Link
                  to={ROUTES.DASHBOARD}
                  className="btn btn-nav-gradient rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 small text-white text-decoration-none"
                  style={{ height: '38px', fontSize: '0.85rem' }}
                  onClick={closeMobileNav}
                >
                  <i className="bi bi-grid-fill fs-6"></i>
                  <span className="d-none d-sm-inline">Dashboard</span>
                </Link>

                <button
                  type="button"
                  className="btn btn-outline-danger rounded-circle d-inline-flex align-items-center justify-content-center p-0"
                  style={{ width: '38px', height: '38px', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  onClick={() => {
                    logout();
                    closeMobileNav();
                  }}
                  title="Logout"
                >
                  <i className="bi bi-box-arrow-right fs-6"></i>
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="btn btn-outline-success rounded-pill fw-bold px-3 py-2 d-inline-flex align-items-center justify-content-center small"
                  style={{ height: '38px', fontSize: '0.85rem' }}
                  onClick={closeMobileNav}
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="btn btn-nav-gradient rounded-pill px-4 py-2 d-inline-flex align-items-center justify-content-center small text-white text-decoration-none"
                  style={{ height: '38px', fontSize: '0.85rem' }}
                  onClick={closeMobileNav}
                >
                  Get Started <i className="bi bi-arrow-right ms-1 fs-6"></i>
                </Link>
              </div>
            )}
          </div>

        </div>
      </nav>
    </div>
  );
}

