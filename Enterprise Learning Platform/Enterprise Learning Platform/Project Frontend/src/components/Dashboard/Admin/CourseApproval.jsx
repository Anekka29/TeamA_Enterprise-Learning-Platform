import { useState, useEffect } from 'react';
import CourseService from '../../../services/CourseService';
import { getCourseThumbnailUrl, getCourseBannerUrl } from '../../../utils/courseImageHelper';

export default function CourseApproval({ onShowToast }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const [reviewState, setReviewState] = useState({ active: false, courseId: null });
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [actionState, setActionState] = useState({ action: '', courseId: null });
  const [reasonModal, setReasonModal] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setLoadError('');
      let data = [];
      if (activeSubTab === 'pending') {
        data = await CourseService.getPendingCourses();
      } else if (activeSubTab === 'approved') {
        data = await CourseService.getCoursesByStatus('APPROVED');
      } else if (activeSubTab === 'rejected') {
        data = await CourseService.getCoursesByStatus('REJECTED');
      } else if (activeSubTab === 'draft') {
        data = await CourseService.getCoursesByStatus('DRAFT');
      }
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(getFriendlyErrorMessage(error, 'Failed to load courses.'));
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to load courses.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [activeSubTab]);

  const openReview = async (courseId) => {
    setReviewState({ active: true, courseId });
    setReviewData(null);
    setReviewError('');

    try {
      setReviewLoading(true);
      const data = await CourseService.getAdminCourseReviewById(courseId);
      setReviewData(data);
      // If we review a pending course, refetch the list behind the scenes to show UNDER_REVIEW status if they go back!
      if (activeSubTab === 'pending') {
        CourseService.getPendingCourses().then(res => setCourses(res)).catch(() => {});
      }
    } catch (error) {
      setReviewError(getFriendlyErrorMessage(error, 'Failed to load course review.'));
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReview = () => {
    setReviewState({ active: false, courseId: null });
    setReviewData(null);
    setReviewError('');
    setReasonModal(null);
  };

  const withAction = async (courseId, action, fn) => {
    if (actionState.courseId === courseId && actionState.action === action) {
      return;
    }

    setActionState({ courseId, action });
    try {
      await fn();
    } finally {
      setActionState({ courseId: null, action: '' });
    }
  };

  const [approveConfirmModal, setApproveConfirmModal] = useState(null);

  const handleApproveClick = (courseId, title) => {
    setApproveConfirmModal({ courseId, title });
  };

  const confirmApprove = async () => {
    if (!approveConfirmModal) return;
    const { courseId } = approveConfirmModal;
    setApproveConfirmModal(null);

    try {
      await withAction(courseId, 'approve', async () => {
        await CourseService.approveCourse(courseId);
      });
      onShowToast('success', 'Course approved successfully.');
      await loadCourses();
      closeReview();
    } catch (error) {
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to approve course.'));
    }
  };

  const handleArchive = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to Archive "${title}"? Students will not be able to find it.`)) {
      return;
    }

    try {
      await withAction(courseId, 'archive', async () => {
        await CourseService.archiveCourse(courseId);
      });
      onShowToast('success', `Course "${title}" archived.`);
      await loadCourses();
      closeReview();
    } catch (error) {
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to archive course.'));
    }
  };

  const openReasonModal = (mode, courseId, courseTitle) => {
    setReasonModal({
      mode,
      courseId,
      courseTitle,
      reason: '',
      error: '',
    });
  };

  const submitReasonAction = async () => {
    if (!reasonModal) {
      return;
    }

    const trimmedReason = reasonModal.reason.trim();
    if (!trimmedReason) {
      setReasonModal((previous) => ({ ...previous, error: 'Feedback reason/comment is required.' }));
      return;
    }

    const courseId = reasonModal.courseId;
    const courseTitle = reasonModal.courseTitle;
    const mode = reasonModal.mode;
    const action = mode === 'requestChanges' ? 'requestChanges' : 'reject';

    try {
      await withAction(courseId, action, async () => {
        if (mode === 'requestChanges') {
          await CourseService.requestChangesCourse(courseId, trimmedReason);
        } else {
          await CourseService.rejectCourse(courseId, trimmedReason);
        }
      });

      onShowToast('success', `${mode === 'requestChanges' ? 'Changes requested for' : 'Course rejected'} "${courseTitle}".`);
      setReasonModal(null);
      await loadCourses();
      closeReview();
    } catch (error) {
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to update course review status.'));
    }
  };

  if (reviewState.active) {
    return (
      <div className="fade-in-quick text-start">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button type="button" className="btn btn-light rounded-pill border" onClick={closeReview}>
              <i className="bi bi-arrow-left me-1"></i> Back to Courses
            </button>
            <div>
              <h2 className="fw-bold text-dark mb-1">Review Course</h2>
              <p className="text-muted mb-0 small">Review basic details, media, modules, lessons, and resources.</p>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          {reviewLoading ? (
            <div className="text-center py-5 text-muted small">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <p className="mb-0">Loading complete course review...</p>
            </div>
          ) : reviewError ? (
            <div className="text-center py-5 text-muted small">
              <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
              <p className="mb-3">{reviewError}</p>
              <button type="button" className="btn btn-success rounded-pill fw-bold px-4" onClick={() => openReview(reviewState.courseId)}>
                Retry
              </button>
            </div>
          ) : (
            <CourseReviewContent
              reviewData={reviewData}
              onApprove={() => handleApproveClick(reviewState.courseId, reviewData?.course?.title || 'Course')}
              onArchive={() => handleArchive(reviewState.courseId, reviewData?.course?.title || 'Course')}
              onRequestChanges={() => openReasonModal('requestChanges', reviewState.courseId, reviewData?.course?.title || 'Course')}
              onReject={() => openReasonModal('reject', reviewState.courseId, reviewData?.course?.title || 'Course')}
              onBack={closeReview}
              busyAction={actionState.courseId === reviewState.courseId ? actionState.action : ''}
            />
          )}
        </div>

        {approveConfirmModal && (
          <ApproveConfirmModal
            courseTitle={approveConfirmModal.title}
            busy={actionState.courseId === approveConfirmModal.courseId && actionState.action === 'approve'}
            onClose={() => setApproveConfirmModal(null)}
            onConfirm={confirmApprove}
          />
        )}

        {reasonModal && (
          <ReasonModal
            title={reasonModal.mode === 'requestChanges' ? 'Request Changes' : 'Reject Course'}
            subtitle={`Course: ${reasonModal.courseTitle}`}
            submitLabel={reasonModal.mode === 'requestChanges' ? 'Request Changes' : 'Reject'}
            submitClassName={reasonModal.mode === 'requestChanges' ? 'btn btn-warning text-dark' : 'btn btn-danger'}
            reason={reasonModal.reason}
            error={reasonModal.error}
            busy={actionState.courseId === reasonModal.courseId && (actionState.action === 'requestChanges' || actionState.action === 'reject')}
            onChange={(value) => setReasonModal((previous) => ({ ...previous, reason: value, error: '' }))}
            onClose={() => setReasonModal(null)}
            onSubmit={submitReasonAction}
          />
        )}
      </div>
    );
  }

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Course Approvals</h2>
        <p className="text-muted mb-0 small">Manage and review submitted course materials.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
        {/* Tab Bar */}
        <div className="border-bottom mb-4">
          <ul className="nav nav-tabs border-bottom-0 flex-wrap">
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-4 ${activeSubTab === 'pending' ? 'active text-success' : 'text-muted'}`}
                onClick={() => setActiveSubTab('pending')}
              >
                Pending Review
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-4 ${activeSubTab === 'approved' ? 'active text-success' : 'text-muted'}`}
                onClick={() => setActiveSubTab('approved')}
              >
                Approved Courses
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-4 ${activeSubTab === 'rejected' ? 'active text-success' : 'text-muted'}`}
                onClick={() => setActiveSubTab('rejected')}
              >
                Rejected Courses
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-4 ${activeSubTab === 'draft' ? 'active text-success' : 'text-muted'}`}
                onClick={() => setActiveSubTab('draft')}
              >
                Draft Courses
              </button>
            </li>
          </ul>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h5 className="fw-bold text-dark mb-0">
            {activeSubTab === 'pending' && 'Pending Course Submissions'}
            {activeSubTab === 'approved' && 'Approved Course Listings'}
            {activeSubTab === 'rejected' && 'Rejected Course Listings'}
            {activeSubTab === 'draft' && 'Draft Course Listings'}
          </h5>
          <span className="badge rounded-pill bg-light text-dark px-3 py-2 border">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted small">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-3 mb-0">Syncing courses...</p>
          </div>
        ) : loadError ? (
          <div className="text-center py-5 text-muted small">
            <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
            <p className="mb-3">{loadError}</p>
            <button type="button" className="btn btn-success rounded-pill fw-bold px-4" onClick={loadCourses}>
              Retry
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-5 text-muted small">
            <i className="bi bi-shield-check fs-1 text-success mb-2"></i>
            <p className="mb-0">No courses found in this category.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  <th>Course</th>
                  <th>Mentor</th>
                  <th>Category</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <div>
                        <h6 className="fw-bold text-dark mb-1 small">{course.title}</h6>
                        <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '300px', fontSize: '0.75rem' }}>
                          {course.shortDescription || 'No description provided.'}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="fw-bold text-dark small">{course.mentorName || 'Current Mentor'}</span>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{course.mentorEmail || 'Unavailable'}</div>
                    </td>
                    <td>
                      <span className="badge rounded-pill bg-light text-dark small">{course.category || 'Tech'}</span>
                    </td>
                    <td className="text-muted small">{formatDate(course.updatedAt || course.createdAt)}</td>
                    <td>
                      <span className={`badge rounded-pill small px-3 py-2 ${getStatusBadgeClass(course.status)}`}>
                        {formatStatusLabel(course.status)}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-success btn-sm rounded-pill fw-bold px-3 border"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => openReview(course.id)}
                      >
                        {activeSubTab === 'pending' ? 'Review Course' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return '—';
  }
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }
  return parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusBadgeClass(status) {
  const badges = {
    DRAFT: 'bg-secondary-subtle text-secondary',
    SUBMITTED: 'bg-warning-subtle text-warning',
    UNDER_REVIEW: 'bg-info-subtle text-info',
    APPROVED: 'bg-primary-subtle text-primary',
    PUBLISHED: 'bg-success-subtle text-success',
    REJECTED: 'bg-danger-subtle text-danger',
    ARCHIVED: 'bg-dark-subtle text-dark'
  };
  return badges[status] || 'bg-warning-subtle text-warning';
}

function formatStatusLabel(status) {
  if (status === 'PENDING_APPROVAL') return 'Submitted';
  return status ? status.replaceAll('_', ' ') : 'Submitted';
}

function getFriendlyErrorMessage(error, fallbackMessage) {
  const status = Number(error?.status);
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'Access denied. You do not have permission to review courses.';
  if (status === 404) return 'Course not found.';
  if (status >= 500) return 'We could not complete that request right now. Please try again.';
  return error?.message || fallbackMessage;
}

function CourseReviewContent({ reviewData, onApprove, onArchive, onRequestChanges, onReject, onBack, busyAction }) {
  const course = reviewData?.course;
  const modules = Array.isArray(reviewData?.modules) ? reviewData.modules : [];
  const mentorLabel = course?.mentorName ? `${course.mentorName}${course.mentorEmail ? ` (${course.mentorEmail})` : ''}` : '—';
const canTakeReviewActions =
    course?.status !== 'APPROVED' &&
    course?.status !== 'PUBLISHED' &&
    course?.status !== 'REJECTED' &&
    course?.status !== 'ARCHIVED';
  if (!course) {
    return (
      <div className="text-center py-5 text-muted small">
        <i className="bi bi-folder-x fs-1 mb-3"></i>
        <p className="mb-0">Course details are unavailable.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
            <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(course.status)}`}>{formatStatusLabel(course.status)}</span>
            <span className="badge rounded-pill bg-light text-dark px-3 py-2">{course.category || 'Uncategorized'}</span>
            <span className="badge rounded-pill bg-light text-dark px-3 py-2">{course.level || 'Level not set'}</span>
            <span className="badge rounded-pill bg-light text-dark px-3 py-2">{course.language || 'Language not set'}</span>
          </div>
          <h3 className="fw-bold text-dark mb-1">{course.title}</h3>
          <p className="text-muted mb-0">{course.shortDescription || 'No short description provided.'}</p>
        </div>
      </div>

      {course.rejectionReason && (
        <div className="alert alert-info border-info-subtle bg-info-subtle rounded-4 mb-4" role="alert">
          <h6 className="fw-bold text-dark mb-1">
            <i className="bi bi-chat-right-text-fill me-2 text-primary"></i>
            Reviewer Comments & Feedback
          </h6>
          <p className="text-dark small mb-0">{course.rejectionReason}</p>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="rounded-4 border bg-light overflow-hidden position-relative d-flex align-items-center justify-content-center" style={{ minHeight: '240px', maxHeight: '280px' }}>
            <img
              src={getCourseThumbnailUrl(course)}
              alt={course.title || 'Course Thumbnail'}
              className="img-fluid w-100 h-100 rounded-4"
              style={{ objectFit: 'cover', minHeight: '240px', maxHeight: '280px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getCourseThumbnailUrl({ category: course.category, title: course.title });
              }}
            />
          </div>

          <div className="mt-3">
            <label className="fw-bold small text-dark mb-1">Course Banner Preview</label>
            <div className="rounded-4 border bg-light overflow-hidden" style={{ height: '120px' }}>
              <img 
                src={getCourseBannerUrl(course)} 
                alt="Banner" 
                className="w-100 h-100" 
                style={{ objectFit: 'cover' }} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getCourseBannerUrl({ category: course.category, title: course.title });
                }}
              />
            </div>
          </div>

          <div className="mt-3 small text-muted">
            <div><span className="fw-semibold text-dark">Mentor:</span> {mentorLabel}</div>
            <div><span className="fw-semibold text-dark">Estimated duration:</span> {course.estimatedDuration || '—'}</div>
            <div><span className="fw-semibold text-dark">Learning hours:</span> {course.estimatedLearningHours || '—'}</div>
            <div><span className="fw-semibold text-dark">Last updated:</span> {formatDate(course.updatedAt || course.createdAt)}</div>
            {course.promotionalVideoUrl && (
              <div className="mt-2">
                <a href={course.promotionalVideoUrl} target="_blank" rel="noreferrer" className="text-decoration-none small text-primary fw-bold">
                  <i className="bi bi-play-circle me-1"></i> Play Promotional Video
                </a>
              </div>
            )}
            {course.introVideoUrl && (
              <div className="mt-1">
                <a href={course.introVideoUrl} target="_blank" rel="noreferrer" className="text-decoration-none small text-primary fw-bold">
                  <i className="bi bi-play-circle me-1"></i> Play Course Intro Video
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 bg-light rounded-4 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">Course Description</h5>
            <p className="text-dark mb-0">{course.description || 'No course description provided.'}</p>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="card border-0 bg-light rounded-4 p-4 h-100">
                <h6 className="fw-bold text-dark mb-2">Learning Outcomes</h6>
                <p className="text-dark mb-0">{course.learningOutcomes || '—'}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 bg-light rounded-4 p-4 h-100">
                <h6 className="fw-bold text-dark mb-2">Skills</h6>
                <p className="text-dark mb-0">{course.skills || '—'}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 bg-light rounded-4 p-4 h-100">
                <h6 className="fw-bold text-dark mb-2">Prerequisites</h6>
                <p className="text-dark mb-0">{course.prerequisites || '—'}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 bg-light rounded-4 p-4 h-100">
                <h6 className="fw-bold text-dark mb-2">Target Audience</h6>
                <p className="text-dark mb-0">{course.targetAudience || '—'}</p>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
            <h5 className="fw-bold text-dark mb-3">Curriculum</h5>
            {modules.length === 0 ? (
              <div className="text-muted small">No modules submitted.</div>
            ) : (
              <div className="vstack gap-3">
                {modules
                  .slice()
                  .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                  .map((module, moduleIndex) => (
                    <div key={`${module.title}-${moduleIndex}`} className="rounded-4 border p-3">
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <span className="badge rounded-pill bg-success-subtle text-success">Module {moduleIndex + 1}</span>
                        <h6 className="fw-bold text-dark mb-0">{module.title}</h6>
                      </div>
                      <p className="text-muted small mb-3">{module.description || 'No module description.'}</p>

                      {Array.isArray(module.lessons) && module.lessons.length > 0 ? (
                        <div className="vstack gap-2">
                          {module.lessons
                            .slice()
                            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                            .map((lesson, lessonIndex) => (
                              <div key={`${lesson.title}-${lessonIndex}`} className="rounded-4 bg-light p-3">
                                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                  <span className="badge rounded-pill bg-white text-dark border">Lesson {lessonIndex + 1}</span>
                                  <div className="fw-semibold text-dark">{lesson.title}</div>
                                  {lesson.lessonType && (
                                    <span className="badge rounded-pill bg-white text-dark border">{lesson.lessonType}</span>
                                  )}
                                  {lesson.mandatory === false ? (
                                    <span className="badge rounded-pill bg-warning-subtle text-warning">Optional</span>
                                  ) : (
                                    <span className="badge rounded-pill bg-info-subtle text-info">Mandatory</span>
                                  )}
                                </div>
                                <div className="small text-muted mb-2">
                                  {lesson.estimatedDuration || 'Duration not set'}
                                </div>
                                <div className="small text-dark mb-3">{lesson.content || 'No lesson content.'}</div>

                                {Array.isArray(lesson.resources) && lesson.resources.length > 0 ? (
                                  <div>
                                    <div className="small fw-semibold text-dark mb-2">Resources</div>
                                    <div className="vstack gap-2">
                                      {lesson.resources
                                        .slice()
                                        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                                        .map((resource, resourceIndex) => (
                                          <div key={`${resource.title}-${resourceIndex}`} className="rounded-4 border bg-white p-3">
                                            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                              <span className="fw-semibold text-dark">{resource.title}</span>
                                              <span className="badge rounded-pill bg-light text-dark">{resource.type}</span>
                                            </div>
                                            <div className="small text-muted mb-1">{resource.description || 'No description.'}</div>
                                            <a href={resource.url} target="_blank" rel="noreferrer" className="small text-decoration-none">
                                              {resource.url}
                                            </a>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="small text-muted">No resources attached.</div>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="small text-muted">No lessons submitted.</div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons at the bottom */}
      <div className="d-flex justify-content-end gap-3 flex-wrap mt-4 border-top pt-4">
        {canTakeReviewActions && (
          <>
            <button type="button" className="btn btn-success rounded-pill fw-bold px-4" onClick={onApprove} disabled={busyAction !== ''}>
              {busyAction === 'approve' ? 'Publishing Live...' : 'Approve & Publish Course'}
            </button>
            <button type="button" className="btn btn-danger rounded-pill fw-bold px-4" onClick={onReject} disabled={busyAction !== ''}>
              {busyAction === 'reject' ? 'Rejecting...' : 'Reject Course'}
            </button>
          </>
        )}
        {(course.status === 'APPROVED' || course.status === 'PUBLISHED') && (
          <button type="button" className="btn btn-dark rounded-pill fw-bold px-4" onClick={onArchive} disabled={busyAction !== ''}>
            {busyAction === 'archive' ? 'Archiving...' : 'Archive'}
          </button>
        )}
        <button type="button" className="btn btn-light rounded-pill border fw-bold px-4" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

function ReasonModal({ title, subtitle, submitLabel, submitClassName, reason, error, busy, onChange, onClose, onSubmit }) {
  const commonReasons = ['Incomplete content', 'Poor quality', 'Missing modules', 'Missing videos', 'Other'];

  return (
    <div
      className="study-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '560px', width: '92%' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">{title}</h5>
            <div className="text-muted small">{subtitle}</div>
          </div>
          <button className="btn-close" onClick={onClose} disabled={busy}></button>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold mb-2">Select Rejection Reason:</label>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {commonReasons.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`btn btn-sm rounded-pill ${reason === opt ? 'btn-danger text-white' : 'btn-light border text-dark'}`}
                onClick={() => onChange(opt)}
                disabled={busy}
              >
                {opt}
              </button>
            ))}
          </div>
          <label className="form-label small fw-bold">Reviewer Comments / Details <span className="text-danger">*</span></label>
          <textarea
            className={`form-control rounded-3 ${error ? 'is-invalid' : ''}`}
            rows="3"
            value={reason}
            onChange={(event) => onChange(event.target.value)}
            disabled={busy}
            placeholder="Select a reason above or type detailed rejection feedback..."
          ></textarea>
          {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>

        <div className="d-flex justify-content-end gap-2 border-top pt-3">
          <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className={`${submitClassName} rounded-pill px-4 fw-bold`} onClick={onSubmit} disabled={busy}>
            {busy ? 'Processing...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ApproveConfirmModal({ courseTitle, busy, onClose, onConfirm }) {
  return (
    <div
      className="study-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '460px', width: '92%' }}>
        <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
          <i className="bi bi-check-circle-fill text-success"></i> Approve & Publish this course?
        </h5>
        <p className="text-muted small mb-4">
          As Administrator, approving <strong>"{courseTitle}"</strong> will publish it live directly. It will immediately appear across student catalogs, search registries, and home landing pages.
        </p>

        <div className="d-flex justify-content-end gap-2 border-top pt-3">
          <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-success rounded-pill px-4 fw-bold" onClick={onConfirm} disabled={busy}>
            {busy ? 'Publishing Live...' : 'Approve & Publish Live'}
          </button>
        </div>
      </div>
    </div>
  );
}
