import { useState, useEffect } from 'react';
import AdminService from '../../../services/AdminService';

export default function UserManagement({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({ fullName: '', username: '', email: '', phoneNumber: '', college: '', department: '', year: '' });
  const [newPassword, setNewPassword] = useState('');
  const getErrorMessage = (err, fallback) =>
    err?.message || err?.response?.data?.message || err?.response?.message || fallback;

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [bulkRole, setBulkRole] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getAllUsersDetails();
      const data = res.data || [];
      setUsers(data);
      setSelectedUserIds((prev) => prev.filter((id) => data.some((u) => u.id === id)));
    } catch (err) {
      console.error('Failed to load users', err);
      onShowToast?.('error', 'Failed to fetch users from MySQL backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Deactivated' : 'Active';
    const nextEnabled = user.status !== 'Active';
    try {
      await AdminService.updateUserStatus(user.id, nextStatus, nextEnabled);
      onShowToast?.('success', `User ${user.email} status updated to ${nextStatus}`);
      fetchUsers();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update user status');
      onShowToast?.('error', msg);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.email}? This action is permanent.`)) {
      return;
    }
    try {
      await AdminService.deleteUser(user.id);
      onShowToast?.('success', `User ${user.email} deleted successfully`);
      fetchUsers();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to delete user');
      onShowToast?.('error', msg);
    }
  };

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

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      college: user.college || '',
      department: user.department || '',
      year: user.year || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await AdminService.editUser(selectedUser.id, editForm);
      onShowToast?.('success', 'User details updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to edit user details');
      onShowToast?.('error', msg);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      onShowToast?.('warning', 'Password must be at least 6 characters');
      return;
    }
    try {
      await AdminService.resetUserPassword(selectedUser.id, newPassword);
      onShowToast?.('success', `Password reset successfully for ${selectedUser.email}`);
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to reset password');
      onShowToast?.('error', msg);
    }
  };

  const handleToggleSelect = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAll = (filteredItems) => {
    const allSelected = filteredItems.length > 0 && filteredItems.every((u) => selectedUserIds.includes(u.id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !filteredItems.some((u) => u.id === id)));
    } else {
      const itemIds = filteredItems.map((u) => u.id);
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  const handleBulkRoleUpdate = async (targetUserList) => {
    if (!bulkRole) {
      onShowToast?.('warning', 'Select a target role for the bulk update');
      return;
    }

    const targetUserIds = targetUserList
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

  // Filter & Search logic
  let filtered = users.filter((u) => {
    const matchesSearch =
      (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phoneNumber || '').toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sorting logic
  filtered.sort((a, b) => {
    let valA = a.fullName || '';
    let valB = b.fullName || '';
    if (sortBy === 'email') { valA = a.email || ''; valB = b.email || ''; }
    if (sortBy === 'role') { valA = a.role || ''; valB = b.role || ''; }
    if (sortBy === 'date') { valA = a.createdAt || ''; valB = b.createdAt || ''; }

    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="fade-in-quick text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">User Management</h2>
          <p className="text-muted mb-0">Manage platform users, roles, statuses, and credentials with direct MySQL persistence.</p>
        </div>
        <button className="btn btn-outline-primary rounded-pill btn-sm" onClick={fetchUsers}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
        {/* Controls Bar */}
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-0"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control bg-light border-0"
                placeholder="Search name, email, username, phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select bg-light border-0" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="MENTOR">Mentor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select bg-light border-0" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select bg-light border-0" value={`${sortBy}-${sortDir}`} onChange={(e) => {
              const [b, d] = e.target.value.split('-');
              setSortBy(b); setSortDir(d);
            }}>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="date-desc">Newest First</option>
              <option value="role-asc">Role</option>
            </select>
          </div>
        </div>

        {/* Bulk Role Update Action Bar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-3 bg-light rounded-3 mb-4 border">
          <div className="small fw-semibold text-muted">
            <i className="bi bi-check2-square text-primary me-1"></i>
            {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
          </div>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm bg-white border rounded-pill"
              style={{ maxWidth: '160px' }}
              value={bulkRole}
              onChange={(e) => setBulkRole(e.target.value)}
            >
              <option value="">Bulk target role...</option>
              <option value="STUDENT">Student</option>
              <option value="MENTOR">Mentor</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
              onClick={() => handleBulkRoleUpdate(filtered)}
              disabled={bulkUpdating || selectedUserIds.length === 0 || !bulkRole}
            >
              {bulkUpdating ? 'Updating...' : 'Apply Bulk Role Update'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading users from MySQL...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-people fs-1 text-secondary mb-2 d-block"></i>
            No users match the search criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead>
                <tr className="text-muted small border-bottom">
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUserIds.includes(u.id))}
                      onChange={() => handleToggleSelectAll(paginatedUsers)}
                    />
                  </th>
                  <th>User Profile</th>
                  <th>Username / Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Completion</th>
                  <th>Registration</th>
                  <th>Last Login</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedUserIds.includes(u.id)}
                        onChange={() => handleToggleSelect(u.id)}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'User')}&background=6366f1&color=fff`}
                          alt={u.fullName}
                          className="rounded-circle"
                          style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold text-dark small">{u.fullName || 'Unnamed'}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small fw-semibold">{u.username || '—'}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.phoneNumber || 'No Phone'}</div>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm border-0 bg-light rounded-pill fw-bold text-uppercase"
                        style={{ fontSize: '0.7rem', width: '110px' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="MENTOR">Mentor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge rounded-pill fw-bold text-uppercase ${
                        u.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2" style={{ width: '100px' }}>
                        <div className="progress flex-grow-1" style={{ height: '6px' }}>
                          <div className="progress-bar bg-info" style={{ width: `${u.profileCompletionPercentage ?? 50}%` }}></div>
                        </div>
                        <span className="small text-muted" style={{ fontSize: '0.7rem' }}>{u.profileCompletionPercentage ?? 50}%</span>
                      </div>
                    </td>
                    <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-info rounded-circle" title="View Profile" onClick={() => { setSelectedUser(u); setShowViewModal(true); }}>
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="btn btn-outline-primary rounded-circle" title="Edit Details" onClick={() => handleOpenEdit(u)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-warning rounded-circle" title="Reset Password" onClick={() => { setSelectedUser(u); setShowPasswordModal(true); }}>
                          <i className="bi bi-key"></i>
                        </button>
                        <button className={`btn ${u.status === 'Active' ? 'btn-outline-secondary' : 'btn-outline-success'} rounded-circle`} title={u.status === 'Active' ? 'Deactivate' : 'Activate'} onClick={() => handleToggleStatus(u)}>
                          <i className={`bi ${u.status === 'Active' ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                        </button>
                        <button className="btn btn-outline-danger rounded-circle" title="Delete User" onClick={() => handleDeleteUser(u)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <span className="small text-muted">Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries</span>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(c => c - 1)}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(c => c + 1)}>Next</button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">User Details</h5>
                <button className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body text-start">
                <div className="text-center mb-3">
                  <img src={selectedUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.fullName)}&background=6366f1&color=fff`} className="rounded-circle mb-2" style={{ width: '80px', height: '80px', objectFit: 'cover' }} alt="" />
                  <h4 className="fw-bold mb-0">{selectedUser.fullName}</h4>
                  <span className="badge bg-primary-subtle text-primary rounded-pill">{selectedUser.role}</span>
                </div>
                <div className="row g-2 small">
                  <div className="col-6"><strong>Email:</strong> {selectedUser.email}</div>
                  <div className="col-6"><strong>Username:</strong> {selectedUser.username || 'N/A'}</div>
                  <div className="col-6"><strong>Phone:</strong> {selectedUser.phoneNumber || 'N/A'}</div>
                  <div className="col-6"><strong>College:</strong> {selectedUser.college || 'N/A'}</div>
                  <div className="col-6"><strong>Department:</strong> {selectedUser.department || 'N/A'}</div>
                  <div className="col-6"><strong>Year:</strong> {selectedUser.year || 'N/A'}</div>
                  <div className="col-6"><strong>Registration:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</div>
                  <div className="col-6"><strong>Last Login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <form onSubmit={handleSaveEdit}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Edit User</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body text-start">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Full Name</label>
                    <input type="text" className="form-control" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email</label>
                    <input type="email" className="form-control" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Phone Number</label>
                    <input type="text" className="form-control" value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
                  </div>
                  <div className="row g-2">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">College</label>
                      <input type="text" className="form-control" value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Department</label>
                      <input type="text" className="form-control" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showPasswordModal && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Reset Password</h5>
                  <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
                </div>
                <div className="modal-body text-start">
                  <p className="small text-muted mb-3">Set new password for <strong>{selectedUser.email}</strong>.</p>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">New Password</label>
                    <input type="password" className="form-control" placeholder="Enter at least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning rounded-pill px-4">Reset Password</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
