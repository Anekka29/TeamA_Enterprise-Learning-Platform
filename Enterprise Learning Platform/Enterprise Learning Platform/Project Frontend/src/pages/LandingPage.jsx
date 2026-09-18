import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import CourseService from '../services/CourseService';
import { COURSE_CATEGORIES } from '../constants/categories';
import { getCourseThumbnailUrl } from '../utils/courseImageHelper';
import '../styles/landing.css';

import logoImg from '../assets/images/logo.png';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Dynamic Course State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  // Text Conveyor Rotator phrases for Hero Heading
  const conveyorPhrases = [
    'Enterprise Learning Platform with Skill & Career Guidance System',
    'AI Career Guidance',
    'Real Internships',
    'ATS Resume Builder',
    'In-Browser Code IDE',
  ];
  const [conveyorIndex, setConveyorIndex] = useState(0);
  const [fadeConveyor, setFadeConveyor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeConveyor(false);
      setTimeout(() => {
        setConveyorIndex((prevIndex) => (prevIndex + 1) % conveyorPhrases.length);
        setFadeConveyor(true);
      }, 350);
    }, 2800);

    return () => clearInterval(interval);
  }, [conveyorPhrases.length]);

  // Scroll-reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [courses, loading, currentPage]);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CourseService.getPublishedCourses(searchTerm, selectedCategory);
      setCourses(Array.isArray(data) ? data : []);
      setCurrentPage(1); // Reset page on category/search change
    } catch (err) {
      console.error('Failed to load published courses', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  // Sync courses on initial load or when search/category changes
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCourses();
  };

  // Compute Latest Courses dynamically
  const latestCourses = [...courses]
    .sort((a, b) => new Date(b.publishedAt || b.updatedAt || b.createdAt) - new Date(a.publishedAt || a.updatedAt || a.createdAt))
    .slice(0, 3);

  // Pagination calculations
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const catalogSection = document.getElementById('explore-catalog');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Rendering course card helper with animated entrance & thumbnail zoom
  const renderCourseCard = (course, idx = 0) => {
    const courseImg = getCourseThumbnailUrl(course);
    const rating = Number(course.rating || course.averageRating || 5.0).toFixed(1);

    return (
      <div key={course.id} className="col-md-6 col-lg-4 reveal in-view">
        <div 
          className="course-card-custom course-card-animated h-100 d-flex flex-column rounded-5 overflow-hidden shadow-sm"
          style={{ animationDelay: `${(idx % 6) * 0.1}s` }}
        >
          <div className="course-banner-img position-relative overflow-hidden" style={{ height: '185px', backgroundColor: '#064e3b' }}>
            <img 
              src={courseImg} 
              alt={course.title}
              className="w-100 h-100 course-thumbnail-anim"
              style={{ objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getCourseThumbnailUrl({ category: course.category, title: course.title });
              }}
            />
            <span className="course-badge-category badge position-absolute top-0 start-0 m-3 shadow-sm">{course.category || 'Tech'}</span>
            <span className="course-badge-level badge position-absolute top-0 end-0 m-3 shadow-sm">{course.level || 'All Levels'}</span>
          </div>
          <div className="course-body-custom p-4 flex-grow-1 d-flex flex-column">
            <h4 className="course-title-custom fw-bold mb-2 text-truncate" title={course.title} style={{ color: '#0f172a' }}>
              {course.title}
            </h4>
            <p className="text-muted small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.5rem', fontSize: '0.85rem' }}>
              {course.shortDescription || course.description || 'Comprehensive course program designed to build industry-ready skills.'}
            </p>
            <div className="course-mentor-custom small mb-2" style={{ color: '#475569' }}>
              <i className="bi bi-person-fill me-1 text-success"></i>
              Instructor: <span className="fw-semibold text-dark">{course.mentorName || 'Certified Instructor'}</span>
            </div>
            <div className="d-flex align-items-center gap-2 mb-3 small">
              <span className="course-rating-badge d-flex align-items-center gap-1 bg-warning-subtle text-warning px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-star-fill text-warning"></i>
                {rating}
              </span>
              <span className="text-muted fw-medium" style={{ fontSize: '0.78rem' }}>
                • {course.enrollmentCount || 0} enrolled
              </span>
            </div>
            <div className="course-meta-row d-flex justify-content-between align-items-center mb-4 small text-muted">
              <span className="d-flex align-items-center gap-1 fw-medium" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-clock text-success me-1"></i>
                {course.estimatedDuration || 'Self-paced'}
              </span>
              <span className="course-price-badge fw-bold text-success fs-6">
                {course.price && course.price > 0 ? `$${course.price}` : 'Free'}
              </span>
            </div>
            <div className="mt-auto">
              <Link
                to={isAuthenticated ? `/student-dashboard/courses/${course.id}` : ROUTES.LOGIN}
                className="btn btn-outline-success rounded-pill fw-bold w-100 py-2"
                style={{ fontSize: '0.88rem' }}
              >
                View Course <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <LandingLayout>
      {/* ============ HERO ============ */}
      <section className="hero-section page" id="home">
        <div className="container container-xl">
          <div className="row align-items-center gy-5">
            {/* LEFT COLUMN: HERO TEXT */}
            <div className="col-lg-6 text-start">
              {isAuthenticated ? (
                <>
                  <span className="eyebrow-badge"><span className="dot bg-success"></span> User Session Active ({user?.role})</span>
                  <h1 className="hero-heading">Welcome back, <span className="highlight">{user?.name || user?.username || 'Learner'}</span></h1>
                  <p className="hero-subheading">Access your personalized Enterprise Learning Platform workspace, track module accomplishments, and message your mentors.</p>
                  <div className="hero-cta-row">
                    <Link to={ROUTES.DASHBOARD} className="btn btn-nexus-primary btn-lg-nexus text-nowrap">
                      Go to Dashboard <i className="bi bi-grid-fill ms-1"></i>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <span className="eyebrow-badge"><span className="dot"></span> Trusted by 25,000+ students worldwide</span>
                  <h1 className="hero-heading">
                    Build Your Future with{' '}
                    <span className="text-conveyor-wrapper">
                      <span className={`highlight text-conveyor-item ${fadeConveyor ? 'in' : 'out'}`}>
                        {conveyorPhrases[conveyorIndex]}
                      </span>
                    </span>
                  </h1>
                  <p className="hero-subheading">Personalized career guidance, learning roadmaps, and skill assessments for students — all in one connected platform.</p>
                  <div className="hero-cta-row">
                    <Link to={ROUTES.REGISTER} className="btn btn-nexus-primary btn-lg-nexus text-nowrap">
                      Get Started <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                    <Link to={ROUTES.LOGIN} className="btn btn-nexus-outline btn-lg-nexus text-nowrap">
                      <i className="bi bi-box-arrow-in-right me-1"></i> Login
                    </Link>
                  </div>
                </>
              )}
              <div className="hero-trust">
                <div className="avatars">
                  <span>JS</span><span>AK</span><span>RM</span><span>+</span>
                </div>
                <span>Joined by students from 120+ campuses this month</span>
              </div>
            </div>

            {/* RIGHT COLUMN: UNIVERSAL 3D ANIMATED SKILLSPHERE ECOSYSTEM HUB */}
            <div className="col-lg-6">
              <div className="hero-visual-wrapper position-relative px-2 px-md-4">
                {/* Ambient Multi-Colored Glass Spotlights (UXMISFIT Bleed Effect) */}
                <div
                  className="ambient-glass-orb"
                  style={{
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(236,72,153,0.38) 0%, rgba(219,39,119,0.1) 60%, transparent 80%)',
                    top: '5%',
                    right: '-15px',
                    animationDelay: '-2s',
                  }}
                />
                <div
                  className="ambient-glass-orb"
                  style={{
                    width: '360px',
                    height: '360px',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.38) 0%, rgba(5,150,105,0.1) 60%, transparent 80%)',
                    bottom: '-20px',
                    left: '-20px',
                  }}
                />
                <div
                  className="ambient-glass-orb"
                  style={{
                    width: '280px',
                    height: '280px',
                    background: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 80%)',
                    top: '35%',
                    left: '30%',
                    animationDelay: '-4s',
                  }}
                />

                {/* Central Universal Glassmorphism Ecosystem Hub */}
                <div
                  className="card border-0 rounded-5 p-4 position-relative z-1 shadow-lg text-start"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 30px 70px rgba(13,74,58,0.2)',
                    animation: 'floatMainCard 6s ease-in-out infinite',
                  }}
                >
                  {/* Header: Brand & Live Status */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-2">
                      <img src={logoImg} alt="Enterprise Learning Platform Logo" style={{ height: '38px', objectFit: 'contain' }} />
                      <div>
                        <div className="fw-black text-uppercase lh-1" style={{ fontSize: '0.9rem', color: '#0d4a3a', fontWeight: 900 }}>
                          ENTERPRISE LEARNING PLATFORM
                        </div>
                        <span className="text-muted text-uppercase text-xs fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.14em' }}>
                          SKILL &amp; CAREER GUIDANCE SYSTEM
                        </span>
                      </div>
                    </div>
                    <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle fw-bold text-uppercase px-3 py-1.5" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                      <i className="bi bi-circle-fill text-success me-1 pulse-dot" style={{ fontSize: '0.45rem' }}></i>CONNECTED ECOSYSTEM
                    </span>
                  </div>

                  {/* 4 Pillars Grid of Enterprise Learning Platform with Skill and Career Guidance System */}
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <div className="p-3 rounded-4 bg-light border border-light-subtle h-100 transition-all hover-lift">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                            <i className="bi bi-journal-bookmark-fill"></i>
                          </div>
                          <span className="fw-bold text-dark small">Course Modules</span>
                        </div>
                        <p className="text-muted text-xs mb-0" style={{ fontSize: '0.72rem', lineHeight: '1.3' }}>
                          Self-paced & mentored structured learning tracks
                        </p>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="p-3 rounded-4 bg-light border border-light-subtle h-100 transition-all hover-lift">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                            <i className="bi bi-shield-lock-fill"></i>
                          </div>
                          <span className="fw-bold text-dark small">Module Badges</span>
                        </div>
                        <p className="text-muted text-xs mb-0" style={{ fontSize: '0.72rem', lineHeight: '1.3' }}>
                          3D Achievement Medallions earned on module completion
                        </p>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="p-3 rounded-4 bg-light border border-light-subtle h-100 transition-all hover-lift">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                            <i className="bi bi-qr-code-scan"></i>
                          </div>
                          <span className="fw-bold text-dark small">QR Certificates</span>
                        </div>
                        <p className="text-muted text-xs mb-0" style={{ fontSize: '0.72rem', lineHeight: '1.3' }}>
                          Official master credentials with live smartphone scanner
                        </p>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="p-3 rounded-4 bg-light border border-light-subtle h-100 transition-all hover-lift">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                            <i className="bi bi-[#10b981] bi-compass-fill"></i>
                          </div>
                          <span className="fw-bold text-dark small">Career Roadmaps</span>
                        </div>
                        <p className="text-muted text-xs mb-0" style={{ fontSize: '0.72rem', lineHeight: '1.3' }}>
                          AI-guided skill paths for tech & engineering roles
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Universal Live Platform Key Metrics */}
                  <div className="row g-2 text-center pt-3 border-top">
                    <div className="col-4">
                      <div className="fw-black fs-5 text-dark" style={{ fontWeight: 900 }}>100%</div>
                      <div className="text-muted text-xs" style={{ fontSize: '0.68rem', fontWeight: 600 }}>Verified Credentials</div>
                    </div>
                    <div className="col-4 border-start border-end">
                      <div className="fw-black fs-5 text-success" style={{ fontWeight: 900 }}>25,000+</div>
                      <div className="text-muted text-xs" style={{ fontSize: '0.68rem', fontWeight: 600 }}>Active Learners</div>
                    </div>
                    <div className="col-4">
                      <div className="fw-black fs-5 text-warning" style={{ fontWeight: 900 }}>5/5 ★</div>
                      <div className="text-muted text-xs" style={{ fontSize: '0.68rem', fontWeight: 600 }}>Student Rating</div>
                    </div>
                  </div>
                </div>

                {/* FLOATING MICRO BADGE 1 (Top Right) */}
                <div
                  className="position-absolute bg-white rounded-4 p-3 shadow-lg d-flex align-items-center gap-3 border z-2 d-none d-sm-flex"
                  style={{
                    top: '-20px',
                    right: '-15px',
                    maxWidth: '230px',
                    animation: 'floatFloatingCard1 5s ease-in-out infinite',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
                  }}
                >
                  <div className="bg-warning-subtle text-warning rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '1.3rem' }}>
                    🏆
                  </div>
                  <div className="text-start">
                    <div className="fw-bold text-dark small" style={{ fontSize: '0.8rem', lineHeight: 1.2 }}>Module Badges</div>
                    <span className="badge bg-success text-white rounded-pill" style={{ fontSize: '0.6rem' }}>Claimed Per Topic</span>
                  </div>
                </div>

                {/* FLOATING MICRO BADGE 2 (Bottom Left) */}
                <div
                  className="position-absolute bg-white rounded-4 p-3 shadow-lg d-flex align-items-center gap-3 border z-2 d-none d-sm-flex"
                  style={{
                    bottom: '-22px',
                    left: '-15px',
                    maxWidth: '240px',
                    animation: 'floatFloatingCard2 6s ease-in-out infinite 1s',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
                  }}
                >
                  <div className="bg-success-subtle text-success rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '1.3rem' }}>
                    📜
                  </div>
                  <div className="text-start">
                    <div className="fw-bold text-dark small" style={{ fontSize: '0.8rem', lineHeight: 1.2 }}>Master Certificates</div>
                    <div className="text-muted text-xs d-flex align-items-center gap-1" style={{ fontSize: '0.66rem' }}>
                      <i className="bi bi-qr-code-scan text-success"></i> Scannable QR Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LATEST COURSES ============ */}
      {latestCourses.length > 0 && (
        <section className="section-pad page position-relative" id="latest-courses">
          {/* Ambient Glass Glow Orbs */}
          <div className="ambient-glass-orb" style={{ width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(14,165,233,0.16) 0%, transparent 70%)', top: '20%', right: '8%', animationDelay: '-2s' }} />

          <div className="container container-xl position-relative z-1">
            <div className="text-center mx-auto reveal mb-5" style={{ maxWidth: 640 }}>
              <span className="section-eyebrow"><i className="bi bi-sparkles text-success me-1"></i>New Arrivals</span>
              <h2 className="section-title">Latest Courses</h2>
              <p className="section-desc mx-auto">Learn cutting-edge skills with our newly published course programs.</p>
            </div>
            <div className="row g-4 mt-2">
              {latestCourses.map((c, idx) => renderCourseCard(c, idx))}
            </div>
          </div>
        </section>
      )}

      {/* ============ COURSE CATALOG (EXPLORE) ============ */}
      <section className="section-pad bg-surface page position-relative" id="explore-catalog">
        {/* Ambient Glass Glow Orbs */}
        <div className="ambient-glass-orb" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 75%)', top: '15%', left: '10%' }} />

        <div className="container container-xl position-relative z-1">
          <div className="text-center mx-auto reveal mb-5" style={{ maxWidth: 640 }}>
            <span className="section-eyebrow"><i className="bi bi-grid-fill text-success me-1"></i>Course Directory</span>
            <h2 className="section-title">Explore All Courses</h2>
            <p className="section-desc mx-auto">Find dynamic, self-paced learning resources mapped to your career pathway goals.</p>
          </div>

          {/* Search and Category Filters */}
          <div
            className="card border-0 rounded-5 p-4 mb-5 position-relative overflow-hidden reveal"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 20px 50px rgba(13, 74, 58, 0.08)',
            }}
          >
            <div className="row g-3 align-items-center">
              <div className="col-lg-6">
                <form onSubmit={handleSearchSubmit} className="search-form-wrap">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    className="form-control rounded-pill ps-5"
                    placeholder="Search by course title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="btn btn-success rounded-pill px-4">
                    Search
                  </button>
                </form>
              </div>
              <div className="col-lg-6">
                <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                  {Array.from(new Set(['', ...COURSE_CATEGORIES, ...courses.map((c) => c.category).filter(Boolean)])).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`category-tab-btn px-4 ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat === '' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted small">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-3 mb-0">Fetching course catalog...</p>
            </div>
          ) : currentCourses.length === 0 ? (
            <div className="text-center py-5 text-muted reveal">
              <i className="bi bi-folder2-open fs-1 mb-2"></i>
              <p className="mb-0">No published courses found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {currentCourses.map((c, idx) => renderCourseCard(c, idx))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-5 reveal">
                  <button
                    className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      className={`btn rounded-circle d-flex align-items-center justify-content-center fw-bold ${currentPage === idx + 1 ? 'btn-success text-white' : 'btn-light border'}`}
                      style={{ width: '40px', height: '40px', fontSize: '0.85rem' }}
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ============ FEATURES SUMMARY ============ */}
      <section className="section-pad page" id="features">
        <div className="container container-xl">
          <div className="text-center mx-auto reveal" style={{ maxWidth: 680 }}>
            <span className="section-eyebrow"><i className="bi bi-cpu-fill text-success me-1"></i> Platform Capabilities</span>
            <h2 className="section-title">Core Features Built for Your Career</h2>
            <p className="section-desc mx-auto">Explore essential connected tools designed to accelerate your technical skills, portfolio, and career readiness.</p>
          </div>

          <div className="row g-4 mt-4">
            {[
              {
                icon: 'bi-robot',
                title: 'AI Tutor & Assistant',
                desc: 'Get 24/7 coding help, instant error debugging, and step-by-step concept explanations powered by AI.',
                color: 'text-success',
                bg: 'rgba(16,185,129,0.1)'
              },
              {
                icon: 'bi-graph-down',
                title: 'AI Skill Gap Analysis',
                desc: 'Radar evaluation comparing your current competencies against real-world target industry job roles.',
                color: 'text-primary',
                bg: 'rgba(59,130,246,0.1)'
              },
              {
                icon: 'bi-file-earmark-person-fill',
                title: 'ATS Resume Builder',
                desc: 'Generate Times New Roman ATS-ready candidate resumes with live paper previews and 1-click PDF exports.',
                color: 'text-info',
                bg: 'rgba(6,182,212,0.1)'
              },
              {
                icon: 'bi-code-square',
                title: 'In-Browser Code IDE',
                desc: 'Practice coding challenges with instant execution and test case verification in Java, Python, and JS.',
                color: 'text-warning',
                bg: 'rgba(245,158,11,0.1)'
              },
              {
                icon: 'bi-briefcase-fill',
                title: 'Internship Hiring Portal',
                desc: 'Apply to real internship openings with multi-step candidate evaluation, resume attachments, and tracking.',
                color: 'text-danger',
                bg: 'rgba(239,68,68,0.1)'
              },
            ].map((f, i) => (
              <div key={i} className="col-md-6 col-lg-4 reveal">
                <div className="feature-card h-100 p-4 border-0 shadow-sm rounded-4 position-relative overflow-hidden transition-all hover-lift">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '56px', height: '56px', background: f.bg }}>
                      <i className={`bi ${f.icon} ${f.color} fs-3`}></i>
                    </div>
                    <h3 className="fw-bold mb-0 text-dark fs-5">{f.title}</h3>
                  </div>
                  <p className="text-muted small mb-0" style={{ lineHeight: '1.6', fontSize: '0.88rem' }}>{f.desc}</p>
                </div>
              </div>
            ))}

            {/* SPECIAL "AND MANY MORE..." CARD */}
            <div className="col-md-6 col-lg-4 reveal">
              <div className="feature-card h-100 p-4 border-0 shadow-sm rounded-4 position-relative overflow-hidden transition-all hover-lift" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(59,130,246,0.06) 100%)', border: '1.5px dashed rgba(16,185,129,0.35)' }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0 bg-success text-white shadow-sm" style={{ width: '56px', height: '56px', animation: 'float floatingCard1 4s ease-in-out infinite' }}>
                    <i className="bi bi-plus-circle-fill fs-3"></i>
                  </div>
                  <div>
                    <span className="badge bg-success-subtle text-success rounded-pill extra-small fw-bold mb-1">More Tools</span>
                    <h3 className="fw-bold mb-0 text-dark fs-5">And Many More...</h3>
                  </div>
                </div>
                <p className="text-muted small mb-3" style={{ lineHeight: '1.5', fontSize: '0.86rem' }}>
                  Interactive Video Courses, Scannable QR Certificates, Live Mentor Sessions, Quizzes & Complaints Support Desk.
                </p>
                <div className="d-flex flex-wrap gap-1">
                  <span className="badge bg-white text-dark border rounded-pill px-2.5 py-1 extra-small">📜 QR Verification</span>
                  <span className="badge bg-white text-dark border rounded-pill px-2.5 py-1 extra-small">❓ Interactive Quizzes</span>
                  <span className="badge bg-white text-dark border rounded-pill px-2.5 py-1 extra-small">💬 Mentor Live Chat</span>
                  <span className="badge bg-white text-dark border rounded-pill px-2.5 py-1 extra-small">🎫 Support Desk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section-pad bg-surface page" id="roadmaps">
        <div className="container container-xl">
          <div className="text-center mx-auto reveal" style={{ maxWidth: 640 }}>
            <span className="section-eyebrow">The Process</span>
            <h2 className="section-title">How Enterprise Learning Platform works</h2>
            <p className="section-desc mx-auto">Four steps stand between you and a career plan built specifically for you.</p>
          </div>
          <div className="steps-wrap mt-5">
            <div className="steps-line d-none d-lg-block"></div>
            <div className="row g-4">
              {[
                { n: 1, title: 'Create Account', desc: 'Sign up in under a minute — no forms to dread.' },
                { n: 2, title: 'Complete Skill Profile', desc: 'Tell us your interests and current skill level.' },
                { n: 3, title: 'Get Career Roadmap', desc: 'Receive a personalized path matched to your goals.' },
                { n: 4, title: 'Track Progress', desc: 'Follow your roadmap and watch your skills grow.' },
              ].map((s) => (
                <div key={s.n} className="col-6 col-lg-3 step-item reveal">
                  <div className="step-number">{s.n}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="section-pad page" id="about">
        <div className="container container-xl">
          <div className="text-center mx-auto reveal" style={{ maxWidth: 640 }}>
            <span className="section-eyebrow">Student Stories</span>
            <h2 className="section-title">Trusted by students who found direction</h2>
            <p className="section-desc mx-auto">Real students, real roadmaps, real results.</p>
          </div>
          <div className="row g-4 mt-4">
            {[
              { initials: 'AN', name: 'Ayesha Nair', role: 'Computer Science, 3rd Year', quote: '"I had no idea what career path fit me. The skill assessment showed me gaps I didn\'t know existed, and the roadmap made the next step obvious."', stars: 5 },
              { initials: 'RK', name: 'Rohan Kulkarni', role: 'Data Science, Final Year', quote: '"The progress tracking kept me consistent. Seeing the dashboard fill up every week was oddly motivating — like a game I actually wanted to win."', stars: 5 },
              { initials: 'MS', name: 'Meera Sharma', role: 'Business Analytics, 2nd Year', quote: '"I compared three platforms before this one. Enterprise Learning Platform was the only one that felt built for students, not recruiters."', stars: 4.5 },
            ].map((t, i) => (
              <div key={i} className="col-md-6 col-lg-4 reveal">
                <div className="testimonial-card">
                  <i className="bi bi-quote quote-icon"></i>
                  <div className="stars">
                    {[1, 2, 3, 4].map(s => <i key={s} className="bi bi-star-fill"></i>)}
                    <i className={`bi ${t.stars === 5 ? 'bi-star-fill' : 'bi-star-half'}`}></i>
                  </div>
                  <p className="quote">{t.quote}</p>
                  <div className="testimonial-author">
                    <div className="avatar">{t.initials}</div>
                    <div>
                      <div className="name">{t.name}</div>
                      <div className="role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="landing-cta-banner reveal mt-5 text-start">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
              <div>
                <h3 className="fw-bold text-white mb-2">Ready to plan your career?</h3>
                <p className="mb-0 text-white-50">It takes less than 60 seconds to get your first skill profile assessment recommendations.</p>
              </div>
              <Link to={ROUTES.REGISTER} className="btn btn-nexus-secondary btn-lg-nexus text-nowrap">
                Create Free Account <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
