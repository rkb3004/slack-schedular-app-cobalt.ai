import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const slackApi = {
  // OAuth related endpoints
  getAuthUrl: () => api.get('/auth/slack/url'),
  checkAuthStatus: () => api.get('/auth/slack/status'),
  
  // Channel related endpoints
  getChannels: () => api.get('/slack/channels'),
  
  // Message related endpoints
  sendMessage: (channelId: string, message: string) => 
    api.post('/slack/message', { channelId, message }),
  
  // Scheduled messages endpoints
  scheduleMessage: (channelId: string, message: string, scheduledTime: string) => 
    api.post('/slack/schedule', { channelId, message, scheduledTime }),
  
  getScheduledMessages: () => api.get('/slack/scheduled'),
  
  cancelScheduledMessage: (id: string) => 
    api.delete(`/slack/scheduled/${id}`),
};

export default api;
