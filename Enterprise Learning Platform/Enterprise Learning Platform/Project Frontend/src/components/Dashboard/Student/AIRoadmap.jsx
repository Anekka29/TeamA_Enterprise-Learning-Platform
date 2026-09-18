import { useState, useEffect } from 'react';
import RoadmapService from '../../../services/RoadmapService';

export default function AIRoadmap() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingRoadmaps, setFetchingRoadmaps] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [updatingStageIndex, setUpdatingStageIndex] = useState(null);
  const [mentorReviewSent, setMentorReviewSent] = useState(false);

  // Fetch existing roadmaps on mount
  useEffect(() => {
    const fetchRoadmaps = async () => {
      setFetchingRoadmaps(true);
      try {
        const data = await RoadmapService.getMyRoadmaps();
        setRoadmaps(data);
        if (data && data.length > 0) {
          setCurrentRoadmap(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch roadmaps', error);
        const msg = error?.response?.data?.message || error?.message || 'Failed to load roadmaps from backend.';
        setErrorMessage(msg);
      } finally {
        setFetchingRoadmaps(false);
      }
    };
    fetchRoadmaps();
  }, []);

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');

  const handleOpenTopicModal = (e) => {
    if (e) e.preventDefault();
    setSelectedTopic('Full Stack Web Development');
    setCustomTopic('');
    setShowTopicModal(true);
  };

  const handleConfirmGenerate = async (e) => {
    if (e) e.preventDefault();
    setShowTopicModal(false);
    setLoading(true);
    setErrorMessage(null);

    const finalTopic = customTopic.trim() ? customTopic.trim() : selectedTopic;

    try {
      const newRoadmap = await RoadmapService.generateRoadmap(finalTopic);
      const updatedList = [newRoadmap, ...roadmaps.filter(r => r.id !== newRoadmap.id)];
      setRoadmaps(updatedList);
      setCurrentRoadmap(newRoadmap);
    } catch (error) {
      console.error('Failed to generate roadmap', error);
      const serverReason =
        error?.response?.data?.message ||
        error?.message ||
        'Unknown error occurred while generating AI roadmap.';
      setErrorMessage(serverReason);
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!currentRoadmap) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const evolvedRoadmap = await RoadmapService.improveRoadmap(currentRoadmap.id);
      const updatedList = [evolvedRoadmap, ...roadmaps.filter(r => r.id !== evolvedRoadmap.id)];
      setRoadmaps(updatedList);
      setCurrentRoadmap(evolvedRoadmap);
    } catch (error) {
      console.error('Failed to improve roadmap', error);
      const serverReason =
        error?.response?.data?.message ||
        error?.message ||
        'Unknown error occurred while evolving roadmap.';
      setErrorMessage(serverReason);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (stageIndex, newStatus) => {
    if (!currentRoadmap) return;
    setUpdatingStageIndex(stageIndex);
    try {
      const updatedRoadmap = await RoadmapService.updateStageStatus(currentRoadmap.id, stageIndex, newStatus);
      setCurrentRoadmap(updatedRoadmap);
      setRoadmaps((prev) => prev.map((r) => (r.id === updatedRoadmap.id ? updatedRoadmap : r)));
    } catch (err) {
      console.error('Failed to update stage status', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to update stage status.';
      setErrorMessage(msg);
    } finally {
      setUpdatingStageIndex(null);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleExportJSON = () => {
    if (!currentRoadmap) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentRoadmap, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `roadmap-${currentRoadmap.id || 'export'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRequestMentorReview = () => {
    setMentorReviewSent(true);
    setTimeout(() => setMentorReviewSent(false), 6000);
  };

  // Helper to categorize topics into Projects, Interview Prep, Resources, and Certifications
  const categorizeTopics = (topics = []) => {
    const projects = [];
    const interviewPrep = [];
    const resources = [];
    const certifications = [];
    const general = [];

    topics.forEach((t) => {
      const lower = t.toLowerCase();
      if (lower.includes('project') || lower.includes('capstone') || lower.includes('build')) {
        projects.push(t.replace(/^\[?Hands-on Project:?\s*/i, '').replace(/\]$/, ''));
      } else if (lower.includes('interview') || lower.includes('question') || lower.includes('prep')) {
        interviewPrep.push(t.replace(/^\[?Interview Prep:?\s*/i, '').replace(/\]$/, ''));
      } else if (lower.includes('resource') || lower.includes('doc') || lower.includes('guide') || lower.includes('book')) {
        resources.push(t.replace(/^\[?Recommended Resource:?\s*/i, '').replace(/\]$/, ''));
      } else if (lower.includes('certif') || lower.includes('exam')) {
        certifications.push(t.replace(/^\[?Certification:?\s*/i, '').replace(/\]$/, ''));
      } else {
        general.push(t);
      }
    });

    return { projects, interviewPrep, resources, certifications, general };
  };

  // Metrics & Analytics
  const stages = currentRoadmap?.stages || [];
  const completedStagesCount = stages.filter(s => (s.status || 'PENDING').toUpperCase() === 'COMPLETED').length;
  const inProgressStagesCount = stages.filter(s => (s.status || 'PENDING').toUpperCase() === 'IN_PROGRESS').length;
  const totalStagesCount = stages.length;

  const progressPercent = totalStagesCount > 0 
    ? Math.round(((completedStagesCount + 0.5 * inProgressStagesCount) / totalStagesCount) * 100) 
    : 0;

  // Career Readiness Score (0-100)
  const readinessScore = totalStagesCount > 0
    ? Math.min(98, Math.max(20, Math.round(progressPercent * 0.7 + (completedStagesCount * 6) + 20)))
    : 20;

  const readinessLabel = readinessScore >= 80 ? 'Job Ready 🚀' : readinessScore >= 50 ? 'Intermediate Competency 📈' : 'Foundational Stage 🌱';

  // Active Stage & Today's Target
  const activeStage = stages.find(s => (s.status || 'PENDING').toUpperCase() === 'IN_PROGRESS') || stages.find(s => (s.status || 'PENDING').toUpperCase() === 'PENDING') || stages[0];
  const activeTopics = activeStage?.recommendedTopics || [];
  const todaysTarget = activeTopics.length > 0 ? activeTopics[0] : 'Master current stage core topics and complete assigned hands-on exercises.';
  const weeklyGoal = activeStage ? `Complete ${activeStage.title} - ${activeStage.estimatedDuration || '4 Weeks'}` : 'Consistent 6-8 hrs/week learning progression.';

  // Target Completion Date Projections
  const calculateCompletionDate = () => {
    const today = new Date();
    today.setMonth(today.getMonth() + (totalStagesCount > 0 ? totalStagesCount : 4));
    return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  const targetCompletionDate = calculateCompletionDate();

  // All extracted skills across stages
  const allSkills = Array.from(new Set(stages.flatMap(s => s.skills || [])));
  const completedSkillsCount = Math.round((completedStagesCount / (totalStagesCount || 1)) * allSkills.length);

  return (
    <div className="fade-in-quick text-start">
      {/* Printable CSS override */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-roadmap-area, .printable-roadmap-area * { visibility: visible; }
          .printable-roadmap-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header & Enterprise Actions */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 no-print">
        <div>
          <span className="badge bg-success-subtle text-success fw-bold rounded-pill mb-2 px-3 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
            ENTERPRISE CAREER SUITE
          </span>
          <h2 className="fw-bold text-dark mb-1">AI Career Roadmap Advisor</h2>
          <p className="text-muted mb-0 small">Dynamic, personalized learning checklists based on your database profile, quizzes, and course progress.</p>
        </div>

        {/* Executive Action Buttons */}
        {currentRoadmap && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button type="button" className="btn btn-outline-success btn-sm rounded-pill fw-bold px-3 shadow-xs" onClick={handleDownloadPDF}>
              <i className="bi bi-file-earmark-pdf me-1"></i>Download PDF
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill fw-bold px-3 shadow-xs" onClick={handleExportJSON}>
              <i className="bi bi-download me-1"></i>Export JSON
            </button>
            <button type="button" className="btn btn-success btn-sm rounded-pill fw-bold px-3 shadow-xs" onClick={handleRequestMentorReview}>
              <i className="bi bi-person-badge me-1"></i>Request Mentor Review
            </button>
          </div>
        )}
      </div>

      {/* Dismissible Notifications */}
      {mentorReviewSent && (
        <div className="alert alert-success border-0 rounded-4 mb-4 d-flex align-items-center justify-content-between gap-3 shadow-sm no-print">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill fs-5 text-success"></i>
            <div>
              <strong className="d-block">Mentor Review Request Sent!</strong>
              <span className="small">Your active roadmap and progress metrics have been shared with your mentor for feedback.</span>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={() => setMentorReviewSent(false)}></button>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger border-0 rounded-4 mb-4 d-flex align-items-center justify-content-between gap-3 shadow-sm no-print">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill fs-5 text-danger"></i>
            <div>
              <strong className="d-block">Roadmap Generation Error</strong>
              <span className="small">{errorMessage}</span>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={() => setErrorMessage(null)}></button>
        </div>
      )}

      <div className="row g-4 printable-roadmap-area">
        {/* Left Column: Settings, History, & Enterprise Analytics */}
        <div className="col-lg-4">
          {/* Generator Controls Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4 no-print">
            <h5 className="fw-bold text-dark mb-3">AI Roadmap Generator</h5>
            <p className="text-muted small mb-3">
              Evolve your current roadmap with completed progress, or generate a fresh roadmap from database updates.
            </p>
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-success w-100 rounded-pill fw-bold py-2 shadow-sm"
                onClick={handleImprove}
                disabled={loading || fetchingRoadmaps || !currentRoadmap}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Evolving Roadmap...
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-stars me-2"></i>Improve Existing Roadmap
                  </span>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-success w-100 rounded-pill fw-bold py-2"
                onClick={handleOpenTopicModal}
                disabled={loading || fetchingRoadmaps}
              >
                <i className="bi bi-magic me-2"></i>Generate Fresh Roadmap
              </button>
            </div>
          </div>

          {/* Today's Target & Weekly Goals Widget */}
          {currentRoadmap && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4 border-start border-4 border-success">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold text-dark mb-0">🎯 Today's Action Target</h6>
                <span className="badge bg-success-subtle text-success rounded-pill small">Daily Task</span>
              </div>
              <p className="text-dark small mb-3 fw-semibold bg-light p-3 rounded-3 border">
                {todaysTarget}
              </p>

              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-dark mb-0">📅 Weekly Goal</h6>
                <span className="badge bg-primary-subtle text-primary rounded-pill small">Weekly Pace</span>
              </div>
              <p className="text-muted small mb-0">
                {weeklyGoal}
              </p>
            </div>
          )}

          {/* Learning Analytics Widget */}
          {currentRoadmap && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h6 className="fw-bold text-dark mb-3">📊 Learning Analytics</h6>
              <div className="row g-2 text-center">
                <div className="col-6">
                  <div className="bg-light p-3 rounded-3 border">
                    <span className="text-muted text-xs d-block mb-1">Total Hours</span>
                    <strong className="text-dark fs-5">{totalStagesCount * 40} hrs</strong>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-light p-3 rounded-3 border">
                    <span className="text-muted text-xs d-block mb-1">Skills Mastered</span>
                    <strong className="text-success fs-5">{completedSkillsCount} / {allSkills.length}</strong>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-light p-3 rounded-3 border">
                    <span className="text-muted text-xs d-block mb-1">Stage Completion</span>
                    <strong className="text-primary fs-5">{completedStagesCount} / {totalStagesCount}</strong>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-light p-3 rounded-3 border">
                    <span className="text-muted text-xs d-block mb-1">Target Finish</span>
                    <strong className="text-dark small fw-bold d-block mt-1">{targetCompletionDate}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Certifications */}
          {currentRoadmap && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h6 className="fw-bold text-dark mb-3">🎓 Upcoming Certifications</h6>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-3 border">
                  <i className="bi bi-award-fill fs-4 text-warning"></i>
                  <div>
                    <strong className="d-block small text-dark">AWS Certified Developer</strong>
                    <span className="text-xs text-muted">Target Exam • Month 4</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-3 border">
                  <i className="bi bi-patch-check-fill fs-4 text-primary"></i>
                  <div>
                    <strong className="d-block small text-dark">Oracle SE Java Professional</strong>
                    <span className="text-xs text-muted">Target Exam • Month 6</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Roadmap History Sidebar */}
          {fetchingRoadmaps ? (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white no-print">
              <div className="placeholder-glow">
                <span className="placeholder col-6 mb-3 rounded"></span>
                <span className="placeholder col-12 py-3 mb-2 rounded-3"></span>
                <span className="placeholder col-12 py-3 rounded-3"></span>
              </div>
            </div>
          ) : roadmaps.length > 0 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white no-print">
              <h6 className="fw-bold text-dark mb-3">Roadmap History</h6>
              <div className="d-flex flex-column gap-2">
                {roadmaps.map((roadmap) => (
                  <button
                    key={roadmap.id}
                    className={`btn btn-sm rounded-3 text-start fw-semibold p-3 transition-all ${
                      currentRoadmap?.id === roadmap.id 
                        ? 'btn-success text-white shadow-xs' 
                        : 'btn-outline-success text-dark'
                    }`}
                    onClick={() => setCurrentRoadmap(roadmap)}
                  >
                    <div className="small text-truncate fw-bold">{roadmap.goal}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(roadmap.createdAt).toLocaleDateString()} • {roadmap.estimatedDuration}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visual Roadmap & Career Readiness Score Header */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            {fetchingRoadmaps || loading ? (
              /* Loading Skeletons */
              <div className="py-3">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="spinner-grow text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">
                      {loading ? 'AI is building your topic-focused roadmap...' : 'Fetching roadmap data...'}
                    </h6>
                    <span className="text-muted small">Analyzing profile, quizzes, and target topic context</span>
                  </div>
                </div>

                <div className="placeholder-glow">
                  <div className="card border-0 bg-light p-3 rounded-4 mb-4">
                    <span className="placeholder col-8 mb-2 py-2 rounded"></span>
                    <span className="placeholder col-4 py-1 rounded"></span>
                  </div>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="card border-0 p-3 mb-3 border rounded-4">
                      <span className="placeholder col-3 mb-2 py-1 rounded"></span>
                      <span className="placeholder col-6 mb-2 py-2 rounded"></span>
                      <span className="placeholder col-10 py-1 rounded"></span>
                    </div>
                  ))}
                </div>
              </div>
            ) : currentRoadmap ? (
              <>
                {/* Hero Summary Header & Career Readiness Gauge */}
                <div className="card border-0 bg-success-subtle p-4 rounded-4 mb-4 shadow-xs">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                    <div>
                      <span className="badge bg-success text-white rounded-pill mb-2 px-3 py-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                        🎯 Career Summary & Goal
                      </span>
                      <h4 className="fw-bold text-dark mb-1">{currentRoadmap.goal}</h4>
                      <div className="text-muted small">
                        <i className="bi bi-clock me-1"></i>Duration: <strong>{currentRoadmap.estimatedDuration}</strong> • Target Finish: <strong>{targetCompletionDate}</strong>
                      </div>
                    </div>

                    {/* Career Readiness Score Badge */}
                    <div className="card border-0 bg-white p-3 rounded-4 text-center shadow-xs">
                      <span className="text-xs text-muted font-bold text-uppercase d-block mb-1">Career Readiness</span>
                      <div className="display-6 fw-extrabold text-success mb-0">{readinessScore}%</div>
                      <span className="badge bg-success-subtle text-success rounded-pill small mt-1">{readinessLabel}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="small text-muted fw-bold">Roadmap Completion Progress</span>
                    <span className="small fw-bold text-success">{progressPercent}%</span>
                  </div>
                  <div className="progress rounded-pill bg-white" style={{ height: '10px' }}>
                    <div
                      className="progress-bar bg-success progress-bar-striped progress-bar-animated rounded-pill"
                      role="progressbar"
                      style={{ width: `${progressPercent}%` }}
                      aria-valuenow={progressPercent}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>

                {/* Timeline Stages */}
                <div className="position-relative ps-4" style={{ borderLeft: '3px dashed #bbdfd4', marginLeft: '12px' }}>
                  {currentRoadmap.stages.map((stage, index) => {
                    const status = (stage.status || 'PENDING').toUpperCase();
                    const isCompleted = status === 'COMPLETED';
                    const isInProgress = status === 'IN_PROGRESS';
                    const isUpdating = updatingStageIndex === index;
                    const { projects, interviewPrep, resources, certifications, general } = categorizeTopics(stage.recommendedTopics);

                    return (
                      <div key={index} className="position-relative mb-4">
                        {/* Circle Node Indicator */}
                        <div
                          className="position-absolute rounded-circle transition-all"
                          style={{
                            left: '-33px',
                            top: '12px',
                            width: '24px',
                            height: '24px',
                            background: isCompleted ? '#10b981' : isInProgress ? '#f59e0b' : '#ffffff',
                            border: `4px solid ${isCompleted ? '#10b981' : isInProgress ? '#f59e0b' : '#cbd5e1'}`,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isCompleted && <i className="bi bi-check-lg text-white font-bold" style={{ fontSize: '0.65rem' }}></i>}
                          {isInProgress && <i className="bi bi-play-fill text-white font-bold" style={{ fontSize: '0.65rem' }}></i>}
                        </div>

                        {/* Stage Card */}
                        <div
                          className={`card border-0 rounded-4 shadow-xs p-4 ms-2 transition-all ${
                            isCompleted ? 'bg-light border-success-subtle opacity-90' : isInProgress ? 'bg-white border-warning-subtle shadow-sm' : 'bg-white border'
                          }`}
                          style={{ border: '1px solid rgba(16, 185, 129, 0.12)' }}
                        >
                          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-success-subtle text-success rounded-pill fw-bold text-uppercase px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                Stage {index + 1} • {stage.estimatedDuration}
                              </span>
                            </div>

                            {/* Status Selector Buttons */}
                            <div className="btn-group btn-group-sm rounded-pill p-1 bg-light border no-print" role="group" aria-label="Stage Status">
                              <button
                                type="button"
                                className={`btn btn-xs rounded-pill px-2 py-1 font-weight-bold ${
                                  status === 'PENDING' ? 'btn-secondary text-white fw-bold shadow-xs' : 'btn-light text-muted'
                                }`}
                                onClick={() => handleStatusChange(index, 'PENDING')}
                                disabled={isUpdating}
                                style={{ fontSize: '0.7rem' }}
                              >
                                Pending
                              </button>
                              <button
                                type="button"
                                className={`btn btn-xs rounded-pill px-2 py-1 font-weight-bold ${
                                  status === 'IN_PROGRESS' ? 'btn-warning text-dark fw-bold shadow-xs' : 'btn-light text-muted'
                                }`}
                                onClick={() => handleStatusChange(index, 'IN_PROGRESS')}
                                disabled={isUpdating}
                                style={{ fontSize: '0.7rem' }}
                              >
                                {isUpdating ? 'Updating...' : 'In Progress'}
                              </button>
                              <button
                                type="button"
                                className={`btn btn-xs rounded-pill px-2 py-1 font-weight-bold ${
                                  status === 'COMPLETED' ? 'btn-success text-white fw-bold shadow-xs' : 'btn-light text-muted'
                                }`}
                                onClick={() => handleStatusChange(index, 'COMPLETED')}
                                disabled={isUpdating}
                                style={{ fontSize: '0.7rem' }}
                              >
                                Completed
                              </button>
                            </div>
                          </div>

                          <h5 className="fw-bold mb-2 text-dark">{stage.title}</h5>
                          
                          {/* Monthly Plan & Weekly Milestones */}
                          <div className="text-muted small mb-3 lh-sm" style={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
                            {stage.description}
                          </div>

                          {/* Technologies & Skills */}
                          {stage.skills && stage.skills.length > 0 && (
                            <div className="mb-3">
                              <div className="small text-dark fw-bold mb-1">
                                <i className="bi bi-code-slash text-success me-1"></i>Technologies & Skills:
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {stage.skills.map((skill, i) => (
                                  <span key={i} className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Projects Section */}
                          {projects.length > 0 && (
                            <div className="mb-3">
                              <div className="small text-dark fw-bold mb-1">
                                <i className="bi bi-folder-check text-primary me-1"></i>Hands-on Projects:
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {projects.map((proj, i) => (
                                  <span key={i} className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-3 px-2 py-1 small">
                                    🚀 {proj}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Interview Preparation */}
                          {interviewPrep.length > 0 && (
                            <div className="mb-3">
                              <div className="small text-dark fw-bold mb-1">
                                <i className="bi bi-chat-quote text-warning me-1"></i>Interview Preparation:
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {interviewPrep.map((prep, i) => (
                                  <span key={i} className="badge bg-warning-subtle text-dark border border-warning-subtle rounded-3 px-2 py-1 small">
                                    💡 {prep}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommended Resources */}
                          {resources.length > 0 && (
                            <div className="mb-3">
                              <div className="small text-dark fw-bold mb-1">
                                <i className="bi bi-book text-info me-1"></i>Recommended Resources:
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {resources.map((res, i) => (
                                  <span key={i} className="badge bg-info-subtle text-info border border-info-subtle rounded-3 px-2 py-1 small">
                                    📚 {res}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Certifications */}
                          {certifications.length > 0 && (
                            <div className="mb-3">
                              <div className="small text-dark fw-bold mb-1">
                                <i className="bi bi-award text-danger me-1"></i>Certifications:
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {certifications.map((cert, i) => (
                                  <span key={i} className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-3 px-2 py-1 small">
                                    🎓 {cert}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* General Topics */}
                          {general.length > 0 && (
                            <div>
                              <div className="small text-dark fw-bold mb-1">
                                <i className="bi bi-list-check me-1"></i>Recommended Topics:
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {general.map((topic, i) => (
                                  <span key={i} className="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1 small">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Clean Empty State */
              <div className="text-center py-5">
                <div className="mb-3">
                  <i className="bi bi-compass text-success" style={{ fontSize: '3.5rem' }}></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">No Enterprise Roadmap Found</h5>
                <p className="text-muted small max-w-md mx-auto mb-4" style={{ maxWidth: '400px' }}>
                  Generate your first enterprise AI Career Roadmap to get structured monthly plans, weekly goals, project milestones, interview prep, and career readiness analytics!
                </p>
                <button
                  type="button"
                  className="btn btn-success rounded-pill fw-bold px-4 py-2 shadow-sm"
                  onClick={handleOpenTopicModal}
                  disabled={loading}
                >
                  <i className="bi bi-magic me-2"></i>Generate Your AI Roadmap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Topic Selection Modal */}
      {showTopicModal && (
        <div className="modal fade show d-block no-print" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-success-subtle text-success rounded-circle">
                    <i className="bi bi-compass-fill fs-5"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Choose Roadmap Topic</h5>
                    <span className="text-muted text-xs">Which technology or domain would you like to master?</span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowTopicModal(false)}></button>
              </div>

              <div className="modal-body py-4">
                <label className="form-label text-dark fw-semibold small mb-2">Select a Popular Career Domain:</label>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {[
                    "Full Stack Web Development",
                    "AI & Machine Learning",
                    "Cloud Architecture & DevOps",
                    "Mobile App Development",
                    "Cybersecurity & Ethical Hacking",
                    "Data Engineering"
                  ].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 transition-all ${
                        selectedTopic === topic && !customTopic.trim()
                          ? 'btn-success text-white shadow-xs fw-bold'
                          : 'btn-outline-secondary text-dark'
                      }`}
                      onClick={() => {
                        setSelectedTopic(topic);
                        setCustomTopic('');
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark fw-semibold small">Or Enter a Custom Topic / Technology:</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 rounded-start-pill">
                      <i className="bi bi-pencil-square text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 rounded-end-pill py-2 text-dark"
                      placeholder="e.g., React Native, Blockchain, System Design..."
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                    />
                  </div>
                  <span className="text-muted text-xs ms-2 mt-1 d-block">
                    Topic focus: <strong>{customTopic.trim() ? customTopic.trim() : selectedTopic}</strong>
                  </span>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowTopicModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={handleConfirmGenerate}>
                  <i className="bi bi-magic me-2"></i>Generate Targeted Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
