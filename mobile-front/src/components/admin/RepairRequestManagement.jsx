import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { toastService } from '../../utils/toastService';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../common/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import { Spinner } from '../common/Spinner';
import { FiSearch, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const RepairRequestManagement = () => {
  const [repairRequests, setRepairRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  useEffect(() => {
    fetchRepairRequests();
  }, [statusFilter, pagination.page]);

  const fetchRepairRequests = async () => {
    try {
      setLoading(true);
      const options = {
        status: statusFilter === 'ALL' ? null : statusFilter,
        page: pagination.page,
        size: pagination.size,
        sort: 'createdAt,desc'
      };

      const response = await adminApi.getAllRepairRequests(options);
      
      setRepairRequests(response.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      }));
    } catch (error) {
      toastService.error('Failed to load repair requests');
      console.error('Error fetching repair requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailsDialog = async (request) => {
    try {
      const fullDetails = await adminApi.getRepairRequestDetails(request.id);
      setSelectedRequest(fullDetails);
      setDetailsDialog(true);
    } catch (error) {
      toastService.error('Failed to load request details');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-900 text-yellow-100',
      'QUOTED': 'bg-purple-900 text-purple-100',
      'ACCEPTED': 'bg-blue-900 text-blue-100',
      'IN_PROGRESS': 'bg-indigo-900 text-indigo-100',
      'COMPLETED': 'bg-green-900 text-green-100',
      'CANCELLED': 'bg-red-900 text-red-100'
    };
    return statusColors[status] || 'bg-gray-900 text-gray-100';
  };

  const formatDate = (dateString) => {
    return dateString 
      ? new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) 
      : 'N/A';
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const filteredRequests = repairRequests.filter(request => {
    const matchesSearch = 
      request.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      request.deviceBrand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.deviceModel?.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesSearch;
  });

  return (
    <Card className="bg-gray-950 text-white border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800">
        <CardTitle className="text-white">Repair Request Management</CardTitle>
        <div className="flex space-x-4">
          <div className="relative w-64">
            <Input
              placeholder="Search by customer, brand, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 text-white border-gray-800 pr-10"
            />
            <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-gray-900 text-white border-gray-800">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 text-white">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="QUOTED">Quoted</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900 border-b border-gray-800">
                    <th className="text-left p-3 text-gray-300">Customer</th>
                    <th className="text-left p-3 text-gray-300">Device</th>
                    <th className="text-left p-3 text-gray-300">IMEI</th>
                    <th className="text-left p-3 text-gray-300">Problem</th>
                    <th className="text-left p-3 text-gray-300">Status</th>
                    <th className="text-left p-3 text-gray-300">Created At</th>
                    <th className="text-center p-3 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-900 border-b border-gray-800">
                        <td className="p-3">
                          <div>
                            <p>{request.customer?.fullName}</p>
                            <p className="text-xs text-gray-400">{request.customer?.phoneNumber}</p>
                          </div>
                        </td>
                        <td className="p-3">{request.deviceBrand} {request.deviceModel}</td>
                        <td className="p-3">{request.imeiNumber}</td>
                        <td className="p-3">{request.problemCategory}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="p-3">{formatDate(request.createdAt)}</td>
                        <td className="p-3">
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openDetailsDialog(request)}
                              className="bg-gray-900 text-white border-gray-700 hover:bg-gray-800"
                              title="View Details"
                            >
                              <FiEye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-3 text-center text-gray-500">
                        No repair requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-4 space-x-2">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  <FiChevronLeft className="mr-2" /> Previous
                </Button>
                <div className="text-white">
                  Page {pagination.page + 1} of {pagination.totalPages}
                </div>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages - 1}
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  Next <FiChevronRight className="ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
        
        {/* Repair Request Details Dialog */}
        <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
          <DialogContent className="max-w-3xl bg-gray-950 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Repair Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="py-4 space-y-4 text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Customer Name</p>
                    <p className="font-semibold">{selectedRequest.customer?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Contact Number</p>
                    <p>{selectedRequest.customer?.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Device</p>
                    <p>{selectedRequest.deviceBrand} {selectedRequest.deviceModel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">IMEI Number</p>
                    <p>{selectedRequest.imeiNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Problem Category</p>
                    <p>{selectedRequest.problemCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-400">Problem Description</p>
                    <p>{selectedRequest.problemDescription || 'No description provided'}</p>
                  </div>
                  {selectedRequest.imageUrls && selectedRequest.imageUrls.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-400 mb-2">Attached Images</p>
                      <div className="flex space-x-2">
                        {selectedRequest.imageUrls.map((url, index) => (
                          <img 
                            key={index} 
                            src={url} 
                            alt={`Repair request image ${index + 1}`} 
                            className="w-20 h-20 object-cover rounded border border-gray-800"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedRequest.quote && (
                    <div className="col-span-2 bg-gray-900 p-4 rounded">
                      <p className="text-sm font-medium text-gray-400 mb-2">Repair Quote</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-400">Estimated Cost</p>
                          <p>${selectedRequest.quote.estimatedCost?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Estimated Days</p>
                          <p>{selectedRequest.quote.estimatedDays || 'N/A'} days</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400">Quote Description</p>
                          <p>{selectedRequest.quote.description || 'No additional details'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-400">Created At</p>
                    <p>{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                  {selectedRequest.completedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-400">Completed At</p>
                      <p>{formatDate(selectedRequest.completedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                onClick={() => setDetailsDialog(false)}
                className="bg-blue-900 text-white hover:bg-blue-800"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};