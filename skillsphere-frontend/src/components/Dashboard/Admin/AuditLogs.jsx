import { useState, useEffect } from 'react';
import AdminService from '../../../services/AdminService';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getAuditLogs();
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="fade-in-quick text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Security Audit Logs</h2>
          <p className="text-muted mb-0">Real-time persistent audit trail stored in MySQL for all administrative actions.</p>
        </div>
        <button className="btn btn-outline-primary rounded-pill btn-sm" onClick={fetchAuditLogs}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
        <h5 className="fw-bold text-dark mb-4">Transactional Audit Ledger</h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Fetching audit logs from MySQL...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-shield-check fs-1 text-success mb-2 d-block"></i>
            No audit logs recorded yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle font-monospace" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  <th>Timestamp</th>
                  <th>Action Type</th>
                  <th>Operation Details</th>
                  <th>Admin Account</th>
                  <th>Target User / Course</th>
                  <th className="text-end">Client IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="text-dark small">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill fw-bold text-uppercase ${
                        log.action?.includes('CHANGE') || log.action?.includes('UPDATE') ? 'bg-warning-subtle text-warning' :
                        log.action?.includes('APPROVED') || log.action?.includes('SUCCESS') ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                      }`} style={{ fontSize: '0.6rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{log.details || '—'}</span>
                    </td>
                    <td>
                      <span className="text-dark small">{log.adminEmail}</span>
                    </td>
                    <td>
                      <span className="small text-muted">{log.targetUser || log.targetCourse || '—'}</span>
                    </td>
                    <td className="text-end text-muted">
                      {log.ipAddress || '127.0.0.1'}
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
