import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';
import { ROUTES } from '../constants/routes';

/**
 * Landing page navbar with React-driven mobile menu overlay.
 */
export default function Navbar() {
  const navRef = useRef(null);
  const [lastScroll, setLastScroll] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll-hide / scroll-show effect
  useEffect(() => {
    const navbar = navRef.current;
    if (!navbar) return;

    const handleScroll = () => {
      // Don't hide navbar while mobile menu is open
      if (isMobileMenuOpen) return;

      const currentScroll = window.pageYOffset;
      if (currentScroll <= 20) {
        navbar.classList.remove('navbar-hidden');
        setLastScroll(currentScroll);
        return;
      }
      if (currentScroll > lastScroll) {
        navbar.classList.add('navbar-hidden');
      } else {
        navbar.classList.remove('navbar-hidden');
      }
      setLastScroll(currentScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll, isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMobileMenuOpen]);

  const toggleMobileNav = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileNav = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-nexus" id="mainNav" ref={navRef}>
      <div className="container container-xl">
        <a className="brand-logo" href="#home" onClick={closeMobileNav}>
          <img src={logoImg} alt="SkillSphere Nexus Logo" className="brand-img" />
        </a>

        <button
          className="navbar-toggler border-0 shadow-none d-lg-none"
          type="button"
          onClick={toggleMobileNav}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation"
        >
          <i className={`bi ${isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-2`}></i>
        </button>

        <div className={`mobile-menu-overlay d-lg-flex ${isMobileMenuOpen ? 'show' : ''}`} id="navMenu">
          <ul className="navbar-nav mx-auto my-4 my-lg-0 gap-lg-1 text-center d-flex flex-column flex-lg-row w-100 justify-content-lg-center">
            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="#home" onClick={closeMobileNav}>Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="#features" onClick={closeMobileNav}>Features</a>
            </li>
            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="#roadmaps" onClick={closeMobileNav}>Roadmaps</a>
            </li>
            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="#about" onClick={closeMobileNav}>About</a>
            </li>
          </ul>
          <div className="d-flex flex-column flex-lg-row gap-3 gap-lg-2 justify-content-center w-100 w-lg-auto mt-3 mt-lg-0">
            <Link to={ROUTES.LOGIN} className="btn btn-nexus-outline w-100 w-lg-auto" onClick={closeMobileNav}>Login</Link>
            <Link to={ROUTES.REGISTER} className="btn btn-nexus-primary w-100 w-lg-auto" onClick={closeMobileNav}>Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
