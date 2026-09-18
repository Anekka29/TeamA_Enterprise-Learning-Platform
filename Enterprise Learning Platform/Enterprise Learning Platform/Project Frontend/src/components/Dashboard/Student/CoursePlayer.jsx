import { useState, useEffect, useMemo } from 'react';
import EnrollmentService from '../../../services/EnrollmentService';
import CourseContentService from '../../../services/CourseContentService';
import courseBadgeImg from '../../../assets/images/course-completed-badge.jpg';

export default function CoursePlayer({ course, enrollment, onBack, onShowToast }) {
  const [modules, setModules] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [rightTab, setRightTab] = useState('notes'); // 'notes' | 'bookmarks' | 'resources' | 'progress'
  const [notes, setNotes] = useState(enrollment?.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedStatus, setNotesSavedStatus] = useState('');
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return enrollment?.bookmarks ? JSON.parse(enrollment.bookmarks) : [];
    } catch {
      return [];
    }
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Load course modules and completed lessons
  const loadCurriculum = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [moduleData, completedIds] = await Promise.all([
        CourseContentService.getModulesForCourse(course.id),
        EnrollmentService.getCompletedLessonIds(course.id),
      ]);

      const sortedModules = (moduleData || []).slice().sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      setModules(sortedModules);
      setCompletedLessonIds(completedIds || []);

      // Determine initial active lesson (lastOpenedLessonId or first available lesson)
      let initialLesson = null;
      if (enrollment?.lastOpenedLessonId) {
        for (const mod of sortedModules) {
          const found = (mod.lessons || []).find((l) => String(l.id) === String(enrollment.lastOpenedLessonId));
          if (found) {
            initialLesson = found;
            break;
          }
        }
      }

      if (!initialLesson && sortedModules.length > 0) {
        for (const mod of sortedModules) {
          if (mod.lessons && mod.lessons.length > 0) {
            initialLesson = mod.lessons[0];
            break;
          }
        }
      }

      if (initialLesson) {
        setActiveLesson(initialLesson);
      }
    } catch (err) {
      console.error('Failed to load course curriculum', err);
      setLoadError(err?.message || 'Failed to load course curriculum.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?.id) {
      loadCurriculum();
    }
  }, [course?.id]);

  // Sync notes from enrollment prop
  useEffect(() => {
    if (enrollment?.notes !== undefined) {
      setNotes(enrollment.notes || '');
    }
  }, [enrollment?.notes]);

  // Select active lesson and record last opened
  const handleSelectLesson = async (lesson) => {
    setActiveLesson(lesson);
    if (enrollment?.id && lesson?.id) {
      try {
        await EnrollmentService.updateLastOpenedLesson(enrollment.id, lesson.id);
      } catch (e) {
        console.error('Failed to update last opened lesson', e);
      }
    }
  };

  // Flattened lessons list for previous/next navigation
  const allLessons = useMemo(() => {
    const list = [];
    modules.forEach((mod) => {
      (mod.lessons || [])
        .slice()
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .forEach((les) => {
          list.push({ ...les, moduleTitle: mod.title, moduleId: mod.id });
        });
    });
    return list;
  }, [modules]);

  // Calculate dynamic progress
  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCompleted = progressPercent === 100;

  // Search filtering
  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return modules;
    const term = searchTerm.toLowerCase();
    return modules
      .map((mod) => {
        const matchesModule = mod.title?.toLowerCase().includes(term);
        const matchingLessons = (mod.lessons || []).filter(
          (l) => l.title?.toLowerCase().includes(term) || l.content?.toLowerCase().includes(term)
        );
        if (matchesModule || matchingLessons.length > 0) {
          return {
            ...mod,
            lessons: matchesModule ? mod.lessons : matchingLessons,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [modules, searchTerm]);

  // Mark lesson complete / incomplete
  const handleToggleComplete = async (lessonId) => {
    if (actionLoading) return;
    const isAlreadyCompleted = completedLessonIds.includes(lessonId);
    try {
      setActionLoading(true);
      if (isAlreadyCompleted) {
        await EnrollmentService.markLessonIncomplete(lessonId);
        setCompletedLessonIds((prev) => prev.filter((id) => id !== lessonId));
        if (onShowToast) onShowToast('info', 'Lesson marked as incomplete.');
      } else {
        await EnrollmentService.markLessonComplete(lessonId);
        const newCompletedIds = [...completedLessonIds, lessonId];
        setCompletedLessonIds(newCompletedIds);
        if (onShowToast) onShowToast('success', 'Lesson completed!');

        // Check if course is newly 100% completed
        if (totalLessons > 0 && newCompletedIds.length === totalLessons) {
          setShowCertificateModal(true);
          if (onShowToast) onShowToast('success', '🎉 Congratulations! You completed the course and earned the Course Completed Badge!');
        } else {
          // Automatically unlock and jump to next lesson if available
          const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
          if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
            const nextLes = allLessons[currentIndex + 1];
            handleSelectLesson(nextLes);
          }
        }
      }
    } catch (err) {
      console.error('Failed to update lesson completion status', err);
      if (onShowToast) onShowToast('error', err?.message || 'Failed to update lesson completion.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = async (lesson) => {
    const isBookmarked = bookmarks.some((b) => b.id === lesson.id);
    let updated;
    if (isBookmarked) {
      updated = bookmarks.filter((b) => b.id !== lesson.id);
    } else {
      updated = [...bookmarks, { id: lesson.id, title: lesson.title, moduleTitle: lesson.moduleTitle }];
    }
    setBookmarks(updated);
    if (enrollment?.id) {
      try {
        await EnrollmentService.saveBookmarks(enrollment.id, JSON.stringify(updated));
        if (onShowToast) onShowToast('success', isBookmarked ? 'Bookmark removed.' : 'Lesson bookmarked!');
      } catch (e) {
        console.error('Failed to save bookmarks', e);
      }
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!enrollment?.id) return;
    try {
      setSavingNotes(true);
      await EnrollmentService.saveNotes(enrollment.id, notes);
      setNotesSavedStatus('Notes saved to MySQL DB');
      setTimeout(() => setNotesSavedStatus(''), 3000);
      if (onShowToast) onShowToast('success', 'Notes saved successfully!');
    } catch (err) {
      console.error('Failed to save notes', err);
      if (onShowToast) onShowToast('error', 'Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Lesson index navigation helpers
  const currentLessonIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex !== -1 && currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // Render main lesson viewer content
  const renderLessonViewer = () => {
    if (!activeLesson) {
      return (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-journal-check fs-1 d-block mb-3 text-success"></i>
          <h5>Select a lesson to begin learning</h5>
          <p className="small">Choose any module from the left curriculum list.</p>
        </div>
      );
    }

    const type = (activeLesson.lessonType || 'TEXT').toUpperCase();
    const isCompletedCurrent = completedLessonIds.includes(activeLesson.id);
    const isBookmarkedCurrent = bookmarks.some((b) => b.id === activeLesson.id);

    return (
      <div className="d-flex flex-column h-100">
        {/* Lesson Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2 fw-semibold">
                {activeLesson.moduleTitle || 'Module Lesson'}
              </span>
              <span className="badge rounded-pill bg-light text-dark px-3 py-2 border">
                <i className="bi bi-play-circle me-1 text-primary"></i>
                {type}
              </span>
              {activeLesson.estimatedDuration && (
                <span className="badge rounded-pill bg-light text-dark px-3 py-2 border">
                  <i className="bi bi-clock me-1"></i>
                  {activeLesson.estimatedDuration}
                </span>
              )}
            </div>
            <h3 className="fw-bold text-dark mb-0">{activeLesson.title}</h3>
          </div>

          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm rounded-pill fw-bold ${isBookmarkedCurrent ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
              onClick={() => handleToggleBookmark(activeLesson)}
            >
              <i className={`bi ${isBookmarkedCurrent ? 'bi-bookmark-fill' : 'bi-bookmark'} me-1`}></i>
              {isBookmarkedCurrent ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>
        </div>

        {/* Lesson Content Viewer Area */}
        <div className="flex-grow-1 mb-4" style={{ minHeight: '380px' }}>
          {type === 'VIDEO' && (
            <div className="rounded-4 overflow-hidden border shadow-sm bg-black text-center" style={{ minHeight: '380px' }}>
              {activeLesson.videoUrl ? (
                activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={activeLesson.videoUrl.replace('watch?v=', 'embed/')}
                    title={activeLesson.title}
                    className="w-100 h-100"
                    style={{ minHeight: '400px', border: 0 }}
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video src={activeLesson.videoUrl} controls className="w-100 h-100 rounded-4" style={{ maxHeight: '480px' }}>
                    Your browser does not support HTML5 video playback.
                  </video>
                )
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white p-5">
                  <i className="bi bi-camera-video-off fs-1 mb-3 text-muted"></i>
                  <h5>Video Media Stream</h5>
                  <p className="text-muted small">No external video URL configured. Read the lesson article below.</p>
                </div>
              )}
            </div>
          )}

          {(type === 'PDF' || type === 'DOCUMENT' || type === 'PRESENTATION') && (
            <div className="rounded-4 border p-4 bg-light text-start shadow-sm mb-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-file-earmark-pdf-fill text-danger fs-1"></i>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">{activeLesson.title} Document Resource</h5>
                    <span className="small text-muted">Interactive PDF & Presentation Study Guide</span>
                  </div>
                </div>
                {activeLesson.videoUrl && (
                  <a
                    href={activeLesson.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-danger btn-sm rounded-pill fw-bold"
                  >
                    <i className="bi bi-download me-1"></i> Download File
                  </a>
                )}
              </div>
              {activeLesson.videoUrl && activeLesson.videoUrl.endsWith('.pdf') ? (
                <iframe src={activeLesson.videoUrl} title="Document Viewer" className="w-100 rounded-3 border" style={{ height: '420px' }}></iframe>
              ) : null}
            </div>
          )}

          {/* Article / Reading Text */}
          <div className="rounded-4 border p-4 bg-white shadow-sm text-start">
            <h5 className="fw-bold text-dark mb-3">Lesson Material</h5>
            <div className="text-dark-emphasis" style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '1.02rem' }}>
              {activeLesson.content || 'Comprehensive study notes and module instructions provided by your instructor.'}
            </div>

            {/* Resources list */}
            {activeLesson.resources && activeLesson.resources.length > 0 && (
              <div className="border-top pt-4 mt-4">
                <h6 className="fw-bold text-dark mb-3">
                  <i className="bi bi-paperclip text-success me-2"></i>
                  Attached Study Resources ({activeLesson.resources.length})
                </h6>
                <div className="vstack gap-2">
                  {activeLesson.resources.map((res) => (
                    <div key={res.id} className="d-flex justify-content-between align-items-center p-3 rounded-3 border bg-light">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-file-earmark-arrow-down text-success fs-5"></i>
                        <div>
                          <div className="fw-semibold text-dark small">{res.title}</div>
                          <div className="text-muted small">{res.description || res.type}</div>
                        </div>
                      </div>
                      {res.url && (
                        <a href={res.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border rounded-pill fw-bold">
                          <i className="bi bi-download me-1"></i> Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Control Bar */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-3 border-top bg-white rounded-4 p-3 border shadow-sm">
          <button
            className="btn btn-light border rounded-pill fw-bold"
            onClick={() => prevLesson && handleSelectLesson(prevLesson)}
            disabled={!prevLesson}
          >
            <i className="bi bi-arrow-left me-1"></i> Previous Lesson
          </button>

          <button
            className={`btn rounded-pill px-4 fw-bold ${isCompletedCurrent ? 'btn-outline-success' : 'btn-success'}`}
            onClick={() => handleToggleComplete(activeLesson.id)}
            disabled={actionLoading}
          >
            <i className={`bi ${isCompletedCurrent ? 'bi-check-circle-fill' : 'bi-check2-circle'} me-2`}></i>
            {isCompletedCurrent ? 'Completed (Click to Undo)' : 'Mark as Completed'}
          </button>

          <button
            className="btn btn-light border rounded-pill fw-bold"
            onClick={() => nextLesson && handleSelectLesson(nextLesson)}
            disabled={!nextLesson}
          >
            Next Lesson <i className="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-hourglass-split fs-1 mb-3 text-success d-block"></i>
        <p className="text-muted">Loading learning portal player...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-4">
        <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
        <h5 className="fw-bold text-dark mb-2">Unable to load portal player</h5>
        <p className="text-muted mb-4">{loadError}</p>
        <button className="btn btn-success rounded-pill fw-bold px-4" onClick={loadCurriculum}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in-quick text-start" style={{ minHeight: '85vh' }}>
      {/* Top Navigation Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-light rounded-pill border fw-semibold" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </button>
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
              <h4 className="fw-bold text-dark mb-0">{course.title}</h4>
              <span className="badge rounded-pill bg-success-subtle text-success">{course.category}</span>
            </div>
            <p className="text-muted small mb-0">
              {completedCount} of {totalLessons} lessons completed ({progressPercent}%)
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Certificate Button */}
          {course.certificateAvailable && (
            <button
              className={`btn btn-sm rounded-pill fw-bold ${isCompleted ? 'btn-success' : 'btn-light border text-muted'}`}
              onClick={() => isCompleted && setShowCertificateModal(true)}
              disabled={!isCompleted}
            >
              <i className="bi bi-award-fill me-1 text-warning"></i>
              {isCompleted ? 'View Certificate' : 'Certificate (Locked)'}
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="row g-4">
        {/* Left Column: Curriculum Tree & Lesson List */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border h-100" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
            <div className="mb-3">
              <div className="position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input
                  type="text"
                  className="form-control rounded-pill ps-5 form-control-sm"
                  placeholder="Search lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark small">Course Content</span>
              <span className="small text-muted">{modules.length} Modules</span>
            </div>

            {filteredModules.length === 0 ? (
              <div className="text-center py-4 text-muted small">No lessons found.</div>
            ) : (
              filteredModules.map((mod, modIdx) => (
                <div key={mod.id} className="mb-3">
                  <div className="fw-bold text-dark small mb-2 d-flex justify-content-between align-items-center">
                    <span>
                      Module {modIdx + 1}: {mod.title}
                    </span>
                    <span className="badge rounded-pill bg-light text-dark">{mod.lessons?.length || 0}</span>
                  </div>
                  <div className="vstack gap-1">
                    {(mod.lessons || [])
                      .slice()
                      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                      .map((les, lesIdx) => {
                        const isDone = completedLessonIds.includes(les.id);
                        const isActive = activeLesson?.id === les.id;

                        return (
                          <button
                            key={les.id}
                            className={`btn btn-sm text-start rounded-3 p-2 d-flex align-items-center justify-content-between transition-all ${
                              isActive ? 'btn-success text-white fw-bold shadow-sm' : 'btn-light text-dark'
                            }`}
                            onClick={() => handleSelectLesson(les)}
                          >
                            <div className="d-flex align-items-center gap-2 overflow-hidden me-2">
                              {isDone ? (
                                <i className={`bi bi-check-circle-fill ${isActive ? 'text-white' : 'text-success'}`}></i>
                              ) : (
                                <i className={`bi bi-play-circle ${isActive ? 'text-white' : 'text-muted'}`}></i>
                              )}
                              <span className="small text-truncate">
                                {lesIdx + 1}. {les.title}
                              </span>
                            </div>
                            {les.previewAvailable && !isDone && (
                              <span className={`badge rounded-pill ${isActive ? 'bg-light text-dark' : 'bg-success-subtle text-success'}`}>
                                Preview
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Column: Interactive Lesson Player */}
        <div className="col-lg-6">{renderLessonViewer()}</div>

        {/* Right Column: Notes, Bookmarks, Resources & Progress */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border h-100">
            {/* Tab Selector */}
            <div className="d-flex gap-1 border-bottom pb-3 mb-3">
              {[
                { id: 'notes', label: 'Notes', icon: 'bi-sticky' },
                { id: 'bookmarks', label: 'Saved', icon: 'bi-bookmark' },
                { id: 'progress', label: 'Progress', icon: 'bi-bar-chart' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`btn btn-sm rounded-pill flex-grow-1 fw-bold ${rightTab === tab.id ? 'btn-success' : 'btn-light border text-muted'}`}
                  onClick={() => setRightTab(tab.id)}
                >
                  <i className={`bi ${tab.icon} me-1`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notes Tab */}
            {rightTab === 'notes' && (
              <div className="d-flex flex-column h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small fw-bold text-dark mb-0">Study Notes</label>
                  {notesSavedStatus && <span className="small text-success fw-bold">{notesSavedStatus}</span>}
                </div>
                <textarea
                  rows="12"
                  className="form-control rounded-3 mb-3 flex-grow-1 small"
                  placeholder="Type personal study notes here... Notes auto-save to database."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
                <button className="btn btn-success btn-sm rounded-pill fw-bold w-100" onClick={handleSaveNotes} disabled={savingNotes}>
                  {savingNotes ? 'Saving Notes...' : 'Save Notes'}
                </button>
              </div>
            )}

            {/* Bookmarks Tab */}
            {rightTab === 'bookmarks' && (
              <div>
                <h6 className="fw-bold text-dark mb-3">Bookmarked Lessons ({bookmarks.length})</h6>
                {bookmarks.length === 0 ? (
                  <div className="text-center py-4 text-muted small">No bookmarked lessons yet. Click "Bookmark" on any lesson.</div>
                ) : (
                  <div className="vstack gap-2">
                    {bookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        className="p-2 rounded-3 border bg-light d-flex justify-content-between align-items-center cursor-pointer hover-shadow"
                        onClick={() => {
                          const found = allLessons.find((l) => l.id === bm.id);
                          if (found) handleSelectLesson(found);
                        }}
                      >
                        <div className="overflow-hidden me-2">
                          <div className="fw-semibold text-dark small text-truncate">{bm.title}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {bm.moduleTitle}
                          </div>
                        </div>
                        <i className="bi bi-arrow-right-short fs-4 text-success"></i>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Progress Tab */}
            {rightTab === 'progress' && (
              <div>
                <h6 className="fw-bold text-dark mb-3">Course Completion Stats</h6>
                <div className="card border rounded-4 p-3 bg-light text-center mb-3">
                  <div className="fs-3 fw-bold text-success mb-1">{progressPercent}%</div>
                  <div className="progress rounded-pill mb-2" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <span className="small text-muted">
                    {completedCount} of {totalLessons} lessons completed
                  </span>
                </div>

                <div className="vstack gap-2 small">
                  <div className="d-flex justify-content-between border-bottom pb-2">
                    <span className="text-muted">Enrolled Date</span>
                    <span className="fw-semibold text-dark">
                      {enrollment?.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2">
                    <span className="text-muted">Certificate Status</span>
                    <span className={`fw-bold ${isCompleted ? 'text-success' : 'text-muted'}`}>
                      {isCompleted ? 'Available' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate & Badge Completion Modal */}
      {showCertificateModal && (
        <div
          className="study-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 40, 32, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div className="study-window bg-white rounded-4 p-4 p-md-5 text-center shadow-lg" style={{ maxWidth: '640px', width: '92%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2 fw-bold">
                <i className="bi bi-patch-check-fill me-1"></i> Official Course Completed Badge & Credential
              </span>
              <button className="btn-close" onClick={() => setShowCertificateModal(false)}></button>
            </div>

            <div className="border border-3 border-success-subtle rounded-4 p-4 bg-light mb-4">
              <div className="mb-3">
                <img
                  src={courseBadgeImg}
                  alt="Enterprise Learning Platform with Skill and Career Guidance System Course Completed Badge"
                  style={{
                    width: '140px',
                    height: '140px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 20px rgba(16,185,129,0.3))',
                    borderRadius: '50%',
                  }}
                />
              </div>
              <h3 className="fw-bold text-dark mb-1">Course Completed!</h3>
              <p className="text-muted small mb-3">This certifies that</p>
              <h4 className="fw-bold text-success border-bottom pb-2 mb-3">{enrollment?.studentName || 'Student'}</h4>
              <p className="text-muted small mb-2">has successfully completed all modules and requirements for</p>
              <h5 className="fw-bold text-dark">{course.title}</h5>
              <div className="small text-muted mt-3">
                Instructor: {course.instructor || course.mentorName} • Issued on {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <a
                href={courseBadgeImg}
                download="Enterprise Learning Platform_Course_Completed_Badge.jpg"
                className="btn btn-outline-success rounded-pill px-4 fw-bold"
              >
                <i className="bi bi-download me-1"></i> Save Badge
              </a>
              <button className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={() => window.print()}>
                <i className="bi bi-printer me-1"></i> Print Certificate
              </button>
              <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={() => setShowCertificateModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
