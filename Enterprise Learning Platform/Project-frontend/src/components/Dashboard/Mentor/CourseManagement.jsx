import { useEffect, useState } from 'react';
import CourseService from '../../../services/CourseService';
import MentorCourseWizard from './MentorCourseWizard';
import MentorCoursePreview from './MentorCoursePreview';
import { COURSE_CATEGORIES } from '../../../constants/categories';
import { getCourseThumbnailUrl } from '../../../utils/courseImageHelper';

const EMPTY_COURSE_FORM = {
  title: '',
  category: 'Programming',
  level: 'Intermediate',
  shortDescription: '',
  description: '',
  thumbnailUrl: '',
  language: 'English',
  estimatedDuration: '',
  estimatedLearningHours: '',
  prerequisites: '',
  learningOutcomes: '',
  skills: ''
};

const EDITABLE_STATUSES = new Set(['DRAFT', 'REJECTED']);
const SUBMITTABLE_STATUSES = new Set(['DRAFT', 'REJECTED']);

function normalizeCoursePayload(course) {
  return {
    ...course,
    estimatedLearningHours:
      course.estimatedLearningHours === '' || course.estimatedLearningHours === null
        ? null
        : Number(course.estimatedLearningHours),
  };
}

function formatDate(value) {
  if (!value) {
    return 'Recently updated';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Recently updated';
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatStatusLabel(status) {
  return status ? status.replaceAll('_', ' ') : 'Unknown';
}

function getStatusBadgeClass(status) {
  const badges = {
    DRAFT: 'bg-secondary-subtle text-secondary',
    PENDING_APPROVAL: 'bg-warning-subtle text-warning',
    SUBMITTED: 'bg-warning-subtle text-warning',
    UNDER_REVIEW: 'bg-info-subtle text-info',
    APPROVED: 'bg-primary-subtle text-primary',
    PUBLISHED: 'bg-success-subtle text-success',
    REJECTED: 'bg-danger-subtle text-danger',
    ARCHIVED: 'bg-dark-subtle text-dark'
  };

  return badges[status] || 'bg-secondary-subtle text-secondary';
}

function getFriendlyErrorMessage(error, fallbackMessage) {
  const status = Number(error?.status);

  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (status === 403) {
    return 'Access denied. You do not have permission to access this section.';
  }

  if (status === 404) {
    return 'The requested course information could not be found.';
  }

  if (status >= 500) {
    return 'We could not complete that request right now. Please try again.';
  }

  return error?.message || fallbackMessage;
}

function getSubmissionValidationState(error) {
  if (error?.errors && typeof error.errors === 'object') {
    return {
      message: error.message || 'Course is not ready for submission.',
      errors: Object.values(error.errors),
    };
  }

  return null;
}

function getCourseThumbnailStyle(thumbnailUrl) {
  if (thumbnailUrl) {
    return {
      backgroundImage: `url(${thumbnailUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }

  return {
    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
  };
}

function StatusBadge({ status }) {
  return (
    <span
      className={`badge rounded-pill fw-bold text-uppercase ${getStatusBadgeClass(status)}`}
      style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}
    >
      {formatStatusLabel(status)}
    </span>
  );
}

function CourseListState({ icon, title, message, actionLabel, onAction }) {
  return (
    <div className="text-center py-5">
      <div className="fs-1 text-muted mb-3">
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="fw-bold text-dark mb-2">{title}</h5>
      <p className="text-muted mb-3">{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function CoursePreviewModal({ course, onClose }) {
  if (!course) {
    return null;
  }

  return (
    <div className="study-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '720px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <div>
            <h5 className="fw-bold text-dark mb-1">Course Preview</h5>
            <p className="text-muted mb-0">Review the course summary without leaving the dashboard.</p>
          </div>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div
              className="rounded-4 border overflow-hidden position-relative"
              style={{ minHeight: '220px', maxHeight: '240px', backgroundColor: '#f3f4f6' }}
            >
              <img 
                src={getCourseThumbnailUrl(course)} 
                alt={course.title}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getCourseThumbnailUrl({ category: course.category, title: course.title });
                }}
              />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <StatusBadge status={course.status} />
              <span className="badge rounded-pill bg-light text-dark">{course.category || 'Uncategorized'}</span>
              <span className="badge rounded-pill bg-light text-dark">{course.level || 'Level not set'}</span>
            </div>

            <h4 className="fw-bold text-dark mb-2">{course.title}</h4>
            <p className="text-muted mb-3">{course.shortDescription || 'No short description added yet.'}</p>
            <p className="text-dark mb-4">{course.description || 'No detailed description added yet.'}</p>

            <div className="row g-3 small">
              <div className="col-sm-6">
                <div className="rounded-4 border bg-light p-3 h-100">
                  <div className="text-muted mb-1">Students</div>
                  <div className="fw-bold text-dark">{course.enrollmentCount ?? 0}</div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="rounded-4 border bg-light p-3 h-100">
                  <div className="text-muted mb-1">Last updated</div>
                  <div className="fw-bold text-dark">{formatDate(course.updatedAt || course.createdAt)}</div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="rounded-4 border bg-light p-3 h-100">
                  <div className="text-muted mb-1">Modules</div>
                  <div className="fw-bold text-dark">{course.moduleCount ?? 0}</div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="rounded-4 border bg-light p-3 h-100">
                  <div className="text-muted mb-1">Lessons</div>
                  <div className="fw-bold text-dark">{course.lessonCount ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="row g-3 mt-1 small">
              <div className="col-sm-6">
                <div className="text-muted mb-1">Language</div>
                <div className="fw-semibold text-dark">{course.language || 'Not specified'}</div>
              </div>
              <div className="col-sm-6">
                <div className="text-muted mb-1">Estimated duration</div>
                <div className="fw-semibold text-dark">{course.estimatedDuration || 'Not specified'}</div>
              </div>
              <div className="col-sm-6">
                <div className="text-muted mb-1">Learning hours</div>
                <div className="fw-semibold text-dark">{course.estimatedLearningHours ?? 'Not specified'}</div>
              </div>
              <div className="col-sm-6">
                <div className="text-muted mb-1">Skills</div>
                <div className="fw-semibold text-dark">{course.skills || 'Not specified'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end border-top pt-3 mt-4">
          <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedbackModal({ course, onClose }) {
  if (!course) {
    return null;
  }

  return (
    <div className="study-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '560px', width: '92%' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Rejection Feedback</h5>
            <p className="text-muted mb-0">{course.title}</p>
          </div>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="rounded-4 border border-danger-subtle bg-danger-subtle p-3">
          <div className="d-flex align-items-start gap-3">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-4"></i>
            <div>
              <h6 className="fw-bold text-dark mb-2">Reviewer feedback</h6>
              <p className="text-dark mb-0">
                {course.rejectionReason || 'No specific feedback was attached to this rejection.'}
              </p>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end border-top pt-3 mt-4">
          <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseFormModal({
  title,
  submitLabel,
  course,
  onChange,
  onClose,
  onSubmit
}) {
  if (!course) {
    return null;
  }

  return (
    <div className="study-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '580px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <h5 className="fw-bold text-dark mb-0">{title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Course Title</label>
            <input
              type="text"
              required
              className="form-control rounded-3"
              placeholder="Course title..."
              value={course.title}
              onChange={(event) => onChange({ ...course, title: event.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Short Description</label>
            <textarea
              rows="2"
              className="form-control rounded-3"
              placeholder="Brief description..."
              value={course.shortDescription || ''}
              onChange={(event) => onChange({ ...course, shortDescription: event.target.value })}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Description</label>
            <textarea
              rows="3"
              className="form-control rounded-3"
              placeholder="Full course description..."
              value={course.description || ''}
              onChange={(event) => onChange({ ...course, description: event.target.value })}
            ></textarea>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Category</label>
              <select
                className="form-select rounded-3"
                value={course.category}
                onChange={(event) => onChange({ ...course, category: event.target.value })}
              >
                {COURSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Level</label>
              <select
                className="form-select rounded-3"
                value={course.level}
                onChange={(event) => onChange({ ...course, level: event.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Thumbnail URL (optional)</label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="https://..."
              value={course.thumbnailUrl || ''}
              onChange={(event) => onChange({ ...course, thumbnailUrl: event.target.value })}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Language</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="English"
                value={course.language || ''}
                onChange={(event) => onChange({ ...course, language: event.target.value })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Estimated Duration</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="6 weeks"
                value={course.estimatedDuration || ''}
                onChange={(event) => onChange({ ...course, estimatedDuration: event.target.value })}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Estimated Learning Hours</label>
            <input
              type="number"
              min="0"
              className="form-control rounded-3"
              placeholder="24"
              value={course.estimatedLearningHours ?? ''}
              onChange={(event) => onChange({ ...course, estimatedLearningHours: event.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Prerequisites</label>
            <textarea
              rows="2"
              className="form-control rounded-3"
              placeholder="Comma-separated or one per line"
              value={course.prerequisites || ''}
              onChange={(event) => onChange({ ...course, prerequisites: event.target.value })}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Learning Outcomes</label>
            <textarea
              rows="2"
              className="form-control rounded-3"
              placeholder="Comma-separated or one per line"
              value={course.learningOutcomes || ''}
              onChange={(event) => onChange({ ...course, learningOutcomes: event.target.value })}
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Skills</label>
            <textarea
              rows="2"
              className="form-control rounded-3"
              placeholder="React, Spring Boot, SQL"
              value={course.skills || ''}
              onChange={(event) => onChange({ ...course, skills: event.target.value })}
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CourseManagement({ onShowToast }) {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseLoadError, setCourseLoadError] = useState('');
  const [feedbackCourse, setFeedbackCourse] = useState(null);
  const [actionState, setActionState] = useState({ courseId: null, action: '' });
  const [wizardState, setWizardState] = useState(null);
  const [previewState, setPreviewState] = useState(null);
  const [submissionValidation, setSubmissionValidation] = useState(null);
  const [activeStatusTab, setActiveStatusTab] = useState('all');

  const filteredCourses = courses.filter((course) => {
    if (activeStatusTab === 'draft') return course.status === 'DRAFT';
    if (activeStatusTab === 'pending') return course.status === 'SUBMITTED' || course.status === 'UNDER_REVIEW' || course.status === 'PENDING_APPROVAL';
    if (activeStatusTab === 'published') return course.status === 'PUBLISHED' || course.status === 'APPROVED';
    if (activeStatusTab === 'rejected') return course.status === 'REJECTED';
    return true;
  });

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      setCourseLoadError('');
      const data = await CourseService.getMentorCourses();
      const normalizedCourses = Array.isArray(data) ? data : [];
      setCourses(normalizedCourses);
    } catch (error) {
      setCourseLoadError(getFriendlyErrorMessage(error, 'We could not load your courses right now.'));
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const withCourseAction = async (courseId, actionName, callback) => {
    try {
      setActionState({ courseId, action: actionName });
      await callback();
    } finally {
      setActionState({ courseId: null, action: '' });
    }
  };

  const handleDeleteDraft = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This action cannot be undone.`)) {
      return;
    }

    await withCourseAction(course.id, 'delete', async () => {
      try {
        await CourseService.deleteDraftCourse(course.id);
        onShowToast('success', 'Course deleted successfully.');
        await loadCourses();
      } catch (error) {
        onShowToast('error', getFriendlyErrorMessage(error, 'Failed to delete course.'));
      }
    });
  };

  const handleSubmitForApproval = async (course) => {
    await withCourseAction(course.id, 'submit', async () => {
      try {
        await CourseService.submitForApproval(course.id);
        setSubmissionValidation(null);
        onShowToast('success', course.status === 'REJECTED' ? 'Course resubmitted for approval.' : 'Course submitted for approval.');
        await loadCourses();
      } catch (error) {
        const validationState = getSubmissionValidationState(error);
        if (validationState) {
          setSubmissionValidation(validationState);
          onShowToast('error', validationState.message);
          return;
        }

        onShowToast('error', getFriendlyErrorMessage(error, 'Failed to submit course for approval.'));
      }
    });
  };

  const handlePublishCourse = async (course) => {
    await withCourseAction(course.id, 'publish', async () => {
      try {
        await CourseService.publishCourse(course.id);
        onShowToast('success', 'Course published successfully.');
        await loadCourses();
      } catch (error) {
        onShowToast('error', getFriendlyErrorMessage(error, 'Failed to publish course.'));
      }
    });
  };

  const handleWithdrawSubmission = async (course) => {
    if (!window.confirm(`Are you sure you want to withdraw the submission for "${course.title}"? It will go back to Draft status.`)) {
      return;
    }

    await withCourseAction(course.id, 'withdraw', async () => {
      try {
        await CourseService.withdrawSubmission(course.id);
        onShowToast('success', 'Submission withdrawn successfully.');
        await loadCourses();
      } catch (error) {
        onShowToast('error', getFriendlyErrorMessage(error, 'Failed to withdraw submission.'));
      }
    });
  };

  const handleDuplicateCourse = async (course) => {
    await withCourseAction(course.id, 'duplicate', async () => {
      try {
        await CourseService.duplicateCourse(course.id);
        onShowToast('success', 'Course duplicated successfully as a new Draft.');
        await loadCourses();
      } catch (error) {
        onShowToast('error', getFriendlyErrorMessage(error, 'Failed to duplicate course.'));
      }
    });
  };

  const openCourseWizard = (course, mode) => {
    setSubmissionValidation(null);
    setWizardState({
      course,
      mode,
    });
  };

  const openCoursePreview = (course) => {
    setSubmissionValidation(null);
    setPreviewState({
      course,
      returnMode: EDITABLE_STATUSES.has(course.status) ? 'edit' : 'courses',
    });
  };

  const renderActionButton = (course, label, icon, className, onClick, actionName) => (
    <button
      key={`${course.id}-${label}`}
      type="button"
      className={`${className} btn btn-sm rounded-pill fw-bold`}
      style={{ fontSize: '0.75rem' }}
      onClick={onClick}
      disabled={actionState.courseId === course.id && actionState.action === actionName}
    >
      <i className={`bi ${icon} me-1`}></i>
      {actionState.courseId === course.id && actionState.action === actionName ? 'Working...' : label}
    </button>
  );

  const renderCourseActions = (course) => {
    const actions = [];

    // Duplicate is always available for any course status!
    actions.push(renderActionButton(course, 'Duplicate', 'bi-files', 'btn-info text-white', () => handleDuplicateCourse(course), 'duplicate'));

    if (course.status === 'DRAFT') {
      actions.push(renderActionButton(course, 'Edit', 'bi-pencil-square', 'btn-primary', () => openCourseWizard(course, 'edit'), 'open-edit'));
      actions.push(renderActionButton(course, 'Preview', 'bi-eye', 'btn-light border', () => openCoursePreview(course), 'preview'));
      actions.push(renderActionButton(course, 'Submit', 'bi-send-check', 'btn-success', () => handleSubmitForApproval(course), 'submit'));
    }

    if (course.status === 'SUBMITTED' || course.status === 'PENDING_APPROVAL' || course.status === 'UNDER_REVIEW') {
      actions.push(renderActionButton(course, 'View', 'bi-folder2-open', 'btn-primary', () => openCourseWizard(course, 'view'), 'open-view'));
      actions.push(renderActionButton(course, 'Preview', 'bi-eye', 'btn-light border', () => openCoursePreview(course), 'preview'));
      actions.push(renderActionButton(course, 'Withdraw', 'bi-arrow-left-right', 'btn-warning text-dark', () => handleWithdrawSubmission(course), 'withdraw'));
    }

    if (course.status === 'REJECTED') {
      actions.push(renderActionButton(course, 'View Feedback', 'bi-chat-left-text', 'btn-warning text-dark', () => setFeedbackCourse(course), 'feedback'));
      actions.push(renderActionButton(course, 'Edit', 'bi-pencil-square', 'btn-primary', () => openCourseWizard(course, 'edit'), 'open-edit'));
      actions.push(renderActionButton(course, 'Resubmit', 'bi-send-check', 'btn-success', () => handleSubmitForApproval(course), 'submit'));
    }

    if (course.status === 'APPROVED') {
      actions.push(renderActionButton(course, 'View', 'bi-folder2-open', 'btn-primary', () => openCourseWizard(course, 'view'), 'open-view'));
      actions.push(renderActionButton(course, 'Preview', 'bi-eye', 'btn-light border', () => openCoursePreview(course), 'preview'));
      actions.push(renderActionButton(course, 'Publish', 'bi-broadcast-pin', 'btn-success', () => handlePublishCourse(course), 'publish'));
    }

    if (course.status === 'PUBLISHED') {
      actions.push(renderActionButton(course, 'View', 'bi-folder2-open', 'btn-primary', () => openCourseWizard(course, 'view'), 'open-view'));
    }

    if (course.status === 'ARCHIVED') {
      actions.push(renderActionButton(course, 'View', 'bi-folder2-open', 'btn-primary', () => openCourseWizard(course, 'view'), 'open-view'));
    }

    // Delete is ALWAYS available for any course status!
    actions.push(renderActionButton(course, 'Delete', 'bi-trash-fill', 'btn-outline-danger', () => handleDeleteDraft(course), 'delete'));

    return actions;
  };

  if (wizardState) {
    return (
      <>
        <MentorCourseWizard
          initialCourse={wizardState.course}
          mode={wizardState.mode}
          onBack={() => setWizardState(null)}
          onShowToast={onShowToast}
          onComplete={async () => {
            setWizardState(null);
            await loadCourses();
          }}
        />
      </>
    );
  }

  if (previewState) {
    return (
      <MentorCoursePreview
        courseId={previewState.course?.id}
        initialCourse={previewState.course}
        backLabel={previewState.returnMode === 'edit' ? 'Back to Edit' : 'Back to Courses'}
        onBack={() => {
          const nextCourse = previewState.course;
          const nextReturnMode = previewState.returnMode;
          setPreviewState(null);

          if (nextReturnMode === 'edit') {
            openCourseWizard(nextCourse, 'edit');
          }
        }}
        onSubmit={async () => {
          await handleSubmitForApproval(previewState.course);
          setPreviewState(null);
        }}
        allowSubmit={SUBMITTABLE_STATUSES.has(previewState.course?.status)}
        submitDisabled={actionState.courseId === previewState.course?.id && actionState.action === 'submit'}
        submitLabel={
          actionState.courseId === previewState.course?.id && actionState.action === 'submit'
            ? 'Submitting...'
            : 'Submit For Approval'
        }
        validationMessage={submissionValidation?.message || ''}
        validationErrors={submissionValidation?.errors || []}
      />
    );
  }

  return (
    <div className="fade-in-quick text-start">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Courses</h2>
          <p className="text-muted mb-0">Create, review, and manage the courses you own.</p>
        </div>
        <button className="btn btn-success rounded-pill fw-bold" onClick={() => openCourseWizard(null, 'create')}>
          <i className="bi bi-plus-lg me-1"></i> Create Course
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
        {/* Status Sub-Tabs */}
        <div className="border-bottom mb-4">
          <ul className="nav nav-tabs border-bottom-0 flex-wrap">
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-4 ${activeStatusTab === 'all' ? 'active text-success' : 'text-muted'}`}
                onClick={() => setActiveStatusTab('all')}
              >
                All ({courses.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-4 ${activeStatusTab === 'draft' ? 'active text-success' : 'text-muted'}`}
                onClick={() => setActiveStatusTab('draft')}
              >
                Draft ({courses.filter(c => c.status === 'DRAFT').length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-4 ${activeStatusTab === 'pending' ? 'active text-success' : 'text-muted'}`}
                onClick={() => setActiveStatusTab('pending')}
              >
                Pending Review ({courses.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(c.status)).length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-4 ${activeStatusTab === 'published' ? 'active text-success' : 'text-muted'}`}
                onClick={() => setActiveStatusTab('published')}
              >
                Published ({courses.filter(c => ['PUBLISHED', 'APPROVED'].includes(c.status)).length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold px-4 ${activeStatusTab === 'rejected' ? 'active text-success' : 'text-muted'}`}
                onClick={() => setActiveStatusTab('rejected')}
              >
                Rejected ({courses.filter(c => c.status === 'REJECTED').length})
              </button>
            </li>
          </ul>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold text-dark mb-1">
              {activeStatusTab === 'all' && 'All Courses'}
              {activeStatusTab === 'draft' && 'Draft Courses'}
              {activeStatusTab === 'pending' && 'Courses Pending Review'}
              {activeStatusTab === 'published' && 'Published Courses'}
              {activeStatusTab === 'rejected' && 'Rejected Courses'}
            </h5>
            <p className="text-muted mb-0">Track course status, engagement, and next actions from one place.</p>
          </div>
          <span className="badge rounded-pill bg-light text-dark px-3 py-2">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
          </span>
        </div>

        {submissionValidation?.errors?.length > 0 && (
          <div className="alert alert-warning rounded-4 mb-4" role="alert">
            <div className="fw-bold text-dark mb-2">{submissionValidation.message}</div>
            <ul className="mb-0 ps-3">
              {submissionValidation.errors.map((issue, index) => (
                <li key={`${issue}-${index}`}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {loadingCourses ? (
          <CourseListState
            icon="bi-hourglass-split"
            title="Loading your courses"
            message="Please wait while we sync your mentor workspace."
          />
        ) : courseLoadError ? (
          <CourseListState
            icon="bi-arrow-clockwise"
            title="Unable to load My Courses"
            message={courseLoadError}
            actionLabel="Retry"
            onAction={() => loadCourses()}
          />
        ) : filteredCourses.length === 0 ? (
          <CourseListState
            icon="bi-journal-plus"
            title="No courses found"
            message="No courses match the selected status category."
            actionLabel={activeStatusTab === 'all' ? "Create Course" : null}
            onAction={() => openCourseWizard(null, 'create')}
          />
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Students</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td style={{ minWidth: '280px' }}>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-4 border flex-shrink-0 d-flex align-items-center justify-content-center text-success"
                          style={{ width: '72px', height: '72px', ...getCourseThumbnailStyle(course.thumbnailUrl) }}
                        >
                          {!course.thumbnailUrl && <i className="bi bi-collection-play-fill fs-4"></i>}
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark mb-1">{course.title}</h6>
                          <p className="text-muted small mb-1">
                            {course.shortDescription || 'Add a short course summary to help learners understand the value.'}
                          </p>
                          <div className="d-flex flex-wrap gap-2 small text-muted">
                            <span>{course.level || 'Level not set'}</span>
                            <span>&bull;</span>
                            <span>{course.estimatedDuration || 'Self-paced'}</span>
                            <span>&bull;</span>
                            <span>{course.moduleCount ?? 0} modules</span>
                            <span>&bull;</span>
                            <span>{course.lessonCount ?? 0} lessons</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge rounded-pill bg-light text-dark">{course.category || 'Uncategorized'}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-success small">{course.price ? `$${Number(course.price).toFixed(2)}` : 'Free'}</span>
                    </td>
                    <td>
                      <StatusBadge status={course.status} />
                      {course.status === 'REJECTED' && (
                        <div className="mt-2 p-2 bg-danger-subtle text-danger rounded-3 small" style={{ maxWidth: '220px', fontSize: '0.75rem' }}>
                          <i className="bi bi-exclamation-circle-fill me-1"></i>
                          <div><strong>Rejected Reason:</strong> {course.rejectionReason || 'Incomplete content'}</div>
                          <div><strong>Reviewed By:</strong> {course.approvedBy || course.reviewerName || 'Admin'}</div>
                          <div><strong>Reviewed Date:</strong> {formatDate(course.reviewedAt)}</div>
                        </div>
                      )}
                      {(course.status === 'PUBLISHED' || course.status === 'APPROVED') && (
                        <div className="mt-2 p-2 bg-success-subtle text-dark rounded-3 small" style={{ maxWidth: '220px', fontSize: '0.75rem' }}>
                          <div className="text-success fw-bold">Published</div>
                          <div><strong>Approved By:</strong> {course.approvedBy || course.reviewerName || 'Admin'}</div>
                          <div><strong>Approved Date:</strong> {formatDate(course.approvedAt || course.reviewedAt || course.publishedAt)}</div>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{course.enrollmentCount ?? 0}</div>
                      <div className="small text-muted">Enrollments</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{formatDate(course.updatedAt || course.createdAt)}</div>
                      <div className="small text-muted">Last updated</div>
                    </td>
                    <td style={{ minWidth: '260px' }}>
                      <div className="d-flex gap-2 flex-wrap">
                        {renderCourseActions(course)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FeedbackModal course={feedbackCourse} onClose={() => setFeedbackCourse(null)} />
    </div>
  );
}

function CourseContentEditor({
  course,
  mode,
  modules,
  modulesLoading,
  modulesError,
  onBack,
  onRefreshModules,
  onRetryModules,
  onEditDetails,
  onPreviewCourse,
  onShowToast
}) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    orderIndex: modules.length
  });

  const canEditContent = mode === 'edit' && EDITABLE_STATUSES.has(course.status);

  useEffect(() => {
    if (!selectedModule) {
      return;
    }

    const refreshedModule = modules.find((module) => module.id === selectedModule.id);
    setSelectedModule(refreshedModule || null);
  }, [modules, selectedModule]);

  const handleAddModule = async (event) => {
    event.preventDefault();

    try {
      await CourseContentService.createModule(course.id, newModule);
      setShowAddModuleModal(false);
      setNewModule({ title: '', description: '', orderIndex: modules.length + 1 });
      onShowToast('success', 'Module created successfully.');
      await onRefreshModules();
    } catch (error) {
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to create module.'));
    }
  };

  if (selectedModule) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
        <ModuleEditor
          course={course}
          module={selectedModule}
          readOnly={!canEditContent}
          onBack={() => setSelectedModule(null)}
          onRefresh={onRefreshModules}
          onShowToast={onShowToast}
        />
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <button className="btn btn-light rounded-pill" onClick={onBack}>
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
              <h5 className="fw-bold text-dark mb-0">{course.title}</h5>
              <StatusBadge status={course.status} />
            </div>
            <p className="text-muted mb-0">
              {canEditContent ? 'Edit your course curriculum and content structure.' : 'This course is currently view-only based on its status.'}
            </p>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-light rounded-pill fw-bold border" onClick={onPreviewCourse}>
            <i className="bi bi-eye me-1"></i> Preview
          </button>
          {canEditContent && (
            <button className="btn btn-light rounded-pill fw-bold border" onClick={onEditDetails}>
              <i className="bi bi-pencil-square me-1"></i> Edit Details
            </button>
          )}
          {canEditContent && (
            <button className="btn btn-success rounded-pill fw-bold" onClick={() => setShowAddModuleModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Add Module
            </button>
          )}
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="rounded-4 border bg-light p-3 h-100">
            <div className="small text-muted mb-1">Students</div>
            <div className="fw-bold text-dark">{course.enrollmentCount ?? 0}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="rounded-4 border bg-light p-3 h-100">
            <div className="small text-muted mb-1">Modules</div>
            <div className="fw-bold text-dark">{course.moduleCount ?? modules.length ?? 0}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="rounded-4 border bg-light p-3 h-100">
            <div className="small text-muted mb-1">Lessons</div>
            <div className="fw-bold text-dark">{course.lessonCount ?? 0}</div>
          </div>
        </div>
      </div>

      {modulesLoading ? (
        <CourseListState
          icon="bi-hourglass-split"
          title="Loading curriculum"
          message="Please wait while we load the latest module structure."
        />
      ) : modulesError ? (
        <CourseListState
          icon="bi-arrow-clockwise"
          title="Unable to load curriculum"
          message={modulesError}
          actionLabel="Retry"
          onAction={onRetryModules}
        />
      ) : modules.length === 0 ? (
        <CourseListState
          icon="bi-collection"
          title="No modules yet"
          message={canEditContent ? 'Start by adding the first module to this course.' : 'This course does not have any modules yet.'}
          actionLabel={canEditContent ? 'Add Module' : undefined}
          onAction={canEditContent ? () => setShowAddModuleModal(true) : undefined}
        />
      ) : (
        <div className="row g-3">
          {modules.map((module) => (
            <div key={module.id} className="col-12">
              <div className="card border rounded-4 p-3 h-100">
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                  <div>
                    <h6 className="fw-bold text-dark mb-1">{module.title}</h6>
                    <p className="text-muted small mb-2">{module.description || 'No module description yet.'}</p>
                    <div className="d-flex gap-3 flex-wrap small text-muted">
                      <span>{module.lessons?.length || 0} lessons</span>
                      <span>Updated {formatDate(module.updatedAt)}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm rounded-pill fw-bold"
                    onClick={() => setSelectedModule(module)}
                  >
                    <i className="bi bi-folder2-open me-1"></i>
                    {canEditContent ? 'Edit Module' : 'View Module'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModuleModal && (
        <div className="study-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '520px', width: '92%' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h5 className="fw-bold text-dark mb-0">Add Module</h5>
              <button className="btn-close" onClick={() => setShowAddModuleModal(false)}></button>
            </div>
            <form onSubmit={handleAddModule}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Title</label>
                <input
                  type="text"
                  required
                  className="form-control rounded-3"
                  value={newModule.title}
                  onChange={(event) => setNewModule({ ...newModule, title: event.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Description</label>
                <textarea
                  rows="2"
                  className="form-control rounded-3"
                  value={newModule.description}
                  onChange={(event) => setNewModule({ ...newModule, description: event.target.value })}
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Order</label>
                <input
                  type="number"
                  required
                  className="form-control rounded-3"
                  value={newModule.orderIndex}
                  onChange={(event) => setNewModule({ ...newModule, orderIndex: Number(event.target.value) })}
                />
              </div>
              <div className="d-flex justify-content-end gap-2 border-top pt-3">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowAddModuleModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">Add Module</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleEditor({ course, module, readOnly, onBack, onRefresh, onShowToast }) {
  const [lessons, setLessons] = useState(module.lessons || []);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    orderIndex: (module.lessons || []).length
  });

  useEffect(() => {
    setLessons(module.lessons || []);
  }, [module]);

  const handleAddLesson = async (event) => {
    event.preventDefault();

    try {
      await CourseContentService.createLesson(course.id, module.id, newLesson);
      setShowAddLessonModal(false);
      setNewLesson({ title: '', content: '', orderIndex: lessons.length + 1 });
      onShowToast('success', 'Lesson created successfully.');
      await onRefresh();
    } catch (error) {
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to create lesson.'));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <button className="btn btn-light rounded-pill" onClick={onBack}>
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
          <div>
            <h6 className="fw-bold text-dark mb-1">{module.title}</h6>
            <p className="text-muted mb-0">{readOnly ? 'Viewing lesson structure only.' : 'Manage lessons within this module.'}</p>
          </div>
        </div>
        {!readOnly && (
          <button className="btn btn-success rounded-pill fw-bold" onClick={() => setShowAddLessonModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> Add Lesson
          </button>
        )}
      </div>

      {lessons.length === 0 ? (
        <CourseListState
          icon="bi-journal-text"
          title="No lessons yet"
          message={readOnly ? 'This module does not have any lessons yet.' : 'Add the first lesson to start building this module.'}
          actionLabel={!readOnly ? 'Add Lesson' : undefined}
          onAction={!readOnly ? () => setShowAddLessonModal(true) : undefined}
        />
      ) : (
        <div className="row g-3">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="col-12">
              <div className="card border rounded-4 p-3">
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <h6 className="fw-bold text-dark mb-0">{lesson.title}</h6>
                      {lesson.lessonType && (
                        <span className="badge rounded-pill bg-light text-dark">{lesson.lessonType}</span>
                      )}
                      {lesson.previewAvailable && (
                        <span className="badge rounded-pill bg-success-subtle text-success">Preview</span>
                      )}
                    </div>
                    <p className="text-muted small mb-2">
                      {lesson.content ? `${lesson.content.substring(0, 120)}${lesson.content.length > 120 ? '...' : ''}` : 'No lesson content added yet.'}
                    </p>
                    <div className="d-flex gap-3 flex-wrap small text-muted">
                      <span>{lesson.resources?.length || 0} resources</span>
                      <span>{lesson.estimatedDuration || 'Duration not set'}</span>
                      <span>Updated {formatDate(lesson.updatedAt)}</span>
                    </div>
                  </div>
                  <span className={`badge rounded-pill ${readOnly ? 'bg-light text-dark' : 'bg-primary-subtle text-primary'}`}>
                    {readOnly ? 'View Only' : 'Editable'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddLessonModal && (
        <div className="study-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '560px', width: '92%' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h5 className="fw-bold text-dark mb-0">Add Lesson</h5>
              <button className="btn-close" onClick={() => setShowAddLessonModal(false)}></button>
            </div>
            <form onSubmit={handleAddLesson}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Title</label>
                <input
                  type="text"
                  required
                  className="form-control rounded-3"
                  value={newLesson.title}
                  onChange={(event) => setNewLesson({ ...newLesson, title: event.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Content</label>
                <textarea
                  rows="4"
                  className="form-control rounded-3"
                  value={newLesson.content}
                  onChange={(event) => setNewLesson({ ...newLesson, content: event.target.value })}
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Order</label>
                <input
                  type="number"
                  required
                  className="form-control rounded-3"
                  value={newLesson.orderIndex}
                  onChange={(event) => setNewLesson({ ...newLesson, orderIndex: Number(event.target.value) })}
                />
              </div>
              <div className="d-flex justify-content-end gap-2 border-top pt-3">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowAddLessonModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">Add Lesson</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
