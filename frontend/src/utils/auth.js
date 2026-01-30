import apiClient from './api';

export const authUtils = {
  // Register new user
  register: async (name, email, password) => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password
    });
    const { token, userId } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    return response.data.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    const { token, userId } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    return response.data.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user ID
  getCurrentUserId: () => {
    return localStorage.getItem('userId');
  },

  // Decode JWT to get user info (basic implementation)
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
};

export default authUtils;
