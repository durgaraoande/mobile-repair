import React, { useState, useCallback, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { PROBLEM_CATEGORIES } from '../../utils/constants';
import { logger } from '../../utils/logger';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const requestSchema = Yup.object().shape({
  deviceBrand: Yup.string().required('Brand is required'),
  deviceModel: Yup.string().required('Model is required'),
  imeiNumber: Yup.string().length(15, 'IMEI must be 15 digits'),
  problemCategory: Yup.string().required('Category is required'),
  problemDescription: Yup.string().required('Description is required')
});

const compressImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        } else if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const RepairRequestForm = ({ onSubmit, isLoading }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageError, setImageError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const validateImage = useCallback((file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }
    return true;
  }, []);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (selectedImages.length + files.length > 3) {
      setImageError('Maximum 3 images allowed');
      return;
    }
  
    try {
      setImageError('');
      setIsProcessing(true);
      
      const newProgress = {};
      files.forEach((_, index) => {
        newProgress[selectedImages.length + index] = { 
          status: 'compressing', 
          progress: 0 
        };
      });
      setUploadProgress(prev => ({ ...prev, ...newProgress }));
      
      const processedFiles = await Promise.all(
        files.map(async (file, index) => {
          const currentIndex = selectedImages.length + index;
          try {
            validateImage(file);
            const compressedFile = await compressImage(file);
            
            setUploadProgress(prev => ({
              ...prev,
              [currentIndex]: { status: 'ready', progress: 100 }
            }));
            
            return {
              file: compressedFile,
              preview: URL.createObjectURL(compressedFile)
            };
          } catch (error) {
            setUploadProgress(prev => ({
              ...prev,
              [currentIndex]: { status: 'error', error: error.message }
            }));
            throw error;
          }
        })
      );
      
      setSelectedImages(prev => [...prev, ...processedFiles]);
    } catch (error) {
      setImageError(error.message || 'Error processing images');
      logger.error('Image processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      deviceBrand: '',
      deviceModel: '',
      imeiNumber: '',
      problemCategory: '',
      problemDescription: ''
    },
    validationSchema: requestSchema,
    onSubmit: async (values) => {
      try {
        setFormSubmitted(true);
        const imagesToUpload = selectedImages.map(img => img.file);
        await onSubmit({
          ...values,
          images: imagesToUpload
        });
      } catch (error) {
        setFormSubmitted(false);
        logger.error('Repair request submission failed:', error);
        throw error;
      }
    }
  });

  useEffect(() => {
    return () => {
      selectedImages.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [selectedImages]);

  if (formSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">Request Submitted Successfully!</h3>
        <p className="mt-2 text-sm text-gray-500">
          We've received your repair request and will review it shortly. You'll receive a confirmation email with details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Please provide accurate details about your device and the issue you're experiencing. This helps us provide the most accurate quote.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="Device Brand"
          name="deviceBrand"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.deviceBrand}
          error={formik.touched.deviceBrand && formik.errors.deviceBrand}
          placeholder="e.g. Apple, Samsung, etc."
        />
        <Input
          label="Device Model"
          name="deviceModel"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.deviceModel}
          error={formik.touched.deviceModel && formik.errors.deviceModel}
          placeholder="e.g. iPhone 13, Galaxy S21, etc."
        />
      </div>

      <Input
        label="IMEI Number (Optional)"
        name="imeiNumber"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.imeiNumber}
        error={formik.touched.imeiNumber && formik.errors.imeiNumber}
        placeholder="15-digit IMEI number"
        helperText="Find your IMEI by dialing *#06# or checking in Settings > About Phone"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Problem Category</label>
        <select
          name="problemCategory"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.problemCategory}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select a category</option>
          {Object.entries(PROBLEM_CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>
        {formik.touched.problemCategory && formik.errors.problemCategory && (
          <p className="text-red-500 text-xs italic">{formik.errors.problemCategory}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Problem Description</label>
        <textarea
          name="problemDescription"
          rows={4}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.problemDescription}
          placeholder="Please describe the issue in detail. When did it start? Are there any specific symptoms?"
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
        {formik.touched.problemDescription && formik.errors.problemDescription && (
          <p className="text-red-500 text-xs italic">{formik.errors.problemDescription}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Images (Optional, max 3)
          </label>
          <span className="text-sm text-gray-500">
            {selectedImages.length}/3 images
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          Upload clear photos showing the damage or issue with your device
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative aspect-square border rounded-lg overflow-hidden">
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(image.preview);
                  setSelectedImages(prev => prev.filter((_, i) => i !== index));
                  setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[index];
                    return newProgress;
                  });
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                aria-label="Remove image"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {selectedImages.length < 3 && (
            <label className="cursor-pointer relative aspect-square">
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleImageChange}
                disabled={isProcessing}
                className="hidden"
              />
              <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors duration-200">
                <div className="text-center p-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">Add Image</p>
                  <p className="mt-1 text-xs text-gray-500">JPEG, PNG, WebP up to 5MB</p>
                </div>
              </div>
            </label>
          )}
          {[...Array(Math.max(0, 2 - selectedImages.length))].map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="hidden sm:block aspect-square border-2 border-dashed border-gray-200 rounded-lg"
            />
          ))}
        </div>
        {isProcessing && (
          <div className="space-y-2">
            {Object.entries(uploadProgress).map(([index, status]) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      status.status === 'error' ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 min-w-[80px]">
                  {status.status === 'compressing' ? 'Processing...' : 
                   status.status === 'ready' ? 'Ready' : 
                   status.error}
                </span>
              </div>
            ))}
          </div>
        )}
        {imageError && (
          <p className="text-red-500 text-xs italic">{imageError}</p>
        )}
      </div>

      <Button
        type="submit"
        loading={isLoading}
        disabled={!formik.isValid || formik.isSubmitting || isProcessing}
        className="w-full sm:w-auto sm:px-8"
      >
        Submit Request
      </Button>
    </form>
  );
};