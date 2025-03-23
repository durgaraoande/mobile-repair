import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export const ForgotPasswordForm = ({ onSubmit, isLoading }) => {
  const [isEmailSent, setIsEmailSent] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
        setIsEmailSent(true);
      } catch (error) {
        console.error('Forgot password submission failed:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isEmailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-100">Check Your Email</h2>
        <p className="text-gray-300">
          We've sent password reset instructions to {formik.values.email}
        </p>
        <div className="mt-6 space-y-2">
          <Button
            onClick={() => setIsEmailSent(false)}
            variant="secondary"
            className="w-full"
          >
            Try another email
          </Button>
          <Link to="/login">
            <Button variant="primary" className="w-full mt-2">
              Return to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 text-center">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-gray-400 text-center">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <Input
        label="Email Address"
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

      <div>
        <Button
          type="submit"
          loading={isLoading}
          disabled={!formik.isValid || formik.isSubmitting}
          className="w-full"
        >
          {isLoading ? 'Sending...' : 'Send Reset Instructions'}
        </Button>
      </div>

      <div className="text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
};