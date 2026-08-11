// API Base URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',

  // User
  CURRENT_USER: '/api/users/me',

  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_ROLE: (userId) => `/api/admin/users/${userId}/role`,
};
