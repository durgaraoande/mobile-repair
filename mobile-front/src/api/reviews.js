// src/api/reviews.js
import axios from '../utils/axios';
import { logger } from '../utils/logger';
import { toastService } from '../utils/toastService';

export const reviewApi = {
  async submitReview(reviewData) {
    try {
      const response = await axios.post('/reviews', reviewData);
      toastService.success('Review submitted successfully!');
      return response.data;
    } catch (error) {
      logger.error('Submit review failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to submit review');
      throw error;
    }
  },

  async getShopReviews(shopId) {
    try {
      const response = await axios.get(`/reviews/shop/${shopId}`);
      return response.data;
    } catch (error) {
      logger.error('Get shop reviews failed:', error);
      toastService.error('Failed to retrieve shop reviews');
      throw error;
    }
  },

  async getCustomerReviews() {
    try {
      const response = await axios.get('/reviews/customer');
      return response.data;
    } catch (error) {
      logger.error('Get customer reviews failed:', error);
      toastService.error('Failed to retrieve your reviews');
      throw error;
    }
  },

  async hasReviewed(requestId) {
    try {
      const response = await axios.get(`/reviews/check/${requestId}`);
      return response.data.hasReviewed;
    } catch (error) {
      logger.error('Check review status failed:', error);
      toastService.error('Failed to check review status');
      throw error;
    }
  },
  
  async getReviewByRequestId(requestId) {
    try {
      const response = await axios.get(`/reviews/request/${requestId}`);
      return response.data;
    } catch (error) {
      logger.error('Get review by request ID failed:', error);
      return null;
    }
  }
};