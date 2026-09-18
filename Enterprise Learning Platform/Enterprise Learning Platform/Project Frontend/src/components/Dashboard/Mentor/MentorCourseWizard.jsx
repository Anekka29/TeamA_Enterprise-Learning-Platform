import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import CourseService from '../../../services/CourseService';
import CourseContentService from '../../../services/CourseContentService';
import MentorCoursePreview from './MentorCoursePreview';
import MediaUploader from '../../Common/MediaUploader';
import { COURSE_CATEGORIES } from '../../../constants/categories';
import { generateAICourseCover } from '../../../utils/courseImageHelper';

const EDITABLE_STATUSES = new Set(['DRAFT', 'REJECTED']);
const SUBMITTABLE_STATUSES = new Set(['DRAFT', 'REJECTED']);
const COURSE_STEPS = [
  { id: 1, label: 'Basic Information' },
  { id: 2, label: 'Detailed Information' },
  { id: 3, label: 'Curriculum & Content' },
  { id: 4, label: 'Course Settings' },
];

const EMPTY_COURSE_FORM = {
  title: '',
  shortDescription: '',
  description: '',
  category: 'Programming',
  level: 'Intermediate',
  language: 'English',
  thumbnailUrl: '',
  bannerUrl: '',
  promotionalVideoUrl: '',
  introVideoUrl: '',
  learningOutcomes: '',
  skills: '',
  prerequisites: '',
  targetAudience: '',
  estimatedDuration: '',
  estimatedLearningHours: '',
  tags: '',
  certificateAvailable: true,
  price: 0,
};

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

const EMPTY_MODULE_FORM = {
  title: '',
  description: '',
  orderIndex: 0,
};

const EMPTY_LESSON_FORM = {
  title: '',
  content: '',
  orderIndex: 0,
  estimatedDuration: '',
  lessonType: 'TEXT',
  videoUrl: '',
  previewAvailable: false,
  mandatory: true,
};

const EMPTY_RESOURCE_FORM = {
  title: '',
  description: '',
  url: '',
  type: 'PDF',
  orderIndex: 0,
};

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
  return status ? status.replaceAll('_', ' ') : 'Draft';
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

function getFriendlyErrorMessage(error, fallbackMessage) {
  const status = Number(error?.status);

  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (status === 403) {
    return 'Access denied. You do not have permission to manage this course.';
  }

  if (status === 404) {
    return 'The requested course information could not be found.';
  }

  if (status >= 500) {
    return 'We could not complete that request right now. Please try again.';
  }

  return error?.message || fallbackMessage;
}

function normalizeCoursePayload(course) {
  return {
    ...course,
    estimatedLearningHours:
      course.estimatedLearningHours === '' || course.estimatedLearningHours === null
        ? null
        : Number(course.estimatedLearningHours),
  };
}

