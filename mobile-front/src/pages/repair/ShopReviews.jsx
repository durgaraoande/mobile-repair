// src/components/reviews/ShopReviews.jsx
import React, { useState, useEffect } from 'react';
import { reviewApi } from '../../api/reviews';
import { ReviewDisplay } from '../../components/reviews/ReviewDisplay';
import { Loading } from '../../components/common/Loading';
import { AlertCircle } from 'lucide-react';
import { logger } from '../../utils/logger';

export const ShopReviews = ({ shopId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewApi.getShopReviews(shopId);
        setReviews(data);
      } catch (error) {
        logger.error('Failed to fetch shop reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [shopId]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-md text-gray-600">
        No reviews available for this shop yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* <h3 className="text-lg font-semibold">Customer Reviews</h3> */}
      {reviews.map(review => (
        <ReviewDisplay key={review.id} review={review} />
      ))}
    </div>
  );
};