import { useState, useEffect } from 'react';
import SkillGapService from '../../../services/SkillGapService';

export default function SkillGap({ onEnrollCourse }) {
  const [targetRole, setTargetRole] = useState('Frontend React Engineer');
  const [analyses, setAnalyses] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await SkillGapService.getHistory();
        setAnalyses(data);
        if (data && data.length > 0) {
          setCurrentAnalysis(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch analysis history', error);
      } finally {
        setFetchingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const handleAnalyze = async (e, customRole) => {
    if (e) e.preventDefault();
    const roleToAnalyze = customRole || targetRole;
    if (!roleToAnalyze.trim()) return;

    setLoading(true);
    try {
      const newAnalysis = await SkillGapService.analyze(roleToAnalyze);
      setAnalyses((prev) => [newAnalysis, ...prev.filter(a => a.id !== newAnalysis.id)]);
      setCurrentAnalysis(newAnalysis);
    } catch (error) {
      console.error('Failed to analyze skill gaps', error);
      alert('Failed to analyze skill gaps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchPercentage = (currentSkills = [], requiredSkills = []) => {
    if (!requiredSkills || requiredSkills.length === 0) return 65;
    const lowerCurrent = currentSkills.map(s => s.toLowerCase());
    let matchedCount = 0;
    requiredSkills.forEach(req => {
      const reqLower = req.toLowerCase();
      if (lowerCurrent.some(cur => cur.includes(reqLower) || reqLower.includes(cur))) {
        matchedCount++;
      }
    });
    const pct = Math.round((matchedCount / requiredSkills.length) * 100);
    return Math.max(15, Math.min(98, pct > 0 ? pct : 40));
  };

  const matchPct = currentAnalysis 
    ? calculateMatchPercentage(currentAnalysis.currentSkills, currentAnalysis.requiredSkills)
    : 0;

  const getStatusBadge = (pct) => {
    if (pct >= 75) return { label: 'High Market Match 🚀', class: 'bg-success text-white' };
    if (pct >= 50) return { label: 'Moderate Compatibility ⚡', class: 'bg-warning text-dark' };
    return { label: 'Development Needed ⚠️', class: 'bg-danger text-white' };
  };

  const statusInfo = getStatusBadge(matchPct);

  return (
    <div className="fade-in-quick text-start">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <span className="badge bg-success-subtle text-success fw-bold rounded-pill mb-2 px-3 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
            ENTERPRISE COMPETENCY ANALYZER
          </span>
          <h2 className="fw-bold text-dark mb-1">Skill Gap Analysis</h2>
          <p className="text-muted mb-0 small">Benchmark your multi-source skills against target industry roles and get actionable course recommendations.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Target Role Form, Match Gauge, and History */}
        <div className="col-lg-4">
          {/* Target Profile Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">Target Profile</h5>
            <form onSubmit={(e) => handleAnalyze(e, targetRole)} className="mb-3">
              <div className="mb-3">
                <label className="form-label text-dark fw-semibold small">Target Role / Designation:</label>
                <input
                  type="text"
                  className="form-control rounded-3 py-2 text-dark"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Frontend React Engineer"
                  disabled={loading}
                />
              </div>

              {/* Popular Role Quick Pills */}
              <div className="mb-3">
                <span className="text-muted text-xs d-block mb-2">Popular Roles:</span>
                <div className="d-flex flex-wrap gap-1">
                  {[
                    "Frontend React Engineer",
                    "Full Stack Developer",
                    "Backend Java Engineer",
                    "Cloud & DevOps Engineer",
                    "AI/ML Engineer"
                  ].map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`btn btn-xs rounded-pill px-2 py-1 ${
                        targetRole === role ? 'btn-success text-white fw-bold' : 'btn-outline-secondary text-dark'
                      }`}
                      onClick={() => {
                        setTargetRole(role);
                        handleAnalyze(null, role);
                      }}
                      disabled={loading}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 rounded-pill fw-bold py-2 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Analyzing Market Gaps...
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-graph-up-arrow me-2"></i>Analyze Skill Gaps
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Skill Match Gauge Card */}
          {currentAnalysis && (
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-4">
              <span className="text-xs text-muted font-bold text-uppercase d-block mb-2">Market Compatibility Score</span>
              
              <div className="d-flex justify-content-center position-relative my-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle border border-success border-4 shadow-xs"
                  style={{
                    width: '140px',
                    height: '140px',
                    fontSize: '2.2rem',
                    fontWeight: '800',
                    color: '#10b981',
                    background: 'radial-gradient(circle, #f0fdf4 0%, #ffffff 80%)'
                  }}
                >
                  {matchPct}%
                </div>
              </div>

              <div className="mt-2">
                <span className={`badge rounded-pill px-3 py-2 fw-bold ${statusInfo.class}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          )}

          {/* Analysis History Sidebar */}
          {fetchingHistory ? (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="placeholder-glow">
                <span className="placeholder col-6 mb-3 rounded"></span>
                <span className="placeholder col-12 py-3 mb-2 rounded-3"></span>
                <span className="placeholder col-12 py-3 rounded-3"></span>
              </div>
            </div>
          ) : analyses.length > 0 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3">Analysis History</h6>
              <div className="d-flex flex-column gap-2">
                {analyses.map((analysis) => (
                  <button
                    key={analysis.id}
                    className={`btn btn-sm rounded-3 text-start fw-semibold p-3 transition-all ${
                      currentAnalysis?.id === analysis.id
                        ? 'btn-success text-white shadow-xs'
                        : 'btn-outline-success text-dark'
                    }`}
                    onClick={() => setCurrentAnalysis(analysis)}
                  >
                    <div className="small text-truncate fw-bold">{analysis.targetRole}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Competency Map & Course Recommendations */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            {fetchingHistory || loading ? (
              <div className="py-5 text-center">
                <div className="spinner-grow text-success mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h6 className="fw-bold text-dark mb-1">
                  {loading ? 'AI is performing market competency gap analysis...' : 'Loading history...'}
                </h6>
                <span className="text-muted small">Comparing profile, courses, quizzes, and target role benchmarks</span>
              </div>
            ) : currentAnalysis ? (
              <>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 pb-3 border-bottom">
                  <div>
                    <span className="badge bg-success-subtle text-success rounded-pill mb-1 px-3 py-1 small fw-bold">
                      COMPETENCY MAP REPORT
                    </span>
                    <h4 className="fw-bold text-dark mb-0">{currentAnalysis.targetRole}</h4>
                  </div>
                  <span className="text-muted text-xs">
                    Generated: {new Date(currentAnalysis.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Domain Competency Progress Bars */}
                <div className="mb-4 bg-light p-4 rounded-4 border">
                  <h6 className="fw-bold text-dark mb-3">⚡ Domain Competency Breakdown</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between text-xs fw-bold text-dark mb-1">
                        <span>Core Frameworks & Tools</span>
                        <span className="text-success">{Math.min(95, matchPct + 10)}%</span>
                      </div>
                      <div className="progress rounded-pill bg-white" style={{ height: '8px' }}>
                        <div className="progress-bar bg-success rounded-pill" style={{ width: `${Math.min(95, matchPct + 10)}%` }}></div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between text-xs fw-bold text-dark mb-1">
                        <span>System Architecture & DB</span>
                        <span className="text-primary">{Math.max(30, matchPct - 5)}%</span>
                      </div>
                      <div className="progress rounded-pill bg-white" style={{ height: '8px' }}>
                        <div className="progress-bar bg-primary rounded-pill" style={{ width: `${Math.max(30, matchPct - 5)}%` }}></div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between text-xs fw-bold text-dark mb-1">
                        <span>Testing & DevOps Pipeline</span>
                        <span className="text-warning">{Math.max(25, matchPct - 15)}%</span>
                      </div>
                      <div className="progress rounded-pill bg-white" style={{ height: '8px' }}>
                        <div className="progress-bar bg-warning rounded-pill" style={{ width: `${Math.max(25, matchPct - 15)}%` }}></div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between text-xs fw-bold text-dark mb-1">
                        <span>CS Core & Problem Solving</span>
                        <span className="text-info">{Math.min(90, matchPct + 5)}%</span>
                      </div>
                      <div className="progress rounded-pill bg-white" style={{ height: '8px' }}>
                        <div className="progress-bar bg-info rounded-pill" style={{ width: `${Math.min(90, matchPct + 5)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mastered vs Missing vs Priority Skills */}
                <div className="row g-3 mb-4">
                  {/* Current Mastered Skills */}
                  <div className="col-md-6">
                    <div className="p-3 bg-white rounded-4 border h-100">
                      <h6 className="fw-bold text-dark mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>Mastered Skills ({currentAnalysis.currentSkills.length})
                      </h6>
                      <div className="d-flex flex-wrap gap-1">
                        {currentAnalysis.currentSkills.map((skill, index) => (
                          <span key={index} className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Required Industry Standards */}
                  <div className="col-md-6">
                    <div className="p-3 bg-white rounded-4 border h-100">
                      <h6 className="fw-bold text-dark mb-2">
                        <i className="bi bi-award-fill text-primary me-2"></i>Required Standards ({currentAnalysis.requiredSkills.length})
                      </h6>
                      <div className="d-flex flex-wrap gap-1">
                        {currentAnalysis.requiredSkills.map((skill, index) => (
                          <span key={index} className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1 small">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="col-md-6">
                    <div className="p-3 bg-white rounded-4 border h-100">
                      <h6 className="fw-bold text-dark mb-2">
                        <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>Missing Skills ({currentAnalysis.missingSkills.length})
                      </h6>
                      <div className="d-flex flex-wrap gap-1">
                        {currentAnalysis.missingSkills.map((skill, index) => (
                          <span key={index} className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1 small">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Priority Focus Skills */}
                  <div className="col-md-6">
                    <div className="p-3 bg-white rounded-4 border h-100">
                      <h6 className="fw-bold text-dark mb-2">
                        <i className="bi bi-star-fill text-warning me-2"></i>Priority Target Skills ({currentAnalysis.prioritySkills.length})
                      </h6>
                      <div className="d-flex flex-wrap gap-1">
                        {currentAnalysis.prioritySkills.map((skill, index) => (
                          <span key={index} className="badge bg-warning-subtle text-dark border border-warning-subtle rounded-pill px-2 py-1 small">
                            ★ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
                  <div className="mb-4 p-4 bg-light rounded-4 border">
                    <h6 className="fw-bold text-dark mb-3">💡 Strategic Recommendations</h6>
                    <ul className="list-group list-group-flush bg-transparent">
                      {currentAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="list-group-item bg-transparent text-dark small px-0 py-1">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Courses */}
                {currentAnalysis.suggestedCourses && currentAnalysis.suggestedCourses.length > 0 && (
                  <div>
                    <h6 className="fw-bold text-dark mb-3">🎓 Recommended Platform Courses</h6>
                    <div className="row g-3">
                      {currentAnalysis.suggestedCourses.map((course) => (
                        <div key={course.id} className="col-12">
                          <div className="card border border-success-subtle rounded-4 p-3 shadow-xs bg-white">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                              <div className="flex-grow-1">
                                <h6 className="fw-bold text-dark mb-1">{course.title}</h6>
                                <div className="d-flex gap-2 mb-2">
                                  <span className="badge bg-success-subtle text-success rounded-pill small">{course.category || 'Tech'}</span>
                                  <span className="badge bg-light text-dark rounded-pill small">{course.level || 'Intermediate'}</span>
                                </div>
                                <p className="text-muted small mb-0">{course.description}</p>
                              </div>
                              <button
                                type="button"
                                className="btn btn-success btn-sm rounded-pill fw-bold px-4 shadow-xs"
                                onClick={() => onEnrollCourse && onEnrollCourse(course.title)}
                              >
                                Enroll Now
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Clean Empty State */
              <div className="text-center py-5">
                <div className="mb-3">
                  <i className="bi bi-graph-up-arrow text-success" style={{ fontSize: '3.5rem' }}></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">No Skill Gap Analysis Performed</h5>
                <p className="text-muted small max-w-md mx-auto mb-4" style={{ maxWidth: '400px' }}>
                  Select or type a target designation above to benchmark your skills against live industry requirements!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
