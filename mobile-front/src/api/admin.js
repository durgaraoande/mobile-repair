import axios from '../utils/axios';
import { logger } from '../utils/logger';
import { toastService } from '../utils/toastService';

export const adminApi = {
  /**
   * Fetches comprehensive dashboard statistics
   * Includes user, shop, repair request, and recent activity metrics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStatistics() {
    try {
      const response = await axios.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      logger.error('Fetch dashboard statistics failed:', error);
      toastService.error('Failed to load dashboard statistics');
      throw error;
    }
  },

  // User Management APIs
  /**
   * Retrieves a list of all users with detailed information
   * @returns {Promise<Array>} List of user details
   */
  async getAllUsers() {
    try {
      const response = await axios.get('/admin/users');
      return response.data;
    } catch (error) {
      logger.error('Fetch all users failed:', error);
      toastService.error('Failed to load users');
      throw error;
    }
  },

  /**
   * Retrieves details of a specific user by ID
   * @param {number} userId - The ID of the user
   * @returns {Promise<Object>} User details
   */
  async getUserDetails(userId) {
    try {
      const response = await axios.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      logger.error(`Fetch user details for ID ${userId} failed:`, error);
      toastService.error('Failed to load user details');
      throw error;
    }
  },

  /**
   * Updates the status of a specific user
   * @param {number} userId - The ID of the user
   * @param {string} status - New user status
   * @param {string} [reason] - Optional reason for status change
   * @returns {Promise<Object>} Updated user details
   */
  async updateUserStatus(userId, status, reason = '') {
    try {
      const url = reason 
        ? `/admin/users/${userId}/status?status=${status}&reason=${encodeURIComponent(reason)}`
        : `/admin/users/${userId}/status?status=${status}`;
      
      const response = await axios.put(url);
      toastService.success('User status updated successfully!');
      return response.data;
    } catch (error) {
      logger.error('Update user status failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to update user status');
      throw error;
    }
  },

  /**
   * Initiates password reset for a specific user
   * @param {number} userId - The ID of the user
   * @returns {Promise<string>} Password reset confirmation message
   */
  async resetUserPassword(userId) {
    try {
      const response = await axios.post(`/admin/users/${userId}/reset-password`);
      toastService.success('Password reset email sent successfully!');
      return response.data;
    } catch (error) {
      logger.error('Reset user password failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to send password reset email');
      throw error;
    }
  },

  // Shop Management APIs
  /**
   * Retrieves a list of all repair shops with comprehensive details
   * @returns {Promise<Array>} List of shop details
   */
  async getAllShops() {
    try {
      const response = await axios.get('/admin/shops');
      return response.data;
    } catch (error) {
      logger.error('Fetch all shops failed:', error);
      toastService.error('Failed to load shops');
      throw error;
    }
  },

  /**
   * Retrieves details of a specific shop
   * @param {number} shopId - The ID of the shop
   * @returns {Promise<Object>} Shop details
   */
  async getShopDetails(shopId) {
    try {
      const response = await axios.get(`/admin/shops/${shopId}`);
      return response.data;
    } catch (error) {
      logger.error(`Fetch shop details for ID ${shopId} failed:`, error);
      toastService.error('Failed to load shop details');
      throw error;
    }
  },

  /**
   * Updates the status of a specific shop
   * @param {number} shopId - The ID of the shop
   * @param {string} status - New shop status
   * @param {string} [reason] - Optional reason for status change
   * @returns {Promise<Object>} Updated shop details
   */
  async updateShopStatus(shopId, status, reason = '') {
    try {
      const url = reason 
        ? `/admin/shops/${shopId}/status?status=${status}&reason=${encodeURIComponent(reason)}`
        : `/admin/shops/${shopId}/status?status=${status}`;
      
      const response = await axios.put(url);
      toastService.success('Shop status updated successfully!');
      return response.data;
    } catch (error) {
      logger.error('Update shop status failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to update shop status');
      throw error;
    }
  },

  /**
   * Verifies a specific repair shop
   * @param {number} shopId - The ID of the shop
   * @returns {Promise<Object>} Verified shop details
   */
  async verifyShop(shopId) {
    try {
      const response = await axios.put(`/admin/shops/${shopId}/verify`);
      toastService.success('Shop verified successfully!');
      return response.data;
    } catch (error) {
      logger.error('Verify shop failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to verify shop');
      throw error;
    }
  },

  // Repair Request Management APIs
  /**
   * Retrieves all repair requests, optionally filtered by status
   * @param {string} [status] - Optional status filter
   * @param {number} [shopId] - Optional shop ID filter
   * @returns {Promise<Array>} List of repair requests
   */
  getAllRepairRequests: async (options = {}) => {
    try {
      const { 
        status = '', 
        page = 0, 
        size = 10, 
        sort = 'createdAt,desc' 
      } = options;

      // Construct query parameters
      const params = new URLSearchParams();
      
      // Only add status if it's not an empty string or 'ALL'
      if (status && status !== 'ALL') {
        params.append('status', status);
      }
      
      params.append('page', page);
      params.append('size', size);
      params.append('sort', sort);

      const response = await axios.get('/admin/repair-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Fetch repair requests failed:', error);
      throw error;
    }
  },

  /**
   * Retrieves detailed information for a specific repair request
   * @param {number} requestId - The ID of the repair request
   * @returns {Promise<Object>} Repair request details
   */
  async getRepairRequestDetails(requestId) {
    try {
      const response = await axios.get(`/admin/repair-requests/${requestId}`);
      return response.data;
    } catch (error) {
      logger.error('Fetch repair request details failed:', error);
      toastService.error('Failed to load repair request details');
      throw error;
    }
  },

  // Analytics and Reports APIs
  /**
   * Fetches comprehensive analytics with configurable time period
   * @param {string} [period='month'] - Time period for analytics (week/month/year)
   * @returns {Promise<Object>} Comprehensive analytics data
   */
  async getComprehensiveAnalytics(period = 'month') {
    try {
      const response = await axios.get(`/admin/analytics/comprehensive?period=${period}`);
      return response.data;
    } catch (error) {
      logger.error('Fetch comprehensive analytics failed:', error);
      toastService.error('Failed to load analytics');
      throw error;
    }
  },

  /**
   * Retrieves review-related analytics
   * @returns {Promise<Object>} Review analytics data
   */
  async getReviewAnalytics() {
    try {
      const response = await axios.get('/admin/analytics/reviews');
      return response.data;
    } catch (error) {
      logger.error('Fetch review analytics failed:', error);
      toastService.error('Failed to load review analytics');
      throw error;
    }
  },
  

  // System Notifications
  /**
   * Sends a system-wide notification
   * @param {Object} notificationData - Notification details
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.message - Notification message
   * @param {string} notificationData.targetAudience - Target user group (ALL_USERS/CUSTOMERS/SHOP_OWNERS)
   * @returns {Promise<Object>} Notification send result
   */
  async sendSystemNotification(notificationData) {
    try {
      const response = await axios.post('/admin/notifications/system', notificationData);
      toastService.success('Notification sent successfully!');
      return response.data;
    } catch (error) {
      logger.error('Send system notification failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to send notification');
      throw error;
    }
  },

  // System Maintenance
  /**
   * Initiates cleanup of expired verification tokens
   * @returns {Promise<number>} Number of tokens deleted
   */
  async cleanupExpiredTokens() {
    try {
      const response = await axios.delete('/admin/cleanup/expired-tokens');
      toastService.success(`Cleaned up ${response.data} expired tokens`);
      return response.data;
    } catch (error) {
      logger.error('Cleanup of expired tokens failed:', error);
      toastService.error('Failed to clean up expired tokens');
      throw error;
    }
  }
};