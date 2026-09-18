import apiClient from '../api/apiClient';

export const AssignmentService = {
  // Mentor methods
  createAssignment: async (courseId, request) => {
    const response = await apiClient.post(`/mentor/courses/${courseId}/assignments`, request);
    return response.data;
  },

  getSubmissionsForAssignment: async (assignmentId) => {
    const response = await apiClient.get(`/mentor/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  gradeAssignment: async (submissionId, request) => {
    const response = await apiClient.put(`/mentor/submissions/${submissionId}/grade`, request);
    return response.data;
  },

  // Student methods
  getAssignmentsForStudent: async () => {
    const response = await apiClient.get('/student/assignments');
    return response.data;
  },

  getAssignmentsForCourse: async (courseId) => {
    const response = await apiClient.get(`/student/courses/${courseId}/assignments`);
    return response.data;
  },

  getAssignment: async (assignmentId) => {
    const response = await apiClient.get(`/student/assignments/${assignmentId}`);
    return response.data;
  },

  submitAssignment: async (assignmentId, request) => {
    const response = await apiClient.post(`/student/assignments/${assignmentId}/submit`, request);
    return response.data;
  },

  getSubmissionForStudent: async (assignmentId) => {
    const response = await apiClient.get(`/student/assignments/${assignmentId}/submission`);
    return response.data;
  },
};

export default AssignmentService;
