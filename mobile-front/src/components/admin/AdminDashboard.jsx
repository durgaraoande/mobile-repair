import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/ui/tabs';
import { UserManagement } from '../admin/UserManagement'
import { ShopManagement } from '../admin/ShopManagement';
import { RepairRequestManagement } from '../admin/RepairRequestManagement';
import { Analytics } from '../admin/Analytics';
import { SystemNotifications } from '../admin/SystemNotifications';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiTool, 
  FiPieChart, 
  FiBell, 
  FiHome,
  FiAlertTriangle 
} from 'react-icons/fi';
import { Spinner } from '../common/Spinner';
import { Button } from '../common/Button';
import { logger } from '../../utils/logger'; // Assume a custom logging utility

export const AdminDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const validateStatistics = (data) => {
    // Comprehensive validation of API response
    const defaultStructure = {
      recentActivity: {
        newUsers: 0,
        newRequests: 0,
        newShops: 0
      },
      requestStats: {
        total: 0,
        newLast7Days: 0,
        byStatus: {
          CANCELLED: 0,
          QUOTED: 0,
          ACCEPTED: 0,
          PENDING: 0,
          COMPLETED: 0,
          IN_PROGRESS: 0
        }
      },
      userStats: {
        total: 0,
        byRole: {
          ADMIN: 0,
          SHOP_OWNER: 0,
          CUSTOMER: 0
        },
        newLast7Days: 0
      },
      shopStats: {
        total: 0,
        averageRating: 0,
        verified: 0
      }
    };

    try {
      // Deep merge with default structure to ensure all keys exist
      return Object.entries(defaultStructure).reduce((acc, [key, defaultValue]) => {
        acc[key] = {
          ...defaultValue,
          ...(data[key] || {})
        };
        return acc;
      }, {});
    } catch (validationError) {
      logger.error('Statistics validation error', {
        error: validationError,
        rawData: data
      });
      throw new Error('Invalid statistics structure');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const rawData = await adminApi.getDashboardStatistics();
      const validatedData = validateStatistics(rawData);
      setStatistics(validatedData);
      logger.info('Dashboard data fetched successfully', { 
        userCount: validatedData.userStats.total,
        shopCount: validatedData.shopStats.total 
      });
    } catch (error) {
      logger.error('Error fetching dashboard data', {
        errorMessage: error.message,
        errorStack: error.stack
      });
      setError({
        message: error.message || 'Failed to load dashboard statistics',
        details: error.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeTab]);

  const StatCard = ({ title, value, icon: Icon, colorClass = 'bg-gray-800', textColorClass = 'text-white' }) => (
    <Card className="bg-gray-900 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-white">
              {(value ?? 0).toLocaleString()}
            </h3>
          </div>
          <div className={`p-3 ${colorClass} rounded-full`}>
            <Icon className={`h-6 w-6 ${textColorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RecentActivityCard = () => (
    <Card className="bg-gray-900 border border-gray-700 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[
            { 
              label: 'New Users', 
              value: statistics?.recentActivity?.newUsers ?? 0,
              colorClass: 'bg-blue-900 text-blue-300'
            },
            { 
              label: 'New Requests', 
              value: statistics?.recentActivity?.newRequests ?? 0,
              colorClass: 'bg-green-900 text-green-300'
            },
            { 
              label: 'New Shops', 
              value: statistics?.recentActivity?.newShops ?? 0,
              colorClass: 'bg-purple-900 text-purple-300'
            }
          ].map(({ label, value, colorClass }) => (
            <div 
              key={label} 
              className="p-3 bg-gray-800 rounded flex justify-between items-center hover:bg-gray-700 transition"
            >
              <p className="font-medium text-white">{label}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
                {value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-900 border border-red-800 rounded-lg">
      <FiAlertTriangle className="h-16 w-16 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">
        Unable to Load Dashboard
      </h2>
      <p className="text-gray-300 mb-4 text-center">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <div className="text-xs text-gray-500 mb-4 text-center">
        {error?.details && `Error Details: ${error.details}`}
      </div>
      <Button 
        variant="destructive" 
        className="flex items-center space-x-2"
        onClick={fetchDashboardData}
      >
        <FiHome className="h-4 w-4" />
        <span>Retry</span>
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl bg-gray-950 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="text-sm text-gray-400">
          Last Updated: {new Date().toLocaleString()}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 gap-2 bg-gray-900 border border-gray-700 rounded-lg">
          {[
            { value: 'dashboard', icon: FiHome, label: 'Dashboard' },
            { value: 'users', icon: FiUsers, label: 'Users' },
            { value: 'shops', icon: FiShoppingBag, label: 'Shops' },
            { value: 'repairs', icon: FiTool, label: 'Repairs' },
            { value: 'analytics', icon: FiPieChart, label: 'Analytics' },
            { value: 'notifications', icon: FiBell, label: 'Notifications' }
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger 
              key={value} 
              value={value} 
              className="flex items-center space-x-2 text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard">
          {loading ? (
            <div className="flex justify-center p-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            renderErrorState()
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard 
                  title="Total Users" 
                  value={statistics?.userStats?.total} 
                  icon={FiUsers}
                  colorClass="bg-blue-900"
                  textColorClass="text-blue-300"
                />
                <StatCard 
                  title="Total Shops" 
                  value={statistics?.shopStats?.total} 
                  icon={FiShoppingBag}
                  colorClass="bg-green-900"
                  textColorClass="text-green-300"
                />
                <StatCard 
                  title="Verified Shops" 
                  value={statistics?.shopStats?.verified} 
                  icon={FiShoppingBag}
                  colorClass="bg-purple-900"
                  textColorClass="text-purple-300"
                />
                <StatCard 
                  title="Total Repair Requests" 
                  value={statistics?.requestStats?.total} 
                  icon={FiTool}
                  colorClass="bg-red-900"
                  textColorClass="text-red-300"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-gray-900 border border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">User Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { 
                          label: 'Shop Owners', 
                          value: statistics?.userStats?.byRole?.SHOP_OWNER ?? 0,
                          colorClass: 'bg-blue-900 text-blue-300'
                        },
                        { 
                          label: 'Customers', 
                          value: statistics?.userStats?.byRole?.CUSTOMER ?? 0,
                          colorClass: 'bg-green-900 text-green-300'
                        },
                        { 
                          label: 'Admins', 
                          value: statistics?.userStats?.byRole?.ADMIN ?? 0,
                          colorClass: 'bg-red-900 text-red-300'
                        }
                      ].map(({ label, value, colorClass }) => (
                        <div 
                          key={label} 
                          className="p-3 bg-gray-800 rounded flex justify-between items-center hover:bg-gray-700 transition"
                        >
                          <p className="font-medium text-white">{label}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
                            {value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <RecentActivityCard />
              </div>

              <div className="mt-4">
                <Card className="bg-gray-900 border border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Repair Request Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(statistics?.requestStats?.byStatus ?? {}).map(([status, count]) => (
                        <div 
                          key={status} 
                          className="p-3 bg-gray-800 rounded flex justify-between items-center hover:bg-gray-700 transition"
                        >
                          <p className="font-medium capitalize text-white">
                            {status.replace('_', ' ').toLowerCase()}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            status === 'PENDING' ? 'bg-yellow-900 text-yellow-300' : 
                            status === 'IN_PROGRESS' ? 'bg-blue-900 text-blue-300' : 
                            status === 'COMPLETED' ? 'bg-green-900 text-green-300' : 
                            status === 'ACCEPTED' ? 'bg-purple-900 text-purple-300' : 
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {count.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="shops">
          <ShopManagement />
        </TabsContent>

        <TabsContent value="repairs">
          <RepairRequestManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>

        <TabsContent value="notifications">
          <SystemNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;