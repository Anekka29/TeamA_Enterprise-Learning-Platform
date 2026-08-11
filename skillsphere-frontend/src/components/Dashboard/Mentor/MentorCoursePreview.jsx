import { useEffect, useState } from 'react';
import CourseService from '../../../services/CourseService';
import CourseContentService from '../../../services/CourseContentService';
import { getCourseBannerUrl } from '../../../utils/courseImageHelper';

const LESSON_TYPE_LABELS = {
  VIDEO: 'Video',
  PDF: 'PDF',
  READING: 'Reading',
  ASSIGNMENT: 'Assignment',
  QUIZ: 'Quiz',
  EXTERNAL_RESOURCE: 'External Resource',
  EXTERNAL_LINK: 'External Link',
  TEXT: 'Reading',
  DOCUMENT: 'PDF',
  LIVE_SESSION: 'Live Session',
};

function getFriendlyLessonType(type) {
  return LESSON_TYPE_LABELS[type] || type;
}

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

function getStatusBadgeClass(status) {
  const badges = {
    DRAFT: 'bg-secondary-subtle text-secondary',
    PENDING_APPROVAL: 'bg-warning-subtle text-warning',
    APPROVED: 'bg-info-subtle text-info',
    PUBLISHED: 'bg-success-subtle text-success',
    REJECTED: 'bg-danger-subtle text-danger',
    ARCHIVED: 'bg-dark-subtle text-dark',
  };
  return badges[status] || 'bg-secondary-subtle text-secondary';
}

function formatStatusLabel(status) {
  return status ? status.replaceAll('_', ' ') : 'Draft';
}

