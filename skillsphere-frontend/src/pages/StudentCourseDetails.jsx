import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LandingLayout from '../layouts/LandingLayout';
import LoadingOverlay from '../components/Dashboard/LoadingOverlay';
import ErrorOverlay from '../components/Dashboard/ErrorOverlay';
import CoursePlayer from '../components/Dashboard/Student/CoursePlayer';
import CourseService from '../services/CourseService';
import CourseContentService from '../services/CourseContentService';
import EnrollmentService from '../services/EnrollmentService';
import { ROUTES } from '../constants/routes';
import { STUDENT_SIDEBAR_LINKS } from '../constants/studentSidebarLinks';
import { useAuth } from '../hooks/useAuth';
import { getCourseBannerUrl } from '../utils/courseImageHelper';
import '../styles/dashboard-layout.css';

function parseList(value) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(name) {
  if (!name) {
    return 'SS';
  }

  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function StudentCourseDetails() {
  const { courseId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const sidebarLinks = useMemo(
    () =>
      STUDENT_SIDEBAR_LINKS.map((link) => ({
        ...link,
        active: course?.enrolled ? link.href.includes('#my-courses') : link.href.includes('#learning'),
      })),
    [course?.enrolled]
  );

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(false);
      const [courseData, moduleData] = await Promise.all([
        CourseService.getCourseById(courseId),
        CourseContentService.getModulesForCourse(courseId),
      ]);
      setCourse(courseData);
      setModules(moduleData);
      return courseData;
    } catch (err) {
      console.error('Failed to load course details', {
        courseId,
        status: err?.status,
        message: err?.message,
      });
      setError(true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const courseData = await loadCourseDetails();
      const intendedCourse = localStorage.getItem('intendedCourse');
      if (intendedCourse && String(intendedCourse) === String(courseId) && isAuthenticated && user?.role === 'STUDENT') {
        localStorage.removeItem('intendedCourse');
        if (courseData && !courseData.enrolled) {
          try {
            setActionLoading(true);
            await EnrollmentService.enrollInCourse(courseId);
            await loadCourseDetails();
          } catch (e) {
            console.error('Auto-enrollment after login failed', e);
          } finally {
            setActionLoading(false);
          }
        }
      }
    };
    init();
  }, [courseId, isAuthenticated, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('intendedCourse', courseId);
      navigate(`/login?redirect=/student-dashboard/courses/${courseId}`);
      return;
    }
    if (user && user.role !== 'STUDENT') {
      window.alert('Only students can enroll in courses.');
      return;
    }
    try {
      setActionLoading(true);
      await EnrollmentService.enrollInCourse(courseId);
      await loadCourseDetails();
    } catch (err) {
      console.error('Enrollment failed', {
        courseId,
        status: err?.status,
        message: err?.message,
      });
      window.alert(err?.message || 'Failed to enroll in course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleContinueLearning = () => {
    setShowPlayer(true);
  };

  if (loading) {
    return <LoadingOverlay visible />;
  }

  if (error || !course) {
    return <ErrorOverlay visible />;
  }

  if (showPlayer && course.enrolled) {
    const playerEnrollment = {
      id: course.enrollmentId,
      notes: course.notes,
      bookmarks: course.bookmarks,
      lastOpenedLessonId: course.lastOpenedLessonId,
    };

    const playerContent = (
      <CoursePlayer
        course={course}
        enrollment={playerEnrollment}
        onBack={() => setShowPlayer(false)}
        onShowToast={(type, msg) => window.alert(msg)}
      />
    );

    if (isAuthenticated && user?.role === 'STUDENT') {
      return (
        <div className="dashboard-wrapper-sim">
          <DashboardLayout sidebarLinks={sidebarLinks} searchPlaceholder="Search courses, roadmaps, mentors...">
            {playerContent}
          </DashboardLayout>
        </div>
      );
    }

    return (
      <LandingLayout>
        <div className="container py-5 text-start" style={{ marginTop: '80px', minHeight: '80vh' }}>
          {playerContent}
        </div>
      </LandingLayout>
    );
  }

  const learningOutcomes = parseList(course.learningOutcomes);
  const skills = parseList(course.skills);
  const prerequisites = parseList(course.prerequisites);
  const tags = parseList(course.tags);
  const totalLessons = course.lessonCount || modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
  const totalModules = course.moduleCount || modules.length;
  const instructorProfile = course.instructorProfile || {};
  const displayRating = Number(course.rating || course.averageRating || 0).toFixed(1);

  const pageContent = (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          {isAuthenticated && user?.role === 'STUDENT' ? (
            course?.enrolled ? (
              <Link to={`${ROUTES.STUDENT_DASHBOARD}#my-courses`} className="btn btn-light rounded-pill border fw-semibold mb-3">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Enrolled Courses
              </Link>
            ) : (
              <Link to={`${ROUTES.STUDENT_DASHBOARD}#learning`} className="btn btn-light rounded-pill border fw-semibold mb-3">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Catalog
              </Link>
            )
          ) : (
            <Link to={ROUTES.HOME} className="btn btn-light rounded-pill border fw-semibold mb-3">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Home
            </Link>
          )}
          <h1 className="fw-bold text-dark mb-2">{course.title}</h1>
          <p className="text-muted mb-0">{course.shortDescription || course.description || 'Course details are being prepared by the mentor.'}</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">{course.category}</span>
          <span className="badge rounded-pill bg-light text-dark px-3 py-2">{course.level || course.difficulty || 'Intermediate'}</span>
          <span className="badge rounded-pill bg-light text-dark px-3 py-2">{course.language || 'English'}</span>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div
              className="border-bottom overflow-hidden position-relative"
              style={{
                height: '280px',
                backgroundColor: '#f3f4f6'
              }}
            >
              <img 
                src={getCourseBannerUrl(course)} 
                alt={course.title}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getCourseBannerUrl({ category: course.category, title: course.title });
                }}
              />
            </div>
            <div className="card-body p-4 p-lg-5">
              <div className="row g-4 mb-4">
                <div className="col-lg-7">
                  <div className="card border rounded-4 h-100">
                    <div className="card-body d-flex gap-3 align-items-start">
                      {instructorProfile.profileImage ? (
                        <img
                          src={instructorProfile.profileImage}
                          alt={instructorProfile.fullName || course.instructor || course.mentorName}
                          className="rounded-circle object-fit-cover border"
                          style={{ width: '72px', height: '72px' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center bg-success-subtle text-success fw-bold"
                          style={{ width: '72px', height: '72px', fontSize: '1.25rem' }}
                        >
                          {getInitials(instructorProfile.fullName || course.instructor || course.mentorName)}
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <div className="text-muted small mb-1">Instructor Profile</div>
                        <h4 className="fw-bold text-dark mb-1">{course.instructor || course.mentorName || 'Certified Instructor'}</h4>
                        <div className="text-muted small mb-1">{instructorProfile.email || 'Mentor contact available after enrollment'}</div>
                        <div className="text-muted small">
                          {[instructorProfile.department, instructorProfile.college].filter(Boolean).join(' • ') || 'Enterprise Learning Platform certified mentor'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-5">
                  <div className="card border rounded-4 h-100 bg-light-subtle">
                    <div className="card-body">
                      <div className="text-muted small mb-2">Detailed Statistics</div>
                      <div className="vstack gap-2 small">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Modules</span>
                          <span className="fw-bold text-dark">{totalModules}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Lessons</span>
                          <span className="fw-bold text-dark">{totalLessons}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Estimated Effort</span>
                          <span className="fw-bold text-dark">{course.estimatedDuration || 'Go-at-your-own-pace'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="fw-bold text-dark mb-3">About this Course</h4>
                <p className="text-dark-emphasis" style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                  {course.description || 'Full course catalog overview details are currently being finalized.'}
                </p>
              </div>

              {learningOutcomes.length > 0 && (
                <div className="mb-4">
                  <h4 className="fw-bold text-dark mb-3">What you will learn</h4>
                  <div className="row g-3">
                    {learningOutcomes.map((outcome, idx) => (
                      <div key={idx} className="col-md-6 d-flex gap-2 align-items-start">
                        <i className="bi bi-check-circle-fill text-success mt-1"></i>
                        <span className="text-dark">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="fw-bold text-dark mb-3">Skills Covered</h4>
                  <div className="d-flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="badge rounded-pill bg-light text-dark px-3 py-2 border">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {prerequisites.length > 0 && (
                <div className="mb-4">
                  <h4 className="fw-bold text-dark mb-3">Requirements</h4>
                  <ul className="mb-0 text-dark-emphasis">
                    {prerequisites.map((req, idx) => (
                      <li key={idx} className="mb-2">{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="fw-bold text-dark mb-3">Tags</h4>
                  <div className="d-flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="badge rounded-pill bg-secondary-subtle text-secondary px-3 py-2">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4" id="course-curriculum">
                <h4 className="fw-bold text-dark mb-1">Course Content</h4>
                <p className="text-muted small mb-4">{totalModules} modules • {totalLessons} lessons</p>

                {modules.length === 0 ? (
                  <div className="text-center py-4 border rounded-4 bg-light text-muted">
                    No modules have been published for this course yet.
                  </div>
                ) : (
                  modules
                    .slice()
                    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                    .map((module, index) => (
                      <div key={module.id} className="card border rounded-4 p-4 mb-3 bg-white">
                        <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 flex-wrap gap-2">
                          <div>
                            <div className="text-success fw-semibold small mb-1">Module {index + 1}</div>
                            <h5 className="fw-bold text-dark mb-1">{module.title}</h5>
                            <p className="text-muted mb-2">{module.description || 'Module overview will be added soon.'}</p>
                          </div>
                          <span className="badge rounded-pill bg-light text-dark">
                            {module.lessons?.length || 0} lessons
                          </span>
                        </div>

                        <div className="mt-3">
                          {(module.lessons || []).map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="d-flex justify-content-between align-items-start border-top pt-3 mt-3">
                              <div>
                                <div className="fw-semibold text-dark">
                                  {lessonIndex + 1}. {lesson.title}
                                </div>
                                <div className="text-muted small">
                                  {course.enrolled
                                    ? (lesson.content || 'Lesson content becomes visible as the learner progresses through the module.')
                                    : 'Lesson content is locked until you enroll.'}
                                </div>
                              </div>
                              <span className={`badge rounded-pill ${course.enrolled ? 'bg-success-subtle text-success' : 'bg-light text-dark'}`}>
                                  {course.enrolled ? 'Available' : 'Locked'}
                                </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: '96px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold text-dark mb-3">Enrollment</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Status</span>
                <span className={`fw-semibold ${course.enrolled ? 'text-success' : 'text-dark'}`}>
                  {course.enrolled ? 'Enrolled' : 'Not enrolled'}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Category</span>
                <span className="fw-semibold text-dark">{course.category}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Difficulty</span>
                <span className="fw-semibold text-dark">{course.level || course.difficulty || 'Intermediate'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Language</span>
                <span className="fw-semibold text-dark">{course.language}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Rating</span>
                <span className="fw-semibold text-dark">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  {displayRating}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Certificate</span>
                <span className={`fw-semibold ${course.certificateAvailable ? 'text-success' : 'text-muted'}`}>
                  {course.certificateAvailable ? 'Included' : 'Unavailable'}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-4">
                <span className="text-muted">Last updated</span>
                <span className="fw-semibold text-dark">{formatDate(course.updatedAt || course.createdAt)}</span>
              </div>

              {!course.enrolled ? (
                <button
                  className="btn btn-success rounded-pill fw-bold w-100"
                  onClick={handleEnroll}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Enrolling...' : 'Enroll Now'}
                </button>
              ) : (
                <button
                  className="btn btn-outline-success rounded-pill fw-bold w-100"
                  onClick={handleContinueLearning}
                >
                  Continue Learning
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (isAuthenticated && user?.role === 'STUDENT') {
    return (
      <div className="dashboard-wrapper-sim">
        <DashboardLayout sidebarLinks={sidebarLinks} searchPlaceholder="Search courses, roadmaps, mentors...">
          {pageContent}
        </DashboardLayout>
      </div>
    );
  }

  return (
    <LandingLayout>
      <div className="container py-5 text-start" style={{ marginTop: '80px', minHeight: '80vh' }}>
        {pageContent}
      </div>
    </LandingLayout>
  );
}
