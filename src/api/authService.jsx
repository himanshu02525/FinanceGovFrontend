import apiClient from '../axios/axiosConfig';

export const authService = {
  // 1. PUBLIC LOGIN - Path: /api/auth/login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      
      // If login is successful, store the AuthResponse DTO fields
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          userId: response.data.userId,
          role: response.data.role,
          email: response.data.email || credentials.email, // Fallback if email isn't in DTO
          username: response.data.username
        }));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },

  // 2. PUBLIC REGISTRATION - Path: /api/auth/register
  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Registration Failed");
    }
  },

  // 3. OTP REQUEST - Path: /api/auth/request-otp
  requestOtp: async (email) => {
    return await apiClient.post(`/api/auth/request-otp?email=${email}`);
  },

  // 4. VERIFY & UPDATE - Path: /api/auth/verify-and-update-password
  updatePassword: async (otpData) => {
    return await apiClient.put('/api/auth/verify-and-update-password', otpData);
  },

  // 5. HELPER: LOGOUT
  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  },

  // 6. HELPER: GET LOCAL DATA
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};