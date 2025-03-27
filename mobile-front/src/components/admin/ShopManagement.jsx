import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { toastService } from '../../utils/toastService';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/Button'
import { Input } from '../common/Input';
import { Textarea } from '../common/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../common/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import { Spinner } from '../common/Spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/ui/tabs';
import { FiSearch, FiCheckCircle, FiAlertCircle, FiEye, FiEdit, FiMapPin, FiClock, FiPhone, FiMail } from 'react-icons/fi';

// Shop Status Constants
const SHOP_STATUS = {
  ALL: 'All Statuses',
  PENDING_VERIFICATION: 'Pending Verification',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  DEACTIVATED: 'Deactivated'
};

export const ShopManagement = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedShop, setSelectedShop] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [shopDetailsDialog, setShopDetailsDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  useEffect(() => {
    fetchShops();
  }, []);
  
  const fetchShops = async () => {
    try {
      setLoading(true);
      const fetchedShops = await adminApi.getAllShops();
      setShops(fetchedShops);
      toastService.success('Shops loaded successfully');
    } catch (error) {
      toastService.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async () => {
    try {
      if (!selectedShop || !newStatus) return;
      
      // Determine if a reason is needed
      const reason = newStatus === 'DEACTIVATED' ? rejectionReason : undefined;
      
      // Call the API method with optional reason
      await adminApi.updateShopStatus(
        selectedShop.id, 
        newStatus, 
        reason
      );
      
      // Refresh the shop list
      fetchShops();
      
      // Close the dialog and reset states
      setStatusDialog(false);
      setRejectionReason('');
      setNewStatus('');
    } catch (error) {
      // Error handling is already done in the API method
      // This catch block is just an additional safety net
      toastService.error('Failed to update shop status');
    }
  };
  
  const handleVerifyShop = async (shopId) => {
    try {
      await adminApi.verifyShop(shopId);
      fetchShops();
    } catch (error) {
      // Error handling is already done in the API method
      toastService.error('Failed to verify shop');
    }
  };
  
  // Filtering logic remains the same
  const filteredShops = shops.filter(shop => {
    const matchesSearch = 
      shop.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      shop.owner?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (shop.status === statusFilter || 
       (statusFilter === 'PENDING_VERIFICATION' && !shop.verified));
    
    return matchesSearch && matchesStatus;
  });
  
  const openStatusDialog = (shop) => {
    setSelectedShop(shop);
    setNewStatus(shop.status || '');
    setStatusDialog(true);
  };
  
  const openShopDetailsDialog = async (shop) => {
    try {
      const fullShopDetails = await adminApi.getShopDetails(shop.id);
      setSelectedShop(fullShopDetails);
      setShopDetailsDialog(true);
    } catch (error) {
      toastService.error('Failed to load shop details');
    }
  };
  
  // getStatusBadgeClass method remains the same
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-900 text-green-200';
      case 'DEACTIVATED':
        return 'bg-red-900 text-red-200';
      case 'PENDING_VERIFICATION':
        return 'bg-yellow-900 text-yellow-200';
      case 'SUSPENDED':
        return 'bg-orange-900 text-orange-200';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <Card className="bg-gray-950 text-white border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800">
        <CardTitle className="text-white">Shop Management</CardTitle>
        <div className="flex space-x-4">
          <div className="relative w-64">
            <Input
              placeholder="Search shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 text-white border-gray-700 pr-10"
            />
            <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-gray-900 text-white border-gray-700">
              <SelectValue placeholder="Status">
                {SHOP_STATUS[statusFilter]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-900 text-white border-gray-700">
              {Object.entries(SHOP_STATUS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="px-4 py-2">
                  {label}
                </SelectItem>
              ))}
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-900">
                  <th className="text-left p-3 border-b border-gray-800 text-gray-300">Shop Name</th>
                  <th className="text-left p-3 border-b border-gray-800 text-gray-300">Owner</th>
                  <th className="text-left p-3 border-b border-gray-800 text-gray-300">Address</th>
                  <th className="text-left p-3 border-b border-gray-800 text-gray-300">Status</th>
                  <th className="text-left p-3 border-b border-gray-800 text-gray-300">Verified</th>
                  <th className="text-center p-3 border-b border-gray-800 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.length > 0 ? (
                  filteredShops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-gray-900 transition-colors">
                      <td className="p-3 border-b border-gray-800">{shop.shopName}</td>
                      <td className="p-3 border-b border-gray-800">{shop.owner?.fullName}</td>
                      <td className="p-3 border-b border-gray-800">{shop.address}</td>
                      <td className="p-3 border-b border-gray-800">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(shop.status)}`}>
                          {shop.status ? SHOP_STATUS[shop.status] : 'N/A'}
                        </span>
                      </td>
                      <td className="p-3 border-b border-gray-800">
                        {shop.verified ? (
                          <span className="text-green-400 flex items-center">
                            <FiCheckCircle className="mr-1" /> Yes
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center">
                            <FiAlertCircle className="mr-1" /> No
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-b border-gray-800">
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openShopDetailsDialog(shop)}
                            className="bg-gray-800 text-white hover:bg-gray-700"
                            title="View Details"
                          >
                            <FiEye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openStatusDialog(shop)}
                            className="bg-gray-800 text-white hover:bg-gray-700"
                            title="Change Status"
                          >
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          {!shop.verified && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyShop(shop.id)}
                              className="bg-green-900 text-green-200 hover:bg-green-800"
                              title="Verify Shop"
                            >
                              <FiCheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-3 text-center text-gray-500">
                      No shops found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Status Change Dialog */}
        <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
          <DialogContent className="bg-gray-900 text-white border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Change Shop Status</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4 text-gray-300">
                Change status for <span className="font-semibold text-white">{selectedShop?.shopName}</span>
              </p>
              <Select value={newStatus} onValueChange={setNewStatus} className="mb-4">
                <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Select new status">
                    {newStatus ? SHOP_STATUS[newStatus] : 'Select Status'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-gray-700">
                  {Object.keys(SHOP_STATUS)
                    .filter(status => status !== 'ALL')
                    .map((status) => (
                      <SelectItem key={status} value={status}>
                        {SHOP_STATUS[status]}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              
              {newStatus === 'DEACTIVATED' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1 text-gray-300">Deactivation Reason</label>
                  <Textarea
                    placeholder="Please provide a reason for deactivation"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="bg-gray-800 text-white border-gray-700"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialog(false)} className="bg-gray-800 text-white hover:bg-gray-700">Cancel</Button>
              <Button onClick={handleStatusChange} className="bg-blue-900 text-blue-200 hover:bg-blue-800">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Shop Details Dialog */}
        <Dialog open={shopDetailsDialog} onOpenChange={setShopDetailsDialog}>
          <DialogContent className="max-w-4xl bg-gray-950 text-white border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Shop Details</DialogTitle>
            </DialogHeader>
            {selectedShop && (
              <div className="py-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-4 bg-gray-900">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-blue-900 data-[state=active]:text-blue-200">Basic Info</TabsTrigger>
                    <TabsTrigger value="owner" className="data-[state=active]:bg-blue-900 data-[state=active]:text-blue-200">Owner Info</TabsTrigger>
                    <TabsTrigger value="services" className="data-[state=active]:bg-blue-900 data-[state=active]:text-blue-200">Services</TabsTrigger>
                    <TabsTrigger value="stats" className="data-[state=active]:bg-blue-900 data-[state=active]:text-blue-200">Shop Stats</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Shop Name</p>
                        <p className="font-semibold text-white">{selectedShop.shopName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Operating Hours</p>
                        <p className="flex items-center text-gray-300"><FiClock className="mr-2" /> {selectedShop.operatingHours}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-400">Address</p>
                        <p className="flex items-center text-gray-300"><FiMapPin className="mr-2" /> {selectedShop.address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedShop.status)}`}>
                          {selectedShop.status || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Verified</p>
                        <p className={selectedShop.verified ? 'text-green-400' : 'text-red-400'}>
                          {selectedShop.verified ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-400">Description</p>
                        <p className="text-gray-300">{selectedShop.description}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="owner" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Owner Name</p>
                        <p className="font-semibold text-white">{selectedShop.owner?.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Email</p>
                        <p className="flex items-center text-gray-300"><FiMail className="mr-2" /> {selectedShop.owner?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Phone</p>
                        <p className="flex items-center text-gray-300"><FiPhone className="mr-2" /> {selectedShop.owner?.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Joined Date</p>
                        <p className="text-gray-300">{new Date(selectedShop.owner?.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="services" className="mt-4">
                    {selectedShop.services?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedShop.services.map((service, index) => (
                          <div key={index} className="p-3 border border-gray-800 rounded-md bg-gray-900">
                            <p className="font-semibold text-white">{service}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No services listed</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="stats" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Repairs</p>
                        <p className="text-white">{selectedShop.totalRepairs || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Average Rating</p>
                        <p className="text-white">{selectedShop.averageRating || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Completion Rate</p>
                        <p className="text-white">{selectedShop.completionRate || 'N/A'}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Rush Service</p>
                        <p className={selectedShop.rushServiceAvailable ? 'text-green-400' : 'text-red-400'}>
                          {selectedShop.rushServiceAvailable ? 'Available' : 'Not Available'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShopDetailsDialog(false)} className="bg-gray-800 text-white hover:bg-gray-700">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};