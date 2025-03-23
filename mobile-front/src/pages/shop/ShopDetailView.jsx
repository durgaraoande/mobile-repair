import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shopApi } from '../../api/shops';
import { Loading } from '../../components/common/Loading';
import { Clock, MapPin, Star, Wrench, CreditCard, Calendar, Phone, Mail, ArrowLeft, Map } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShopReviews } from '../../pages/repair/ShopReviews';
import { AverageRating } from '../../components/reviews/AverageRating';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const ShopDetailView = () => {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('about');
  
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const data = await shopApi.getShopById(shopId);
        setShop(data);
      } catch (error) {
        setError('Failed to load shop details');
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  if (loading) return <Loading />;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!shop) return <div className="text-center p-8">Shop not found</div>;

  // Function to create an OpenStreetMap URL for directions
  // New function to get user location and navigate to directions
const navigateToDirections = (e) => {
  e.preventDefault();
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        let directionsUrl;
        if (shop.latitude && shop.longitude) {
          directionsUrl = `https://www.openstreetmap.org/directions?engine=osrm_car&route=${userLat},${userLng};${shop.latitude},${shop.longitude}`;
        } else {
          // Fallback to address-based URL
          directionsUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(shop.address)}`;
        }
        
        window.open(directionsUrl, '_blank');
      },
      (error) => {
        console.error("Error getting location:", error);
        // Fall back to the original method if geolocation fails
        window.open(getDirectionsUrl(), '_blank');
      }
    );
  } else {
    // Geolocation not supported, use the original URL
    window.open(getDirectionsUrl(), '_blank');
  }
};

// Keep the original function as a fallback
const getDirectionsUrl = () => {
  if (shop.latitude && shop.longitude) {
    return `https://www.openstreetmap.org/directions?engine=osrm_car&route=;${shop.latitude},${shop.longitude}`;
  } else {
    // Fallback to address-based URL
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(shop.address)}`;
  }
};

  // Default coordinates for map
  const defaultLat = 16.5449;
  const defaultLng = 81.5212;
  
  // Get map position from shop data or use defaults
  const mapPosition = [
    shop.latitude || defaultLat,
    shop.longitude || defaultLng
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <Link to="/shops" className="inline-flex items-center text-blue-600 mb-4 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Shop List
        </Link>

        {/* Shop Header - Simplified and Cleaner */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="p-5">
            <div className="flex justify-between items-start">
              <h1 className="text-xl font-bold text-gray-900">{shop.shopName}</h1>
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 font-medium text-gray-700">
                  {shop.averageRating ? shop.averageRating.toFixed(1) : 'New'}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <div className="inline-flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                {shop.address}
              </div>
              <div className="inline-flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                {shop.operatingHours}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Simplified */}
        <div className="flex mb-4 border-b border-gray-200 overflow-x-auto">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'about' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'services' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'location' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('location')}
          >
            Location
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'reviews' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        {/* Content based on active tab - Simplified to match backend changes */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-5">
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About Us</h2>
                <p className="text-gray-600">{shop.description}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h2>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{shop.owner.phoneNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{shop.owner.email}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Methods</h2>
                <div className="flex flex-wrap gap-2">
                  {shop.paymentMethods?.map((method, idx) => (
                    <div key={idx} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <CreditCard className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-gray-600 text-sm">{method}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Repair Information</h2>
                <div className="flex items-start">
                  <Calendar className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <span className="block text-gray-600">Average Repair Time: {shop.averageRepairTime || "24-48 hours"}</span>
                    <span className="block text-gray-600 mt-1">Rush Service: {shop.rushServiceAvailable ? "Available" : "Not available"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Experience</h2>
                <div className="bg-blue-50 p-3 rounded-lg inline-block">
                  <span className="text-lg font-bold text-blue-600">{shop.yearsInBusiness || "N/A"}</span>
                  <span className="text-gray-700 ml-2">Years in business</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            // Services tab content - Simplified
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {shop.services?.map((service, idx) => (
                    <div key={idx} className="flex items-center p-2 bg-blue-50 rounded-lg">
                      <Wrench className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-gray-700 text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Device Types</h2>
                <div className="flex flex-wrap gap-2">
                  {shop.deviceTypes?.map((type, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
                <div className="flex items-start mb-3">
                  <MapPin className="w-4 h-4 text-blue-500 mt-1 mr-2" />
                  <p className="text-gray-700">{shop.address}</p>
                </div>
                
                {/* Leaflet Map */}
                <div className="h-56 md:h-80 w-full rounded-lg overflow-hidden border border-gray-200 mb-3">
                  {shop.latitude && shop.longitude ? (
                    <MapContainer
                      center={mapPosition}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={mapPosition}>
                        <Popup>
                          <div>
                            <strong>{shop.shopName}</strong><br />
                            {shop.address}
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">Map location not available</p>
                    </div>
                  )}
                </div>

                {/* Get Directions Button */}
                <a 
                  href="#"
                  onClick={navigateToDirections}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors w-full"
                >
                  <Map className="w-4 h-4 mr-2" />
                  Get Directions
                </a>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Operating Hours</h2>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700">{shop.operatingHours}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            // Reviews tab content using the ShopReviews component
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Customer Reviews</h2>
                <AverageRating shopId={shop.id} initialAverage={shop.averageRating} initialCount={shop.totalReviews} />
              </div>
              
              {/* ShopReviews component for displaying the reviews */}
              <ShopReviews shopId={shop.id} />
            </div>
          )}
        </div>

        {/* Request Repair Button - Made more prominent */}
        <div className="mt-6 text-center">
          <Link
            to={`/repair-requests/new?shopId=${shop.id}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            Request Repair Service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailView;