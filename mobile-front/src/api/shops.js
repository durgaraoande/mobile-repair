import axios from '../utils/axios';
import { logger } from '../utils/logger';
import { toastService } from '../utils/toastService';

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  QUOTED: 'QUOTED',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const shopApi = {
  // Existing public shop methods
  async getAllShops() {
    try {
      const response = await axios.get('/shops');
      return response.data;
    } catch (error) {
      logger.error('Get all shops failed:', error);
      toastService.error('Failed to retrieve shops');
      throw error;
    }
  },

  async getShopById(shopId) {
    try {
      const response = await axios.get(`/shops/${shopId}`);
      return response.data;
    } catch (error) {
      logger.error('Get shop by ID failed:', error);
      toastService.error('Failed to retrieve shop details');
      throw error;
    }
  },
  
  // Shop owner specific methods
  async registerShop(shopData) {
    try {
      const response = await axios.post('/shops', shopData);
      logger.info('Shop registered successfully');
      toastService.success('Shop registered successfully!');
      return response.data;
    } catch (error) {
      logger.error('Shop registration failed:', error);
      toastService.error(error.response?.data?.message || 'Shop registration failed');
      throw error;
    }
  },

  async getShopByOwnerId(ownerId) {
    try {
      const response = await axios.get(`/shops/owner/${ownerId}`);
      return response.data;
    } catch (error) {
      logger.error('Get shop by owner ID failed:', error);
      toastService.error('Failed to retrieve your shop details');
      throw error;
    }
  },

  async updateShop(shopId, shopData) {
    try {
      const response = await axios.put(`/shops/${shopId}`, shopData);
      toastService.success('Shop details updated successfully!');
      return response.data;
    } catch (error) {
      logger.error('Update shop failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to update shop details');
      throw error;
    }
  },

  // Repair request methods
  async getShopRepairRequests() {
    try {
      const response = await axios.get('/repair-requests/shop');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch shop repair requests:', error);
      toastService.error('Failed to retrieve repair requests');
      throw error;
    }
  },

  // Quote methods
  async submitQuote(quoteData) {
    try {
      const response = await axios.post('/quotes', quoteData);
      logger.info('Quote submitted successfully');
      toastService.success('Quote submitted successfully!');
      return response.data;
    } catch (error) {
      logger.error('Quote submission failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to submit quote');
      throw error;
    }
  },

  async getQuotesForRequest(requestId) {
    try {
      const response = await axios.get(`/quotes/request/${requestId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch quotes for request:', error);
      toastService.error('Failed to retrieve quotes');
      throw error;
    }
  }, 
  
  async getPendingRepairRequests() {
    try {
      const response = await axios.get('/repair-requests/shop/available-for-quote');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch pending repair requests:', error);
      toastService.error('Failed to retrieve pending repair requests');
      throw error;
    }
  },

  async getAllRepairRequests() {
    try {
      const response = await axios.get('/repair-requests/shop');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch repair requests:', error);
      toastService.error('Failed to retrieve repair requests');
      throw error;
    }
  },

  async createQuote(quoteData) {
    try {
      const response = await axios.post('/quotes', quoteData);
      logger.info('Quote created successfully');
      toastService.success('Quote created successfully!');
      return response.data;
    } catch (error) {
      logger.error('Failed to create quote:', error);
      toastService.error(error.response?.data?.message || 'Failed to create quote');
      throw error;
    }
  },

  async updateRepairStatus(requestId, status) {
    try {
      const response = await axios.put(`/repair-requests/${requestId}/status?status=${status}`);
      logger.info('Repair status updated successfully');
      toastService.success(`Repair status updated to ${status.toLowerCase()}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to update repair status:', error);
      toastService.error('Failed to update repair status');
      throw error;
    }
  },

async updateRepairDetails(requestId, repairDetails) {
  try {
    const response = await axios.put(`/repair-requests/${requestId}/details`, repairDetails);
    toastService.success("Repair details updated and work started");
    return response.data;
  } catch (error) {
    logger.error('Update repair details failed:', error);
    toastService.error('Failed to update repair details');
    throw error;
  }
},
};