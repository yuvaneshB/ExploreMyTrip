import api from '../services/api.js';

export const queryChatbot = async (message, conversationHistory = []) => {
  const response = await api.post('/chatbot/message', { message, conversationHistory });
  return response.data;
};
