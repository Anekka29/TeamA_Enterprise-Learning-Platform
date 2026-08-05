import { useState } from 'react';

const INITIAL_ATTENDANCE = [
  { id: 'st1', name: 'Rahul Sharma', email: 'rahul@skillsphere.com', lectures: 14, total: 15, progress: 85, attendedToday: true },
  { id: 'st2', name: 'Pooja Sen', email: 'pooja@skillsphere.com', lectures: 15, total: 15, progress: 100, attendedToday: true },
  { id: 'st3', name: 'Aarav Gupta', email: 'aarav@skillsphere.com', lectures: 11, total: 15, progress: 50, attendedToday: false }
];

export default function AttendanceTracker() {
  const [records, setRecords] = useState(INITIAL_ATTENDANCE);

  const toggleAttended = (id) => {
    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        const nextAttended = !r.attendedToday;
        return {
          ...r,
          attendedToday: nextAttended,
          lectures: nextAttended ? r.lectures + 1 : r.lectures - 1
        };
      }
      return r;
    }));
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Attendance Ledger & Student Analytics</h2>
        <p className="text-muted">Monitor student progress benchmarks, log classroom attendance, and trace curriculum completion curves.</p>
      </div>

      <div className="row g-4">
        {/* Attendance ledger */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
            <h5 className="fw-bold text-dark mb-4">Classroom Roster ({new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })})</h5>
            
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    <th>Student Details</th>
                    <th>Course Completion</th>
                    <th>Attendance Ratio</th>
                    <th className="text-center">Attended Today</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td>
                        <span className="fw-bold text-dark small">{r.name}</span>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{r.email}</div>
                      </td>
                      <td style={{ width: '250px' }}>
                        <div className="d-flex align-items-center gap-3">
                          <div className="progress rounded-pill flex-grow-1" style={{ height: '6px' }}>
                            <div className="progress-bar bg-success" style={{ width: `${r.progress}%` }}></div>
                          </div>
                          <span className="fw-bold text-dark small" style={{ fontSize: '0.75rem' }}>{r.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-dark small">{r.lectures} / {r.total} sessions</span>
                        <span className="text-muted small ms-2">({Math.round((r.lectures/r.total)*100)}%)</span>
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input text-success cursor-pointer"
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          checked={r.attendedToday}
                          onChange={() => toggleAttended(r.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
