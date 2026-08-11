import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/images/logo.png';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

/**
 * Dashboard top navbar using standard Bootstrap layout
 */
export default function DashboardNavbar({ searchPlaceholder = "Search courses, mentors, resources...", notificationCount = 0, onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : (user?.role?.charAt(0) || 'U');
  const displayName = user?.name || user?.role || 'User';
  const roleDisplay = user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'User';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <nav className="navbar bg-white shadow-sm px-3 py-2 w-100 rounded-4 mb-4" style={{ zIndex: 10 }}>
      <div className="container-fluid d-flex align-items-center justify-content-between gap-2">
        
        {/* Left Side: Mobile Menu Toggler + Logo */}
        <div className="d-flex align-items-center gap-3">
          <button className="mobile-menu-btn d-lg-none" id="mobileMenuBtn" onClick={onMobileMenuToggle}>
            <i className="bi bi-list fs-5"></i>
          </button>
          
          <Link className="dashboard-navbar-brand text-decoration-none" to={ROUTES.HOME}>
            <img src={logoImg} alt="SkillSphere Nexus" />
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="d-flex flex-grow-1 justify-content-center px-lg-5">
          <div className="dashboard-search-bar w-100" style={{ maxWidth: '500px' }}>
            <i className="bi bi-search"></i>
            <input type="text" placeholder={searchPlaceholder} className="w-100 form-control rounded-pill ps-5" />
          </div>
        </div>

        {/* Right Side: Notifications & Profile */}
        <div className="d-flex align-items-center gap-3 ms-auto">
          <div className="notification-bell">
            <i className="bi bi-bell"></i>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>

          <div className="profile-dropdown" ref={menuRef}>
            <div className="profile-trigger" onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}>
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar" id="navProfileAvatar">{initials}</div>
                <div className="profile-online-indicator"></div>
              </div>
              <div className="profile-info d-none d-md-flex flex-column align-items-start">
                <span className="profile-name" id="navProfileName">{displayName}</span>
                <span className="profile-role-badge">{roleDisplay}</span>
              </div>
              <i className="bi bi-chevron-down ms-1"></i>
            </div>

            <div className={`profile-menu${menuOpen ? ' show' : ''}`}>
              <a className="profile-menu-item" href="#">
                <i className="bi bi-person"></i> My Profile
              </a>
              <a className="profile-menu-item" href="#">
                <i className="bi bi-gear"></i> Settings
              </a>
              <div className="profile-divider"></div>
              <a className="profile-menu-item" href="#" id="logoutBtn" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Logout
              </a>
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
}
