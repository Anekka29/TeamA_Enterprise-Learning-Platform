import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/images/logo.png';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import ProfileService from '../../services/ProfileService';
import CourseService from '../../services/CourseService';
import AdminService from '../../services/AdminService';
import NotificationBell from './NotificationBell';
import ThemeToggle from '../Common/ThemeToggle';
import apiClient from '../../api/apiClient';

// Dynamic Tool & Navigation Registry grouped by Role
const TOOLS_REGISTRY = {
  STUDENT: [
    { title: 'Overview Dashboard', category: 'Dashboard', icon: 'bi-speedometer2', href: '/student-dashboard#dashboard', keywords: 'home overview dashboard analytics stats' },
    { title: 'Course Catalog & Explore', category: 'Learning', icon: 'bi-collection-play-fill', href: '/student-dashboard#catalog', keywords: 'courses explore catalog search enroll learn' },
    { title: 'AI Assistant & Tutor', category: 'AI Tools', icon: 'bi-robot', href: '/student-dashboard#ai-tutor', keywords: 'ai tutor assistant chat ask help bot' },
    { title: 'AI Career Roadmap', category: 'Roadmap', icon: 'bi-signpost-split-fill', href: '/student-dashboard#roadmap', keywords: 'roadmap career path skills goal timeline' },
    { title: 'Skill Gap Analysis', category: 'AI Tools', icon: 'bi-bar-chart-steps', href: '/student-dashboard#skill-gap', keywords: 'skill gap analysis radar assessment missing' },
    { title: 'Resume & CV Builder', category: 'Career Tools', icon: 'bi-file-earmark-person-fill', href: '/student-dashboard#resume-builder', keywords: 'resume cv builder export pdf template alex student' },
    { title: 'Coding Practice & IDE', category: 'Practice', icon: 'bi-code-slash', href: '/student-dashboard#coding-practice', keywords: 'code coding ide editor practice compiler java python react' },
    { title: 'Internships & Job Portal', category: 'Careers', icon: 'bi-briefcase-fill', href: '/student-dashboard#internships', keywords: 'internships jobs career opportunities apply hiring' },
    { title: 'Learning Analytics', category: 'Stats', icon: 'bi-graph-up-arrow', href: '/student-dashboard#analytics', keywords: 'analytics metrics progress stats hours completed' },
    { title: 'Quizzes & Practice Tests', category: 'Assessment', icon: 'bi-patch-question-fill', href: '/student-dashboard#quizzes', keywords: 'quiz test assessment exam questions score' },
    { title: 'Assignments & Projects', category: 'Work', icon: 'bi-card-checklist', href: '/student-dashboard#assignments', keywords: 'assignments projects tasks submit deadline homework' },
    { title: 'Certificates & Credentials', category: 'Achievements', icon: 'bi-award-fill', href: '/student-dashboard#certificates', keywords: 'certificate credentials degree download verify diploma' },
    { title: 'Notifications Center', category: 'System', icon: 'bi-bell-fill', href: '/student-dashboard#notifications', keywords: 'notifications alerts unread updates messages' },
    { title: 'Account Settings', category: 'Settings', icon: 'bi-gear-fill', href: ROUTES.SETTINGS, keywords: 'settings profile security theme dark light password email' },
    { title: 'My Profile', category: 'Account', icon: 'bi-person-fill', href: ROUTES.MY_PROFILE, keywords: 'my profile user info account details bio' },
    { title: 'Edit Profile', category: 'Account', icon: 'bi-person-gear', href: ROUTES.EDIT_PROFILE, keywords: 'edit profile picture photo update name phone college' },
  ],
  MENTOR: [
    { title: 'Mentor Dashboard', category: 'Dashboard', icon: 'bi-house-fill', href: '/mentor-dashboard#dashboard', keywords: 'mentor dashboard overview stats students' },
    { title: 'My Courses & Management', category: 'Courses', icon: 'bi-collection-play-fill', href: '/mentor-dashboard#courses', keywords: 'mentor courses manage create edit publish draft' },
    { title: 'Lessons & Modules Editor', category: 'Content', icon: 'bi-folder-fill', href: '/mentor-dashboard#modules', keywords: 'lessons modules curriculum video pdf chapters' },
    { title: 'Grading & Assignments', category: 'Grading', icon: 'bi-file-earmark-text-fill', href: '/mentor-dashboard#assignments', keywords: 'grading review assignments submissions feedback marks' },
    { title: 'Quizzes & Question Bank', category: 'Quizzes', icon: 'bi-patch-question-fill', href: '/mentor-dashboard#quizzes', keywords: 'quizzes question bank create test mcq' },
    { title: 'Mentorship Sessions Scheduler', category: 'Sessions', icon: 'bi-calendar-event-fill', href: '/mentor-dashboard#sessions', keywords: 'sessions 1-on-1 schedule calendar meet zoom' },
    { title: 'Internships & Hiring Portal', category: 'Careers', icon: 'bi-briefcase-fill', href: '/mentor-dashboard#internships', keywords: 'internships hiring post recruiter applications review shortlist accept reject' },
    { title: 'Student Roster & Attendance', category: 'Students', icon: 'bi-journal-check', href: '/mentor-dashboard#analytics', keywords: 'roster students attendance enrolled progress list' },
    { title: 'Inbox & Student Messages', category: 'Messages', icon: 'bi-chat-left-text-fill', href: '/mentor-dashboard#messages', keywords: 'inbox messages chat student inquiries support' },
    { title: 'Account Settings', category: 'Settings', icon: 'bi-gear-fill', href: ROUTES.SETTINGS, keywords: 'settings theme dark light password email' },
    { title: 'My Profile', category: 'Account', icon: 'bi-person-fill', href: ROUTES.MY_PROFILE, keywords: 'my profile user info account details bio' },
    { title: 'Edit Profile', category: 'Account', icon: 'bi-person-gear', href: ROUTES.EDIT_PROFILE, keywords: 'edit profile photo company job title' },
  ],
  ADMIN: [
    { title: 'Admin Overview', category: 'Dashboard', icon: 'bi-house-fill', href: '/admin-dashboard#dashboard', keywords: 'admin dashboard platform stats metrics' },
    { title: 'User Management', category: 'Users', icon: 'bi-people-fill', href: '/admin-dashboard#users', keywords: 'users manage accounts ban reset activate students mentors' },
    { title: 'Role Management & Access', category: 'Permissions', icon: 'bi-person-badge-fill', href: '/admin-dashboard#roles', keywords: 'roles permissions access admin mentor student change role' },
    { title: 'Course Approvals & Quality', category: 'Approvals', icon: 'bi-check-circle-fill', href: '/admin-dashboard#approvals', keywords: 'approvals courses pending verify reject publish review' },
    { title: 'Internships & Hiring Portal', category: 'Careers', icon: 'bi-briefcase-fill', href: '/admin-dashboard#internships', keywords: 'internships hiring admin manage partner openings applications' },
    { title: 'Support Tickets & Complaints', category: 'Support', icon: 'bi-chat-left-text-fill', href: '/admin-dashboard#complaints', keywords: 'complaints tickets support issues resolve reports' },
    { title: 'Audit Logs & Security', category: 'Security', icon: 'bi-shield-lock-fill', href: '/admin-dashboard#audits', keywords: 'audit logs security actions history admin activity' },
    { title: 'Account Settings', category: 'Settings', icon: 'bi-gear-fill', href: ROUTES.SETTINGS, keywords: 'settings security theme dark light' },
    { title: 'My Profile', category: 'Account', icon: 'bi-person-fill', href: ROUTES.MY_PROFILE, keywords: 'admin profile account' },
  ]
};

