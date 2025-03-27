import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Spinner } from '../common/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiTrendingUp, FiUsers, FiTool, FiStar } from 'react-icons/fi';

export const Analytics = () => {
  const [comprehensiveAnalytics, setComprehensiveAnalytics] = useState(null);
  const [reviewAnalytics, setReviewAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive analytics
      const comprehensiveData = await adminApi.getComprehensiveAnalytics();
      
      // Fetch review analytics
      const reviewData = await adminApi.getReviewAnalytics();
      
      setComprehensiveAnalytics(comprehensiveData);
      setReviewAnalytics(reviewData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Color palette for charts
  const COLORS = ['#1e40af', '#166534', '#be185d', '#9333ea', '#c2410c'];

  // Prepare pie chart data
  const preparePieData = (dataObj) => {
    return Object.entries(dataObj)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  };

  // Render review rating distribution
  const renderReviewRatingDistribution = () => {
    if (!reviewAnalytics) return null;

    const ratingData = Object.entries(reviewAnalytics.ratingCounts).map(([rating, count]) => ({
      name: `${rating} Star`,
      value: count
    }));

    return (
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FiStar className="mr-2 text-yellow-500" />
            Review Ratings Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="w-1/2">
              <p className="text-2xl font-bold text-blue-400">{reviewAnalytics.averageRating.toFixed(1)}</p>
              <p className="text-gray-300">Average Rating</p>
              <p className="text-sm text-gray-400">Total Reviews: {reviewAnalytics.totalReviews}</p>
            </div>
            <ResponsiveContainer width="50%" height={200}>
              <BarChart data={ratingData}>
                <XAxis dataKey="name" tick={{ fill: 'white' }} />
                <YAxis tick={{ fill: 'white' }} />
                <Bar dataKey="value" fill="#3b82f6">
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render financial insights
  const renderFinancialInsights = () => {
    const financialData = comprehensiveAnalytics?.financialInsights;
    if (!financialData) return null;

    return (
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FiTrendingUp className="mr-2 text-green-500" />
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-300">Estimated Total Revenue</p>
              <p className="text-xl font-bold text-green-400">
                ${financialData.estimatedTotalRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-300">Average Repair Cost</p>
              <p className="text-xl font-bold text-blue-400">
                ${financialData.averageRepairCost.toFixed(2)}
              </p>
            </div>
          </div>
          {financialData.topEarningShops && financialData.topEarningShops.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-300 mb-2">Top Earning Shops</p>
              {financialData.topEarningShops.map((shop, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{shop.shopName}</span>
                  <span className="text-green-400">${shop.earnings.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render existing charts with comprehensive analytics data
  const renderExistingCharts = () => {
    if (!comprehensiveAnalytics) return null;

    // User Growth Data
    const processedUserGrowth = comprehensiveAnalytics.userGrowth.map(user => ({
      date: new Date(user.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      newUsers: 1
    })).reduce((acc, curr) => {
      const existingEntry = acc.find(entry => entry.date === curr.date);
      if (existingEntry) {
        existingEntry.newUsers += 1;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);

    // Repair Request Data
    const repairRequestData = [
      { name: 'Device Types', ...comprehensiveAnalytics.requestAnalytics.byDeviceType },
      { name: 'Request Status', ...comprehensiveAnalytics.requestAnalytics.byStatus }
    ];

    // Shop Performance Data
    const shopPerformanceData = comprehensiveAnalytics.shopPerformance;

    return (
      <>
        {/* User Growth Chart */}
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">User Growth</CardTitle>
            <div className="flex items-center text-gray-300">
              <FiUsers className="mr-2 text-blue-500" />
              <span>Total Users: {processedUserGrowth.reduce((sum, item) => sum + item.newUsers, 0)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedUserGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis dataKey="date" tick={{ fill: 'white' }} />
                <YAxis tick={{ fill: 'white' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d3748', 
                    color: 'white',
                    border: '1px solid #4a5568'
                  }}
                />
                <Bar dataKey="newUsers" fill="#3b82f6" name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Repair Request Analytics */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Device Types Pie Chart */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Repair Requests by Device Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={preparePieData(repairRequestData[0])}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {preparePieData(repairRequestData[0]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#2d3748', 
                      color: 'white',
                      border: '1px solid #4a5568'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Request Status Pie Chart */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Repair Requests by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={preparePieData(repairRequestData[1])}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {preparePieData(repairRequestData[1]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#2d3748', 
                      color: 'white',
                      border: '1px solid #4a5568'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Shop Performance */}
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Shop Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopPerformanceData.map((shop) => (
                <div 
                  key={shop.shopId} 
                  className="p-4 border rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 text-white"
                >
                  <h3 className="font-semibold text-lg mb-2 text-blue-400">{shop.shopName}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">Completed Repairs:</span> {shop.completedRepairs}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">Average Rating:</span> {shop.avgRating.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">Avg. Repair Time:</span> {shop.avgRepairTime} hrs
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">Quote Acceptance Rate:</span> {(shop.quoteAcceptanceRate * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="space-y-6 bg-gray-950 min-h-screen p-6">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {renderExistingCharts()}
          <div className="grid md:grid-cols-2 gap-6">
            {renderReviewRatingDistribution()}
            {renderFinancialInsights()}
          </div>
        </>
      )}
    </div>
  );
};