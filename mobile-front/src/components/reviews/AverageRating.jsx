// src/components/reviews/AverageRating.jsx
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { reviewApi } from '../../api/reviews';
import { logger } from '../../utils/logger';

export const AverageRating = ({ shopId, initialAverage = null, initialCount = 0 }) => {
  const [averageRating, setAverageRating] = useState(initialAverage);
  const [reviewCount, setReviewCount] = useState(initialCount);
  
  useEffect(() => {
    // If we don't have initial average rating data, fetch it
    if (initialAverage === null || initialCount === 0) {
      const fetchRatingData = async () => {
        try {
          const reviews = await reviewApi.getShopReviews(shopId);
          
          if (reviews.length > 0) {
            // Calculate average rating
            const total = reviews.reduce((sum, review) => sum + review.rating, 0);
            const average = total / reviews.length;
            setAverageRating(average);
            setReviewCount(reviews.length);
          }
        } catch (error) {
          logger.error('Failed to fetch rating data:', error);
        }
      };
      
      fetchRatingData();
    }
  }, [shopId, initialAverage, initialCount]);

  return (
    <span className="flex items-center">
      <Star className="w-4 h-4 text-yellow-400 fill-current" />
      <span className="ml-1 font-medium text-gray-700">
        {averageRating ? `${averageRating.toFixed(1)} (${reviewCount} reviews)` : 'New'}
      </span>
    </span>
  );
};