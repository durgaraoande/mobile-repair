import axios from 'axios';
import { API_BASE_URL } from './constants';
import { logger } from './logger';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log request information
axiosInstance.interceptors.request.use(
  config => {
    logger.debug('Making request to:', config.url);
    return config;
  },
  error => {
    logger.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add authentication token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // First check localStorage (for long term storage)
    let token = localStorage.getItem('token');
    
    // If not in localStorage, check sessionStorage (for session-only storage)
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    logger.debug('API Request:', config);
    return config;
  },
  (error) => {
    logger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle responses
axiosInstance.interceptors.response.use(
  (response) => {
    logger.debug('API Response:', response);
    return response;
  },
  (error) => {
    logger.error('API Response Error:', error);
    if (error.response?.status === 401) {
      // Clear tokens from both storage locations
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;