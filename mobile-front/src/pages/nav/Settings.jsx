import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/common/Button';
import { Lock, Shield, Mail, Clock, AlertTriangle, User, Globe } from 'lucide-react';
import { authApi } from '../../api/auth';

export const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loginActivity, setLoginActivity] = useState([
    { 
      id: 1, 
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      ipAddress: '192.168.1.1',
      device: 'Chrome on MacOS',
      status: 'success',
      location: 'New York, USA'
    },
    { 
      id: 2, 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      ipAddress: '192.168.1.1',
      device: 'Safari on iOS',
      status: 'success',
      location: 'New York, USA'
    }
  ]);

  useEffect(() => {
    // Fetch login activity
    const fetchLoginActivity = async () => {
      try {
        const activity = await authApi.getLoginActivity(user.id);
        setLoginActivity(activity);
      } catch (error) {
        console.error('Failed to fetch login activity:', error);
      }
    };

    if (user) {
      fetchLoginActivity();
    }
  }, [user]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
      if (error.message.includes('Current password is incorrect')) {
        setErrors((prev) => ({
          ...prev,
          currentPassword: 'Current password is incorrect',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (user.enabled) return;
    
    setLoading(true);
    
    try {
      await authApi.resendEmailVerification(user.email);
      toast.success('Verification email has been sent successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  // Custom date formatting functions to replace date-fns
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }); // e.g., "April 29, 2023"
  };

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  };

  const formatDateTime = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }); // "Apr 29, 2023, 3:25 PM"
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength === 0) return { label: 'Very Weak', color: 'bg-red-500' };
    if (strength === 1) return { label: 'Weak', color: 'bg-red-400' };
    if (strength === 2) return { label: 'Fair', color: 'bg-yellow-500' };
    if (strength === 3) return { label: 'Good', color: 'bg-yellow-400' };
    if (strength === 4) return { label: 'Strong', color: 'bg-green-400' };
    return { label: 'Very Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  if (!user) {
    return <div className="text-center py-10">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Account Settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account security and preferences
          </p>
        </div>
        
        {/* Email Verification Section */}
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="flex items-center">
                <Mail size={20} className="text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium leading-6 text-gray-900">Email Verification</h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Verify your email address to access all features
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className={`rounded-md ${user.enabled ? 'bg-green-50' : 'bg-yellow-50'} p-4`}>
                <div className="flex">
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        {user.enabled 
                          ? 'Your email has been verified.'
                          : 'Your email is pending verification. Please check your inbox.'}
                      </p>
                      {user.enabled && user.emailVerifiedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Verified on {formatDate(user.emailVerifiedAt)} ({timeAgo(user.emailVerifiedAt)})
                        </p>
                      )}
                    </div>
                    <p className="mt-3 text-sm md:mt-0 md:ml-6">
                      {!user.enabled && (
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={handleResendVerification}
                          disabled={loading}
                        >
                          Resend Verification
                        </Button>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Password Change Section */}
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="flex items-center">
                <Lock size={20} className="text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium leading-6 text-gray-900">Password</h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Update your password regularly for better security
              </p>
              {user.passwordUpdatedAt && (
                <p className="mt-2 text-xs text-gray-500">
                  Last updated: {formatDate(user.passwordUpdatedAt)} 
                  <br />({timeAgo(user.passwordUpdatedAt)})
                </p>
              )}
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                        errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                        errors.newPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                    
                    {passwordData.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Password Strength</span>
                          <span className="text-xs font-medium text-gray-700">{passwordStrength.label}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${passwordStrength.color} h-2 rounded-full`} 
                            style={{width: `${(getPasswordStrength(passwordData.newPassword).label !== 'Very Weak' ? 20 * getPasswordStrength(passwordData.newPassword).label.length / 10 : 0)}%`}}
                          ></div>
                        </div>
                        <ul className="mt-2 text-xs text-gray-500 space-y-1">
                          <li className="flex items-center">
                            <span className={`mr-1 w-3 h-3 inline-block rounded-full ${passwordData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            At least 8 characters
                          </li>
                          <li className="flex items-center">
                            <span className={`mr-1 w-3 h-3 inline-block rounded-full ${/[A-Z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            At least one uppercase letter
                          </li>
                          <li className="flex items-center">
                            <span className={`mr-1 w-3 h-3 inline-block rounded-full ${/[a-z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            At least one lowercase letter
                          </li>
                          <li className="flex items-center">
                            <span className={`mr-1 w-3 h-3 inline-block rounded-full ${/[0-9]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            At least one number
                          </li>
                          <li className="flex items-center">
                            <span className={`mr-1 w-3 h-3 inline-block rounded-full ${/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            At least one special character
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="medium"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Security Section */}
        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="flex items-center">
                <Shield size={20} className="text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium leading-6 text-gray-900">Security</h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Additional security options for your account
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              {/* <div className="rounded-md bg-yellow-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle size={18} className="text-yellow-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-yellow-700">
                      Forgot your password? 
                      <a href="/forgot-password" className="font-medium text-yellow-700 underline ml-1">
                        Reset it here
                      </a>
                    </p>
                  </div>
                </div>
              </div> */}
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Login Activity</h4>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Time
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Device
                        </th>
                        <th
                          scope="col"
                          className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginActivity.map((activity) => (
                        <tr key={activity.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDateTime(activity.timestamp)}</div>
                            <div className="text-xs text-gray-500">{timeAgo(activity.timestamp)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{activity.device}</div>
                            <div className="text-xs text-gray-500">{activity.ipAddress}</div>
                          </td>
                          <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <Globe size={16} className="text-gray-400 mr-1" />
                              <span className="text-sm text-gray-900">{activity.location}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  <p>If you notice any suspicious activity, please change your password immediately and contact support.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Information Section */}
        <div className="px-4 py-5 sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="flex items-center">
                <User size={20} className="text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium leading-6 text-gray-900">Account Information</h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                View your account details
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.fullName}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.phoneNumber || 'Not provided'}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.role}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                    {user.createdAt && <span className="text-xs text-gray-500 ml-1">({timeAgo(user.createdAt)})</span>}
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(user.updatedAt)}
                    {user.updatedAt && <span className="text-xs text-gray-500 ml-1">({timeAgo(user.updatedAt)})</span>}
                  </dd>
                </div>
              </dl>
              
              <div className="mt-5 border-t border-gray-200 pt-5">
                <a href="/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Edit Profile Information →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;