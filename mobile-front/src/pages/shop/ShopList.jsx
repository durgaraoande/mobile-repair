import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopApi } from '../../api/shops';
import { Loading } from '../../components/common/Loading';
import { Star, MapPin, Clock, Wrench, Shield, CreditCard, Award, Phone } from 'lucide-react';

export const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const data = await shopApi.getAllShops();
        setShops(data);
      } catch (error) {
        setError('Failed to load repair shops');
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Get all unique services across shops
  const allServices = [...new Set(shops.flatMap(shop => shop.services || []))];

  // Filter shops based on search and service filter
  const filteredShops = shops.filter(shop => {
    const matchesSearch = filterValue === '' || 
      shop.shopName.toLowerCase().includes(filterValue.toLowerCase()) ||
      shop.address.toLowerCase().includes(filterValue.toLowerCase()) ||
      (shop.description && shop.description.toLowerCase().includes(filterValue.toLowerCase()));
    
    const matchesService = serviceFilter === '' || 
      (shop.services && shop.services.includes(serviceFilter));
    
    return matchesSearch && matchesService;
  });

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Repair Shop</h1>
          <p className="mt-2 text-gray-600">Browse our network of trusted repair professionals</p>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, location, or description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="">All Services</option>
                {allServices.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 max-w-3xl mx-auto p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredShops.map((shop) => (
            <div 
              key={shop.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{shop.shopName}</h2>
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium text-gray-700">
                      {shop.averageRating ? shop.averageRating.toFixed(1) : 'New'}
                    </span>
                  </div>
                </div>

                {/* Enhanced information display */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <p className="ml-2 text-gray-600">{shop.address}</p>
                  </div>

                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mt-1" />
                    <p className="ml-2 text-gray-600">{shop.operatingHours}</p>
                  </div>

                  {/* Contact info */}
                  {shop.phoneNumber && (
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-gray-400 mt-1" />
                      <p className="ml-2 text-gray-600">{shop.phoneNumber}</p>
                    </div>
                  )}

                  {/* Top specializations */}
                  {shop.specializedBrands && shop.specializedBrands.length > 0 && (
                    <div className="flex items-start">
                      <Award className="w-5 h-5 text-gray-400 mt-1" />
                      <div className="ml-2">
                        <p className="text-gray-700 font-medium mb-1">Brand Specialist:</p>
                        <div className="flex flex-wrap gap-1">
                          {shop.specializedBrands.slice(0, 3).map((brand, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {brand}
                            </span>
                          ))}
                          {shop.specializedBrands.length > 3 && (
                            <span className="px-2 py-1 text-gray-500 text-xs">+{shop.specializedBrands.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment methods highlight */}
                  {shop.paymentMethods && shop.paymentMethods.length > 0 && (
                    <div className="flex items-start">
                      <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                      <div className="ml-2">
                        <p className="text-gray-600">
                          Accepts: {shop.paymentMethods.slice(0, 3).join(', ')}
                          {shop.paymentMethods.length > 3 && ' & more'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Warranty highlight */}
                  {shop.warranty && (
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-gray-400 mt-1" />
                      <p className="ml-2 text-gray-600">{shop.warranty}</p>
                    </div>
                  )}

                  {/* Services */}
                  <div className="flex items-start">
                    <Wrench className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="ml-2 flex-1">
                      <p className="text-gray-700 font-medium mb-2">Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {(shop.services || []).slice(0, 4).map((service, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                        {(shop.services || []).length > 4 && (
                          <span className="px-3 py-1 text-gray-500 text-sm">
                            +{(shop.services || []).length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lead time information */}
                  {shop.averageRepairTime && (
                    <div className="mt-3 px-3 py-2 bg-blue-50 rounded-md">
                      <p className="text-blue-800 text-sm">
                        <span className="font-medium">Avg. Repair Time:</span> {shop.averageRepairTime}
                        {shop.rushServiceAvailable && ' • Rush service available'}
                      </p>
                    </div>
                  )}

                  {/* Description trimmed */}
                  {shop.description && (
                    <p className="text-gray-600 mt-4 line-clamp-2">{shop.description}</p>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    to={`/shops/${shop.id}`}
                    className="flex-1 block text-center px-4 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/repair-requests/new?shopId=${shop.id}`}
                    className="flex-1 block text-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Request Repair
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredShops.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No repair shops found matching your criteria.</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopList;