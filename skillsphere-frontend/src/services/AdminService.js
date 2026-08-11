import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../constants/api';

const AdminService = {
  /**
   * Get all users (admin only)
   */
  getAllUsers() {
    return apiClient.get(API_ENDPOINTS.ADMIN_USERS);
  },

  /**
   * Update user role (admin only)
   * @param {number} userId
   * @param {string} role - New role string e.g. 'MENTOR', 'ADMIN'
   */
  updateUserRole(userId, role) {
    return apiClient.put(API_ENDPOINTS.ADMIN_USER_ROLE(userId), { role });
  },
};

export default AdminService;
