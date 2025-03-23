import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RepairRequestForm } from '../../components/repair/RepairRequestForm';
import { repairRequestApi } from '../../api/repairRequests';
import { logger } from '../../utils/logger';
import { AlertCircle, Wrench, HelpCircle } from 'lucide-react';

export const NewRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (requestData) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await repairRequestApi.create(requestData);
      logger.info('Repair request created successfully');
      navigate(`/repair-requests/${response.id}`);
    } catch (error) {
      logger.error('Failed to create repair request:', error);
      setError(error.response?.data?.message || 'Failed to create repair request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Wrench className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">New Repair Request</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <RepairRequestForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">Tips for Submitting a Request</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <p className="text-blue-800">Provide clear photos of the damaged area to help shops assess the repair needs</p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <p className="text-blue-800">Be specific about the problem - include when it started and any relevant details</p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <p className="text-blue-800">Include the device model and any previous repair history if applicable</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewRequest;