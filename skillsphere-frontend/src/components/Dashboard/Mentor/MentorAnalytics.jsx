import { useState } from 'react';

export default function MentorAnalytics() {
  const [metrics] = useState({
    totalStudents: 69,
    avgRating: 4.9,
    sessionsBooked: 8,
    completionRate: 72
  });

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Mentor Analytics Overview</h2>
        <p className="text-muted">Analyze student acquisition, rating history, and modular completions.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white border">
            <div className="fs-1 mb-2">👥</div>
            <div className="text-muted small">Total Students</div>
            <div className="fs-3 fw-bold text-dark">{metrics.totalStudents}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white border">
            <div className="fs-1 mb-2">⭐</div>
            <div className="text-muted small">Average Rating</div>
            <div className="fs-3 fw-bold text-dark">{metrics.avgRating} / 5.0</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white border">
            <div className="fs-1 mb-2">📅</div>
            <div className="text-muted small">Scheduled Calls</div>
            <div className="fs-3 fw-bold text-dark">{metrics.sessionsBooked} Sessions</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white border">
            <div className="fs-1 mb-2">🎯</div>
            <div className="text-muted small">Average Progress</div>
            <div className="fs-3 fw-bold text-dark">{metrics.completionRate}%</div>
          </div>
        </div>
      </div>

      {/* Graphical logs placeholder */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
            <h5 className="fw-bold text-dark mb-4">Student Activity & Attendance (Weekly log)</h5>
            <div className="d-flex align-items-end gap-3 justify-content-between pt-5 px-3" style={{ height: '220px' }}>
              {[
                { label: 'Mon', h: '30%' },
                { label: 'Tue', h: '60%' },
                { label: 'Wed', h: '85%' },
                { label: 'Thu', h: '40%' },
                { label: 'Fri', h: '95%' },
                { label: 'Sat', h: '20%' },
                { label: 'Sun', h: '10%' }
              ].map((bar, idx) => (
                <div key={idx} className="d-flex flex-column align-items-center flex-grow-1">
                  <div 
                    className="w-100 bg-success rounded-top" 
                    style={{ height: bar.h, minHeight: '10px', background: 'linear-gradient(to top, #10b981, #34d399)' }}
                  />
                  <span className="text-muted small mt-2" style={{ fontSize: '0.75rem' }}>{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
            <h5 className="fw-bold text-dark mb-3">Feedback Sentiment</h5>
            <div className="d-flex flex-column gap-3 mt-4">
              <div>
                <div className="d-flex justify-content-between mb-1 small text-muted">
                  <span>Positive (4-5 stars)</span>
                  <span className="fw-bold text-dark">92%</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '6px' }}><div className="progress-bar bg-success" style={{ width: '92%' }}></div></div>
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1 small text-muted">
                  <span>Neutral (3 stars)</span>
                  <span className="fw-bold text-dark">6%</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '6px' }}><div className="progress-bar bg-warning" style={{ width: '6%' }}></div></div>
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1 small text-muted">
                  <span>Negative (1-2 stars)</span>
                  <span className="fw-bold text-dark">2%</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '6px' }}><div className="progress-bar bg-danger" style={{ width: '2%' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
