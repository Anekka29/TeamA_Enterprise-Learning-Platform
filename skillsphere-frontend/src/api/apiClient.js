import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import AuthUtils from '../utils/auth';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = AuthUtils.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401/403 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthEndpoint = 
      url.includes('/api/auth/forgot-password') || 
      url.includes('/api/auth/validate-reset-token') || 
      url.includes('/api/auth/reset-password');
    
    // Don't redirect on login request or password reset auth endpoints
    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      AuthUtils.clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
