import axios from 'axios';
import { BASE_API_URL } from './config';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error);
    // Add more detailed error information for debugging
    if (error.code === 'ECONNABORTED') {
      console.warn('Connection timed out. The server might be temporarily unavailable.');
    }
    return Promise.reject(error);
  }
);

export default api;