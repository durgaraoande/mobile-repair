import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { PROBLEM_CATEGORIES, PAYMENT_METHODS, DEVICE_TYPES } from '../../utils/constants';
import { MapPin, Clock, CreditCard, Calendar, Phone, Mail } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);
  
  return null;
};

// Component to recenter the map
const MapCentering = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, map]);
  return null;
};

const shopSchema = Yup.object().shape({
  shopName: Yup.string().required('Shop name is required'),
  address: Yup.string().required('Address is required'),
  description: Yup.string().required('Description is required'),
  operatingHours: Yup.string().required('Operating hours are required'),
  services: Yup.array().min(1, 'At least one service is required'),
  paymentMethods: Yup.array().min(1, 'At least one payment method is required'),
  averageRepairTime: Yup.string(),
  rushServiceAvailable: Yup.boolean(),
  yearsInBusiness: Yup.number().positive('Must be a positive number'),
  deviceTypes: Yup.array(),
  latitude: Yup.number().nullable(),
  longitude: Yup.number().nullable()
});

export const ShopProfile = ({ shop, onUpdate, isLoading }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [imageError, setImageError] = useState('');
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const defaultLat = 16.5449;
  const defaultLng = 81.5212;

  const formik = useFormik({
    initialValues: {
      shopName: shop?.shopName || '',
      address: shop?.address || '',
      description: shop?.description || '',
      operatingHours: shop?.operatingHours || '',
      services: shop?.services || [],
      paymentMethods: shop?.paymentMethods || [],
      averageRepairTime: shop?.averageRepairTime || '',
      rushServiceAvailable: shop?.rushServiceAvailable || false,
      yearsInBusiness: shop?.yearsInBusiness || '',
      deviceTypes: shop?.deviceTypes || [],
      latitude: shop?.latitude || null,
      longitude: shop?.longitude || null,
      photoUrls: shop?.photoUrls || [],
      phoneNumber: shop?.owner?.phoneNumber || '',
      email: shop?.owner?.email || '',
    },
    validationSchema: shopSchema,
    onSubmit: (values) => {
      if (typeof onUpdate === 'function') {
        onUpdate(values);
      }
    }
  });

  // Reinitialize form values when shop prop changes
  useEffect(() => {
    if (shop) {
      formik.setValues({
        shopName: shop.shopName || '',
        address: shop.address || '',
        description: shop.description || '',
        operatingHours: shop.operatingHours || '',
        services: shop.services || [],
        paymentMethods: shop.paymentMethods || [],
        averageRepairTime: shop.averageRepairTime || '',
        rushServiceAvailable: shop.rushServiceAvailable || false,
        yearsInBusiness: shop.yearsInBusiness || '',
        deviceTypes: shop.deviceTypes || [],
        latitude: shop.latitude || null,
        longitude: shop.longitude || null,
        photoUrls: shop.photoUrls || [],
        phoneNumber: shop?.owner?.phoneNumber || '',
        email: shop?.owner?.email || '', // Set email from owner
      });
    }
  }, [shop]);

  const [mapCenter, setMapCenter] = useState([
    formik.values.latitude || defaultLat,
    formik.values.longitude || defaultLng
  ]);

  const handleLocationSelect = (lat, lng) => {
    formik.setFieldValue('latitude', lat);
    formik.setFieldValue('longitude', lng);
    setMapCenter([lat, lng]);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsProcessing(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          formik.setFieldValue('latitude', latitude);
          formik.setFieldValue('longitude', longitude);
          setMapCenter([latitude, longitude]);
          setIsProcessing(false);
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("Unable to retrieve your location. Please check your browser permissions.");
          setIsProcessing(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop Profile</h2>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
        <p className="text-sm text-blue-700">
          A complete profile helps customers find your shop when searching for specific repairs
        </p>
      </div>
      
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Shop Name"
              name="shopName"
              value={formik.values.shopName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.shopName && formik.errors.shopName}
              className="focus:ring-indigo-500 focus:border-indigo-500"
              icon={<span className="text-gray-400"></span>}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Years in Business</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="yearsInBusiness"
                  placeholder="e.g., 5"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  value={formik.values.yearsInBusiness}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.yearsInBusiness && formik.errors.yearsInBusiness && (
                <p className="text-red-500 text-xs italic">{formik.errors.yearsInBusiness}</p>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Shop Description
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Highlight your expertise, years in business, and what makes your shop unique
            </p>
            <textarea
              name="description"
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-xs italic">{formik.errors.description}</p>
            )}
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <p className="text-red-500 text-xs italic">{formik.errors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  value={formik.values.email}
                  readOnly // Make email non-editable
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Information Section */}
        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Hours</h3>
          
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="address"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-500 text-xs italic">{formik.errors.address}</p>
            )}
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Latitude (Optional)</label>
              <input
                type="number"
                name="latitude"
                step="0.0001"
                placeholder="e.g., 16.5449"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={formik.values.latitude || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <p className="text-xs text-gray-500">For precise map location</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Longitude (Optional)</label>
              <input
                type="number"
                name="longitude"
                step="0.0001"
                placeholder="e.g., 81.5212"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={formik.values.longitude || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <p className="text-xs text-gray-500">For precise map location</p>
            </div>
          </div> */}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="operatingHours"
                placeholder="e.g., Mon-Sat: 9 AM - 6 PM"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                value={formik.values.operatingHours}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.operatingHours && formik.errors.operatingHours && (
              <p className="text-red-500 text-xs italic">{formik.errors.operatingHours}</p>
            )}
          </div>
        </div>

        {/* Services & Devices Section */}
        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Services & Devices</h3>
          
          <div className="space-y-3 mb-4">
            <label className="block text-sm font-medium text-gray-700">Services Offered</label>
            <p className="text-xs text-gray-500 mb-2">
              Select all the services your shop provides
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(PROBLEM_CATEGORIES).map((category) => (
                <label key={category} className="inline-flex items-center bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="services"
                    value={category}
                    checked={formik.values.services.includes(category)}
                    onChange={(e) => {
                      const services = e.target.checked
                        ? [...formik.values.services, category]
                        : formik.values.services.filter((s) => s !== category);
                      formik.setFieldValue('services', services);
                    }}
                    className="form-checkbox h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
            {formik.touched.services && formik.errors.services && (
              <p className="text-red-500 text-xs italic">{formik.errors.services}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Device Types</label>
            <p className="text-xs text-gray-500 mb-2">
              Select all device types your shop can repair
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEVICE_TYPES.map((type) => (
                <label key={type} className="inline-flex items-center bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="deviceTypes"
                    value={type}
                    checked={formik.values.deviceTypes.includes(type)}
                    onChange={(e) => {
                      const deviceTypes = e.target.checked
                        ? [...formik.values.deviceTypes, type]
                        : formik.values.deviceTypes.filter((t) => t !== type);
                      formik.setFieldValue('deviceTypes', deviceTypes);
                    }}
                    className="form-checkbox h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Payment & Repair Info Section */}
        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment & Repair Details</h3>
          
          <div className="space-y-3 mb-4">
            <label className="block text-sm font-medium text-gray-700">Payment Methods Accepted</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <label key={method} className="inline-flex items-center bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="paymentMethods"
                    value={method}
                    checked={formik.values.paymentMethods.includes(method)}
                    onChange={(e) => {
                      const paymentMethods = e.target.checked
                        ? [...formik.values.paymentMethods, method]
                        : formik.values.paymentMethods.filter((m) => m !== method);
                      formik.setFieldValue('paymentMethods', paymentMethods);
                    }}
                    className="form-checkbox h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    <span className="inline-flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
                      {method}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {formik.touched.paymentMethods && formik.errors.paymentMethods && (
              <p className="text-red-500 text-xs italic">{formik.errors.paymentMethods}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Average Repair Time</label>
              <input
                type="text"
                name="averageRepairTime"
                placeholder="e.g., 24-48 hours"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={formik.values.averageRepairTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="space-y-2 flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rushServiceAvailable"
                  checked={formik.values.rushServiceAvailable}
                  onChange={formik.handleChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Rush Service Available</span>
              </label>
            </div>
          </div>
        </div>

        {/* Map Interface for Location Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Shop Location</h3>
          <p className="text-sm text-gray-500 mb-2">
            Click on the map to select your shop's location. The coordinates will be automatically filled.
          </p>
          <div className="mb-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? 'Getting Location...' : 'Use My Current Location'}
            </button>
          </div>
          <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              <MapCentering center={mapCenter} />
              {formik.values.latitude && formik.values.longitude && (
                <Marker position={[formik.values.latitude, formik.values.longitude]} />
              )}
            </MapContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col">
              <label htmlFor="latitude" className="text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formik.values.latitude || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={`e.g., ${defaultLat}`}
                readOnly
              />
              {formik.touched.latitude && formik.errors.latitude && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.latitude}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="longitude" className="text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formik.values.longitude || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={`e.g., ${defaultLng}`}
                readOnly
              />
              {formik.touched.longitude && formik.errors.longitude && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.longitude}</p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          disabled={!formik.isValid || formik.isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white"
        >
          Update Profile
        </Button>
        
        <p className="text-xs text-center text-gray-500 mt-4">
          Your profile information will be visible to customers searching for repair services
        </p>
      </form>
    </div>
  );
};