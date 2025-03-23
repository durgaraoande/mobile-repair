import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { repairRequestApi } from '../../api/repairRequests';
import { quoteApi } from '../../api/quotes';
import { reviewApi } from '../../api/reviews';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, REQUEST_STATUS } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { logger } from '../../utils/logger';
import { CloudinaryImageGallery } from '../../image/ImageGallery';
import { ReviewForm } from '../../components/reviews/ReviewForm';
import { ReviewDisplay } from '../../components/reviews/ReviewDisplay';
import { AlertCircle, Clock, DollarSign, Wrench, Calendar, CheckCircle, Star } from 'lucide-react';

export const RequestDetails = () => {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestData, quotesData] = await Promise.all([
          user.role === ROLES.CUSTOMER 
            ? repairRequestApi.getCustomerRequests() 
            : repairRequestApi.getShopRequests(),
          quoteApi.getQuotesForRequest(requestId)
        ]);
        
        const currentRequest = requestData.find(r => r.id === parseInt(requestId));
        setRequest(currentRequest);
        setQuotes(quotesData);
        
        // If the request is completed and user is customer, check if they've already reviewed
        if (currentRequest?.status === 'COMPLETED' && user.role === ROLES.CUSTOMER) {
          const reviewed = await reviewApi.hasReviewed(requestId);
          setHasReviewed(reviewed);
        }
      } catch (error) {
        logger.error('Failed to fetch request details:', error);
        setError('Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestId, user.role]);

  useEffect(() => {
    // Check if the user has already reviewed this request
    const checkReviewStatus = async () => {
      if (request && request.status === 'COMPLETED' && request.id) {
        setReviewLoading(true);
        try {
          const hasReviewed = await reviewApi.hasReviewed(request.id);
          setHasReviewed(hasReviewed);
          
          // If user has reviewed, fetch the review data
          if (hasReviewed) {
            // Directly get the review data for this specific request
            const review = await reviewApi.getReviewByRequestId(request.id);
            console.log('Review data api:', review);
            
            // Check if review exists and is valid
            if (review && review.id) {
              setReviewData(review);
              console.log('Setting review data:', review);
            }
          }
        } catch (error) {
          console.error("Failed to check review status:", error);
        } finally {
          setReviewLoading(false);
        }
      }
    };
    
    checkReviewStatus();
  }, [request]);

  const handleReviewSubmit = (submittedReview) => {
    setHasReviewed(true);
    setShowReviewForm(false);
    setReviewData(submittedReview);
    logger.info('Review submitted successfully');
  };

  const handleStatusUpdate = async (status) => {
    try {
      const updatedRequest = await repairRequestApi.updateStatus(requestId, status);
      setRequest(updatedRequest);
      logger.info('Request status updated successfully');
    } catch (error) {
      logger.error('Failed to update request status:', error);
      setError('Failed to update status');
    }
  };

  const handleQuoteAccept = async (quoteId) => {
    try {
      await quoteApi.accept(quoteId);
      // After accepting a quote, update all quotes to reflect new statuses
      const updatedQuotes = await quoteApi.getQuotesForRequest(requestId);
      setQuotes(updatedQuotes);
      logger.info('Quote accepted successfully');
    } catch (error) {
      logger.error('Failed to accept quote:', error);
      setError('Failed to accept quote');
    }
  };

  // Function to get status badge style
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center";
    switch (status) {
      case 'ACCEPTED':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case 'REJECTED':
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'PENDING':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'QUOTED':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'IN_PROGRESS':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'COMPLETED':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      default:
        return `${baseClasses} bg-slate-100 text-slate-800`;
    }
  };

  // Calculate the difference between two dates and return it in a human-readable format
  const calculateDateDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return '-';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate difference in milliseconds
    const diffMs = end - start;
    
    // Convert to days (round up to include partial days)
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // If less than a day, calculate hours
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      return diffHours <= 1 ? '1 hour' : `${diffHours} hours`;
    } else if (diffDays === 1) {
      return '1 day';
    } else {
      return `${diffDays} days`;
    }
  };

  // Early return if required objects are null
  if (!request || !user) {
    return <Loading />;
  }

  const sortedQuotes = [...quotes].sort((a, b) => {
    const order = { ACCEPTED: 0, PENDING: 1, REJECTED: 2 };
    return order[a.status] - order[b.status];
  });

  // Find the accepted quote for the review section
  const acceptedQuote = sortedQuotes.find(q => q.status === 'ACCEPTED');
  
  // Check if acceptedQuote and shop exist before attempting to access
  const shopId = acceptedQuote && acceptedQuote.shop ? acceptedQuote.shop.id : null;

  if (loading) return <Loading />;
  if (!request) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Request not found</h2>
        <p className="mt-2 text-gray-600">The repair request you're looking for doesn't exist or was removed.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-sm rounded-xl p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Repair Request Details
          </h1>
          <span className={getStatusBadge(request.status)}>
            {request.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-blue-800 font-medium mb-2">Device Information</h3>
            <p className="text-gray-900">{request.deviceBrand} {request.deviceModel}</p>
            {request.imeiNumber && (
              <p className="text-gray-600 mt-1">IMEI: {request.imeiNumber}</p>
            )}
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-purple-800 font-medium mb-2">Problem Category</h3>
            <p className="text-gray-900">{request.problemCategory}</p>
          </div>
          
          <div className="bg-emerald-50 p-4 rounded-lg">
            <h3 className="text-emerald-800 font-medium mb-2">Dates</h3>
            <div className="space-y-1">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-gray-600" />
                <p className="text-gray-900">Created: {formatDate(request.createdAt)}</p>
              </div>
              
              {request.status === 'COMPLETED' && request.completedAt && (
                <>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                    <p className="text-gray-900">Completed: {formatDate(request.completedAt)}</p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-blue-600" />
                    <p className="text-gray-900">
                      Duration: {calculateDateDifference(request.createdAt, request.completedAt)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-gray-800 font-medium mb-2">Problem Description</h3>
          <p className="text-gray-700 leading-relaxed">{request.problemDescription}</p>
        </div>

        {request.imageUrls?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-gray-800 font-medium mb-3">Device Images</h3>
            <CloudinaryImageGallery images={request.imageUrls} />
          </div>
        )}

        {user.role === ROLES.SHOP_OWNER && request.status === REQUEST_STATUS.PENDING && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => handleStatusUpdate(REQUEST_STATUS.ACCEPTED)}
              variant="primary"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Accept Request
            </Button>
            <Button
              onClick={() => handleStatusUpdate(REQUEST_STATUS.CANCELLED)}
              variant="danger"
              className="flex-1"
            >
              Decline Request
            </Button>
          </div>
        )}
        
        {/* New section for completed repair data comparison */}
        {request.status === 'COMPLETED' && request.completedAt && sortedQuotes.some(q => q.status === 'ACCEPTED') && (
          <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-indigo-800 font-medium mb-2">Repair Performance</h3>
            {sortedQuotes.filter(q => q.status === 'ACCEPTED').map(acceptedQuote => {
              const actualDuration = calculateDateDifference(request.createdAt, request.completedAt);
              const estimatedDays = acceptedQuote.estimatedDays;
              const durationDiff = actualDuration.split(' ')[0] - estimatedDays;
              
              return (
                <div key={acceptedQuote.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Estimated completion time:</span>
                    <span className="font-medium">{estimatedDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Actual completion time:</span>
                    <span className="font-medium">{actualDuration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Performance:</span>
                    <span className={`font-medium ${durationDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {durationDiff > 0 
                        ? `${durationDiff} days longer than estimated` 
                        : durationDiff < 0 
                          ? `${Math.abs(durationDiff)} days faster than estimated`
                          : 'Completed exactly as estimated'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Review section for customers with completed repairs */}
        {user.role === ROLES.CUSTOMER && 
         request.status === 'COMPLETED' && 
         acceptedQuote && shopId && (
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  Rate this repair service
                </div>
              </h3>
              
              {!hasReviewed && !showReviewForm && (
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Write a Review
                </Button>
              )}
            </div>
            
            {hasReviewed ? (
              <div>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-green-700">
                      Thank you for your review! Your feedback helps other customers make informed decisions.
                    </p>
                  </div>
                </div>
                
                {/* Display the submitted review */}
                {reviewLoading ? (
                  <div className="text-center p-4">
                    <p>Loading your review...</p>
                  </div>
                ) : reviewData ? (
                  <ReviewDisplay review={reviewData} />
                ) : (
                  <div className="text-yellow-700 bg-yellow-50 p-4 rounded-lg">
                    <p>Review data could not be loaded. Please refresh to try again.</p>
                  </div>
                )}
              </div>
            ) : showReviewForm ? (
              <ReviewForm 
                requestId={request.id} 
                shopId={shopId}
                onSubmitSuccess={handleReviewSubmit}
              />
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700">
                  Your repair has been completed! Please share your experience to help other customers.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {sortedQuotes.length > 0 && (
        <div className="bg-white shadow-sm rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Repair Quotes</h2>
          <div className="space-y-6">
            {sortedQuotes.map((quote) => (
              <div
                key={quote.id}
                className={`rounded-lg p-6 transition-all ${
                  quote.status === 'ACCEPTED' 
                    ? 'bg-emerald-50 border-2 border-emerald-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Wrench className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-lg">{quote.shop.shopName}</h3>
                      <span className={getStatusBadge(quote.status)}>
                        {quote.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{quote.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-gray-700">
                          Estimated time: <strong>{quote.estimatedDays} days</strong>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-gray-700">
                          Cost: <strong>{formatCurrency(quote.estimatedCost)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {user.role === ROLES.CUSTOMER && 
                   quote.status === 'PENDING' && 
                   !sortedQuotes.some(q => q.status === 'ACCEPTED') && (
                    <Button
                      onClick={() => handleQuoteAccept(quote.id)}
                      variant="primary"
                      className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                      Accept Quote
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};