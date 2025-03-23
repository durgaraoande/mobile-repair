import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ROLES } from '../../utils/constants';
import { logger } from '../../utils/logger';

const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  fullName: Yup.string().required('Full name is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Invalid phone number')
    .required('Phone number is required'),
  role: Yup.string().oneOf([ROLES.CUSTOMER, ROLES.SHOP_OWNER])
});

export const RegisterUserForm = ({ onSubmit, isLoading }) => {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      role: ROLES.CUSTOMER
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
      } catch (error) {
        logger.error('User registration form submission failed:', error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100 sm:text-3xl">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Join our community and start using our services
            </p>
          </div>
          
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              error={formik.touched.email && formik.errors.email}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-700 text-gray-100"
              labelClassName="block text-sm font-medium text-gray-300 mb-1"
              placeholder="you@example.com"
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              error={formik.touched.password && formik.errors.password}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-700 text-gray-100"
              labelClassName="block text-sm font-medium text-gray-300 mb-1"
              placeholder="••••••••"
            />
            
            <Input
              label="Full Name"
              name="fullName"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.fullName}
              error={formik.touched.fullName && formik.errors.fullName}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-700 text-gray-100"
              labelClassName="block text-sm font-medium text-gray-300 mb-1"
              placeholder="John Doe"
            />
            
            <Input
              label="Phone Number"
              name="phoneNumber"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phoneNumber}
              error={formik.touched.phoneNumber && formik.errors.phoneNumber}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-700 text-gray-100"
              labelClassName="block text-sm font-medium text-gray-300 mb-1"
              placeholder="1234567890"
            />
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Account Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="relative flex items-center p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600">
                  <input
                    type="radio"
                    name="role"
                    value={ROLES.CUSTOMER}
                    checked={formik.values.role === ROLES.CUSTOMER}
                    onChange={formik.handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-600 focus:ring-indigo-500"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-100">Customer</span>
                    <span className="block text-xs text-gray-400">Search and book services</span>
                  </div>
                </label>
                
                <label className="relative flex items-center p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600">
                  <input
                    type="radio"
                    name="role"
                    value={ROLES.SHOP_OWNER}
                    checked={formik.values.role === ROLES.SHOP_OWNER}
                    onChange={formik.handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-600 focus:ring-indigo-500"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-100">Shop Owner</span>
                    <span className="block text-xs text-gray-400">List and manage your business</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                loading={isLoading}
                disabled={!formik.isValid || formik.isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};