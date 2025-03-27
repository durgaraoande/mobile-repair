package com.repair.mobile.service;

import com.repair.mobile.dto.ReviewDto;
import com.repair.mobile.dto.ReviewResponseDto;
import com.repair.mobile.entity.RepairQuote;
import com.repair.mobile.entity.RepairRequest;
import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.entity.Review;
import com.repair.mobile.entity.User;
import com.repair.mobile.enums.QuoteStatus;
import com.repair.mobile.enums.RequestStatus;
import com.repair.mobile.exception.BadRequestException;
import com.repair.mobile.exception.ResourceNotFoundException;
import com.repair.mobile.repository.RepairQuoteRepository;
import com.repair.mobile.repository.RepairRequestRepository;
import com.repair.mobile.repository.RepairShopRepository;
import com.repair.mobile.repository.ReviewRepository;
import com.repair.mobile.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final RepairRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final RepairShopRepository shopRepository;
    private final NotificationService notificationService;
    private final ModelMapper modelMapper;
    private final RepairQuoteRepository quoteRepository;

    public ReviewResponseDto createReview(Long customerId, ReviewDto reviewDto) {
        log.info("Creating review for repair request ID: {}", reviewDto.getRepairRequestId());
        
        // Check if user exists
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + customerId));
        
        // Check if repair request exists and is completed
        RepairRequest repairRequest = requestRepository.findById(reviewDto.getRepairRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Repair request not found with ID: " + reviewDto.getRepairRequestId()));
        
        // Validate that the request is completed
        if (repairRequest.getStatus() != RequestStatus.COMPLETED) {
            throw new BadRequestException("Cannot review a repair that is not completed");
        }
        
        // Validate that the request belongs to the customer
        if (!repairRequest.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You can only review your own repair requests");
        }
        
        // Check if review already exists
        Optional<Review> existingReview = reviewRepository.findByRepairRequestId(reviewDto.getRepairRequestId());
        if (existingReview.isPresent()) {
            throw new BadRequestException("Review already exists for this repair request");
        }
        
        // FIX: Get the accepted quote directly from the database instead of using the collection from RepairRequest
        RepairQuote acceptedQuote = quoteRepository.findByRepairRequestIdAndStatus(
                reviewDto.getRepairRequestId(), 
                QuoteStatus.ACCEPTED)
                .orElseThrow(() -> new BadRequestException("No accepted quote found for this repair request"));
        
        // Get the shop from the accepted quote
        if (acceptedQuote.getShop() == null) {
            throw new BadRequestException("No shop found for the accepted quote");
        }
        RepairShop shop = acceptedQuote.getShop();
        
        // Create the review
        Review review = new Review();
        review.setRepairRequest(repairRequest);
        review.setShop(shop);
        review.setCustomer(customer);
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        
        Review savedReview = reviewRepository.save(review);
        log.info("Successfully created review with ID: {}", savedReview.getId());
        
        // Notify shop about new review
        notificationService.notifyShopAboutNewReview(savedReview);
        
        return modelMapper.map(savedReview, ReviewResponseDto.class);
    }
    
    @Transactional(readOnly = true)
    public ReviewResponseDto getReviewById(Long reviewId) {
        log.info("Fetching review with ID: {}", reviewId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));
        
        return modelMapper.map(review, ReviewResponseDto.class);
    }
    
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByShop(Long shopId) {
        log.info("Fetching reviews for shop ID: {}", shopId);
        
        // Ensure shop exists
        if (!shopRepository.existsById(shopId)) {
            throw new ResourceNotFoundException("Shop not found with ID: " + shopId);
        }
        
        List<Review> reviews = reviewRepository.findByShopId(shopId);
        
        return reviews.stream()
                .map(review -> modelMapper.map(review, ReviewResponseDto.class))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByCustomer(Long customerId) {
        log.info("Fetching reviews by customer ID: {}", customerId);
        
        // Ensure customer exists
        if (!userRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + customerId);
        }
        
        List<Review> reviews = reviewRepository.findByCustomerId(customerId);
        
        return reviews.stream()
                .map(review -> modelMapper.map(review, ReviewResponseDto.class))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getShopRatingSummary(Long shopId) {
        log.info("Fetching rating summary for shop ID: {}", shopId);
        
        // Ensure shop exists
        if (!shopRepository.existsById(shopId)) {
            throw new ResourceNotFoundException("Shop not found with ID: " + shopId);
        }
        
        Double averageRating = reviewRepository.getAverageRatingByShopId(shopId);
        Long totalReviews = reviewRepository.getReviewCountByShopId(shopId);
        
        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingCounts.put(i, reviewRepository.countByShopIdAndRating(shopId, i));
        }
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("shopId", shopId);
        summary.put("averageRating", averageRating != null ? averageRating : 0.0);
        summary.put("totalReviews", totalReviews);
        summary.put("ratingCounts", ratingCounts);
        
        return summary;
    }
    
    @Transactional
    public void deleteReview(Long reviewId, Long customerId) {
        log.info("Deleting review with ID: {}", reviewId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));
        
        // Ensure the review belongs to the customer
        if (!review.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You can only delete your own reviews");
        }
        
        reviewRepository.delete(review);
        log.info("Successfully deleted review with ID: {}", reviewId);
    }

    @Transactional(readOnly = true)
public boolean hasUserReviewedRequest(Long customerId, Long requestId) {
    log.info("Checking if user ID: {} has already reviewed request ID: {}", customerId, requestId);
    
    // Ensure repair request exists
    if (!requestRepository.existsById(requestId)) {
        throw new ResourceNotFoundException("Repair request not found with ID: " + requestId);
    }
    
    // Check if review exists for this request
    Optional<Review> review = reviewRepository.findByRepairRequestId(requestId);
    
    // Return true if review exists and belongs to this customer
    return review.isPresent() && review.get().getCustomer().getId().equals(customerId);
}

@Transactional(readOnly = true)
    public ReviewResponseDto getReviewByRequestId(Long requestId) {
        log.info("Fetching review for repair request ID: {}", requestId);

        // Ensure repair request exists
        if (!requestRepository.existsById(requestId)) {
            throw new ResourceNotFoundException("Repair request not found with ID: " + requestId);
        }

        Review review = reviewRepository.findByRepairRequestId(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found for repair request ID: " + requestId));

        return modelMapper.map(review, ReviewResponseDto.class);
    }

        @Transactional(readOnly = true)
    public Map<String, Object> getReviewAnalytics() {
        log.info("Fetching review analytics");
    
        // Total number of reviews
        Long totalReviews = reviewRepository.count();
    
        // Average rating across all reviews
        Double averageRating = reviewRepository.getAverageRating();
    
        // Rating distribution (count of reviews for each rating from 1 to 5)
        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingCounts.put(i, reviewRepository.countByRating(i));
        }
    
        // Prepare analytics data
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalReviews", totalReviews);
        analytics.put("averageRating", averageRating != null ? averageRating : 0.0);
        analytics.put("ratingCounts", ratingCounts);
    
        return analytics;
    }
}