// Popular Career Roadmaps List
const ROADMAPS_PRESETS = [
  { title: 'Full-Stack Web Development Roadmap', category: 'Roadmap', icon: 'bi-signpost-2', href: '/student-dashboard#roadmap', keywords: 'fullstack web react node html css javascript sql' },
  { title: 'Data Science & Machine Learning Pathway', category: 'Roadmap', icon: 'bi-cpu-fill', href: '/student-dashboard#roadmap', keywords: 'data science machine learning python pandas scikit AI' },
  { title: 'AI Engineering & LLM Application Path', category: 'Roadmap', icon: 'bi-robot', href: '/student-dashboard#roadmap', keywords: 'ai llm deep learning pytorch langchain prompt engineering' },
  { title: 'Cybersecurity & Ethical Hacking Roadmap', category: 'Roadmap', icon: 'bi-shield-shaded', href: '/student-dashboard#roadmap', keywords: 'cybersecurity hacking security network linux defense' },
  { title: 'Cloud Architecture & DevOps Pathway', category: 'Roadmap', icon: 'bi-cloud-check-fill', href: '/student-dashboard#roadmap', keywords: 'devops cloud aws docker kubernetes ci cd linux' },
  { title: 'Mobile App Development (React Native & Flutter)', category: 'Roadmap', icon: 'bi-phone-fill', href: '/student-dashboard#roadmap', keywords: 'mobile app react native flutter ios android development' },
  { title: 'UI/UX Product Design Pathway', category: 'Roadmap', icon: 'bi-palette-fill', href: '/student-dashboard#roadmap', keywords: 'ui ux design figma wireframes prototyping user research' },
];

