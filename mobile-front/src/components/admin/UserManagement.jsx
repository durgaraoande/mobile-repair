import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { authApi } from '../../api/auth'; // Assuming this is the correct import
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../common/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import { Spinner } from '../common/Spinner';
import { toastService } from '../../utils/toastService'; // Assuming a toast utility
import { 
  FiSearch, 
  FiEdit, 
  FiLock, 
  FiCheckCircle, 
  FiXCircle, 
  FiUnlock, 
  FiRefreshCw 
} from 'react-icons/fi';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailDialog, setUserDetailDialog] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [statusChangeDialog, setStatusChangeDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await adminApi.getAllUsers();
      setUsers(fetchedUsers);
      toastService.success('Users loaded successfully');
    } catch (error) {
      toastService.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    try {
      if (!selectedUser) return;
      
      await authApi.resendEmailVerification(selectedUser.email);
      setVerificationDialog(false);
      toastService.success('Verification email sent');
    } catch (error) {
      toastService.error('Failed to send verification email');
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!selectedUser) return;
      
      await adminApi.resetUserPassword(selectedUser.id);
      toastService.success('Password reset email sent');
    } catch (error) {
      toastService.error('Failed to send password reset');
    }
  };

  const handleStatusChange = async () => {
    try {
      if (!selectedUser) return;
      
      await adminApi.updateUserStatus(
        selectedUser.id, 
        selectedStatus, 
        `Status changed by admin`
      );
      fetchUsers();
      setStatusChangeDialog(false);
      toastService.success(`User status updated to ${selectedStatus}`);
    } catch (error) {
      toastService.error('Failed to update user status');
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const openUserDetailDialog = (user) => {
    setSelectedUser(user);
    setUserDetailDialog(true);
  };
  
  const openVerificationDialog = (user) => {
    setSelectedUser(user);
    setVerificationDialog(true);
  };

  const openStatusChangeDialog = (user) => {
    setSelectedUser(user);
    setSelectedStatus(user.enabled ? 'SUSPENDED' : 'ACTIVE');
    setStatusChangeDialog(true);
  };
  
  const getStatusBadgeClass = (enabled) => {
    return enabled 
      ? 'bg-green-900 text-green-200' 
      : 'bg-red-900 text-red-200';
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

  const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'BLOCKED'];

  return (
    <Card className="bg-gray-950 text-white border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between bg-gray-900 border-b border-gray-800">
        <CardTitle className="text-white">User Management</CardTitle>
        <div className="relative w-64">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 bg-gray-800 text-white border-gray-700 focus:border-blue-900"
          />
          <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
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
                  {['Full Name', 'Email', 'Phone', 'Role', 'Status', 'Created At', 'Actions'].map((header) => (
                    <th key={header} className="text-left p-3 border-b border-gray-800 text-gray-300">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-900 transition-colors">
                      <td className="p-3 border-b border-gray-800">{user.fullName}</td>
                      <td className="p-3 border-b border-gray-800">{user.email}</td>
                      <td className="p-3 border-b border-gray-800">{user.phoneNumber}</td>
                      <td className="p-3 border-b border-gray-800">{user.role}</td>
                      <td className="p-3 border-b border-gray-800">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(user.enabled)}`}>
                          {user.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 border-b border-gray-800">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-3 border-b border-gray-800">
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openUserDetailDialog(user)}
                            title="View Details"
                            className="bg-gray-800 text-white hover:bg-blue-900"
                          >
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openStatusChangeDialog(user)}
                            title={user.enabled ? 'Suspend User' : 'Activate User'}
                            className="bg-gray-800 text-white hover:bg-red-900"
                          >
                            {user.enabled ? <FiLock className="h-4 w-4" /> : <FiUnlock className="h-4 w-4" />}
                          </Button>
                          {!user.emailVerifiedAt && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openVerificationDialog(user)}
                              title="Resend Verification"
                              className="bg-gray-800 text-white hover:bg-green-900"
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
                    <td colSpan={7} className="p-3 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* User Details Dialog */}
        <Dialog open={userDetailDialog} onOpenChange={setUserDetailDialog}>
          <DialogContent className="bg-gray-950 text-white border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">User Details</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              {selectedUser && (
                <>
                  <p><strong>Full Name:</strong> {selectedUser.fullName}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
                  <p><strong>Role:</strong> {selectedUser.role}</p>
                  <p><strong>Status:</strong> {selectedUser.enabled ? 'Active' : 'Inactive'}</p>
                  <p><strong>Created At:</strong> {formatDate(selectedUser.createdAt)}</p>
                  <p><strong>Updated At:</strong> {formatDate(selectedUser.updatedAt)}</p>
                  <p><strong>Email Verified:</strong> {selectedUser.emailVerifiedAt ? 'Yes' : 'No'}</p>
                </>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={() => setUserDetailDialog(false)}
                className="bg-gray-800 text-white hover:bg-blue-900"
              >
                Close
              </Button>
              <Button 
                onClick={handleResetPassword}
                className="bg-blue-900 text-white hover:bg-blue-800"
              >
                <FiRefreshCw className="mr-2" /> Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Email Verification Dialog */}
        <Dialog open={verificationDialog} onOpenChange={setVerificationDialog}>
          <DialogContent className="bg-gray-950 text-white border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Resend Verification Email</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to resend verification email to{' '}
                <span className="font-semibold">{selectedUser?.fullName}</span>?
              </p>
              <p className="mt-2 text-sm text-gray-400">
                A new verification link will be sent to the user's email.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setVerificationDialog(false)}
                className="bg-gray-800 text-white hover:bg-red-900"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleResendVerification}
                className="bg-green-900 text-white hover:bg-green-800"
              >
                Resend Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Change Dialog */}
        <Dialog open={statusChangeDialog} onOpenChange={setStatusChangeDialog}>
          <DialogContent className="bg-gray-950 text-white border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Change User Status</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Change status for{' '}
                <span className="font-semibold">{selectedUser?.fullName}</span>
              </p>
              <Select 
                value={selectedStatus} 
                onValueChange={(value) => setSelectedStatus(value)}
              >
                <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700 mt-4">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-gray-800">
                  {USER_STATUSES.map((status) => (
                    <SelectItem 
                      key={status} 
                      value={status}
                      className="hover:bg-gray-800"
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setStatusChangeDialog(false)}
                className="bg-gray-800 text-white hover:bg-red-900"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStatusChange}
                className="bg-blue-900 text-white hover:bg-blue-800"
              >
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};