import { useState, useEffect } from 'react';
import AdminService from '../../../services/AdminService';

export default function ComplaintManagement({ onShowToast }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('RESOLVED');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getComplaints();
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to load complaints', err);
      onShowToast?.('error', 'Failed to fetch complaints from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setStatus(complaint.status || 'RESOLVED');
    setAssignedTo(complaint.assignedTo || '');
    setNotes(complaint.resolutionNotes || '');
    setShowModal(true);
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await AdminService.updateComplaint(selectedComplaint.id, {
        status,
        assignedTo,
        resolutionNotes: notes
      });
      onShowToast?.('success', `Complaint #${selectedComplaint.id} updated to ${status}`);
      setShowModal(false);
      fetchComplaints();
    } catch (err) {
      console.error('Failed to update complaint', err);
      onShowToast?.('error', 'Failed to update complaint');
    }
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Support Complaint Desk</h2>
          <p className="text-muted mb-0">Review, assign, resolve, reject, or close student technical and curriculum complaints.</p>
        </div>
        <button className="btn btn-outline-primary rounded-pill btn-sm" onClick={fetchComplaints}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
        <h5 className="fw-bold text-dark mb-4">Platform Complaints</h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading complaints from MySQL...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-5 text-muted">No student complaints found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead>
                <tr className="text-muted small border-bottom">
                  <th>ID / Date</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Subject & Details</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong className="text-dark small">#{c.id}</strong>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recently'}
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark small">{c.student?.fullName || 'Student'}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{c.student?.email}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark rounded-pill fw-normal" style={{ fontSize: '0.7rem' }}>
                        {c.category || 'GENERAL'}
                      </span>
                    </td>
                    <td>
                      <h6 className="fw-bold text-dark mb-1 small">{c.subject}</h6>
                      <p className="text-muted small mb-0" style={{ maxWidth: '280px', fontSize: '0.75rem' }}>{c.description}</p>
                    </td>
                    <td>
                      <span className="small text-muted">{c.assignedTo || 'Unassigned'}</span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill fw-bold text-uppercase ${
                        c.status === 'RESOLVED' || c.status === 'Resolved' ? 'bg-success-subtle text-success' :
                        c.status === 'REJECTED' || c.status === 'Rejected' ? 'bg-danger-subtle text-danger' :
                        c.status === 'IN_PROGRESS' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleOpenModal(c)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedComplaint && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <form onSubmit={handleUpdateComplaint}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Manage Complaint #{selectedComplaint.id}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body text-start">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Subject</label>
                    <input type="text" className="form-control" value={selectedComplaint.subject} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Status Action</label>
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="PENDING">Pending</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Assigned Staff / Admin</label>
                    <input type="text" className="form-control" placeholder="e.g. Admin Support" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Resolution Notes / Response</label>
                    <textarea className="form-control" rows={3} placeholder="Notes sent to student..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4">Update Ticket</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
