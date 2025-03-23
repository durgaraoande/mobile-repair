import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { logger } from '../../utils/logger';
import { useNavigate } from 'react-router-dom';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required')
});

export const LoginForm = ({ onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  
  // Check if we have stored credentials
  useEffect(() => {
    const storedEmail = localStorage.getItem('rememberedEmail');
    const hasRememberedUser = !!storedEmail;
    
    if (hasRememberedUser) {
      formik.setFieldValue('email', storedEmail);
      setRememberMe(true);
    }
  }, []);
  
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', values.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        await onSubmit({...values, rememberMe});
      } catch (error) {
        logger.error('Login form submission failed:', error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-gray-800 p-6 md:p-8 rounded-xl shadow-xl border border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">Sign In</h2>
          <p className="mt-2 text-sm text-gray-400">
            Access your account
          </p>
        </div>
        
        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            <Input
              label="Email"
              type="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              error={formik.touched.email && formik.errors.email}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-gray-100 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-gray-100 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              labelClassName="block text-sm font-medium text-gray-300 mb-1"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-gray-300 cursor-pointer">
                Remember me
              </label>
            </div>
            
            <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot password?
            </a>
          </div>

          <div>
            <Button 
              type="submit" 
              loading={isLoading} 
              disabled={!formik.isValid || formik.isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
        
        <div className="pt-4 text-center border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <a 
              onClick={() => navigate('/register')} 
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;