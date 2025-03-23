// src/components/reviews/ReviewForm.jsx
import React from 'react';
import { Star } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const ReviewDisplay = ({ review }) => {
  if (!review) {
    console.log('Review is missing or null');
    return null;
  }
  
  // Add defensive checks for required properties
  const rating = review.rating || 0;
  const comment = review.comment || 'No comment provided';
  const createdAt = review.createdAt || new Date().toISOString();
  
  console.log('Rendering ReviewDisplay with:', review);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{review.customerName || 'You'}</h4>
          <p className="text-sm text-gray-500">
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
        </div>
      </div>
      <p className="text-gray-700">{comment}</p>
    </div>
  );
};