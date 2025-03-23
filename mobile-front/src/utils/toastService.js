// src/utils/toastService.js
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast configuration
const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const toastService = {
  success(message, options = {}) {
    return toast.success(message, { ...defaultOptions, ...options });
  },
  
  error(message, options = {}) {
    return toast.error(message, { ...defaultOptions, ...options });
  },
  
  warning(message, options = {}) {
    return toast.warning(message, { ...defaultOptions, ...options });
  },
  
  info(message, options = {}) {
    return toast.info(message, { ...defaultOptions, ...options });
  },
  
  // For API error handling
  handleError(error) {
    const errorMessage = error.message || 'An unexpected error occurred';
    this.error(errorMessage);
    return error; // Return for error chaining
  }
};