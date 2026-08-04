import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../constants/api';

const DashboardService = {
  getStudentDashboard() {
    return apiClient.get(API_ENDPOINTS.DASHBOARD_STUDENT);
  },

  getMentorDashboard() {
    return apiClient.get(API_ENDPOINTS.DASHBOARD_MENTOR);
  },

  getAdminDashboard() {
    return apiClient.get(API_ENDPOINTS.DASHBOARD_ADMIN);
  },
};

export default DashboardService;
