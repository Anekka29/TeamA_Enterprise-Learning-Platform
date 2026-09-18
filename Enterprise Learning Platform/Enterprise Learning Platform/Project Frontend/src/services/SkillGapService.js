import apiClient from '../api/apiClient';

export const SkillGapService = {
  analyze: async (targetRole) => {
    const response = await apiClient.post('/api/skill-gap/analyze', { targetRole });
    return response.data;
  },

  getHistory: async () => {
    const response = await apiClient.get('/api/skill-gap/history');
    return response.data;
  }
};

export default SkillGapService;
