import { useState, useEffect } from 'react';
import AdminService from '../../../services/AdminService';

export default function RoleManagement({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [bulkRole, setBulkRole] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const getErrorMessage = (err, fallback) =>
    err?.message || err?.response?.data?.message || err?.response?.message || fallback;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getAllUsersDetails();
      const data = res.data || [];
      setUsers(data);
      setSelectedUserIds((prev) => prev.filter((id) => data.some((user) => user.id === id)));
    } catch (err) {
      console.error('Failed to load role directory', err);
      onShowToast?.('error', getErrorMessage(err, 'Failed to load user directory from backend'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (user, newRole) => {
    try {
      await AdminService.updateUserRole(user.id, newRole);
      onShowToast?.('success', `User ${user.email} role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update role');
      onShowToast?.('error', msg);
    }
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Deactivated' : 'Active';
    const nextEnabled = user.status !== 'Active';
    try {
      await AdminService.updateUserStatus(user.id, nextStatus, nextEnabled);
      onShowToast?.('info', `User ${user.email} status set to ${nextStatus}`);
      fetchUsers();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update status');
      onShowToast?.('error', msg);
    }
  };

  const filtered = users.filter((u) =>
    (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const allFilteredSelected = filtered.length > 0 && filtered.every((user) => selectedUserIds.includes(user.id));

  const handleToggleSelect = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !filtered.some((user) => user.id === id)));
      return;
    }

    const filteredIds = filtered.map((user) => user.id);
    setSelectedUserIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleBulkRoleUpdate = async () => {
    if (!bulkRole) {
      onShowToast?.('warning', 'Select a target role for the bulk update');
      return;
    }

    const targetUserIds = filtered
      .filter((user) => selectedUserIds.includes(user.id) && user.role !== bulkRole)
      .map((user) => user.id);

    if (targetUserIds.length === 0) {
      onShowToast?.('warning', 'Select at least one user with a different role');
      return;
    }

    setBulkUpdating(true);
    try {
      const res = await AdminService.bulkUpdateUserRoles(targetUserIds, bulkRole);
      onShowToast?.('success', res.data?.message || `${targetUserIds.length} user roles updated successfully!`);
      setBulkRole('');
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to perform bulk role update');
      onShowToast?.('error', msg);
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Role & Access Control Management</h2>
          <p className="text-muted mb-0">Promote students to mentors, assign system administrators, suspend access, and enforce governance rules.</p>
        </div>
        <button className="btn btn-outline-primary rounded-pill btn-sm" onClick={fetchUsers}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
        <div className="row g-3 mb-3">
          <div className="col-lg-6">
            <input
              type="text"
              className="form-control rounded-pill bg-light border-0"
              placeholder="Filter by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-lg-6">
            <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
              <span className="badge text-bg-light rounded-pill align-self-center px-3 py-2">
                {selectedUserIds.length} selected
              </span>
              <select
                className="form-select bg-light border-0 rounded-pill"
                style={{ maxWidth: '180px' }}
                value={bulkRole}
                onChange={(e) => setBulkRole(e.target.value)}
              >
                <option value="">Bulk role</option>
                <option value="STUDENT">Student</option>
                <option value="MENTOR">Mentor</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                className="btn btn-outline-primary rounded-pill"
                onClick={handleBulkRoleUpdate}
                disabled={bulkUpdating || selectedUserIds.length === 0 || !bulkRole}
              >
                {bulkUpdating ? 'Applying...' : 'Apply Bulk Update'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading role matrix from MySQL...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">No users found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead>
                <tr className="text-muted small border-bottom">
                  <th style={{ width: '44px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={allFilteredSelected}
                      onChange={handleToggleSelectAll}
                      aria-label="Select all users"
                    />
                  </th>
                  <th>User Profile</th>
                  <th>Current Role</th>
                  <th>Status</th>
                  <th>Promote / Demote</th>
                  <th className="text-end">Account Control</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedUserIds.includes(u.id)}
                        onChange={() => handleToggleSelect(u.id)}
                        aria-label={`Select ${u.email}`}
                      />
                    </td>
                    <td>
                      <div className="fw-bold text-dark small">{u.fullName || u.username || 'User'}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill fw-bold text-uppercase ${
                        u.role === 'ADMIN' ? 'bg-danger-subtle text-danger' :
                        u.role === 'MENTOR' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill fw-bold text-uppercase ${
                        u.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {u.role === 'STUDENT' && (
                          <button className="btn btn-outline-primary rounded-pill btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => handleRoleChange(u, 'MENTOR')}>
                            Promote to Mentor
                          </button>
                        )}
                        {u.role === 'MENTOR' && (
                          <>
                            <button className="btn btn-outline-success rounded-pill btn-sm me-1" style={{ fontSize: '0.7rem' }} onClick={() => handleRoleChange(u, 'ADMIN')}>
                              Promote to Admin
                            </button>
                            <button className="btn btn-outline-secondary rounded-pill btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => handleRoleChange(u, 'STUDENT')}>
                              Demote to Student
                            </button>
                          </>
                        )}
                        {u.role === 'ADMIN' && (
                          <button className="btn btn-outline-warning rounded-pill btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => handleRoleChange(u, 'MENTOR')}>
                            Demote to Mentor
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm rounded-pill fw-bold ${u.status === 'Active' ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                        style={{ fontSize: '0.7rem' }}
                        onClick={() => handleStatusToggle(u)}
                      >
                        {u.status === 'Active' ? 'Suspend Access' : 'Reactivate Access'}
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
