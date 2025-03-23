import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle, Image as ImageIcon, Wrench } from 'lucide-react';
import { shopApi, REQUEST_STATUS } from '../../api/shops';
import { repairRequestApi } from '../../api/repairRequests';
import { logger } from '../../utils/logger';
import { CloudinaryImageGallery } from '../../image/ImageGallery';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  QUOTED: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

const Alert = ({ title, message, type = 'error' }) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    success: 'bg-green-50 border-green-200 text-green-700',
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <div>
          {title && <h3 className="font-medium">{title}</h3>}
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
      </div>
    </div>
  );
};

// Pending Repairs Component
export const PendingRepairs = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    repairRequestId: null,
    estimatedCost: '',
    description: '',
    estimatedDays: ''
  });
  const [formErrors, setFormErrors] = useState({
    estimatedCost: '',
    description: '',
    estimatedDays: ''
  });
  const [submitStatus, setSubmitStatus] = useState({
    isSubmitting: false,
    success: false,
    message: ''
  });

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const data = await shopApi.getPendingRepairRequests();
      setRequests(data);
      setError('');
    } catch (err) {
      logger.error('Failed to fetch pending requests:', err);
      setError('Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {
      estimatedCost: '',
      description: '',
      estimatedDays: ''
    };
    let isValid = true;

    // Validate estimated cost
    if (!quoteForm.estimatedCost.trim()) {
      errors.estimatedCost = 'Estimated cost is required';
      isValid = false;
    } else if (isNaN(quoteForm.estimatedCost) || parseFloat(quoteForm.estimatedCost) <= 0) {
      errors.estimatedCost = 'Please enter a valid amount';
      isValid = false;
    }

    // Validate description
    if (!quoteForm.description.trim()) {
      errors.description = 'Repair details are required';
      isValid = false;
    } else if (quoteForm.description.trim().length < 10) {
      errors.description = 'Please provide more detailed description (min 10 characters)';
      isValid = false;
    }

    // Validate estimated days
    if (!quoteForm.estimatedDays.trim()) {
      errors.estimatedDays = 'Estimated days is required';
      isValid = false;
    } else if (isNaN(quoteForm.estimatedDays) || parseInt(quoteForm.estimatedDays) <= 0) {
      errors.estimatedDays = 'Please enter a valid number of days';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleQuoteSubmit = async (requestId) => {
    if (!validateForm()) {
      return;
    }

    setSubmitStatus({
      isSubmitting: true,
      success: false,
      message: ''
    });

    try {
      await shopApi.createQuote({
        ...quoteForm,
        repairRequestId: requestId
      });
      
      setSubmitStatus({
        isSubmitting: false,
        success: true,
        message: 'Quote submitted successfully!'
      });
      
      setTimeout(() => {
        setQuoteForm({
          repairRequestId: null,
          estimatedCost: '',
          description: '',
          estimatedDays: ''
        });
        setExpandedRequest(null);
        setSubmitStatus({
          isSubmitting: false,
          success: false,
          message: ''
        });
        fetchPendingRequests();
      }, 2000);
      
    } catch (err) {
      logger.error('Failed to submit quote:', err);
      setSubmitStatus({
        isSubmitting: false,
        success: false,
        message: 'Failed to submit quote. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Pending Repairs</h1>
            <p className="mt-2 text-gray-600">Review and quote new repair requests</p>
          </div>

          <div className="mx-6 mt-6">
            <Alert 
              type="info" 
              title="Quick Tips"
              message="Provide accurate estimates and detailed descriptions to help customers make informed decisions."
            />
          </div>

          {error && (
            <div className="mx-6 mt-4">
              <Alert 
                type="error" 
                title="Error"
                message={error}
              />
            </div>
          )}

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-500">Loading requests...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg overflow-hidden">
                    <div 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {request.deviceBrand} {request.deviceModel}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{request.problemCategory}</p>
                          <p className="text-sm text-gray-500 mt-1">{request.problemDescription}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[request.status]}`}>
                            {request.status}
                          </span>
                          {expandedRequest === request.id ? <ChevronUp /> : <ChevronDown />}
                        </div>
                      </div>
                    </div>

                    {expandedRequest === request.id && (
                      <div className="border-t bg-gray-50 p-4">
                        {request.imageUrls?.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Device Images</h3>
                            {/* Image gallery component would go here */}
                            <CloudinaryImageGallery images={request.imageUrls} />
                          </div>
                        )}

                        {submitStatus.message && (
                          <div className="mb-4">
                            <Alert 
                              type={submitStatus.success ? "success" : "error"}
                              message={submitStatus.message}
                            />
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Estimated Cost (₹) <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                    formErrors.estimatedCost ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                  placeholder="Enter amount"
                                  value={quoteForm.estimatedCost}
                                  onChange={(e) => setQuoteForm({
                                    ...quoteForm,
                                    estimatedCost: e.target.value
                                  })}
                                />
                              </div>
                              {formErrors.estimatedCost && (
                                <p className="text-sm text-red-600 mt-1">{formErrors.estimatedCost}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Estimated Days <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  formErrors.estimatedDays ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Number of days"
                                value={quoteForm.estimatedDays}
                                onChange={(e) => setQuoteForm({
                                  ...quoteForm,
                                  estimatedDays: e.target.value
                                })}
                              />
                              {formErrors.estimatedDays && (
                                <p className="text-sm text-red-600 mt-1">{formErrors.estimatedDays}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Repair Details <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                formErrors.description ? 'border-red-300' : 'border-gray-300'
                              }`}
                              rows="3"
                              placeholder="Describe the repair process and any additional notes..."
                              value={quoteForm.description}
                              onChange={(e) => setQuoteForm({
                                ...quoteForm,
                                description: e.target.value
                              })}
                            />
                            {formErrors.description && (
                              <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>
                            )}
                          </div>

                          <button
                            onClick={() => handleQuoteSubmit(request.id)}
                            disabled={submitStatus.isSubmitting}
                            className={`w-full py-2 ${
                              submitStatus.isSubmitting 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            } text-white rounded-lg transition-colors flex justify-center items-center`}
                          >
                            {submitStatus.isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Submitting...
                              </>
                            ) : (
                              'Submit Quote'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {requests.length === 0 && (
                  <div className="text-center py-12">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-500">No pending requests</p>
                    <p className="mt-2 text-sm text-gray-400">New repair requests will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};