import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { logger } from '../../utils/logger';
import { shopApi } from '../../api/shops';
import { MapPin, Clock, HelpCircle, Info } from 'lucide-react';
import { Tooltip } from '../../components/common/Tooltip';

// Validation schema with only required fields
const shopSchema = Yup.object().shape({
  shopName: Yup.string().required('Shop name is required'),
  address: Yup.string().required('Address is required'),
  description: Yup.string().required('Description is required'),
  operatingHours: Yup.string().required('Operating hours are required'),
});

// Helper component for field hints
const FieldHint = ({ text }) => (
  <Tooltip content={text}>
    <HelpCircle className="w-4 h-4 text-gray-400 ml-1 cursor-help" />
  </Tooltip>
);

export const ShopRegistration = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initial values for required fields
  const formik = useFormik({
    initialValues: {
      shopName: '',
      address: '',
      description: '',
      operatingHours: '',
    },
    validationSchema: shopSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      
      try {
        await shopApi.registerShop(values);
        navigate('/shop-dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to register shop');
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Register Your Shop</h1>
            <p className="mt-2 text-gray-600">Join our network of trusted repair shops</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Shop Name */}
            <div>
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                <FieldHint text="Choose a clear, memorable name that represents your repair business" />
              </div>
              <Input
                name="shopName"
                value={formik.values.shopName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.shopName && formik.errors.shopName}
                placeholder="e.g., Quick Fix Mobile Repair"
                required
                icon={<span className="text-gray-400"></span>}
              />
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <FieldHint text="Include street number, street name, city, state/province, and postal code" />
              </div>
              <Input
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && formik.errors.address}
                placeholder="123 Repair Street, Techville, CA 90210"
                required
                icon={<MapPin className="w-5 h-5 text-gray-400" />}
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <FieldHint text="Highlight your expertise, unique selling points, and what makes your shop special" />
              </div>
              <textarea
                name="description"
                rows={4}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 resize-none"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="We are a professional repair shop with over 10 years of experience specializing in smartphone and tablet repairs. Our certified technicians provide fast, reliable service with a focus on customer satisfaction..."
                required
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-sm">{formik.errors.description}</p>
              )}
            </div>

            {/* Operating Hours */}
            <div>
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
                <FieldHint text="Be specific about days and hours - include any lunch breaks if applicable" />
              </div>
              <Input
                name="operatingHours"
                value={formik.values.operatingHours}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.operatingHours && formik.errors.operatingHours}
                placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                required
                icon={<Clock className="w-5 h-5 text-gray-400" />}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Registering...' : 'Register Shop'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};