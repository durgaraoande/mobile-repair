import React, { useState, useEffect } from 'react';
import { shopApi, REQUEST_STATUS } from '../../api/shops';
import { logger } from '../../utils/logger';

export const ShopRepairManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quoteForm, setQuoteForm] = useState({
    repairRequestId: null,
    estimatedCost: '',
    description: '',
    estimatedDays: ''
  });

  useEffect(() => {
    fetchRepairRequests();
  }, []);

  const fetchRepairRequests = async () => {
    try {
      const data = await shopApi.getAllRepairRequests();
      setRequests(data);
    } catch (err) {
      logger.error('Failed to fetch repair requests:', err);
      setError('Failed to fetch repair requests');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmit = async (requestId) => {
    try {
      await shopApi.createQuote({
        ...quoteForm,
        repairRequestId: requestId
      });
      
      setQuoteForm({
        repairRequestId: null,
        estimatedCost: '',
        description: '',
        estimatedDays: ''
      });
      await fetchRepairRequests();
      logger.info('Quote submitted successfully');
    } catch (err) {
      logger.error('Failed to submit quote:', err);
      setError('Failed to submit quote');
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await shopApi.updateRepairStatus(requestId, newStatus);
      await fetchRepairRequests();
      logger.info(`Status updated to ${newStatus} successfully`);
    } catch (err) {
      logger.error('Failed to update status:', err);
      setError('Failed to update request status');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case REQUEST_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case REQUEST_STATUS.QUOTED:
        return 'bg-blue-100 text-blue-800';
      case REQUEST_STATUS.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case REQUEST_STATUS.IN_PROGRESS:
        return 'bg-purple-100 text-purple-800';
      case REQUEST_STATUS.COMPLETED:
        return 'bg-green-100 text-green-800';
      case REQUEST_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-indigo-200"></div>
          <div className="mt-2 text-indigo-600 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError('')}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 border-b">
          <h2 className="text-xl font-semibold text-white">Repair Requests Management</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {requests.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No repair requests found</h3>
                <p className="mt-1 text-sm text-gray-500">New requests will appear here once customers submit them.</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="border rounded-lg overflow-hidden hover:shadow-md transition duration-200">
                  <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.deviceBrand} {request.deviceModel}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Submitted on {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full inline-flex items-center ${getStatusBadgeColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="p-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Problem Details</h4>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Category:</span> {request.problemCategory}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Description:</span> {request.problemDescription}
                        </p>
                      </div>
                      
                      {request.quote && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quote Information</h4>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Price:</span> ${request.quote.estimatedCost}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Duration:</span> {request.quote.estimatedDays} days
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Details:</span> {request.quote.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === REQUEST_STATUS.PENDING && (
                    <div className="p-4 bg-indigo-50 border-t">
                      <h4 className="text-sm font-medium text-indigo-800 mb-3">Create Quote</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="number"
                            placeholder="Estimated cost"
                            className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            value={quoteForm.estimatedCost}
                            onChange={(e) => setQuoteForm({
                              ...quoteForm,
                              estimatedCost: e.target.value
                            })}
                          />
                          <input
                            type="number"
                            placeholder="Estimated days"
                            className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            value={quoteForm.estimatedDays}
                            onChange={(e) => setQuoteForm({
                              ...quoteForm,
                              estimatedDays: e.target.value
                            })}
                          />
                        </div>
                        <textarea
                          placeholder="Quote description - include parts and labor details"
                          className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          rows={3}
                          value={quoteForm.description}
                          onChange={(e) => setQuoteForm({
                            ...quoteForm,
                            description: e.target.value
                          })}
                        />
                        <div className="text-xs text-indigo-600 mb-2">
                          Pro tip: Detailed quotes with clear breakdowns have higher acceptance rates
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => handleQuoteSubmit(request.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium transition duration-150 ease-in-out"
                          >
                            Submit Quote
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, REQUEST_STATUS.CANCELLED)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium transition duration-150 ease-in-out"
                          >
                            Decline Request
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {request.status === REQUEST_STATUS.ACCEPTED && (
                    <div className="p-4 bg-green-50 border-t">
                      <button
                        onClick={() => handleStatusUpdate(request.id, REQUEST_STATUS.IN_PROGRESS)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium transition duration-150 ease-in-out"
                      >
                        Start Repair
                      </button>
                      <p className="text-xs text-green-700 mt-2">
                        Starting the repair will notify the customer that work has begun
                      </p>
                    </div>
                  )}

                  {request.status === REQUEST_STATUS.IN_PROGRESS && (
                    <div className="p-4 bg-green-50 border-t">
                      <button
                        onClick={() => handleStatusUpdate(request.id, REQUEST_STATUS.COMPLETED)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium transition duration-150 ease-in-out"
                      >
                        Mark as Completed
                      </button>
                      <p className="text-xs text-green-700 mt-2">
                        Only mark as completed when the device is ready for pickup
                      </p>
                    </div>
                  )}

                  {(request.status === REQUEST_STATUS.COMPLETED || request.status === REQUEST_STATUS.CANCELLED) && (
                    <div className="p-4 bg-gray-50 border-t text-center">
                      <div className="text-sm text-gray-500 italic">
                        No actions available - this request is {request.status.toLowerCase()}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};