import axios from '../utils/axios';
import { logger } from '../utils/logger';
import { toastService } from '../utils/toastService';

export const repairRequestApi = {
  async create(requestData) {
    try {
      const formData = new FormData();
      
      // Create the request JSON object excluding images
      const requestJson = {
        deviceBrand: requestData.deviceBrand,
        deviceModel: requestData.deviceModel,
        imeiNumber: requestData.imeiNumber,
        problemCategory: requestData.problemCategory,
        problemDescription: requestData.problemDescription
      };
      
      // Append the JSON data as a 'request' part
      formData.append('request', new Blob([JSON.stringify(requestJson)], {
        type: 'application/json'
      }));
      
      // Append images if they exist
      if (requestData.images && requestData.images.length > 0) {
        requestData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await axios.post('/repair-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toastService.success('Repair request submitted successfully!');
      return response.data;
    } catch (error) {
      logger.error('Create repair request failed:', error);
      toastService.error(error.response?.data?.message || 'Failed to submit repair request');
      throw error;
    }
  },

  async updateStatus(requestId, status) {
    try {
      const response = await axios.put(`/repair-requests/${requestId}/status?status=${status}`);
      toastService.success(`Request status updated to ${status.toLowerCase()}`);
      return response.data;
    } catch (error) {
      logger.error('Update repair request status failed:', error);
      toastService.error('Failed to update request status');
      throw error;
    }
  },
  

  async getCustomerRequests() {
    try {
      const response = await axios.get('/repair-requests/customer');
      return response.data;
    } catch (error) {
      logger.error('Get customer repair requests failed:', error);
      toastService.error('Failed to retrieve your repair requests');
      throw error;
    }
  },

  async getShopRequests() {
    try {
      const response = await axios.get('/repair-requests/shop');
      return response.data;
    } catch (error) {
      logger.error('Get shop repair requests failed:', error);
      toastService.error('Failed to retrieve shop repair requests');
      throw error;
    }
  },
  
  async getActiveRepairRequests() {
    try {
      const response = await axios.get(`/repair-requests/repairs/active`);
      return response.data;
    } catch (error) {
      logger.error('Get active repairs by shop ID failed:', error);
      toastService.error('Failed to retrieve active repair requests');
      throw error;
    }
  },
  
  async getCompletedRepairRequests() {
    try {
      const response = await axios.get(`/repair-requests/repairs/completed`);
      return response.data;
    } catch (error) {
      logger.error('Get completed repair requests by shop ID failed:', error);
      toastService.error('Failed to retrieve completed repair requests');
      throw error;
    }
  },
};