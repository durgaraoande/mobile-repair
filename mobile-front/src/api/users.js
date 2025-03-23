import axios from '../utils/axios';
import { logger } from '../utils/logger';
import { toastService } from '../utils/toastService';

export const userApi = {
  async getCurrentUser() {
    try {
      const response = await axios.get('/users/me');
      return response.data;
    } catch (error) {
      logger.error('Get current user failed:', error);
      toastService.error('Failed to retrieve user profile');
      throw error;
    }
  },

  async getUserById(userId) {
    try {
      const response = await axios.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('Get user by ID failed:', error);
      toastService.error('Failed to retrieve user details');
      throw error;
    }
  }
};