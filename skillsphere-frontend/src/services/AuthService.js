import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../constants/api';

const AuthService = {
  /**
   * Login with email and password
   * @returns {Promise} { token, email, role }
   */
  login(email, password) {
    return apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
  },

  /**
   * Register a new student account
   */
  register(payload) {
    return apiClient.post(API_ENDPOINTS.REGISTER, payload);
  },

  forgotPassword(email) {
    return apiClient.post('/api/auth/forgot-password', { email });
  },

  validateResetToken(token) {
    return apiClient.get(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
  },

  resetPassword(token, newPassword) {
    return apiClient.post('/api/auth/reset-password', { token, newPassword });
  }
};

export default AuthService;
