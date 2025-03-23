import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';

const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

export const ResetPasswordForm = ({ onSubmit, isLoading, token }) => {
  const [isSuccess, setIsSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit({ token, newPassword: values.newPassword });
        setIsSuccess(true);
      } catch (error) {
        console.error('Password reset failed:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-100">Password Reset Successfully</h2>
        <p className="text-gray-300">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Link to="/login">
          <Button variant="primary" className="w-full mt-4">
            Proceed to Login
          </Button>
        </Link>
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
          Please enter your new password below
        </p>
      </div>

      <Input
        label="New Password"
        type="password"
        name="newPassword"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.newPassword}
        error={formik.touched.newPassword && formik.errors.newPassword}
        className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-700 text-gray-100"
        labelClassName="block text-sm font-medium text-gray-300 mb-1"
      />

      <Input
        label="Confirm New Password"
        type="password"
        name="confirmPassword"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.confirmPassword}
        error={formik.touched.confirmPassword && formik.errors.confirmPassword}
        className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-700 text-gray-100"
        labelClassName="block text-sm font-medium text-gray-300 mb-1"
      />

      <Button
        type="submit"
        loading={isLoading}
        disabled={!formik.isValid || formik.isSubmitting}
        className="w-full"
      >
        {isLoading ? 'Resetting Password...' : 'Reset Password'}
      </Button>
    </form>
  );
};