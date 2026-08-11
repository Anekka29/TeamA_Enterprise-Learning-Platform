import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../constants/api';

const UserService = {
  /**
   * Get current authenticated user's profile
   */
  getCurrentUser() {
    return apiClient.get(API_ENDPOINTS.CURRENT_USER);
  },
};

export default UserService;
