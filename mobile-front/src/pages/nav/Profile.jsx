import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/common/Button';
import { User, Mail, Phone, CheckCircle, AlertCircle, Calendar, Clock } from 'lucide-react';
import { authApi } from '../../api/auth';

// Custom date formatting functions to replace date-fns
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString(undefined, options); // e.g., "April 29, 2023"
};

const timeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffYears > 0) {
    return diffYears === 1 ? 'about 1 year ago' : `about ${diffYears} years ago`;
  } else if (diffMonths > 0) {
    return diffMonths === 1 ? 'about 1 month ago' : `about ${diffMonths} months ago`;
  } else if (diffDays > 0) {
    return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? 'about 1 hour ago' : `about ${diffHours} hours ago`;
  } else if (diffMins > 0) {
    return diffMins === 1 ? 'about 1 minute ago' : `about ${diffMins} minutes ago`;
  } else {
    return 'just now';
  }
};

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePhoneNumber = (phoneNumber) => {
    // Basic phone validation - can be adjusted based on your requirements
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    setLoading(true);

    try {
      const updatedUser = await authApi.updateUserProfile(user.id, formData);
      
      updateUser({
        ...user,
        ...updatedUser,
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your personal information and account status
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                      required
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+1234567890"
                      className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter phone number with country code (e.g., +1234567890)</p>
                </div>

                <div className="sm:col-span-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="medium"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="medium"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User size={20} className="text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">{user.fullName}</h4>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail size={16} className="mr-1" /> Email Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone size={16} className="mr-1" /> Phone Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.phoneNumber || 'Not provided'}
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar size={16} className="mr-1" /> Member Since
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                    {user.createdAt && <span className="text-xs text-gray-500 ml-1">({timeAgo(user.createdAt)})</span>}
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Clock size={16} className="mr-1" /> Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(user.updatedAt)}
                    {user.updatedAt && <span className="text-xs text-gray-500 ml-1">({timeAgo(user.updatedAt)})</span>}
                  </dd>
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    {user.enabled ? (
                      <>
                        <CheckCircle size={16} className="text-green-500 mr-1" />
                        <span className="mr-2">Verified</span>
                        {user.emailVerifiedAt && (
                          <span className="text-xs text-gray-500">
                            (Verified on {formatDate(user.emailVerifiedAt)})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-yellow-500 mr-1" />
                        <span>Pending verification</span>
                      </>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="pt-5">
                <Button
                  variant="primary"
                  size="medium"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;