/**
 * Dashboard top navbar with real-time global search for Student, Mentor & Admin
 */
export default function DashboardNavbar({ searchPlaceholder = "Search courses, roadmaps, tools, users...", onMobileMenuToggle }) {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImg, setProfileImg] = useState(user?.profileImage || '');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Help / Support Complaint Modal State
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState('TECHNICAL');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSuccessMessage, setComplaintSuccessMessage] = useState('');

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const role = (user?.role || 'STUDENT').toUpperCase();
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : (user?.role?.charAt(0) || 'U');
  const displayName = user?.name || user?.role || 'User';
  const roleDisplay = user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'User';

  const handleSendComplaint = async (e) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDescription.trim()) return;

    setSubmittingComplaint(true);
    setComplaintSuccessMessage('');
    try {
      const res = await apiClient.post('/api/complaints', {
        subject: complaintSubject.trim(),
        description: complaintDescription.trim(),
        category: complaintCategory
      });
      const ticketId = res.data?.id ? `#${res.data.id}` : '';
      setComplaintSuccessMessage(`Complaint ticket ${ticketId} submitted successfully! The admin team will review it shortly.`);
      setComplaintSubject('');
      setComplaintDescription('');
      setComplaintCategory('TECHNICAL');
      setTimeout(() => {
        setComplaintSuccessMessage('');
        setShowHelpModal(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      alert('Failed to submit complaint ticket. Please try again.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Fetch current profile image on mount and sync on profile updates
  useEffect(() => {
    let isMounted = true;
    const fetchNavProfile = async () => {
      try {
        const res = await ProfileService.getCurrentProfile();
        if (res.data && isMounted) {
          const img = typeof res.data.profileImage === 'string'
            ? res.data.profileImage
            : (res.data.profileData?.profileImage || res.data.avatarUrl || '');
          setProfileImg(img);
        }
      } catch (e) {
        // silent
      }
    };

    fetchNavProfile();

    const handleProfileUpdate = () => {
      fetchNavProfile();
      if (refreshUser) refreshUser();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [refreshUser]);

  // Global keyboard shortcut: Ctrl+K or '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement !== inputRef.current)) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Real-time search query processor
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsSearchOpen(true);

    const timer = setTimeout(async () => {
      const results = [];

      // 1. Filter Role-based Tools & Navigation Items
      const userTools = TOOLS_REGISTRY[role] || TOOLS_REGISTRY.STUDENT;
      const matchedTools = userTools.filter((t) =>
        t.title.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.keywords.toLowerCase().includes(query)
      );

      if (matchedTools.length > 0) {
        results.push({
          group: 'Tools & Navigation',
          items: matchedTools.slice(0, 5)
        });
      }

      // 2. Filter Career Roadmaps
      const matchedRoadmaps = ROADMAPS_PRESETS.filter((r) =>
        r.title.toLowerCase().includes(query) ||
        r.keywords.toLowerCase().includes(query)
      );

      if (matchedRoadmaps.length > 0) {
        results.push({
          group: 'Career Roadmaps',
          items: matchedRoadmaps.slice(0, 3)
        });
      }

      // 3. Fetch Matching Courses from Backend
      try {
        const coursesData = await CourseService.getPublishedCourses(query);
        const courseItems = Array.isArray(coursesData)
          ? coursesData.map((c) => ({
              id: c.id,
              title: c.title || c.name,
              category: c.category || 'Course',
              icon: 'bi-journal-code',
              subtitle: `By ${c.instructorName || c.mentorName || 'Instructor'} • ${c.level || 'All Levels'}`,
              href: `/student-dashboard/courses/${c.id}`
            }))
          : [];

        if (courseItems.length > 0) {
          results.push({
            group: 'Courses & Catalog',
            items: courseItems.slice(0, 5)
          });
        }
      } catch (err) {
        // Fallback local course matches if API request is offline
      }

      // 4. Admin Specific: Fetch Users matching query
      if (role === 'ADMIN') {
        try {
          const usersRes = await AdminService.getAllUsers();
          const usersList = Array.isArray(usersRes.data) ? usersRes.data : [];
          const matchedUsers = usersList
            .filter((u) =>
              (u.name && u.name.toLowerCase().includes(query)) ||
              (u.email && u.email.toLowerCase().includes(query)) ||
              (u.role && u.role.toLowerCase().includes(query))
            )
            .map((u) => ({
              id: u.id,
              title: u.name || u.email,
              category: u.role || 'USER',
              icon: 'bi-person-circle',
              subtitle: u.email,
              href: '/admin-dashboard#users'
            }));

          if (matchedUsers.length > 0) {
            results.push({
              group: 'Platform Users',
              items: matchedUsers.slice(0, 4)
            });
          }
        } catch (err) {
          // silent fallback
        }
      }

      setSearchResults(results);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, role]);

  const handleResultClick = (href) => {
    setIsSearchOpen(false);
    setSearchQuery('');

    if (!href) return;

    // Check if link contains a hash (e.g. /student-dashboard#resume-builder)
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      const targetHash = `#${hash}`;

      // If we are already on that page layout, change hash directly
      if (window.location.pathname.startsWith(path) || path === '') {
        window.location.hash = targetHash;
      } else {
        navigate(`${path}${targetHash}`);
      }
    } else {
      navigate(href);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate(ROUTES.HOME);
  };

  const displayImage = user?.profileImage || profileImg;

  return (
    <nav className="navbar dashboard-navbar-theme shadow-sm px-3 py-2 w-100 rounded-4 mb-4" style={{ zIndex: 1050 }}>
      <div className="container-fluid d-flex align-items-center justify-content-between gap-2">
        
        {/* Left Side: Mobile Menu Toggler + Logo */}
        <div className="d-flex align-items-center gap-3">
          <button className="mobile-menu-btn d-lg-none" id="mobileMenuBtn" onClick={onMobileMenuToggle}>
            <i className="bi bi-list fs-5"></i>
          </button>
          
          <Link className="dashboard-navbar-brand text-decoration-none" to={ROUTES.HOME}>
            <img src={logoImg} alt="Enterprise Learning Platform with Skill and Career Guidance System" style={{ height: '38px', objectFit: 'contain' }} />
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <div className="d-flex flex-grow-1 justify-content-center px-lg-4" ref={searchRef}>
          <div className="dashboard-search-bar w-100" style={{ maxWidth: '540px' }}>
            <i className="bi bi-search"></i>
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              className="w-100 form-control rounded-pill ps-5 pe-5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setIsSearchOpen(true); }}
            />

            {/* Clear Input Button */}
            {searchQuery ? (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearchOpen(false);
                  inputRef.current?.focus();
                }}
                title="Clear Search"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            ) : (
              <span
                className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted small d-none d-md-inline-block pointer-events-none"
                style={{ opacity: 0.6, fontSize: '0.72rem', background: 'rgba(0,0,0,0.06)', padding: '2px 7px', borderRadius: '4px' }}
              >
                Ctrl K
              </span>
            )}

            {/* Floating Global Search Results Dropdown */}
            {isSearchOpen && (
              <div className="global-search-results">
                {isSearching ? (
                  <div className="search-no-results py-4 text-center">
                    <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    <span>Searching platform resources...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="search-no-results py-4 text-center">
                    <i className="bi bi-search fs-3 text-muted d-block mb-2"></i>
                    <span>No results found for "<strong>{searchQuery}</strong>"</span>
                    <p className="small text-muted mt-1 mb-0">Try searching for <em>"React"</em>, <em>"Resume"</em>, <em>"Roadmap"</em>, or <em>"Settings"</em>.</p>
                  </div>
                ) : (
                  searchResults.map((group, idx) => (
                    <div key={idx} className="search-group">
                      <div className="search-group-title">{group.group}</div>
                      {group.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="search-result-item"
                          onClick={() => handleResultClick(item.href)}
                        >
                          <div className="search-item-icon">
                            <i className={`bi ${item.icon || 'bi-layers-fill'}`}></i>
                          </div>
                          <div className="search-item-info">
                            <div className="search-item-title">{item.title}</div>
                            {item.subtitle && <div className="search-item-sub">{item.subtitle}</div>}
                          </div>
                          <span className="search-item-badge">{item.category}</span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Support Help Button, Dark Mode Toggle, Notifications & Profile */}
        <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto">
          
          {/* Help & Raise Complaint Support Button (Student Only) */}
          {role === 'STUDENT' && (
            <button 
              type="button"
              className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm border"
              style={{ width: '38px', height: '38px', transition: 'all 0.25s ease' }}
              onClick={() => setShowHelpModal(true)}
              title="Raise Support Complaint / Help Desk"
            >
              <i className="bi bi-question-circle-fill fs-5 text-success"></i>
            </button>
          )}

          {/* Dark / Light Mode Toggle Button */}
          <ThemeToggle />

          {/* Notifications Bell */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="profile-dropdown" ref={menuRef}>
            <div className="profile-trigger" onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}>
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar d-flex align-items-center justify-content-center overflow-hidden" id="navProfileAvatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
                  {displayImage ? (
                    <img src={displayImage} alt={displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    initials
                  )}
                </div>
                <div className="profile-online-indicator"></div>
              </div>
              <div className="profile-info d-none d-md-flex flex-column align-items-start">
                <span className="profile-name" id="navProfileName">{displayName}</span>
                <span className="profile-role-badge">{roleDisplay}</span>
              </div>
              <i className="bi bi-chevron-down ms-1"></i>
            </div>

            <div className={`profile-menu${menuOpen ? ' show' : ''}`}>
              <Link className="profile-menu-item" to={ROUTES.MY_PROFILE} onClick={() => setMenuOpen(false)}>
                <i className="bi bi-person"></i> My Profile
              </Link>
              <Link className="profile-menu-item" to={ROUTES.EDIT_PROFILE} onClick={() => setMenuOpen(false)}>
                <i className="bi bi-person-gear"></i> Edit Profile
              </Link>
              <Link className="profile-menu-item" to={ROUTES.SETTINGS} onClick={() => setMenuOpen(false)}>
                <i className="bi bi-gear"></i> Settings
              </Link>
              {role === 'STUDENT' && (
                <button 
                  type="button" 
                  className="profile-menu-item border-0 bg-transparent w-100 text-start" 
                  onClick={() => { setMenuOpen(false); setShowHelpModal(true); }}
                >
                  <i className="bi bi-headset text-success"></i> Help & Complaints Desk
                </button>
              )}
              <div className="profile-divider"></div>
              <a className="profile-menu-item" href="#" id="logoutBtn" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Log Out
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Real-World Help & Complaint Submission Modal */}
      {showHelpModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1065 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '540px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-start">
              <div className="modal-header border-0 bg-success text-white p-4">
                <div>
                  <h5 className="modal-title fw-bold mb-1 d-flex align-items-center gap-2">
                    <i className="bi bi-headset fs-4"></i> Raise Support Complaint
                  </h5>
                  <p className="mb-0 text-white-50 extra-small">
                    Directly submit your issue to Enterprise Learning Platform Administrators. We review tickets promptly.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setShowHelpModal(false); setComplaintSuccessMessage(''); }}
                ></button>
              </div>
              
              <form onSubmit={handleSendComplaint}>
                <div className="modal-body p-4">
                  {complaintSuccessMessage && (
                    <div className="alert alert-success border-0 shadow-sm rounded-3 d-flex align-items-center gap-2 mb-3">
                      <i className="bi bi-check-circle-fill fs-5"></i>
                      <div className="small fw-semibold">{complaintSuccessMessage}</div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-dark text-uppercase">Complaint Category</label>
                    <select 
                      className="form-select rounded-3" 
                      value={complaintCategory} 
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      required
                    >
                      <option value="TECHNICAL">Technical & Platform Issue</option>
                      <option value="COURSE">Course & Learning Content</option>
                      <option value="BILLING">Billing & Payments</option>
                      <option value="CERTIFICATE">Certificate & Achievements</option>
                      <option value="GENERAL">General Inquiry / Feedback</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-dark text-uppercase">Subject / Issue Title</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      placeholder="e.g., Video lecture not loading in Java course"
                      value={complaintSubject} 
                      onChange={(e) => setComplaintSubject(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-dark text-uppercase">Detailed Description</label>
                    <textarea 
                      className="form-control rounded-3" 
                      rows={4} 
                      placeholder="Describe what happened, error codes, or steps to reproduce..."
                      value={complaintDescription} 
                      onChange={(e) => setComplaintDescription(e.target.value)} 
                      required 
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top p-3 d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-light rounded-pill px-4 fw-semibold border" 
                    onClick={() => { setShowHelpModal(false); setComplaintSuccessMessage(''); }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                    disabled={submittingComplaint}
                  >
                    {submittingComplaint ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span> Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill"></i> Submit Complaint
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