export default function MentorCoursePreview({
  courseId,
  initialCourse,
  backLabel = 'Back to Edit',
  onBack,
  onSubmit,
  allowSubmit = false,
  submitDisabled = false,
  submitLabel = 'Submit For Approval',
  validationMessage = '',
  validationErrors = [],
}) {
  const [course, setCourse] = useState(initialCourse || null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [error, setError] = useState('');

  const loadPreview = async () => {
    if (!courseId) {
      setCourse(initialCourse || null);
      setModules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const [courseResponse, modulesResponse] = await Promise.all([
        CourseService.getMentorCourseById(courseId),
        CourseContentService.getModulesForCourse(courseId),
      ]);
      setCourse(courseResponse);
      setModules(Array.isArray(modulesResponse) ? modulesResponse : []);
    } catch (previewError) {
      setError(previewError?.message || 'We could not load the course preview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, [courseId]);

  if (loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 bg-white border text-center">
        <div className="spinner-border text-success mb-3" role="status"></div>
        <h5 className="fw-bold text-dark mb-2">Loading Course Preview</h5>
        <p className="text-muted mb-0">Fetching the latest persisted course details.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 bg-white border text-center">
        <div className="fs-1 text-muted mb-3">
          <i className="bi bi-arrow-clockwise"></i>
        </div>
        <h5 className="fw-bold text-dark mb-2">Unable To Load Preview</h5>
        <p className="text-muted mb-3">{error}</p>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <button type="button" className="btn btn-light rounded-pill px-4" onClick={onBack}>
            {backLabel}
          </button>
          <button type="button" className="btn btn-success rounded-pill px-4 fw-bold" onClick={loadPreview}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const learningOutcomes = parseList(course.learningOutcomes);
  const skills = parseList(course.skills || course.skillsCovered);
  const prerequisites = parseList(course.prerequisites);
  const tags = parseList(course.tags);
  const totalLessons = modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
  const totalModules = modules.length;
  const instructorName = course.mentorName || course.instructor || 'Current Mentor';
  const instructorEmail = course.mentorEmail || 'mentor@skillsphere.com';

  return (
    <div className="fade-in-quick text-start">
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border mb-4">
        {/* Preview Control Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button type="button" className="btn btn-light rounded-pill border fw-semibold" onClick={onBack}>
              <i className="bi bi-arrow-left me-1"></i> {backLabel}
            </button>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h2 className="fw-bold text-dark mb-0">Course Preview</h2>
                <span className={`badge rounded-pill ${getStatusBadgeClass(course.status)}`}>
                  {formatStatusLabel(course.status)}
                </span>
              </div>
              <p className="text-muted mb-0 small">This is the exact view students will see. The course remains unpublished.</p>
            </div>
          </div>

          {allowSubmit && (
            <button
              type="button"
              className="btn btn-success rounded-pill px-4 fw-bold"
              onClick={onSubmit}
              disabled={submitDisabled}
            >
              {submitLabel}
            </button>
          )}
        </div>

        {validationErrors.length > 0 && (
          <div className="alert alert-warning rounded-4 mb-4" role="alert">
            <div className="fw-bold text-dark mb-2">{validationMessage || 'Course is not ready for submission.'}</div>
            <ul className="mb-0 ps-3">
              {validationErrors.map((issue, index) => (
                <li key={`${issue}-${index}`}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Student View Mockup */}
        <div className="border rounded-4 bg-light p-3 p-lg-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <div className="btn btn-light rounded-pill border fw-semibold mb-3 disabled" style={{ opacity: 0.7 }}>
                <i className="bi bi-arrow-left me-2"></i>
                Back to Catalog (Preview)
              </div>
              <h1 className="fw-bold text-dark mb-2">{course.title || 'Untitled Course'}</h1>
              <p className="text-muted mb-0">{course.shortDescription || 'No short description added yet.'}</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">{course.category || 'Tech'}</span>
              <span className="badge rounded-pill bg-light text-dark px-3 py-2">{course.level || 'Intermediate'}</span>
              <span className="badge rounded-pill bg-light text-dark px-3 py-2">{course.language || 'English'}</span>
            </div>
          </div>

          <div className="row g-4">
            {/* Left Content Area */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
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
                  {/* Mentor Card */}
                  <div className="row g-4 mb-4">
                    <div className="col-lg-12">
                      <div className="card border rounded-4 bg-light">
                        <div className="card-body d-flex gap-3 align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center bg-success-subtle text-success fw-bold"
                            style={{ width: '60px', height: '60px', fontSize: '1.2rem', flexShrink: 0 }}
                          >
                            {getInitials(instructorName)}
                          </div>
                          <div className="flex-grow-1 text-truncate">
                            <div className="text-muted small">Instructor Profile</div>
                            <h5 className="fw-bold text-dark mb-0 text-truncate">{instructorName}</h5>
                            <div className="text-muted small text-truncate">{instructorEmail}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Full Description */}
                  <div className="mb-4">
                    <h4 className="fw-bold text-dark mb-3">Course Description</h4>
                    <p className="text-muted mb-0">{course.description || 'No full course description added yet.'}</p>
                  </div>

                  {/* Learning Outcomes and Requirements */}
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <div className="card border rounded-4 h-100 bg-light">
                        <div className="card-body">
                          <h5 className="fw-bold text-dark mb-3">What You Will Learn</h5>
                          {learningOutcomes.length > 0 ? (
                            learningOutcomes.map((item, index) => (
                              <div key={index} className="d-flex align-items-start gap-2 mb-2">
                                <i className="bi bi-check-circle-fill text-success mt-1"></i>
                                <span className="text-muted small">{item}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted small mb-0">Learning outcomes will appear here.</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border rounded-4 h-100 bg-light">
                        <div className="card-body">
                          <h5 className="fw-bold text-dark mb-3">Prerequisites</h5>
                          {prerequisites.length > 0 ? (
                            prerequisites.map((item, index) => (
                              <div key={index} className="d-flex align-items-start gap-2 mb-2">
                                <i className="bi bi-dot text-success mt-1"></i>
                                <span className="text-muted small">{item}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted small mb-0">No prerequisites listed for this course.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Gained */}
                  <div className="card border rounded-4 mb-4 bg-light">
                    <div className="card-body">
                      <h5 className="fw-bold text-dark mb-3">Skills You Will Gain</h5>
                      {skills.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <span key={index} className="badge rounded-pill bg-white text-dark border px-3 py-2 fw-semibold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted small mb-0">Skill tags will appear here.</p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="card border rounded-4 mb-4 bg-light">
                      <div className="card-body">
                        <h5 className="fw-bold text-dark mb-3">Tags</h5>
                        <div className="d-flex flex-wrap gap-2">
                          {tags.map((tag, index) => (
                            <span key={index} className="badge rounded-pill bg-success-subtle text-success px-3 py-2 fw-semibold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Curriculum Card */}
              <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                <div className="card-body p-4 p-lg-5">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">Course Curriculum</h4>
                      <p className="text-muted mb-0 small">Previewing the structure and resource preview links.</p>
                    </div>
                    <span className="badge rounded-pill bg-light text-dark px-3 py-2 border">{totalLessons} total lessons</span>
                  </div>

                  {modules.length === 0 ? (
                    <div className="card border rounded-4 bg-light">
                      <div className="card-body text-center py-5 text-muted">
                        <i className="bi bi-collection fs-1 mb-3"></i>
                        <p className="mb-0">Curriculum is empty. Build modules and lessons in Step 3.</p>
                      </div>
                    </div>
                  ) : (
                    modules.map((module, index) => (
                      <div key={module.id} className="border rounded-4 p-3 mb-3 bg-light">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                          <div>
                            <div className="text-success fw-semibold small mb-1">Module {index + 1}</div>
                            <h5 className="fw-bold text-dark mb-1">{module.title}</h5>
                            <p className="text-muted small mb-2">{module.description || 'No description provided.'}</p>
                          </div>
                          <span className="badge rounded-pill bg-white border text-dark">
                            {module.lessons?.length || 0} lessons
                          </span>
                        </div>

                        <div className="mt-3">
                          {(module.lessons || []).map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="border-top pt-3 mt-3 bg-white rounded-3 p-3 shadow-sm">
                              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                                <div>
                                  <span className="badge rounded-pill bg-light text-dark border me-2">Lesson {lessonIndex + 1}</span>
                                  <span className="fw-semibold text-dark">{lesson.title}</span>
                                  {lesson.lessonType && (
                                    <span className="badge rounded-pill bg-white text-dark border ms-2">{getFriendlyLessonType(lesson.lessonType)}</span>
                                  )}
                                  {lesson.mandatory === false ? (
                                    <span className="badge rounded-pill bg-warning-subtle text-warning ms-2">Optional</span>
                                  ) : (
                                    <span className="badge rounded-pill bg-info-subtle text-info ms-2">Mandatory</span>
                                  )}
                                </div>
                                <span className="badge rounded-pill bg-light text-dark border">
                                  {lesson.estimatedDuration || 'Duration not set'}
                                </span>
                              </div>
                              <div className="small text-muted mb-2">
                                {lesson.content || 'No lesson description added.'}
                              </div>

                              {lesson.resources && lesson.resources.length > 0 ? (
                                <div className="ms-2 mt-2 pt-2 border-top">
                                  <div className="small fw-semibold text-dark mb-1">Resources ({lesson.resources.length})</div>
                                  <div className="vstack gap-2">
                                    {lesson.resources.map((resource) => (
                                      <div key={resource.id} className="rounded-3 border bg-light p-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <div className="d-flex align-items-center gap-2">
                                          <i className="bi bi-file-earmark-text text-primary"></i>
                                          <div>
                                            <span className="fw-semibold text-dark small">{resource.title}</span>
                                            <span className="badge rounded-pill bg-white text-dark border ms-2" style={{ fontSize: '0.7rem' }}>{resource.type}</span>
                                          </div>
                                        </div>
                                        <a href={resource.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border rounded-pill py-1 px-3 fw-bold" style={{ fontSize: '0.8rem' }}>
                                          <i className="bi bi-eye me-1"></i> Preview / Download
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="small text-muted italic">No resources attached to this lesson yet.</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar Area */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 bg-white sticky-top" style={{ top: '24px', zIndex: 10 }}>
                {/* Course Thumbnail Image */}
                <div
                  className="border-bottom"
                  style={{
                    height: '180px',
                    backgroundImage: course.thumbnailUrl ? `url(${course.thumbnailUrl})` : 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                  }}
                >
                  {!course.thumbnailUrl && (
                    <div className="h-100 d-flex align-items-center justify-content-center text-success">
                      <i className="bi bi-camera-video" style={{ fontSize: '3rem' }}></i>
                    </div>
                  )}
                </div>

                <div className="card-body p-4">
                  <h5 className="fw-bold text-dark mb-3">Enrollment Preview</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Price</span>
                    <span className="fw-bold text-success">Free</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Status</span>
                    <span className="fw-semibold text-dark">Preview Mode</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Category</span>
                    <span className="fw-semibold text-dark">{course.category || 'Tech'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Difficulty</span>
                    <span className="fw-semibold text-dark">{course.level || 'Intermediate'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Language</span>
                    <span className="fw-semibold text-dark">{course.language || 'English'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Certificate</span>
                    <span className={`fw-semibold ${course.certificateAvailable ? 'text-success' : 'text-muted'}`}>
                      {course.certificateAvailable ? 'Included' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-4">
                    <span className="text-muted">Last updated</span>
                    <span className="fw-semibold text-dark">{formatDate(course.updatedAt)}</span>
                  </div>

                  <button
                    className="btn btn-success rounded-pill fw-bold w-100"
                    disabled
                    style={{ opacity: 0.65 }}
                  >
                    Enroll Now (Disabled)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="d-flex justify-content-between align-items-center border-top pt-4 mt-4 flex-wrap gap-2">
          <button type="button" className="btn btn-light rounded-pill px-4 border" onClick={onBack}>
            {backLabel}
          </button>

          {allowSubmit && (
            <button
              type="button"
              className="btn btn-success rounded-pill px-4 fw-bold"
              onClick={onSubmit}
              disabled={submitDisabled}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
