// src/components/reviews/ReviewForm.jsx
import React, { useState } from 'react';
import { Star, StarOff } from 'lucide-react';
import { Button } from '../common/Button';
import { logger } from '../../utils/logger';
import { reviewApi } from '../../api/reviews';

export const ReviewForm = ({ requestId, shopId, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (comment.trim().length < 10) {
      setError('Please provide a comment (minimum 10 characters)');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const reviewData = {
        repairRequestId: requestId,  // Matches the ReviewDto field
        rating,
        comment
      };
      
      const response = await reviewApi.submitReview(reviewData);
      logger.info('Review submitted successfully', response);
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component with the review data
      if (onSubmitSuccess) {
        onSubmitSuccess(response);
      }
    } catch (error) {
      logger.error('Failed to submit review:', error);
      setError('Failed to submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Rate this repair service</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Rating
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="focus:outline-none"
              >
                {star <= rating ? (
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                ) : (
                  <StarOff className="w-8 h-8 text-gray-300" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="comment" 
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this repair service..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
};

