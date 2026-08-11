import apiClient from '../api/apiClient';

const InternshipService = {
  getAllActiveInternships() {
    return apiClient.get('/api/internships');
  },

  getInternshipById(id) {
    return apiClient.get(`/api/internships/${id}`);
  },

  applyForInternship(id, applicationData) {
    return apiClient.post(`/api/internships/${id}/apply`, applicationData);
  },

  getMyApplications() {
    return apiClient.get('/api/internships/my-applications');
  },

  createInternship(data) {
    return apiClient.post('/api/internships', data);
  },

  getMentorApplications() {
    return apiClient.get('/api/internships/mentor/applications');
  },

  updateApplicationStatus(id, status, reviewNotes) {
    return apiClient.patch(`/api/internships/applications/${id}/status`, { status, reviewNotes });
  }
};

export default InternshipService;
