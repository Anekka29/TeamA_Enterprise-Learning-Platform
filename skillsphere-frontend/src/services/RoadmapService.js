import apiClient from '../api/apiClient';

export const RoadmapService = {
  generateRoadmap: async (topic) => {
    const response = await apiClient.post('/api/roadmaps/generate', topic ? { topic } : {});
    return response.data;
  },

  improveRoadmap: async (id) => {
    const response = await apiClient.post(`/api/roadmaps/${id}/improve`);
    return response.data;
  },

  getMyRoadmaps: async () => {
    const response = await apiClient.get('/api/roadmaps');
    return response.data;
  },

  updateStageStatus: async (roadmapId, stageIndex, status) => {
    const response = await apiClient.put(`/api/roadmaps/${roadmapId}/stages/${stageIndex}/status`, { status });
    return response.data;
  }
};

export default RoadmapService;
