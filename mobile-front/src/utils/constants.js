// export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api/v1'
    : 'http://192.168.29.41:8080/api/v1');


export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SHOP_OWNER: 'SHOP_OWNER',
  ADMIN: 'ADMIN'
};

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const PROBLEM_CATEGORIES = {
  SCREEN_DAMAGE: 'Screen',
  BATTERY_ISSUE: 'Battery',
  CHARGING_PROBLEM: 'Charging',
  WATER_DAMAGE: 'Water Damage',
  SOFTWARE_ISSUE: 'Software',
  CAMERA_PROBLEM: 'Camera',
  SPEAKER_ISSUE: 'Speaker',
  OTHER: 'Other'
};

export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Mobile Payment',
  'Bank Transfer',
  'PayPal',
  'Cryptocurrency'
];

export const SPECIALIZED_BRANDS = [
  'Apple',
  'Samsung',
  'Google',
  'OnePlus',
  'Xiaomi',
  'Huawei',
  'Sony',
  'LG',
  'Nokia',
  'Motorola',
  'Other'
];

export const DEVICE_TYPES = [
  'Smartphone',
  'Tablet',
  'Laptop',
  'Smartwatch',
  'Gaming Console',
  'Camera',
  'Drone',
  'Other'
];

