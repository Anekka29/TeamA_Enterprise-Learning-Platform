import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseService from '../../../services/CourseService';
import { COURSE_FILTER_CATEGORIES, getCategoryBadgeClass } from '../../../constants/categories';
import { getCourseThumbnailUrl } from '../../../utils/courseImageHelper';

function parseList(value) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFriendlyErrorMessage(error) {
  const status = Number(error?.status);

  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (status === 403) {
    return 'Access denied. You are not allowed to view the catalog.';
  }

  if (status >= 500) {
    return 'We could not load the published courses right now. Please try again.';
  }

  return error?.message || 'Failed to load courses.';
}

export default function CourseListing({ onShowToast, onEnroll, catalogRefreshKey }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  const loadCourses = async (nextTitle = search, nextFilter = filter) => {
    try {
      setLoading(true);
      setLoadError('');
      const title = nextTitle?.trim() || null;
      const category = nextFilter === 'All' ? null : nextFilter;
      const data = await CourseService.searchPublishedCourses(title, category);
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = getFriendlyErrorMessage(error);
      setLoadError(message);
      onShowToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [catalogRefreshKey]);

  const handleSearch = async () => {
    await loadCourses(search, filter);
  };

  const handleFilterChange = async (nextFilter) => {
    setFilter(nextFilter);
    await loadCourses(search, nextFilter);
  };

  // Filter by level and sort
  const displayCourses = courses
    .filter(course => {
      if (levelFilter === 'All') return true;
      return (course.level || '').toLowerCase().includes(levelFilter.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
      }
      if (sortBy === 'price_low') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price_high') {
        return (b.price || 0) - (a.price || 0);
      }
      // default: newest
      return new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0);
    });

  const handleEnrollClick = async (courseId) => {
    try {
      setEnrollingCourseId(courseId);
      await onEnroll(courseId);
      await loadCourses(search, filter);
    } catch {
      // Parent toast already explains the failure.
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const openCourseDetails = (courseId) => {
    navigate(`/student-dashboard/courses/${courseId}`);
  };

  return (
    <div className="fade-in-quick">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Learning Catalog</h2>
          <p className="text-muted">Master job-ready skills via structured curriculum and interactive study units.</p>
        </div>
      </div>

      {/* Filter, Search, Level & Sorting Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                className="form-control rounded-pill ps-5"
                placeholder="Search published courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select rounded-pill small"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select rounded-pill small"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort by: Newest</option>
              <option value="popular">Sort by: Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
          <div className="col-12 border-top pt-3 mt-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="small text-muted fw-bold me-1">Category:</span>
              {COURSE_FILTER_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm px-3 rounded-pill fw-bold transition-all ${filter === cat ? 'btn-success shadow-sm' : 'btn-light border text-secondary'}`}
                  onClick={() => handleFilterChange(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center py-5 text-muted">
            <i className="bi bi-hourglass-split fs-1 mb-3 text-muted"></i>
            <p className="mb-0">Loading courses...</p>
          </div>
        ) : loadError ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
              <i className="bi bi-exclamation-triangle fs-1 mb-3 text-warning"></i>
              <h5 className="fw-bold text-dark mb-2">Unable to load catalog</h5>
              <p className="text-muted mb-3">{loadError}</p>
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <button
                  className="btn btn-light border rounded-pill fw-bold px-4"
                  onClick={() => {
                    setSearch('');
                    setFilter('All');
                    loadCourses('', 'All');
                  }}
                >
                  Reset Filters
                </button>
                <button
                  className="btn btn-success rounded-pill fw-bold px-4"
                  onClick={() => loadCourses(search, filter)}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">
            <i className="bi bi-search fs-1 mb-3 text-muted"></i>
            <p className="mb-1">No published courses matched your current search or filters.</p>
            <span className="small">Try another keyword or reset your filters.</span>
          </div>
        ) : (
          displayCourses.map(course => {
            const skills = parseList(course.skills).slice(0, 3);
            const categoryLabel = course.category || 'General';
            const categoryBadgeClass = getCategoryBadgeClass(course.category);
            const shortDescription = course.shortDescription || course.description || 'Explore this published course to view the full curriculum.';

            const courseImg = getCourseThumbnailUrl(course);

            return (
            <div key={course.id} className="col-md-6 col-lg-4">
              <div className="course-card-custom h-100 d-flex flex-column text-start bg-white rounded-4 border overflow-hidden shadow-sm transition-all">
                <div
                  className="border-bottom overflow-hidden position-relative"
                  style={{
                    height: '180px',
                    backgroundColor: '#f3f4f6'
                  }}
                >
                  <img 
                    src={courseImg} 
                    alt={course.title}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getCourseThumbnailUrl({ category: course.category, title: course.title });
                    }}
                  />
                </div>
                <div className="p-4 flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className={`badge-custom ${categoryBadgeClass}`}>
                      {categoryLabel}
                    </span>
                    <span className="small text-muted fw-bold">{course.level || 'All levels'}</span>
                  </div>

                  <div className="d-flex align-items-center gap-2 mb-3">
                    <h3 className="fs-5 fw-bold text-dark mb-0">{course.title}</h3>
                  </div>

                  <p className="text-muted small mb-3" style={{ minHeight: '40px' }}>
                    {shortDescription}
                  </p>
                  
                  <div className="d-flex flex-wrap gap-2 small text-muted mb-3">
                    <span><i className="bi bi-person me-1 text-success"></i>{course.mentorName || 'Enterprise Learning Platform Mentor'}</span>
                    <span><i className="bi bi-clock me-1 text-success"></i>{course.estimatedDuration || 'Self-paced'}</span>
                    <span><i className="bi bi-collection-play me-1 text-success"></i>{course.lessonCount || 0} lessons</span>
                    <span><i className="bi bi-people me-1 text-success"></i>{course.enrollmentCount || 0} enrolled</span>
                  </div>

                  {skills.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 border-top pt-3">
                      {skills.map((skill) => (
                        <span key={`${course.id}-${skill}`} className="badge rounded-pill bg-light text-dark fw-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="border-top pt-3 mt-3 d-flex justify-content-between align-items-center small text-muted">
                    <span>{course.language || 'English'}</span>
                    <span>{course.estimatedLearningHours ? `${course.estimatedLearningHours}h learning` : 'Flexible duration'}</span>
                  </div>
                </div>

                <div className="p-4 bg-light border-top d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill fw-bold flex-grow-1"
                    onClick={() => openCourseDetails(course.id)}
                  >
                    View Course
                  </button>
                  {!course.enrolled ? (
                    <button
                      className="btn btn-success btn-sm rounded-pill fw-bold"
                      onClick={() => handleEnrollClick(course.id)}
                      disabled={enrollingCourseId === course.id}
                    >
                      {enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-success btn-sm rounded-pill fw-bold"
                      onClick={() => openCourseDetails(course.id)}
                    >
                      Continue Learning
                    </button>
                  )}
                </div>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
}
