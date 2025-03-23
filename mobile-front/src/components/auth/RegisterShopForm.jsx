import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const shopSchema = Yup.object().shape({
  shopName: Yup.string().required('Shop name is required'),
  address: Yup.string().required('Address is required'),
  description: Yup.string().required('Description is required'),
  operatingHours: Yup.string().required('Operating hours are required'),
  services: Yup.array().min(1, 'At least one service is required')
});

export const RegisterShopForm = ({ onSubmit, isLoading }) => {
  const formik = useFormik({
    initialValues: {
      shopName: '',
      address: '',
      description: '',
      operatingHours: '',
      services: []
    },
    validationSchema: shopSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    }
  });

  const services = [
    'Screen Repair',
    'Battery Replacement',
    'Water Damage',
    'Software Issues',
    'Hardware Repair'
  ];

  const handleServiceChange = (service) => {
    const currentServices = formik.values.services;
    const newServices = currentServices.includes(service)
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service];
    formik.setFieldValue('services', newServices);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="px-6 py-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Register Your Repair Shop
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Fill in the details below to list your shop in our directory
            </p>
          </div>
          
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <Input
              label="Shop Name"
              name="shopName"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.shopName}
              error={formik.touched.shopName && formik.errors.shopName}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
              labelClassName="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              placeholder="Your shop's name"
            />

            <Input
              label="Address"
              name="address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
              error={formik.touched.address && formik.errors.address}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
              labelClassName="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              placeholder="Full address including city and zip code"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                name="description"
                rows={4}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
                placeholder="Tell customers about your shop, expertise, and what makes you special"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-xs italic">{formik.errors.description}</p>
              )}
            </div>

            <Input
              label="Operating Hours"
              name="operatingHours"
              placeholder="e.g., Mon-Sat 9 AM - 6 PM"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.operatingHours}
              error={formik.touched.operatingHours && formik.errors.operatingHours}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
              labelClassName="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Services Offered</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <label key={service} className="inline-flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <input
                      type="checkbox"
                      checked={formik.values.services.includes(service)}
                      onChange={() => handleServiceChange(service)}
                      className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-200">{service}</span>
                  </label>
                ))}
              </div>
              {formik.touched.services && formik.errors.services && (
                <p className="text-red-500 text-xs italic">{formik.errors.services}</p>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                loading={isLoading}
                disabled={!formik.isValid || formik.isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registering...' : 'Register Shop'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};