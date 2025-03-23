import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const quoteSchema = Yup.object().shape({
  estimatedCost: Yup.number()
    .positive('Cost must be positive')
    .required('Estimated cost is required'),
  description: Yup.string().required('Description is required'),
  estimatedDays: Yup.number()
    .positive('Days must be positive')
    .integer('Days must be a whole number')
    .required('Estimated days is required')
});

export const QuoteForm = ({ onSubmit, isLoading, repairRequestId }) => {
  const formik = useFormik({
    initialValues: {
      estimatedCost: '',
      description: '',
      estimatedDays: ''
    },
    validationSchema: quoteSchema,
    onSubmit: async (values) => {
      await onSubmit({ ...values, repairRequestId });
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-indigo-700 mb-2">Submit Repair Quote</h2>
      <p className="text-gray-600 text-sm mb-4">
        Please provide accurate estimates to help customers make informed decisions.
      </p>
      
      <Input
        label="Estimated Cost (₹)"
        type="number"
        name="estimatedCost"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.estimatedCost}
        error={formik.touched.estimatedCost && formik.errors.estimatedCost}
        placeholder="Enter the total estimated cost"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          rows={4}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.description}
          placeholder="Provide detailed explanation of the repairs and costs involved"
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
        {formik.touched.description && formik.errors.description && (
          <p className="text-red-500 text-xs italic">{formik.errors.description}</p>
        )}
      </div>

      <Input
        label="Estimated Days"
        type="number"
        name="estimatedDays"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.estimatedDays}
        error={formik.touched.estimatedDays && formik.errors.estimatedDays}
        placeholder="Number of days required for repair"
      />

      <div className="text-xs text-gray-500 italic mt-2">
        Tip: Providing a realistic timeframe helps set proper expectations
      </div>

      <Button
        type="submit"
        loading={isLoading}
        disabled={!formik.isValid || formik.isSubmitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
      >
        Submit Quote
      </Button>
    </form>
  );
};