import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';
import AdminService from '../services/AdminService';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import '../styles/admin-role-management.css';

export default function AdminRoleManagement() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [processingUsers, setProcessingUsers] = useState(new Set());

  const [stats, setStats] = useState({ total: 0, students: 0, mentors: 0, admins: 0 });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    AdminService.getAllUsers()
      .then(res => {
        const data = res.data;
        setUsers(data);
        applyFilters(data, searchQuery, roleFilter);
        // Compute stats
        setStats({
          total: data.length,
          students: data.filter(u => u.role === 'STUDENT').length,
          mentors: data.filter(u => u.role === 'MENTOR').length,
          admins: data.filter(u => u.role === 'ADMIN').length,
        });
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const applyFilters = (data, query, filter) => {
    let result = [...data];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(u =>
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q)
      );
    }
    if (filter !== 'ALL') {
      result = result.filter(u => u.role === filter);
    }
    setFilteredUsers(result);
  };

  useEffect(() => {
    applyFilters(users, searchQuery, roleFilter);
  }, [searchQuery, roleFilter, users]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
  };

  const handlePromoteRole = async (userId, newRole) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    try {
      await AdminService.updateUserRole(userId, newRole);
      showAlert('success', `User role updated to ${newRole} successfully.`);
      fetchUsers();
    } catch {
      showAlert('error', 'Failed to update role. Please try again.');
    } finally {
      setProcessingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate(ROUTES.HOME);
  };

  const getRoleBadgeClass = (role) => {
    const map = { ADMIN: 'admin', MENTOR: 'mentor', STUDENT: 'student', USER: 'user' };
    return map[role] || 'user';
  };

  const getAvailableRoles = (currentRole) => {
    const allRoles = ['STUDENT', 'MENTOR', 'ADMIN'];
    return allRoles.filter(r => r !== currentRole);
  };

  const getInitials = (user) => {
    if (user.fullName) {
      const parts = user.fullName.trim().split(' ');
      return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
    }
    return (user.email || 'U').charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Navbar */}
      <nav className="admin-navbar">
        <a className="admin-navbar-brand" href="#">
          <img src={logoImg} alt="SkillSphere Nexus" />
        </a>
        <div className="admin-nav-right">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="admin-nav-link">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </nav>

      <div className="admin-content">
        {/* Page header */}
        <div className="page-header">
          <h1><i className="bi bi-people-fill me-2"></i>User Role Management</h1>
          <p>Manage user roles and permissions across the SkillSphere Nexus platform.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users"><i className="bi bi-people-fill"></i></div>
            <div className="stat-info"><h3 id="totalUsers">{stats.total}</h3><p>Total Users</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentors"><i className="bi bi-person-check-fill"></i></div>
            <div className="stat-info"><h3 id="totalMentors">{stats.mentors}</h3><p>Mentors</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon admins"><i className="bi bi-shield-check"></i></div>
            <div className="stat-info"><h3 id="totalAdmins">{stats.admins}</h3><p>Admins</p></div>
          </div>
        </div>

        {/* Alert */}
        <div className={`alert-custom ${alert.type}${alert.show ? ' show' : ''}`} id="alertMessage">
          <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
          <span id="alertText">{alert.message}</span>
        </div>

        {/* Search and filter */}
        <div className="search-filter-bar">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text" id="searchInput" placeholder="Search users by name, email, or username..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            id="roleFilter"
            className="filter-select"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="MENTOR">Mentor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="users-table-card">
          <div className="table-header">
            <h2>Users</h2>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
              {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="table-responsive">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <h3>Failed to load users</h3>
                <p>Please refresh the page to try again.</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-search"></i>
                <h3>No users found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <table className="admin-table" id="usersTable">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Username</th>
                    <th>Current Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="usersTableBody">
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">{getInitials(u)}</div>
                          <div className="user-details">
                            <h4>{u.fullName || 'N/A'}</h4>
                            <p>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.7)' }}>@{u.username || 'N/A'}</td>
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>{u.role}</span>
                      </td>
                      <td>
                        <div className="role-actions">
                          {getAvailableRoles(u.role).map(role => (
                            <button
                              key={role}
                              className={`role-btn${role === 'MENTOR' ? ' promote' : ''}`}
                              disabled={processingUsers.has(u.id)}
                              onClick={() => handlePromoteRole(u.id, role)}
                            >
                              {processingUsers.has(u.id) ? (
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              ) : null}
                              Make {role.charAt(0) + role.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
