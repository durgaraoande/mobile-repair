import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, Wrench, AlertCircle, CheckCircle, Edit, X, ZoomIn, PlayCircle, Calendar, Image as ImageIcon } from 'lucide-react';
import { shopApi, REQUEST_STATUS } from '../../api/shops';
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

// Shop Owner Suggestion Component
const ShopOwnerSuggestion = ({ status }) => {
  let suggestion = '';
  let icon = null;
  
  switch(status) {
    case REQUEST_STATUS.ACCEPTED:
      suggestion = "Click Edit to update device details and start the repair process.";
      icon = <Edit className="h-5 w-5 text-blue-500" />;
      break;
    case REQUEST_STATUS.IN_PROGRESS:
      suggestion = "Once repair is complete, click 'Mark as Completed' to update the status.";
      icon = <CheckCircle className="h-5 w-5 text-green-500" />;
      break;
    default:
      return null;
  }
  
  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
      <div className="flex items-start gap-2">
        {icon}
        <p className="text-sm text-blue-700">{suggestion}</p>
      </div>
    </div>
  );
};

// Edit Repair Form Component
const EditRepairForm = ({ repair, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    deviceBrand: repair.deviceBrand,
    deviceModel: repair.deviceModel,
    imeiNumber: repair.imeiNumber || '',
    problemCategory: repair.problemCategory,
    problemDescription: repair.problemDescription
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(repair.id, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium text-gray-900 mb-3">Edit Repair Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Device Brand</label>
          <input
            type="text"
            name="deviceBrand"
            value={formData.deviceBrand}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Device Model</label>
          <input
            type="text"
            name="deviceModel"
            value={formData.deviceModel}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">IMEI Number</label>
        <input
          type="text"
          name="imeiNumber"
          value={formData.imeiNumber}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Problem Category</label>
        <select
          name="problemCategory"
          value={formData.problemCategory}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          required
        >
          <option value="SCREEN">Screen</option>
          <option value="BATTERY">Battery</option>
          <option value="CHARGING">Charging</option>
          <option value="WATER_DAMAGE">Water Damage</option>
          <option value="SOFTWARE">Software</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
        <textarea
          name="problemDescription"
          value={formData.problemDescription}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
          rows="3"
          required
        ></textarea>
      </div>
      
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <PlayCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700 font-medium">Update Status</p>
            <p className="text-sm text-blue-700 mt-1">Clicking 'Start Repair' will update this repair to 'In Progress' status.</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start Repair
        </button>
      </div>
    </form>
  );
};

export const ActiveRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingRepairId, setEditingRepairId] = useState(null);
  const [expandedRepairId, setExpandedRepairId] = useState(null);

  const fetchActiveRepairs = async () => {
    try {
      const data = await shopApi.getAllRepairRequests();
      setRepairs(data);
      setError('');
    } catch (err) {
      logger.error('Failed to fetch active repairs:', err);
      setError('Failed to fetch active repairs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRepairs();
  }, []);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await shopApi.updateRepairStatus(requestId, newStatus);
      setSuccess(`Successfully updated repair status to ${newStatus.toLowerCase()}`);
      setTimeout(() => setSuccess(''), 3000);
      await fetchActiveRepairs();
      logger.info(`Successfully updated repair ${requestId} to status ${newStatus}`);
    } catch (err) {
      logger.error('Failed to update repair status:', err);
      setError('Failed to update repair status');
    }
  };

  const handleSaveRepairDetails = async (requestId, formData) => {
    try {
      await shopApi.updateRepairDetails(requestId, formData);
      await handleStatusUpdate(requestId, REQUEST_STATUS.IN_PROGRESS);
      setEditingRepairId(null);
      setSuccess('Repair details updated and work started');
      setTimeout(() => setSuccess(''), 3000);
      await fetchActiveRepairs();
    } catch (err) {
      logger.error('Failed to update repair details:', err);
      setError('Failed to update repair details');
    }
  };

  const handleCancelEdit = () => {
    setEditingRepairId(null);
  };

  const toggleExpandRepair = (repairId) => {
    setExpandedRepairId(expandedRepairId === repairId ? null : repairId);
  };

  // Format date string for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate duration since created date
  const calculateDuration = (startDate) => {
    if (!startDate) return '-';
    
    const start = new Date(startDate);
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffMs = now - start;
    
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

  // Function to render image thumbnails - Fixed to match CompletedRepairs component
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Active Repairs</h1>
            <p className="mt-2 text-gray-600">Track and manage ongoing repairs</p>
          </div>

          {error && (
            <div className="mx-6 mt-6">
              <Alert title="Error" message={error} type="error" />
            </div>
          )}

          {success && (
            <div className="mx-6 mt-6">
              <Alert title="Success" message={success} type="success" />
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
                {repairs.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-500 mt-0.5">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Managing Your Repairs</h3>
                        <ul className="mt-2 text-sm text-blue-700 space-y-2">
                          <li className="flex items-start gap-2">
                            <ChevronDown className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>Click on a repair card to view complete details</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Edit className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>Use <strong>Edit</strong> to update details and start working on accepted repairs</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>Mark repairs as completed when the work is done</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {repairs.map((repair) => (
                  <div key={repair.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow transition-shadow">
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleExpandRepair(repair.id)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-gray-900">
                                {repair.deviceBrand} {repair.deviceModel}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[repair.status]}`}>
                                {repair.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Problem: {repair.problemCategory}
                            </p>
                            <div className="flex flex-wrap items-center mt-2 gap-3 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>Started: {formatDate(repair.createdAt)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>Duration: {calculateDuration(repair.createdAt)}</span>
                              </div>
                              {repair.imageUrls && repair.imageUrls.length > 0 && (
                                <div className="flex items-center text-blue-600">
                                  <ImageIcon className="w-4 h-4 mr-1" />
                                  <span>{repair.imageUrls.length} {repair.imageUrls.length === 1 ? 'image' : 'images'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {repair.status === REQUEST_STATUS.ACCEPTED && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRepairId(repair.id);
                                }}
                                className="ml-2 p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit repair details"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {expandedRepairId === repair.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400 ml-2" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {repair.quote && !expandedRepairId && (
                        <div className="px-4 pb-3 -mt-1">
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center text-gray-700">
                              <span className="font-medium mr-1">Cost:</span> 
                              <span>${repair.quote.estimatedCost}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="font-medium mr-1">Est. time:</span>
                              <span>{repair.quote.estimatedDays} days</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {(expandedRepairId === repair.id || editingRepairId === repair.id) && (
                      <div className="border-t border-gray-100">
                        {editingRepairId === repair.id ? (
                          <EditRepairForm 
                            repair={repair} 
                            onSave={handleSaveRepairDetails}
                            onCancel={handleCancelEdit}
                          />
                        ) : (
                          <div className="p-4 bg-gray-50">
                            {/* Suggestion for shop owners */}
                            <ShopOwnerSuggestion status={repair.status} />
                            
                            {repair.quote && (
                              <div className="mt-4">
                                <p className="text-sm font-medium text-gray-900 mb-2">Quote Details</p>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-500">Cost:</span>
                                        <span className="ml-2 text-sm text-gray-900">${repair.quote.estimatedCost}</span>
                                      </div>
                                      <div className="flex items-center mt-1">
                                        <span className="text-sm font-medium text-gray-500">Duration:</span>
                                        <span className="ml-2 text-sm text-gray-900">{repair.quote.estimatedDays} days</span>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-500">Description:</span>
                                      <p className="text-sm text-gray-900 mt-1">{repair.quote.description}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-900 mb-2">Problem Description</p>
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700">{repair.problemDescription}</p>
                              </div>
                            </div>

                            {/* Device Images - Fixed implementation to match CompletedRepairs */}
                            {renderImageThumbnails(repair.imageUrls)}

                            {repair.status === REQUEST_STATUS.IN_PROGRESS && (
                              <div className="mt-6 flex justify-end">
                                <button
                                  onClick={() => handleStatusUpdate(repair.id, REQUEST_STATUS.COMPLETED)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Completed
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {repairs.length === 0 && (
                  <div className="text-center py-12">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-500">No active repairs</p>
                    <p className="mt-2 text-sm text-gray-400">New repairs will appear here once started</p>
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