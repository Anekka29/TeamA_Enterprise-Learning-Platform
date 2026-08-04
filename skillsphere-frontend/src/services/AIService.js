import apiClient from '../api/apiClient';

export const AIService = {
  chat: async (message, conversationId) => {
    const response = await apiClient.post('/api/ai/chat', { message, conversationId });
    return response.data;
  }
};

export default AIService;
