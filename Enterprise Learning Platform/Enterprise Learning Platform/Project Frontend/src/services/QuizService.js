import apiClient from '../api/apiClient';

export const QuizService = {
  // Mentor endpoints
  createQuiz: async (courseId, quizData) => {
    const response = await apiClient.post(`/api/mentor/courses/${courseId}/quizzes`, quizData);
    return response.data;
  },

  updateQuiz: async (quizId, quizData) => {
    const response = await apiClient.put(`/api/mentor/quizzes/${quizId}`, quizData);
    return response.data;
  },

  deleteQuiz: async (quizId) => {
    await apiClient.delete(`/api/mentor/quizzes/${quizId}`);
  },

  publishQuiz: async (quizId) => {
    const response = await apiClient.put(`/api/mentor/quizzes/${quizId}/publish`);
    return response.data;
  },

  getQuizzesByCourse: async (courseId) => {
    const response = await apiClient.get(`/api/mentor/courses/${courseId}/quizzes`);
    return response.data;
  },

  getQuizById: async (quizId) => {
    const response = await apiClient.get(`/api/mentor/quizzes/${quizId}`);
    return response.data;
  },

  generateQuiz: async (requestData) => {
    const response = await apiClient.post('/api/mentor/quizzes/generate', requestData);
    return response.data;
  },

  // Student endpoints
  getQuizForAttempt: async (quizId) => {
    const response = await apiClient.get(`/api/student/quizzes/${quizId}/attempt`);
    return response.data;
  },

  submitQuiz: async (submissionData) => {
    const response = await apiClient.post('/api/student/quizzes/submit', submissionData);
    return response.data;
  },

  getStudentQuizHistory: async () => {
    const response = await apiClient.get('/api/student/quizzes/history');
    return response.data;
  },

  getQuizResult: async (resultId) => {
    const response = await apiClient.get(`/api/student/quizzes/results/${resultId}`);
    return response.data;
  }
};

export default QuizService;