function getValidationErrors(error) {
  if (error?.errors && typeof error.errors === 'object') {
    return error.errors;
  }

  return {};
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

function StepBadge({ step, currentStep, onSelect, disabled }) {
  const isActive = currentStep === step.id;
  const className = isActive
    ? 'bg-success text-white border-success'
    : 'bg-white text-muted border';

  return (
    <button
      type="button"
      className={`btn rounded-pill px-3 py-2 fw-semibold ${className}`}
      style={{ fontSize: '0.8rem' }}
      onClick={() => onSelect(step.id)}
      disabled={disabled}
    >
      {step.id}. {step.label}
    </button>
  );
}

function FieldError({ error }) {
  if (!error) {
    return null;
  }

  return <div className="invalid-feedback d-block">{error}</div>;
}

function ConfirmModal({ title, message, confirmLabel, confirmClassName, onCancel, onConfirm }) {
  if (!title) {
    return null;
  }

  return (
    <div
      className="study-overlay"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '520px', width: '92%' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <h5 className="fw-bold text-dark mb-0">{title}</h5>
          <button className="btn-close" onClick={onCancel}></button>
        </div>

        <p className="text-muted mb-4">{message}</p>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-light rounded-pill px-4" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={`${confirmClassName || 'btn btn-success'} rounded-pill px-4 fw-bold`} onClick={onConfirm}>
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CurriculumSection({
  modules,
  isEditable,
  onAddModule,
  onEditModule,
  onDeleteModule,
  onMoveModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
  onAddResource,
  onEditResource,
  onDeleteResource,
  onMoveResource,
}) {
  return (
    <div className="row g-3">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold text-dark mb-1">Course Curriculum</h5>
            <p className="text-muted mb-0">Organize modules and lessons in the order learners should follow.</p>
          </div>
          {isEditable && (
            <button type="button" className="btn btn-success rounded-pill fw-bold" onClick={onAddModule}>
              <i className="bi bi-plus-lg me-1"></i> Add Module
            </button>
          )}
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
            <div className="fs-1 text-muted mb-3">
              <i className="bi bi-collection"></i>
            </div>
            <h6 className="fw-bold text-dark mb-2">No modules yet</h6>
            <p className="text-muted mb-0">Add the first module to begin structuring this course.</p>
          </div>
        </div>
      ) : (
        modules.map((module, moduleIndex) => (
          <div className="col-12" key={module.id}>
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span className="badge rounded-pill bg-success-subtle text-success">Module {moduleIndex + 1}</span>
                    <h6 className="fw-bold text-dark mb-0">{module.title}</h6>
                  </div>
                  <p className="text-muted mb-2">{module.description || 'No module description added yet.'}</p>
                  <div className="small text-muted">
                    {module.lessons?.length || 0} lessons • Updated {formatDate(module.updatedAt)}
                  </div>
                </div>

                {isEditable && (
                  <div className="d-flex gap-2 flex-wrap">
                    <button type="button" className="btn btn-light border btn-sm rounded-pill" onClick={() => onMoveModule(moduleIndex, -1)} disabled={moduleIndex === 0}>
                      <i className="bi bi-arrow-up"></i>
                    </button>
                    <button type="button" className="btn btn-light border btn-sm rounded-pill" onClick={() => onMoveModule(moduleIndex, 1)} disabled={moduleIndex === modules.length - 1}>
                      <i className="bi bi-arrow-down"></i>
                    </button>
                    <button type="button" className="btn btn-light border btn-sm rounded-pill" onClick={() => onEditModule(module)}>
                      <i className="bi bi-pencil-square me-1"></i> Edit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm rounded-pill" onClick={() => onDeleteModule(module)}>
                      <i className="bi bi-trash me-1"></i> Delete
                    </button>
                    <button type="button" className="btn btn-success btn-sm rounded-pill" onClick={() => onAddLesson(module)}>
                      <i className="bi bi-plus-lg me-1"></i> Add Lesson
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4">
                {module.lessons?.length ? (
                  <div className="vstack gap-3">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="rounded-4 border bg-light p-3">
                        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                              <span className="badge rounded-pill bg-white text-dark border">Lesson {lessonIndex + 1}</span>
                              <h6 className="fw-bold text-dark mb-0">{lesson.title}</h6>
                              {lesson.lessonType && (
                                <span className="badge rounded-pill bg-white text-dark border">{getFriendlyLessonType(lesson.lessonType)}</span>
                              )}
                              {lesson.previewAvailable && (
                                <span className="badge rounded-pill bg-success-subtle text-success">Preview</span>
                              )}
                              {lesson.mandatory === false ? (
                                <span className="badge rounded-pill bg-warning-subtle text-warning">Optional</span>
                              ) : (
                                <span className="badge rounded-pill bg-info-subtle text-info">Mandatory</span>
                              )}
                            </div>
                            <p className="text-muted mb-2">{lesson.content || 'No lesson summary added yet.'}</p>
                            <div className="small text-muted mb-2">
                              {lesson.resources?.length || 0} resources • {lesson.estimatedDuration || 'Duration not set'}
                            </div>

                            {/* Lesson Resources List */}
                            {lesson.resources?.length > 0 && (
                              <div className="mt-2 vstack gap-2 ps-3 border-start">
                                {lesson.resources.map((resource, resourceIndex) => (
                                  <div key={resource.id} className="d-flex justify-content-between align-items-center bg-white p-2 rounded-3 border small">
                                    <div>
                                      <span className="fw-semibold text-dark me-2">{resource.title}</span>
                                      <span className="badge bg-light text-dark me-2">{resource.type}</span>
                                      <a href={resource.url} target="_blank" rel="noreferrer" className="text-decoration-none text-muted small">
                                        <i className="bi bi-link-45deg me-1"></i>Link
                                      </a>
                                    </div>
                                    {isEditable && (
                                      <div className="d-flex gap-1">
                                        <button type="button" className="btn btn-light btn-sm rounded-pill p-1 py-0 border" style={{ fontSize: '0.7rem' }} onClick={() => onMoveResource(module, lesson, resourceIndex, -1)} disabled={resourceIndex === 0}>
                                          <i className="bi bi-arrow-up"></i>
                                        </button>
                                        <button type="button" className="btn btn-light btn-sm rounded-pill p-1 py-0 border" style={{ fontSize: '0.7rem' }} onClick={() => onMoveResource(module, lesson, resourceIndex, 1)} disabled={resourceIndex === lesson.resources.length - 1}>
                                          <i className="bi bi-arrow-down"></i>
                                        </button>
                                        <button type="button" className="btn btn-light btn-sm rounded-pill p-1 py-0 border" style={{ fontSize: '0.7rem' }} onClick={() => onEditResource(module, lesson, resource)}>
                                          <i className="bi bi-pencil-square"></i>
                                        </button>
                                        <button type="button" className="btn btn-danger btn-sm rounded-pill p-1 py-0 text-white" style={{ fontSize: '0.7rem' }} onClick={() => onDeleteResource(module, lesson, resource)}>
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {isEditable && (
                            <div className="d-flex gap-2 flex-wrap">
                              <button type="button" className="btn btn-light border btn-sm rounded-pill" onClick={() => onMoveLesson(module, lessonIndex, -1)} disabled={lessonIndex === 0}>
                                <i className="bi bi-arrow-up"></i>
                              </button>
                              <button type="button" className="btn btn-light border btn-sm rounded-pill" onClick={() => onMoveLesson(module, lessonIndex, 1)} disabled={lessonIndex === module.lessons.length - 1}>
                                <i className="bi bi-arrow-down"></i>
                              </button>
                              <button type="button" className="btn btn-light border btn-sm rounded-pill" onClick={() => onEditLesson(module, lesson)}>
                                <i className="bi bi-pencil-square me-1"></i> Edit
                              </button>
                              <button type="button" className="btn btn-danger btn-sm rounded-pill" onClick={() => onDeleteLesson(module, lesson)}>
                                <i className="bi bi-trash me-1"></i> Delete
                              </button>
                              <button type="button" className="btn btn-success btn-sm rounded-pill" onClick={() => onAddResource(module, lesson)}>
                                <i className="bi bi-plus-lg me-1"></i> Add Resource
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-4 border bg-light p-4 text-center text-muted">
                    No lessons yet. Add the first lesson for this module.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ResourcesSection({
  modules,
  isEditable,
  onAddResource,
  onEditResource,
  onDeleteResource,
  onMoveResource,
}) {
  return (
    <div className="row g-3">
      <div className="col-12">
        <div>
          <h5 className="fw-bold text-dark mb-1">Lesson Resources</h5>
          <p className="text-muted mb-0">Attach the right learning materials to each lesson.</p>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
            <div className="fs-1 text-muted mb-3">
              <i className="bi bi-journal-richtext"></i>
            </div>
            <h6 className="fw-bold text-dark mb-2">No curriculum available yet</h6>
            <p className="text-muted mb-0">Create modules and lessons first before attaching resources.</p>
          </div>
        </div>
      ) : (
        modules.map((module) => (
          <div className="col-12" key={module.id}>
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h6 className="fw-bold text-dark mb-3">{module.title}</h6>

              {module.lessons?.length ? (
                <div className="vstack gap-3">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="rounded-4 border bg-light p-3">
                      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                        <div>
                          <div className="fw-bold text-dark">{lesson.title}</div>
                          <div className="small text-muted">{lesson.lessonType || 'TEXT'} • {lesson.estimatedDuration || 'Duration not set'}</div>
                        </div>
                        {isEditable && (
                          <button type="button" className="btn btn-success btn-sm rounded-pill" onClick={() => onAddResource(module, lesson)}>
                            <i className="bi bi-plus-lg me-1"></i> Add Resource
                          </button>
                        )}
                      </div>

                      {lesson.resources?.length ? (
                        <div className="vstack gap-2">
                          {lesson.resources.map((resource, resourceIndex) => (
                            <div key={resource.id} className="d-flex justify-content-between align-items-start gap-3 rounded-4 border bg-white p-3">
                              <div>
                                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                  <span className="fw-semibold text-dark">{resource.title}</span>
                                  <span className="badge rounded-pill bg-light text-dark">{resource.type}</span>
                                </div>
                                <div className="small text-muted mb-1">{resource.description || 'No resource description added yet.'}</div>
                                <a href={resource.url} target="_blank" rel="noreferrer" className="small text-decoration-none">
                                  {resource.url}
                                </a>
                              </div>

                              {isEditable && (
                                <div className="d-flex gap-2 flex-wrap">
                                  <button type="button" className="btn btn-light border btn-sm rounded-pill" onClick={() => onMoveResource(module, lesson, resourceIndex, -1)} disabled={resourceIndex === 0}>
                                    <i className="bi bi-arrow-up"></i>
                                  </button>
                                  <button type="button" className="btn btn-light border btn-sm rounded-pill" onClick={() => onMoveResource(module, lesson, resourceIndex, 1)} disabled={resourceIndex === lesson.resources.length - 1}>
                                    <i className="bi bi-arrow-down"></i>
                                  </button>
                                  <button type="button" className="btn btn-light border btn-sm rounded-pill" onClick={() => onEditResource(module, lesson, resource)}>
                                    <i className="bi bi-pencil-square me-1"></i> Edit
                                  </button>
                                  <button type="button" className="btn btn-danger btn-sm rounded-pill" onClick={() => onDeleteResource(module, lesson, resource)}>
                                    <i className="bi bi-trash me-1"></i> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-4 border bg-white p-3 text-muted small">
                          No resources attached to this lesson yet.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-4 border bg-light p-4 text-center text-muted">
                  Add lessons in the curriculum step before attaching resources.
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ReviewSection({ course, modules }) {
  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                <span className={`badge rounded-pill ${getStatusBadgeClass(course.status)}`}>{formatStatusLabel(course.status)}</span>
                <span className="badge rounded-pill bg-light text-dark">{course.category || 'Uncategorized'}</span>
                <span className="badge rounded-pill bg-light text-dark">{course.level || 'Level not set'}</span>
              </div>
              <h4 className="fw-bold text-dark mb-2">{course.title || 'Untitled course'}</h4>
              <p className="text-muted mb-2">{course.shortDescription || 'No short description added yet.'}</p>
              <p className="text-dark mb-0">{course.description || 'No full description added yet.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-6">
        <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
          <h6 className="fw-bold text-dark mb-3">Learning Details</h6>
          <div className="small text-muted mb-1">Learning Outcomes</div>
          <div className="text-dark mb-3">{course.learningOutcomes || 'Not specified'}</div>
          <div className="small text-muted mb-1">Skills Covered</div>
          <div className="text-dark mb-3">{course.skills || 'Not specified'}</div>
          <div className="small text-muted mb-1">Prerequisites</div>
          <div className="text-dark mb-3">{course.prerequisites || 'Not specified'}</div>
          <div className="small text-muted mb-1">Target Audience</div>
          <div className="text-dark mb-3">{course.targetAudience || 'Not specified'}</div>
          <div className="small text-muted mb-1">Estimated Duration</div>
          <div className="text-dark">{course.estimatedDuration || 'Not specified'}</div>
        </div>
      </div>

      <div className="col-lg-6">
        <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
          <h6 className="fw-bold text-dark mb-3">Course Summary</h6>
          <div className="small text-muted mb-1">Language</div>
          <div className="text-dark mb-3">{course.language || 'Not specified'}</div>
          <div className="small text-muted mb-1">Learning Hours</div>
          <div className="text-dark mb-3">{course.estimatedLearningHours ?? 'Not specified'}</div>
          <div className="small text-muted mb-1">Modules</div>
          <div className="text-dark mb-3">{modules.length}</div>
          <div className="small text-muted mb-1">Lessons</div>
          <div className="text-dark">
            {modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)}
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h6 className="fw-bold text-dark mb-3">Curriculum Review</h6>

          {modules.length ? (
            <div className="vstack gap-3">
              {modules.map((module, moduleIndex) => (
                <div key={module.id} className="rounded-4 border p-3">
                  <div className="fw-bold text-dark mb-1">Module {moduleIndex + 1}: {module.title}</div>
                  <div className="text-muted small mb-3">{module.description || 'No module description'}</div>

                  {module.lessons?.length ? (
                    <div className="vstack gap-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="rounded-4 bg-light p-3">
                          <div className="fw-semibold text-dark mb-1">
                            Lesson {lessonIndex + 1}: {lesson.title}
                          </div>
                          <div className="small text-muted mb-2">
                            {getFriendlyLessonType(lesson.lessonType)} • {lesson.estimatedDuration || 'Duration not set'} • {lesson.mandatory === false ? 'Optional' : 'Mandatory'} {lesson.previewAvailable ? '• Preview Available' : ''}
                          </div>
                          <div className="small text-dark mb-2">{lesson.content || 'No lesson content added yet.'}</div>

                          {lesson.resources?.length ? (
                            <div className="small">
                              <div className="text-muted mb-1">Resources</div>
                              <ul className="mb-0">
                                {lesson.resources.map((resource) => (
                                  <li key={resource.id}>
                                    {resource.title} ({resource.type})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="small text-muted">No resources attached yet.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="small text-muted">No lessons added yet.</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted">No curriculum created yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModuleModal({ title, data, errors, onChange, onClose, onSubmit, submitLabel }) {
  if (!data) {
    return null;
  }

  return (
    <div className="study-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '560px', width: '92%' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <h5 className="fw-bold text-dark mb-0">{title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Module Title</label>
            <input
              type="text"
              className={`form-control rounded-3 ${errors.title ? 'is-invalid' : ''}`}
              value={data.title}
              onChange={(event) => onChange({ ...data, title: event.target.value })}
            />
            <FieldError error={errors.title} />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Description</label>
            <textarea
              rows="3"
              className={`form-control rounded-3 ${errors.description ? 'is-invalid' : ''}`}
              value={data.description}
              onChange={(event) => onChange({ ...data, description: event.target.value })}
            ></textarea>
            <FieldError error={errors.description} />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Order</label>
            <input
              type="number"
              className={`form-control rounded-3 ${errors.orderIndex ? 'is-invalid' : ''}`}
              value={data.orderIndex}
              onChange={(event) => onChange({ ...data, orderIndex: Number(event.target.value) })}
            />
            <FieldError error={errors.orderIndex} />
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

function LessonModal({ title, data, errors, onChange, onClose, onSubmit, submitLabel }) {
  if (!data) {
    return null;
  }

  return (
    <div className="study-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '620px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <h5 className="fw-bold text-dark mb-0">{title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Lesson Title</label>
            <input
              type="text"
              className={`form-control rounded-3 ${errors.title ? 'is-invalid' : ''}`}
              value={data.title}
              onChange={(event) => onChange({ ...data, title: event.target.value })}
            />
            <FieldError error={errors.title} />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Content</label>
            <textarea
              rows="4"
              className={`form-control rounded-3 ${errors.content ? 'is-invalid' : ''}`}
              value={data.content}
              onChange={(event) => onChange({ ...data, content: event.target.value })}
            ></textarea>
            <FieldError error={errors.content} />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Lesson Type</label>
              <select
                className={`form-select rounded-3 ${errors.lessonType ? 'is-invalid' : ''}`}
                value={data.lessonType}
                onChange={(event) => onChange({ ...data, lessonType: event.target.value })}
              >
                <option value="VIDEO">Video</option>
                <option value="PDF">PDF</option>
                <option value="READING">Reading</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="QUIZ">Quiz</option>
                <option value="EXTERNAL_RESOURCE">External Resource</option>
              </select>
              <FieldError error={errors.lessonType} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Lesson Duration</label>
              <input
                type="text"
                className={`form-control rounded-3 ${errors.estimatedDuration ? 'is-invalid' : ''}`}
                value={data.estimatedDuration}
                onChange={(event) => onChange({ ...data, estimatedDuration: event.target.value })}
              />
              <FieldError error={errors.estimatedDuration} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Video URL</label>
            <input
              type="text"
              className={`form-control rounded-3 ${errors.videoUrl ? 'is-invalid' : ''}`}
              value={data.videoUrl}
              onChange={(event) => onChange({ ...data, videoUrl: event.target.value })}
              placeholder="https://..."
            />
            <FieldError error={errors.videoUrl || errors.videoUrlValidForLessonType} />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Order</label>
              <input
                type="number"
                className={`form-control rounded-3 ${errors.orderIndex ? 'is-invalid' : ''}`}
                value={data.orderIndex}
                onChange={(event) => onChange({ ...data, orderIndex: Number(event.target.value) })}
              />
              <FieldError error={errors.orderIndex} />
            </div>
            <div className="col-md-6 mb-3 d-flex align-items-end gap-3 flex-wrap">
              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="lessonPreviewAvailable"
                  checked={Boolean(data.previewAvailable)}
                  onChange={(event) => onChange({ ...data, previewAvailable: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="lessonPreviewAvailable">Preview available</label>
              </div>
              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="lessonMandatory"
                  checked={data.mandatory !== false}
                  onChange={(event) => onChange({ ...data, mandatory: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="lessonMandatory">Mandatory lesson</label>
              </div>
            </div>
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

function ResourceModal({ title, data, errors, onChange, onClose, onSubmit, submitLabel }) {
  if (!data) {
    return null;
  }

  return (
    <div className="study-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '620px', width: '92%' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <h5 className="fw-bold text-dark mb-0">{title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Resource Title</label>
            <input
              type="text"
              className={`form-control rounded-3 ${errors.title ? 'is-invalid' : ''}`}
              value={data.title}
              onChange={(event) => onChange({ ...data, title: event.target.value })}
            />
            <FieldError error={errors.title} />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Description</label>
            <textarea
              rows="3"
              className={`form-control rounded-3 ${errors.description ? 'is-invalid' : ''}`}
              value={data.description}
              onChange={(event) => onChange({ ...data, description: event.target.value })}
            ></textarea>
            <FieldError error={errors.description} />
          </div>

          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label small fw-bold">Resource Type</label>
              <select
                className={`form-select rounded-3 ${errors.type ? 'is-invalid' : ''}`}
                value={data.type}
                onChange={(event) => onChange({ ...data, type: event.target.value, url: '' })}
              >
                <option value="PDF">PDF</option>
                <option value="DOCUMENT">Document (Word, PPT, ZIP, Audio, Image)</option>
                <option value="VIDEO">Video (MP4, MOV, WEBM)</option>
                <option value="EXTERNAL_LINK">External Web Link</option>
                <option value="REFERENCE">Reference Web Link</option>
              </select>
              <FieldError error={errors.type} />
            </div>

            <div className="col-md-12 mb-3">
              {data.type === 'EXTERNAL_LINK' || data.type === 'REFERENCE' ? (
                <div>
                  <label className="form-label small fw-bold">Web Link URL</label>
                  <input
                    type="text"
                    className={`form-control rounded-3 ${errors.url ? 'is-invalid' : ''}`}
                    value={data.url}
                    onChange={(event) => onChange({ ...data, url: event.target.value })}
                    placeholder="https://..."
                  />
                  <FieldError error={errors.url} />
                </div>
              ) : (
                <div>
                  <MediaUploader
                    type={data.type === 'VIDEO' ? 'video' : data.type === 'PDF' ? 'doc' : 'file'}
                    value={data.url}
                    onChange={(url) => onChange({ ...data, url })}
                    label="Resource File"
                    description="Upload the file from your local machine. Supported types depend on selection."
                  />
                  <FieldError error={errors.url} />
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Order</label>
            <input
              type="number"
              className={`form-control rounded-3 ${errors.orderIndex ? 'is-invalid' : ''}`}
              value={data.orderIndex}
              onChange={(event) => onChange({ ...data, orderIndex: Number(event.target.value) })}
            />
            <FieldError error={errors.orderIndex} />
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

export default function MentorCourseWizard({
  initialCourse,
  mode = 'create',
  onBack,
  onShowToast,
  onComplete,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [course, setCourse] = useState(() => ({ ...EMPTY_COURSE_FORM, ...initialCourse }));
  const [persistedCourseId, setPersistedCourseId] = useState(initialCourse?.id || null);
  const [courseErrors, setCourseErrors] = useState({});
  const [dirtyCourse, setDirtyCourse] = useState(mode === 'create');
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(Boolean(initialCourse?.id));
  const [modulesError, setModulesError] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [moduleModal, setModuleModal] = useState(null);
  const [lessonModal, setLessonModal] = useState(null);
  const [resourceModal, setResourceModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submissionValidation, setSubmissionValidation] = useState(null);
  const { user } = useAuth();
  const [selectedVisibility, setSelectedVisibility] = useState(() => {
    if (initialCourse?.status === 'PUBLISHED') return 'PUBLISHED';
    if (initialCourse?.status === 'PENDING_APPROVAL') return 'SUBMIT_FOR_REVIEW';
    return 'DRAFT';
  });

  useEffect(() => {
    if (course.status === 'PUBLISHED') setSelectedVisibility('PUBLISHED');
    else if (course.status === 'PENDING_APPROVAL') setSelectedVisibility('SUBMIT_FOR_REVIEW');
    else setSelectedVisibility('DRAFT');
  }, [course.status]);

  const isEditable = mode !== 'view' && (!course.status || EDITABLE_STATUSES.has(course.status));

  const totalLessons = useMemo(
    () => modules.reduce((total, module) => total + (module.lessons?.length || 0), 0),
    [modules]
  );

  useEffect(() => {
    setCourse({ ...EMPTY_COURSE_FORM, ...initialCourse });
    setPersistedCourseId(initialCourse?.id || null);
    setDirtyCourse(mode === 'create');
    setCurrentStep(1);
  }, [initialCourse, mode]);

  const refreshStructure = async (courseId = persistedCourseId) => {
    if (!courseId) {
      setModules([]);
      return;
    }

    try {
      setModulesLoading(true);
      setModulesError('');
      const data = await CourseContentService.getModulesForCourse(courseId);
      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      setModules([]);
      setModulesError(getFriendlyErrorMessage(error, 'We could not load the latest curriculum.'));
    } finally {
      setModulesLoading(false);
    }
  };

  useEffect(() => {
    if (persistedCourseId) {
      refreshStructure(persistedCourseId);
    } else {
      setModules([]);
    }
  }, [persistedCourseId]);

  useEffect(() => {
    if (!dirtyCourse) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirtyCourse]);

  const [aiThemeIndex, setAiThemeIndex] = useState(0);
  const [aiArtMode, setAiArtMode] = useState('template'); // 'template' | 'photo'

  const updateCourseField = (field, value) => {
    setCourse((previous) => {
      const updated = { ...previous, [field]: value };
      
      // Auto-generate AI Cover Art & Banner when title or category is updated or if artwork is empty
      if (field === 'title' || field === 'category') {
        const aiArt = generateAICourseCover(updated.title, updated.category, aiThemeIndex, aiArtMode === 'template');
        if (!updated.thumbnailUrl || updated.isAiThumbnail) {
          updated.thumbnailUrl = aiArt.thumbnailUrl;
          updated.isAiThumbnail = true;
        }
        if (!updated.bannerUrl || updated.isAiBanner) {
          updated.bannerUrl = aiArt.bannerUrl;
          updated.isAiBanner = true;
        }
      }
      return updated;
    });
    setDirtyCourse(true);
    setCourseErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleManualAiRegenerate = (nextIndex = null, modeOverride = null) => {
    const targetThemeIndex = nextIndex !== null ? nextIndex : (aiThemeIndex + 1) % 4;
    const targetMode = modeOverride !== null ? modeOverride : aiArtMode;

    if (nextIndex !== null) setAiThemeIndex(targetThemeIndex);
    else setAiThemeIndex(targetThemeIndex);

    if (modeOverride !== null) setAiArtMode(targetMode);

    const aiArt = generateAICourseCover(course.title, course.category, targetThemeIndex, targetMode === 'template');
    setCourse(prev => ({
      ...prev,
      thumbnailUrl: aiArt.thumbnailUrl,
      bannerUrl: aiArt.bannerUrl,
      isAiThumbnail: true,
      isAiBanner: true
    }));
    setDirtyCourse(true);
    onShowToast('success', `✨ AI Cover Art regenerated for "${course.title || 'Topic'}"!`);
  };

  const persistCourse = async (successMessage) => {
    setBusyAction('save-course');
    setCourseErrors({});

    try {
      // Ensure AI cover artwork is generated if thumbnail or banner is missing
      const aiArt = generateAICourseCover(course.title, course.category);
      const finalCourse = {
        ...course,
        thumbnailUrl: course.thumbnailUrl || aiArt.thumbnailUrl,
        bannerUrl: course.bannerUrl || aiArt.bannerUrl
      };

      const payload = normalizeCoursePayload(finalCourse);
      const savedCourse = persistedCourseId
        ? await CourseService.updateCourse(persistedCourseId, payload)
        : await CourseService.createDraftCourse(payload);

      setCourse((previous) => ({ ...previous, ...savedCourse }));
      setPersistedCourseId(savedCourse.id);
      setDirtyCourse(false);
      setSubmissionValidation(null);

      if (successMessage) {
        onShowToast('success', successMessage);
      }

      if (!persistedCourseId && savedCourse.id) {
        await refreshStructure(savedCourse.id);
      }

      return savedCourse;
    } catch (error) {
      const validationErrors = getValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        setCourseErrors(validationErrors);
        onShowToast('error', 'Please correct the highlighted course fields.');
      } else {
        onShowToast('error', getFriendlyErrorMessage(error, 'Failed to save course details.'));
      }
      throw error;
    } finally {
      setBusyAction('');
    }
  };

  const goToStep = async (targetStep) => {
    if (targetStep === currentStep) {
      return;
    }

    if (targetStep > currentStep && isEditable && currentStep <= 2 && dirtyCourse) {
      try {
        await persistCourse();
      } catch {
        return;
      }
    }

    setCurrentStep(targetStep);
  };

  const handleBackToCourses = () => {
    if (dirtyCourse) {
      setConfirmModal({
        title: 'Leave course wizard?',
        message: 'You have unsaved course detail changes. Leave now and those changes will be lost.',
        confirmLabel: 'Leave Wizard',
        confirmClassName: 'btn btn-danger',
        onConfirm: () => {
          setConfirmModal(null);
          onBack();
        },
      });
      return;
    }

    onBack();
  };

  const openModuleModal = (module) => {
    setModuleModal({
      title: module ? 'Edit Module' : 'Add Module',
      submitLabel: module ? 'Update Module' : 'Add Module',
      moduleId: module?.id || null,
      data: module
        ? {
            title: module.title || '',
            description: module.description || '',
            orderIndex: module.orderIndex ?? 0,
          }
        : {
            ...EMPTY_MODULE_FORM,
            orderIndex: modules.length,
          },
      errors: {},
    });
  };

  const openLessonModal = (module, lesson) => {
    setLessonModal({
      title: lesson ? 'Edit Lesson' : 'Add Lesson',
      submitLabel: lesson ? 'Update Lesson' : 'Add Lesson',
      moduleId: module.id,
      lessonId: lesson?.id || null,
      data: lesson
        ? {
            title: lesson.title || '',
            content: lesson.content || '',
            orderIndex: lesson.orderIndex ?? 0,
            estimatedDuration: lesson.estimatedDuration || '',
            lessonType: lesson.lessonType || 'TEXT',
            videoUrl: lesson.videoUrl || '',
            previewAvailable: Boolean(lesson.previewAvailable),
            mandatory: lesson.mandatory !== false,
          }
        : {
            ...EMPTY_LESSON_FORM,
            orderIndex: module.lessons?.length || 0,
          },
      errors: {},
    });
  };

  const openResourceModal = (module, lesson, resource) => {
    setResourceModal({
      title: resource ? 'Edit Resource' : 'Add Resource',
      submitLabel: resource ? 'Update Resource' : 'Add Resource',
      moduleId: module.id,
      lessonId: lesson.id,
      resourceId: resource?.id || null,
      data: resource
        ? {
            title: resource.title || '',
            description: resource.description || '',
            url: resource.url || '',
            type: resource.type || 'PDF',
            orderIndex: resource.orderIndex ?? 0,
          }
        : {
            ...EMPTY_RESOURCE_FORM,
            orderIndex: lesson.resources?.length || 0,
          },
      errors: {},
    });
  };

  const handleModuleSubmit = async (event) => {
    event.preventDefault();
    if (!moduleModal || !persistedCourseId) {
      return;
    }

    setBusyAction('module-submit');
    try {
      if (moduleModal.moduleId) {
        await CourseContentService.updateModule(persistedCourseId, moduleModal.moduleId, moduleModal.data);
        onShowToast('success', 'Module updated successfully.');
      } else {
        await CourseContentService.createModule(persistedCourseId, moduleModal.data);
        onShowToast('success', 'Module created successfully.');
      }

      setModuleModal(null);
      await refreshStructure(persistedCourseId);
    } catch (error) {
      const validationErrors = getValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        setModuleModal((previous) => ({ ...previous, errors: validationErrors }));
      }
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to save module.'));
    } finally {
      setBusyAction('');
    }
  };

  const handleLessonSubmit = async (event) => {
    event.preventDefault();
    if (!lessonModal || !persistedCourseId) {
      return;
    }

    setBusyAction('lesson-submit');
    try {
      if (lessonModal.lessonId) {
        await CourseContentService.updateLesson(persistedCourseId, lessonModal.moduleId, lessonModal.lessonId, lessonModal.data);
        onShowToast('success', 'Lesson updated successfully.');
      } else {
        await CourseContentService.createLesson(persistedCourseId, lessonModal.moduleId, lessonModal.data);
        onShowToast('success', 'Lesson created successfully.');
      }

      setLessonModal(null);
      await refreshStructure(persistedCourseId);
    } catch (error) {
      const validationErrors = getValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        setLessonModal((previous) => ({ ...previous, errors: validationErrors }));
      }
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to save lesson.'));
    } finally {
      setBusyAction('');
    }
  };

  const handleResourceSubmit = async (event) => {
    event.preventDefault();
    if (!resourceModal || !persistedCourseId) {
      return;
    }

    setBusyAction('resource-submit');
    try {
      if (resourceModal.resourceId) {
        await CourseContentService.updateResource(
          persistedCourseId,
          resourceModal.moduleId,
          resourceModal.lessonId,
          resourceModal.resourceId,
          resourceModal.data
        );
        onShowToast('success', 'Resource updated successfully.');
      } else {
        await CourseContentService.createResource(
          persistedCourseId,
          resourceModal.moduleId,
          resourceModal.lessonId,
          resourceModal.data
        );
        onShowToast('success', 'Resource added successfully.');
      }

      setResourceModal(null);
      await refreshStructure(persistedCourseId);
    } catch (error) {
      const validationErrors = getValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        setResourceModal((previous) => ({ ...previous, errors: validationErrors }));
      }
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to save resource.'));
    } finally {
      setBusyAction('');
    }
  };

  const handleDeleteModule = (module) => {
    setConfirmModal({
      title: 'Delete module?',
      message: `Remove "${module.title}" from this course?`,
      confirmLabel: 'Delete Module',
      confirmClassName: 'btn btn-danger',
      onConfirm: async () => {
        setConfirmModal(null);
        setBusyAction('module-delete');
        try {
          await CourseContentService.deleteModule(persistedCourseId, module.id);
          onShowToast('success', 'Module deleted successfully.');
          await refreshStructure(persistedCourseId);
        } catch (error) {
          onShowToast('error', getFriendlyErrorMessage(error, 'Failed to delete module.'));
        } finally {
          setBusyAction('');
        }
      },
    });
  };

  const handleDeleteLesson = (module, lesson) => {
    setConfirmModal({
      title: 'Delete lesson?',
      message: `Remove "${lesson.title}" from "${module.title}"?`,
      confirmLabel: 'Delete Lesson',
      confirmClassName: 'btn btn-danger',
      onConfirm: async () => {
        setConfirmModal(null);
        setBusyAction('lesson-delete');
        try {
          await CourseContentService.deleteLesson(persistedCourseId, module.id, lesson.id);
          onShowToast('success', 'Lesson deleted successfully.');
          await refreshStructure(persistedCourseId);
        } catch (error) {
          onShowToast('error', getFriendlyErrorMessage(error, 'Failed to delete lesson.'));
        } finally {
          setBusyAction('');
        }
      },
    });
  };

  const handleDeleteResource = (module, lesson, resource) => {
    setConfirmModal({
      title: 'Delete resource?',
      message: `Remove "${resource.title}" from "${lesson.title}"?`,
      confirmLabel: 'Delete Resource',
      confirmClassName: 'btn btn-danger',
      onConfirm: async () => {
        setConfirmModal(null);
        setBusyAction('resource-delete');
        try {
          await CourseContentService.deleteResource(persistedCourseId, module.id, lesson.id, resource.id);
          onShowToast('success', 'Resource deleted successfully.');
          await refreshStructure(persistedCourseId);
        } catch (error) {
          onShowToast('error', getFriendlyErrorMessage(error, 'Failed to delete resource.'));
        } finally {
          setBusyAction('');
        }
      },
    });
  };

  const reorderModules = async (moduleIndex, direction) => {
    const targetIndex = moduleIndex + direction;
    if (targetIndex < 0 || targetIndex >= modules.length) {
      return;
    }

    const reordered = [...modules];
    const [moved] = reordered.splice(moduleIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setBusyAction('module-reorder');
    try {
      await CourseContentService.reorderModules(
        persistedCourseId,
        reordered.map((module) => module.id)
      );
      await refreshStructure(persistedCourseId);
    } catch (error) {
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to reorder modules.'));
    } finally {
      setBusyAction('');
    }
  };

  const reorderLessons = async (module, lessonIndex, direction) => {
    const lessons = module.lessons || [];
    const targetIndex = lessonIndex + direction;
    if (targetIndex < 0 || targetIndex >= lessons.length) {
      return;
    }

    const reordered = [...lessons];
    const [moved] = reordered.splice(lessonIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setBusyAction('lesson-reorder');
    try {
      await CourseContentService.reorderLessons(
        persistedCourseId,
        module.id,
        reordered.map((lesson) => lesson.id)
      );
      await refreshStructure(persistedCourseId);
    } catch (error) {
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to reorder lessons.'));
    } finally {
      setBusyAction('');
    }
  };

  const reorderResources = async (module, lesson, resourceIndex, direction) => {
    const resources = lesson.resources || [];
    const targetIndex = resourceIndex + direction;
    if (targetIndex < 0 || targetIndex >= resources.length) {
      return;
    }

    const reordered = [...resources];
    const [moved] = reordered.splice(resourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setBusyAction('resource-reorder');
    try {
      await CourseContentService.reorderResources(
        persistedCourseId,
        module.id,
        lesson.id,
        reordered.map((resource) => resource.id)
      );
      await refreshStructure(persistedCourseId);
    } catch (error) {
      onShowToast('error', getFriendlyErrorMessage(error, 'Failed to reorder resources.'));
    } finally {
      setBusyAction('');
    }
  };

  const saveDraftFromSubmission = async () => {
    try {
      const savedCourse = dirtyCourse || !persistedCourseId
        ? await persistCourse('Draft saved successfully.')
        : course;

      onComplete(savedCourse.id);
    } catch {
      // handled in persistCourse
    }
  };

  const submitForApproval = async () => {
    if (!isEditable) {
      return;
    }

    setBusyAction('submit-course');
    try {
      const savedCourse = dirtyCourse || !persistedCourseId ? await persistCourse() : course;
      const courseId = savedCourse.id || persistedCourseId;

      if (!SUBMITTABLE_STATUSES.has(savedCourse.status || 'DRAFT')) {
        onShowToast('error', 'Only draft or rejected courses can be submitted for approval.');
        return;
      }

      await CourseService.submitForApproval(courseId);
      setSubmissionValidation(null);
      onShowToast('success', 'Course submitted for approval.');
      onComplete(courseId);
    } catch (error) {
      const validationState = getSubmissionValidationState(error);
      if (validationState) {
        setSubmissionValidation(validationState);
        onShowToast('error', validationState.message);
      } else {
        onShowToast('error', getFriendlyErrorMessage(error, 'Failed to submit course for approval.'));
      }
    } finally {
      setBusyAction('');
    }
  };

  const openPreview = async () => {
    if (!persistedCourseId || dirtyCourse) {
      try {
        await persistCourse();
      } catch {
        return;
      }
    }

    setShowPreview(true);
  };

  if (showPreview) {
    return (
      <MentorCoursePreview
        courseId={persistedCourseId}
        initialCourse={course}
        backLabel="Back to Edit"
        onBack={() => setShowPreview(false)}
        onSubmit={submitForApproval}
        allowSubmit={isEditable && SUBMITTABLE_STATUSES.has(course.status || 'DRAFT')}
        submitDisabled={busyAction === 'save-course' || busyAction === 'submit-course'}
        submitLabel={busyAction === 'submit-course' ? 'Submitting...' : 'Submit For Approval'}
        validationMessage={submissionValidation?.message || ''}
        validationErrors={submissionValidation?.errors || []}
      />
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="row g-3">
            <div className="col-12">
              <h5 className="fw-bold text-dark mb-1">Step 1: Basic Information</h5>
              <p className="text-muted mb-0">Capture the essential course details mentors and learners see first.</p>
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Course Title</label>
              <input
                type="text"
                className={`form-control rounded-3 ${courseErrors.title ? 'is-invalid' : ''}`}
                value={course.title}
                onChange={(event) => updateCourseField('title', event.target.value)}
                disabled={!isEditable}
              />
              <FieldError error={courseErrors.title} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Short Description</label>
              <textarea
                rows="2"
                className={`form-control rounded-3 ${courseErrors.shortDescription ? 'is-invalid' : ''}`}
                value={course.shortDescription}
                onChange={(event) => updateCourseField('shortDescription', event.target.value)}
                disabled={!isEditable}
              ></textarea>
              <FieldError error={courseErrors.shortDescription} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Category</label>
              <select
                className={`form-select rounded-3 ${courseErrors.category ? 'is-invalid' : ''}`}
                value={course.category}
                onChange={(event) => updateCourseField('category', event.target.value)}
                disabled={!isEditable}
              >
                {COURSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <FieldError error={courseErrors.category} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Difficulty</label>
              <select
                className={`form-select rounded-3 ${courseErrors.level ? 'is-invalid' : ''}`}
                value={course.level}
                onChange={(event) => updateCourseField('level', event.target.value)}
                disabled={!isEditable}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <FieldError error={courseErrors.level} />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Language</label>
              <input
                type="text"
                className={`form-control rounded-3 ${courseErrors.language ? 'is-invalid' : ''}`}
                value={course.language}
                onChange={(event) => updateCourseField('language', event.target.value)}
                disabled={!isEditable}
              />
              <FieldError error={courseErrors.language} />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Estimated Duration</label>
              <input
                type="text"
                className={`form-control rounded-3 ${courseErrors.estimatedDuration ? 'is-invalid' : ''}`}
                value={course.estimatedDuration}
                onChange={(event) => updateCourseField('estimatedDuration', event.target.value)}
                disabled={!isEditable}
                placeholder="e.g. 6 weeks"
              />
              <FieldError error={courseErrors.estimatedDuration} />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Estimated Hours</label>
              <input
                type="number"
                min="0"
                className={`form-control rounded-3 ${courseErrors.estimatedLearningHours ? 'is-invalid' : ''}`}
                value={course.estimatedLearningHours ?? ''}
                onChange={(event) => updateCourseField('estimatedLearningHours', event.target.value)}
                disabled={!isEditable}
                placeholder="e.g. 40"
              />
              <FieldError error={courseErrors.estimatedLearningHours} />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Price ($ USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`form-control rounded-3 ${courseErrors.price ? 'is-invalid' : ''}`}
                value={course.price ?? 0}
                onChange={(event) => updateCourseField('price', Number(event.target.value))}
                disabled={!isEditable}
                placeholder="0.00 (Free)"
              />
              <FieldError error={courseErrors.price} />
            </div>
            {/* AI AUTO-GENERATED COVER ART & BANNER STUDIO */}
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4 border overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' }}>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                      <i className="bi bi-stars text-success fs-5"></i> AI Auto-Generated Course Art Studio
                    </h6>
                    <p className="text-muted extra-small mb-0">
                      AI dynamically renders course titles (<strong>{course.title || 'Java Programming'}</strong>) on bespoke glassmorphic cover graphics. Saved directly to database on publish.
                    </p>
                  </div>

                  <div className="d-flex gap-2">
                    {/* Art Style Toggle */}
                    <button
                      type="button"
                      className={`btn btn-xs rounded-pill px-3 fw-bold ${aiArtMode === 'template' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                      onClick={() => handleManualAiRegenerate(aiThemeIndex, aiArtMode === 'template' ? 'photo' : 'template')}
                    >
                      <i className="bi bi-palette me-1"></i> {aiArtMode === 'template' ? 'Dynamic Title Graphic' : 'Curated Tech HD Photo'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-xs btn-success rounded-pill px-3 fw-bold shadow-sm"
                      onClick={() => handleManualAiRegenerate()}
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i> Switch AI Theme
                    </button>
                  </div>
                </div>

                <div className="row g-3">
                  {/* AI Thumbnail Preview */}
                  <div className="col-md-5">
                    <div className="bg-white p-3 rounded-4 border shadow-xs text-center h-100">
                      <span className="extra-small fw-bold text-muted d-block mb-2 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                        <i className="bi bi-image-fill me-1 text-success"></i> AI Catalog Thumbnail
                      </span>
                      <div className="position-relative overflow-hidden rounded-3 border" style={{ height: '145px', backgroundColor: '#f8fafc' }}>
                        <img
                          src={course.thumbnailUrl || generateAICourseCover(course.title, course.category, aiThemeIndex, aiArtMode === 'template').thumbnailUrl}
                          alt="AI Course Thumbnail"
                          className="w-100 h-100 object-fit-cover transition-all"
                        />
                        <span className="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white px-2 py-1 extra-small rounded-start-2" style={{ fontSize: '0.68rem' }}>
                          <i className="bi bi-magic me-1 text-warning"></i>AI Generated
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Banner Preview */}
                  <div className="col-md-7">
                    <div className="bg-white p-3 rounded-4 border shadow-xs text-center h-100">
                      <span className="extra-small fw-bold text-muted d-block mb-2 text-uppercase" style={{ letterSpacing: '0.04em' }}>
                        <i className="bi bi-aspect-ratio-fill me-1 text-success"></i> AI Wide Header Banner
                      </span>
                      <div className="position-relative overflow-hidden rounded-3 border" style={{ height: '145px', backgroundColor: '#f8fafc' }}>
                        <img
                          src={course.bannerUrl || generateAICourseCover(course.title, course.category, aiThemeIndex, aiArtMode === 'template').bannerUrl}
                          alt="AI Course Banner"
                          className="w-100 h-100 object-fit-cover transition-all"
                        />
                        <span className="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white px-2 py-1 extra-small rounded-start-2" style={{ fontSize: '0.68rem' }}>
                          <i className="bi bi-magic me-1 text-warning"></i>AI Generated
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Palette Switcher */}
                <div className="mt-3 pt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <span className="extra-small text-muted fw-bold">
                    <i className="bi bi-paint-bucket me-1 text-success"></i> AI Color Palettes:
                  </span>
                  <div className="d-flex flex-wrap gap-1">
                    {[
                      { name: 'Emerald Tech', idx: 0, color: '#10b981' },
                      { name: 'Cyber Blue', idx: 1, color: '#6366f1' },
                      { name: 'Neon Violet', idx: 2, color: '#a855f7' },
                      { name: 'Dark Amber', idx: 3, color: '#f59e0b' },
                    ].map(t => (
                      <button
                        key={t.idx}
                        type="button"
                        className={`btn btn-xs rounded-pill px-2.5 py-1 extra-small fw-semibold border ${aiThemeIndex === t.idx ? 'btn-success text-white' : 'btn-light text-dark'}`}
                        onClick={() => handleManualAiRegenerate(t.idx)}
                      >
                        <span className="d-inline-block rounded-circle me-1" style={{ width: '8px', height: '8px', backgroundColor: t.color }}></span>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <MediaUploader
                type="video"
                value={course.promotionalVideoUrl}
                onChange={(url) => updateCourseField('promotionalVideoUrl', url)}
                label="Promotional Video"
                description="Upload a short promotional video (teaser) for marketing display."
                onShowToast={onShowToast}
              />
              <FieldError error={courseErrors.promotionalVideoUrl} />
            </div>
            <div className="col-md-6">
              <MediaUploader
                type="video"
                value={course.introVideoUrl}
                onChange={(url) => updateCourseField('introVideoUrl', url)}
                label="Course Intro Video"
                description="Upload an introductory overview lesson/video for students."
                onShowToast={onShowToast}
              />
              <FieldError error={courseErrors.introVideoUrl} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="row g-3">
            <div className="col-12">
              <h5 className="fw-bold text-dark mb-1">Step 2: Detailed Information</h5>
              <p className="text-muted mb-0">Provide learning outcomes, prerequisites, target audience, and other course details.</p>
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Full Description</label>
              <textarea
                rows="4"
                className={`form-control rounded-3 ${courseErrors.description ? 'is-invalid' : ''}`}
                value={course.description}
                onChange={(event) => updateCourseField('description', event.target.value)}
                disabled={!isEditable}
                placeholder="Detailed description of what the course covers..."
              ></textarea>
              <FieldError error={courseErrors.description} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Learning Outcomes</label>
              <textarea
                rows="3"
                className={`form-control rounded-3 ${courseErrors.learningOutcomes ? 'is-invalid' : ''}`}
                value={course.learningOutcomes}
                onChange={(event) => updateCourseField('learningOutcomes', event.target.value)}
                disabled={!isEditable}
                placeholder="What will students learn? (One per line or comma-separated)"
              ></textarea>
              <FieldError error={courseErrors.learningOutcomes} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Prerequisites</label>
              <textarea
                rows="2"
                className={`form-control rounded-3 ${courseErrors.prerequisites ? 'is-invalid' : ''}`}
                value={course.prerequisites}
                onChange={(event) => updateCourseField('prerequisites', event.target.value)}
                disabled={!isEditable}
                placeholder="Prerequisites for this course... (One per line or comma-separated)"
              ></textarea>
              <FieldError error={courseErrors.prerequisites} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Target Audience</label>
              <textarea
                rows="2"
                className={`form-control rounded-3 ${courseErrors.targetAudience ? 'is-invalid' : ''}`}
                value={course.targetAudience}
                onChange={(event) => updateCourseField('targetAudience', event.target.value)}
                disabled={!isEditable}
                placeholder="Who is this course for?"
              ></textarea>
              <FieldError error={courseErrors.targetAudience} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Skills Covered</label>
              <textarea
                rows="2"
                className={`form-control rounded-3 ${courseErrors.skills ? 'is-invalid' : ''}`}
                value={course.skills}
                onChange={(event) => updateCourseField('skills', event.target.value)}
                disabled={!isEditable}
                placeholder="e.g. React, Spring Boot, Java"
              ></textarea>
              <FieldError error={courseErrors.skills} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Tags</label>
              <textarea
                rows="2"
                className={`form-control rounded-3 ${courseErrors.tags ? 'is-invalid' : ''}`}
                value={course.tags || ''}
                onChange={(event) => updateCourseField('tags', event.target.value)}
                disabled={!isEditable}
                placeholder="e.g. Web Development, Backend, Frontend"
              ></textarea>
              <FieldError error={courseErrors.tags} />
            </div>
            <div className="col-12 d-flex align-items-center">
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="certificateAvailable"
                  checked={Boolean(course.certificateAvailable)}
                  onChange={(event) => updateCourseField('certificateAvailable', event.target.checked)}
                  disabled={!isEditable}
                />
                <label className="form-check-label fw-semibold text-dark ms-2" htmlFor="certificateAvailable">
                  Certificate Available
                </label>
              </div>
              <FieldError error={courseErrors.certificateAvailable} />
            </div>
          </div>
        );
      case 3:
        return (
          <CurriculumSection
            modules={modules}
            isEditable={isEditable}
            onAddModule={() => openModuleModal(null)}
            onEditModule={openModuleModal}
            onDeleteModule={handleDeleteModule}
            onMoveModule={reorderModules}
            onAddLesson={(module) => openLessonModal(module, null)}
            onEditLesson={openLessonModal}
            onDeleteLesson={handleDeleteLesson}
            onMoveLesson={reorderLessons}
            onAddResource={(module, lesson) => openResourceModal(module, lesson, null)}
            onEditResource={openResourceModal}
            onDeleteResource={handleDeleteResource}
            onMoveResource={reorderResources}
          />
        );
      case 4:
        return (
          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold text-dark mb-2">Step 4: Course Settings</h5>
                <p className="text-muted mb-4">
                  Configure the visibility of your course. Drafts are private, submitted courses go to admin queue, and published courses are visible to students.
                </p>

                <div className="mb-4">
                  <label className="form-label small fw-bold">Visibility Setting</label>
                  <div className="d-flex flex-column gap-2">
                    <div className="form-check border p-3 rounded-4 bg-light">
                      <input
                        className="form-check-input ms-0 me-2"
                        type="radio"
                        name="visibility"
                        id="visibilityDraft"
                        value="DRAFT"
                        checked={selectedVisibility === 'DRAFT'}
                        onChange={(e) => setSelectedVisibility(e.target.value)}
                        disabled={!isEditable}
                      />
                      <label className="form-check-label fw-semibold text-dark ms-2" htmlFor="visibilityDraft">
                        Draft
                        <span className="d-block text-muted fw-normal small">Keep editing this course. It will only be visible to you.</span>
                      </label>
                    </div>

                    <div className="form-check border p-3 rounded-4 bg-light">
                      <input
                        className="form-check-input ms-0 me-2"
                        type="radio"
                        name="visibility"
                        id="visibilitySubmit"
                        value="SUBMIT_FOR_REVIEW"
                        checked={selectedVisibility === 'SUBMIT_FOR_REVIEW'}
                        onChange={(e) => setSelectedVisibility(e.target.value)}
                        disabled={!isEditable}
                      />
                      <label className="form-check-label fw-semibold text-dark ms-2" htmlFor="visibilitySubmit">
                        Submit For Review
                        <span className="d-block text-muted fw-normal small">Send this course to the Administrator for approval.</span>
                      </label>
                    </div>

                    <div className="form-check border p-3 rounded-4 bg-light">
                      <input
                        className="form-check-input ms-0 me-2"
                        type="radio"
                        name="visibility"
                        id="visibilityPublished"
                        value="PUBLISHED"
                        checked={selectedVisibility === 'PUBLISHED'}
                        onChange={(e) => setSelectedVisibility(e.target.value)}
                        disabled={user?.role !== 'ADMIN'}
                      />
                      <label className="form-check-label fw-semibold text-dark ms-2" htmlFor="visibilityPublished">
                        Published {user?.role !== 'ADMIN' && <span className="badge bg-secondary ms-2">Admin Only</span>}
                        <span className="d-block text-muted fw-normal small">Make this course instantly active in the Student Catalog (Admin only).</span>
                      </label>
                    </div>
                  </div>
                </div>

                {course.rejectionReason && course.status === 'REJECTED' && (
                  <div className="alert alert-danger rounded-4 mb-4">
                    <div className="fw-bold mb-1"><i className="bi bi-exclamation-triangle-fill me-1"></i> Admin Rejection Feedback</div>
                    <div>{course.rejectionReason}</div>
                  </div>
                )}

                <div className="d-flex flex-wrap gap-2 mt-4">
                  {selectedVisibility === 'DRAFT' && isEditable && (
                    <button
                      type="button"
                      className="btn btn-primary rounded-pill px-4 fw-bold"
                      onClick={saveDraftFromSubmission}
                      disabled={busyAction === 'save-course' || busyAction === 'submit-course'}
                    >
                      {busyAction === 'save-course' ? 'Saving...' : 'Save As Draft'}
                    </button>
                  )}
                  {selectedVisibility === 'SUBMIT_FOR_REVIEW' && isEditable && (
                    <button
                      type="button"
                      className="btn btn-success rounded-pill px-4 fw-bold"
                      onClick={submitForApproval}
                      disabled={busyAction === 'save-course' || busyAction === 'submit-course'}
                    >
                      {busyAction === 'submit-course' ? 'Submitting...' : 'Submit For Approval'}
                    </button>
                  )}
                  {selectedVisibility === 'PUBLISHED' && user?.role === 'ADMIN' && (
                    <button
                      type="button"
                      className="btn btn-info text-white rounded-pill px-4 fw-bold"
                      onClick={async () => {
                        setBusyAction('publish-course');
                        try {
                          await CourseService.publishCourseAsAdmin(persistedCourseId);
                          onShowToast('success', 'Course published directly as Admin.');
                          onComplete(persistedCourseId);
                        } catch (error) {
                          onShowToast('error', getFriendlyErrorMessage(error, 'Failed to publish course.'));
                        } finally {
                          setBusyAction('');
                        }
                      }}
                      disabled={busyAction !== ''}
                    >
                      {busyAction === 'publish-course' ? 'Publishing...' : 'Publish Course'}
                    </button>
                  )}
                  {!isEditable && selectedVisibility !== 'PUBLISHED' && (
                    <div className="text-muted">
                      This course is currently in {formatStatusLabel(course.status)} status and cannot be edited.
                    </div>
                  )}
                </div>

                <div className="mt-5 border-top pt-4">
                  <h6 className="fw-bold text-dark mb-4">Review Course Structure</h6>
                  <ReviewSection course={course} modules={modules} />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fade-in-quick text-start">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button type="button" className="btn btn-light rounded-pill" onClick={handleBackToCourses}>
              <i className="bi bi-arrow-left me-1"></i> Back
            </button>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h2 className="fw-bold text-dark mb-0">
                  {mode === 'create' ? 'Create Course Wizard' : 'Course Wizard'}
                </h2>
                <span className={`badge rounded-pill ${getStatusBadgeClass(course.status)}`}>
                  {formatStatusLabel(course.status || 'DRAFT')}
                </span>
              </div>
              <p className="text-muted mb-0">
                Build the course in guided steps while persisting each stage through the real backend APIs.
              </p>
            </div>
          </div>

          {dirtyCourse && (
            <span className="badge rounded-pill bg-warning-subtle text-warning px-3 py-2">
              Unsaved course detail changes
            </span>
          )}
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <div className="d-flex gap-2 flex-wrap mb-4">
            {COURSE_STEPS.map((step) => (
              <StepBadge
                key={step.id}
                step={step}
                currentStep={currentStep}
                onSelect={goToStep}
                disabled={busyAction !== ''}
              />
            ))}
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

          {modulesError && (currentStep === 3 || currentStep === 4) && (
            <div className="alert alert-warning rounded-4 mb-4" role="alert">
              {modulesError}
            </div>
          )}

          {modulesLoading && (currentStep === 3 || currentStep === 4) ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <div className="text-muted">Loading course structure...</div>
            </div>
          ) : (
            renderStepContent()
          )}

          <div className="d-flex justify-content-between align-items-center border-top pt-4 mt-4 flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-light rounded-pill px-4"
              onClick={() => goToStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || busyAction !== ''}
            >
              Previous
            </button>

            <div className="small text-muted">
              Step {currentStep} of {COURSE_STEPS.length}
            </div>

            <div className="d-flex gap-2 flex-wrap">
              {persistedCourseId && (
                <button
                  type="button"
                  className="btn btn-light border rounded-pill px-4"
                  onClick={openPreview}
                  disabled={busyAction !== ''}
                >
                  Preview Course
                </button>
              )}
              <button
                type="button"
                className="btn btn-success rounded-pill px-4 fw-bold"
                onClick={() => goToStep(Math.min(COURSE_STEPS.length, currentStep + 1))}
                disabled={currentStep === COURSE_STEPS.length || busyAction !== ''}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModuleModal
        title={moduleModal?.title}
        data={moduleModal?.data}
        errors={moduleModal?.errors || {}}
        onChange={(data) => setModuleModal((previous) => ({ ...previous, data }))}
        onClose={() => setModuleModal(null)}
        onSubmit={handleModuleSubmit}
        submitLabel={moduleModal?.submitLabel}
      />

      <LessonModal
        title={lessonModal?.title}
        data={lessonModal?.data}
        errors={lessonModal?.errors || {}}
        onChange={(data) => setLessonModal((previous) => ({ ...previous, data }))}
        onClose={() => setLessonModal(null)}
        onSubmit={handleLessonSubmit}
        submitLabel={lessonModal?.submitLabel}
      />

      <ResourceModal
        title={resourceModal?.title}
        data={resourceModal?.data}
        errors={resourceModal?.errors || {}}
        onChange={(data) => setResourceModal((previous) => ({ ...previous, data }))}
        onClose={() => setResourceModal(null)}
        onSubmit={handleResourceSubmit}
        submitLabel={resourceModal?.submitLabel}
      />

      <ConfirmModal
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        confirmClassName={confirmModal?.confirmClassName}
        onCancel={() => setConfirmModal(null)}
        onConfirm={confirmModal?.onConfirm}
      />
    </>
  );
}
