import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`API Error [${status}]:`, data);
      
      // Format error message
      const errorMessage = data?.message || data?.error || 'An error occurred';
      const errorCode = data?.errorCode || 'UNKNOWN_ERROR';
      
      return Promise.reject({
        status,
        message: errorMessage,
        code: errorCode,
        details: data?.details || null,
        timestamp: data?.timestamp,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
      return Promise.reject({
        status: 0,
        message: 'No response from server. Please check your connection.',
        code: 'NO_RESPONSE',
      });
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        code: 'REQUEST_ERROR',
      });
    }
  }
);

export default axiosInstance;
