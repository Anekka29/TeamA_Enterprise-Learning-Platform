
import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const CourseService = {
  // Student endpoints
  getPublishedCourses: async (search, category) => {
    const params = new URLSearchParams();
    if (search && search.trim() !== '') {
      params.set('search', search.trim());
    }
    if (
      category &&
      category.trim() !== '' &&
      category.toLowerCase() !== 'all categories' &&
      category.toLowerCase() !== 'all'
    ) {
      params.set('category', category.trim());
    }
    const query = params.toString();
    const response = await apiClient.get(`/api/courses${query ? `?${query}` : ''}`);
    return response.data;
  },

  searchPublishedCourses: async (search, category) => {
    return CourseService.getPublishedCourses(search, category);
  },

  getCourseById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.COURSE_DETAILS(id));
    return response.data;
  },

  // Mentor endpoints
  getMentorCourses: async () => {
    const response = await apiClient.get(API_ENDPOINTS.MENTOR_COURSES);
    return response.data;
  },

  getMentorCourseById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.MENTOR_COURSE(id));
    return response.data;
  },

  createDraftCourse: async (courseData) => {
    const response = await apiClient.post(API_ENDPOINTS.MENTOR_COURSES, courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await apiClient.put(API_ENDPOINTS.MENTOR_COURSE(id), courseData);
    return response.data;
  },

  deleteCourse: async (id) => {
    await apiClient.delete(`/api/mentor/courses/${id}`);
  },

  deleteDraftCourse: async (id) => {
    await apiClient.delete(`/api/mentor/courses/${id}`);
  },

  submitForApproval: async (id) => {
    const response = await apiClient.put(API_ENDPOINTS.MENTOR_COURSE_SUBMIT(id));
    return response.data;
  },

  publishCourse: async (id) => {
    const response = await apiClient.put(API_ENDPOINTS.MENTOR_COURSE_PUBLISH(id));
    return response.data;
  },

  withdrawSubmission: async (id) => {
    const response = await apiClient.put(API_ENDPOINTS.MENTOR_COURSE_WITHDRAW(id));
    return response.data;
  },

  duplicateCourse: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.MENTOR_COURSE_DUPLICATE(id));
    return response.data;
  },

  // Admin endpoints
  getPendingCourses: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN_PENDING_COURSES);
    return response.data;
  },

  getCoursesByStatus: async (status) => {
    const response = await apiClient.get(`/api/admin/courses/status/${status}`);
    return response.data;
  },

  approveCourse: async (id) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN_APPROVE_COURSE(id));
    return response.data;
  },

  rejectCourse: async (id, reason) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN_REJECT_COURSE(id), { reason });
    return response.data;
  },

  archiveCourse: async (id) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN_ARCHIVE_COURSE(id));
    return response.data;
  },

  getAdminCourseReviewById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN_COURSE_REVIEW(id));
    return response.data;
  },

  requestChangesCourse: async (id, reason) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN_REQUEST_CHANGES_COURSE(id), { reason });
    return response.data;
  },

  publishCourseAsAdmin: async (id) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN_PUBLISH_COURSE(id));
    return response.data;
  }
};

export default CourseService;
