import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const UserService = {
  getCurrentUser: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CURRENT_USER);
    return response;
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/user/profile');
    return response;
  },

  updateStudentProfile: async (data) => {
    const response = await apiClient.put('/api/user/profile/student', data);
    return response;
  },

  updateMentorProfile: async (data) => {
    const response = await apiClient.put('/api/user/profile/mentor', data);
    return response;
  },

  updateAdminProfile: async (data) => {
    const response = await apiClient.put('/api/user/profile/admin', data);
    return response;
  },

  getSettings: async () => {
    const response = await apiClient.get('/api/user/settings');
    return response;
  },

  updateSettings: async (data) => {
    const response = await apiClient.put('/api/user/settings', data);
    return response;
  },

  changePassword: async (data) => {
    const response = await apiClient.post('/api/user/change-password', data);
    return response;
  },

  updateEmail: async (data) => {
    const response = await apiClient.post('/api/user/update-email', data);
    return response;
  },

  getLoginHistory: async () => {
    const response = await apiClient.get('/api/user/login-history');
    return response;
  },

  logoutAllDevices: async () => {
    const response = await apiClient.post('/api/user/logout-all');
    return response;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete('/api/user/delete-account');
    return response;
  }
};

export default UserService;
