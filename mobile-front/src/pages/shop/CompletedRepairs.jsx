import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle, Image as ImageIcon, Wrench, Calendar } from 'lucide-react';
import { shopApi } from '../../api/shops';
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

// Custom Alert Component
const Alert = ({ title, message, type = 'error' }) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
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

export const CompletedRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompletedRepairs();
  }, []);

  const fetchCompletedRepairs = async () => {
    try {
      const data = await repairRequestApi.getCompletedRepairRequests();
      // Sort by completedAt date instead of updatedAt
      data.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      setRepairs(data);
    } catch (err) {
      logger.error('Failed to fetch completed repairs:', err);
      setError('Failed to fetch completed repairs');
    } finally {
      setLoading(false);
    }
  };

  // Format date string for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate the difference between two dates and return it in a human-readable format
  const calculateDateDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return '-';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate difference in milliseconds
    const diffMs = end - start;
    
    // Convert to days (round up to include partial days)
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // If less than a day, calculate hours
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      return diffHours <= 1 ? '1 hour' : `${diffHours} hours`;
    } else if (diffDays === 1) {
      return '1 day';
    } else {
      return `${diffDays} days`;
    }
  };

  // Function to render image thumbnails
  const renderImageThumbnails = (imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return null;
    
    return (
      <div className="mt-3">
        <p className="text-sm font-medium text-gray-900 mb-2">Device Images</p>
        <div className="flex flex-wrap gap-2">
        <CloudinaryImageGallery images={imageUrls} />
          {imageUrls.length > 3 && (
            <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center border">
              <span className="text-sm text-gray-500">+{imageUrls.length - 3}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Completed Repairs</h1>
            <p className="mt-2 text-gray-600">View repair history and outcomes</p>
          </div>

          {error && (
            <div className="mx-6 mt-6">
              <Alert title="Error" message={error} type="error" />
            </div>
          )}

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-500">Loading repairs...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {repairs.map((repair) => (
                  <div key={repair.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {repair.deviceBrand} {repair.deviceModel}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          IMEI: {repair.imeiNumber || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Problem: {repair.problemCategory}
                        </p>
                        <div className="flex flex-wrap items-center mt-2 gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Started: {formatDate(repair.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Completed: {formatDate(repair.completedAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>Duration: {calculateDateDifference(repair.createdAt, repair.completedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[repair.status]}`}>
                        {repair.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Repair Summary</p>
                          <p className="text-sm text-gray-500 mt-1">{repair.problemDescription}</p>
                          {renderImageThumbnails(repair.imageUrls)}
                        </div>
                        {repair.quote && (
                          <div>
                            <p className="text-sm font-medium text-gray-900">Repair Details</p>
                            <div className="mt-1 space-y-1 text-sm">
                              <p className="text-gray-500">Cost: ${repair.quote.estimatedCost}</p>
                              <p className="text-gray-500">{repair.quote.description}</p>
                              <div className="flex items-center mt-2">
                                <Wrench className="w-4 h-4 mr-1 text-gray-500" />
                                <span className="text-gray-500">
                                  Est. Duration: {repair.quote.estimatedDays} days
                                </span>
                              </div>
                              {repair.quote.shop && (
                                <p className="text-gray-500 mt-2">
                                  Repair Shop: {repair.quote.shop.name}
                                </p>
                              )}
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <div className="flex gap-2 items-center">
                                  <span className="text-gray-700 font-medium">Actual vs. Estimated:</span>
                                  <span className={
                                    calculateDateDifference(repair.createdAt, repair.completedAt) > repair.quote?.estimatedDays ? 'text-red-600' : 'text-green-600'
                                  }>
                                    {calculateDateDifference(repair.createdAt, repair.completedAt)} / {repair.quote?.estimatedDays || '-'} days
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {repairs.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-500">No completed repairs</p>
                    <p className="mt-2 text-sm text-gray-400">Completed repairs will appear here</p>
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