import axios from '../utils/axios';
import { logger } from '../utils/logger';
import { toastService } from '../utils/toastService';

export const authApi = {
  async login(credentials) {
    try {
      // Use the configured axiosInstance instead of axios directly
      const response = await axios.post('/auth/login', credentials);
      
      // If token is available in the response
      if (response.data && response.data.token) {
        // Handle remember me functionality
        if (credentials.rememberMe) {
          // Store in localStorage for persistent login
          localStorage.setItem('token', response.data.token);
          // Also remove from sessionStorage to avoid conflicts
          sessionStorage.removeItem('token');
        } else {
          // If remember me is not checked, only store in sessionStorage
          sessionStorage.setItem('token', response.data.token);
          // Also remove from localStorage to avoid conflicts
          localStorage.removeItem('token');
        }
        
        // Optionally store user data if available
        if (response.data.user) {
          const storage = credentials.rememberMe ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(response.data.user));
        }
        
        toastService.success('Login successful!');
        return response.data;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      const errorDetails = {
        message: error.response?.data?.message || error.message || 'Login failed',
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
      };
      
      logger.error('Login error details:', errorDetails);
      toastService.error(errorDetails.message);
      throw errorDetails;
    }
  },
  
  async logout() {
    try {
      // Optionally call logout endpoint if your API requires it
      await axios.post('/auth/logout');
    } catch (error) {
      logger.warn('Logout API call failed:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      toastService.info('You have been logged out');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  },
  
  isAuthenticated() {
    // Check both storage locations
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  },
  
  getToken() {
    // First check localStorage, then sessionStorage
    return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
  },
  
  getUser() {
    // First check localStorage, then sessionStorage
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // // You'll also need to update your auth helper to check both storage locations
  // getToken() {
  //   return localStorage.getItem('token') || sessionStorage.getItem('token');
  // },
  
  // logout() {
  //   localStorage.removeItem('token');
  //   sessionStorage.removeItem('token');
  //   // You may want to keep rememberedEmail when logging out
  // },

  async registerUser(userData) {
    try {
      const response = await axios.post('/auth/register/user', userData);
      toastService.success('Registration successful! Please check your email for verification.');
      return response.data;
    } catch (error) {
      logger.error('User registration failed:', error);
      toastService.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  },

  async verifyEmail(token) {
    try {
      const response = await axios.get(`/auth/verify-email?token=${token}`);
      toastService.success('Email verified successfully!');
      return response.data;
    } catch (error) {
      logger.error('Email verification failed:', error);
      toastService.error('Email verification failed. The link may be expired or invalid.');
      throw error;
    }
  },

  async resendVerification(email) {
    try {
      const response = await axios.post(`/auth/resend-verification?email=${email}`);
      toastService.success('Verification email sent successfully!');
      return response.data;
    } catch (error) {
      logger.error('Resend verification failed:', error);
      toastService.error('Failed to resend verification email');
      throw error;
    }
  },

  async forgotPassword(email) {
    try {
      const response = await axios.post(`/auth/forgot-password?email=${email}`);
      toastService.success('Password reset instructions sent to your email');
      return response.data;
    } catch (error) {
      logger.error('Forgot password request failed:', error);
      toastService.error('Failed to process forgot password request');
      throw error;
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await axios.post('/auth/reset-password', {
        token,
        newPassword
      });
      toastService.success('Password reset successful!');
      return response.data;
    } catch (error) {
      logger.error('Password reset failed:', error);
      toastService.error('Password reset failed. The link may be expired or invalid.');
      throw error;
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axios.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toastService.success('Password changed successfully!');
      return response.data;
    } catch (error) {
      logger.error('Password change failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to change password');
      throw error;
    }
  },
  
  async updateUserProfile(userId, userData) {
    try {
      const response = await axios.put(`/auth/update/user/${userId}`, userData);
      toastService.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      logger.error('Profile update failed:', error);
      toastService.error('Failed to update profile');
      throw error;
    }
  },
  
  async resendEmailVerification(email) {
    try {
      const response = await axios.post('/api/auth/resend-verification', { email });
      toastService.success('Verification email sent!');
      return response.data;
    } catch (error) {
      logger.error('Resend verification email failed:', error);
      toastService.error('Failed to resend verification email');
      throw error;
    }
  }
};