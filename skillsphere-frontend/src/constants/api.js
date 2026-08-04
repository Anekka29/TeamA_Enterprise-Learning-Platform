// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',

  // User
  CURRENT_USER: '/api/users/me',

  // Profile
  PROFILE_ME: '/api/profile/me',
  PROFILE_STUDENT: '/api/profile/student',
  PROFILE_MENTOR: '/api/profile/mentor',
  PROFILE_ADMIN: '/api/profile/admin',

  // Dashboard
  DASHBOARD_STUDENT: '/api/dashboard/student',
  DASHBOARD_MENTOR: '/api/dashboard/mentor',
  DASHBOARD_ADMIN: '/api/dashboard/admin',

  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_ROLE: (userId) => `/api/admin/users/${userId}/role`,

  // Courses
  COURSE_DETAILS: (id) => `/api/courses/${id}`,
  STUDENT_COURSES: '/api/student/courses',
  STUDENT_COURSE: (id) => `/api/student/courses/${id}`,
  ENROLLMENTS: '/api/enrollments',
  MY_ENROLLMENTS: '/api/enrollments/me',
  MENTOR_COURSES: '/api/mentor/courses',
  MENTOR_COURSE: (id) => `/api/mentor/courses/${id}`,
  MENTOR_COURSE_SUBMIT: (id) => `/api/mentor/courses/${id}/submit`,
  MENTOR_COURSE_PUBLISH: (id) => `/api/mentor/courses/${id}/publish`,
  MENTOR_COURSE_WITHDRAW: (id) => `/api/mentor/courses/${id}/withdraw`,
  MENTOR_COURSE_DUPLICATE: (id) => `/api/mentor/courses/${id}/duplicate`,
  ADMIN_PENDING_COURSES: '/api/admin/courses/pending',
  ADMIN_COURSE_REVIEW: (id) => `/api/admin/courses/${id}`,
  ADMIN_APPROVE_COURSE: (id) => `/api/admin/courses/${id}/approve`,
  ADMIN_REJECT_COURSE: (id) => `/api/admin/courses/${id}/reject`,
  ADMIN_REQUEST_CHANGES_COURSE: (id) => `/api/admin/courses/${id}/request-changes`,
  ADMIN_PUBLISH_COURSE: (id) => `/api/admin/courses/${id}/publish`,
  ADMIN_ARCHIVE_COURSE: (id) => `/api/admin/courses/${id}/archive`,
};

export { API_BASE_URL };
