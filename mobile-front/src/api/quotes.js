import axios from '../utils/axios';
import { logger } from '../utils/logger';
import { toastService } from '../utils/toastService';

export const quoteApi = {
  async create(quoteData) {
    try {
      const response = await axios.post('/quotes', quoteData);
      toastService.success('Quote created successfully!');
      return response.data;
    } catch (error) {
      logger.error('Create quote failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to create quote');
      throw error;
    }
  },

  async accept(quoteId) {
    try {
      const response = await axios.post(`/quotes/${quoteId}/accept`);
      toastService.success('Quote accepted successfully!');
      return response.data;
    } catch (error) {
      logger.error('Accept quote failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to accept quote');
      throw error;
    }
  },

  async getQuotesForRequest(requestId) {
    try {
      const response = await axios.get(`/quotes/request/${requestId}`);
      return response.data;
    } catch (error) {
      logger.error('Get quotes for request failed:', error);
      toastService.error('Failed to retrieve quotes');
      throw error;
    }
  }
};