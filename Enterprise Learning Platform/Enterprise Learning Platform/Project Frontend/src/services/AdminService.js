import apiClient from '../api/apiClient';

const AdminService = {
  getAllUsers() {
    return apiClient.get('/api/admin/users');
  },

  getAllUsersDetails() {
    return apiClient.get('/api/admin/users/details');
  },

  updateUserRole(userId, role) {
    return apiClient.put(`/api/admin/users/${userId}/role`, { role });
  },

  bulkUpdateUserRoles(userIds, role) {
    return apiClient.put('/api/admin/users/bulk-role', { userIds, role });
  },

  updateUserStatus(userId, status, enabled) {
    return apiClient.put(`/api/admin/users/${userId}/status`, { status, enabled });
  },

  resetUserPassword(userId, newPassword) {
    return apiClient.put(`/api/admin/users/${userId}/reset-password`, { newPassword });
  },

  editUser(userId, data) {
    return apiClient.put(`/api/admin/users/${userId}/edit`, data);
  },

  deleteUser(userId) {
    return apiClient.delete(`/api/admin/users/${userId}`);
  },

  getAuditLogs() {
    return apiClient.get('/api/admin/audit-logs');
  },

  getComplaints() {
    return apiClient.get('/api/admin/complaints');
  },

  updateComplaint(id, data) {
    return apiClient.put(`/api/admin/complaints/${id}`, data);
  },

  getSettings() {
    return apiClient.get('/api/admin/settings');
  },

  updateSettings(settings) {
    return apiClient.put('/api/admin/settings', settings);
  },

  getAnalyticsDetails() {
    return apiClient.get('/api/admin/analytics/details');
  },

  approveCourse(id) {
    return apiClient.put(`/api/admin/courses/${id}/approve`);
  },

  rejectCourse(id, reason) {
    return apiClient.put(`/api/admin/courses/${id}/reject`, { reason });
  },

  requestChanges(id, reason) {
    return apiClient.put(`/api/admin/courses/${id}/request-changes`, { reason });
  },

  publishCourse(id) {
    return apiClient.put(`/api/admin/courses/${id}/publish`);
  },

  archiveCourse(id) {
    return apiClient.put(`/api/admin/courses/${id}/archive`);
  },

  getCourseReviewById(id) {
    return apiClient.get(`/api/admin/courses/${id}`);
  }
};

export default AdminService;
