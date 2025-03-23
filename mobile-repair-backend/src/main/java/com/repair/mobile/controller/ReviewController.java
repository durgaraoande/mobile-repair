package com.repair.mobile.controller;

import com.repair.mobile.dto.ReviewDto;
import com.repair.mobile.dto.ReviewResponseDto;
import com.repair.mobile.exception.BadRequestException;
import com.repair.mobile.exception.ResourceNotFoundException;
import com.repair.mobile.service.ReviewService;
import com.repair.mobile.util.SecurityUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {
    private final ReviewService reviewService;
    private final SecurityUtils securityUtils;

    @PostMapping
@PreAuthorize("hasRole('CUSTOMER')")
public ResponseEntity<ReviewResponseDto> createReview(@Valid @RequestBody ReviewDto reviewDto) {
    log.info("Creating review for repair request ID: {}", reviewDto.getRepairRequestId());
    log.info("reviewDto: {}", reviewDto);
    try {
        ReviewResponseDto response = reviewService.createReview(
                SecurityUtils.getCurrentUserId(),
                reviewDto
        );
        log.info("Successfully created review with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    } catch (ResourceNotFoundException e) {
        log.error("Resource not found: {}", e.getMessage());
        throw e;
    } catch (BadRequestException e) {
        log.error("Bad request: {}", e.getMessage());
        throw e;
    } catch (Exception e) {
        log.error("Unexpected error:", e);  // Log full exception with stack trace
        throw new RuntimeException("Failed to create review: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"), e);
    }
}

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDto> getReviewById(@PathVariable Long reviewId) {
        log.info("Fetching review with ID: {}", reviewId);
        try {
            return ResponseEntity.ok(reviewService.getReviewById(reviewId));
        } catch (ResourceNotFoundException e) {
            log.error("Review not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching review: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch review: " + e.getMessage());
        }
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByShop(@PathVariable Long shopId) {
        log.info("Fetching reviews for shop ID: {}", shopId);
        try {
            return ResponseEntity.ok(reviewService.getReviewsByShop(shopId));
        } catch (ResourceNotFoundException e) {
            log.error("Shop not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching shop reviews: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch shop reviews: " + e.getMessage());
        }
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReviewResponseDto>> getCustomerReviews() {
        Long customerId = SecurityUtils.getCurrentUserId();
        log.info("Fetching reviews by customer ID: {}", customerId);
        try {
            return ResponseEntity.ok(reviewService.getReviewsByCustomer(customerId));
        } catch (ResourceNotFoundException e) {
            log.error("Customer not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching customer reviews: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch customer reviews: " + e.getMessage());
        }
    }

    @GetMapping("/shop/{shopId}/summary")
    public ResponseEntity<Map<String, Object>> getShopRatingSummary(@PathVariable Long shopId) {
        log.info("Fetching rating summary for shop ID: {}", shopId);
        try {
            return ResponseEntity.ok(reviewService.getShopRatingSummary(shopId));
        } catch (ResourceNotFoundException e) {
            log.error("Shop not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching shop rating summary: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch shop rating summary: " + e.getMessage());
        }
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        Long customerId = SecurityUtils.getCurrentUserId();
        log.info("Deleting review with ID: {} by customer ID: {}", reviewId, customerId);
        try {
            reviewService.deleteReview(reviewId, customerId);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            log.error("Review not found: {}", e.getMessage());
            throw e;
        } catch (BadRequestException e) {
            log.error("Bad request: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error deleting review: {}", e.getMessage());
            throw new RuntimeException("Failed to delete review: " + e.getMessage());
        }
    }

    @GetMapping("/check/{requestId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Boolean>> checkIfReviewed(@PathVariable Long requestId) {
        Long customerId = SecurityUtils.getCurrentUserId();
        log.info("Checking if customer ID: {} has already reviewed request ID: {}", customerId, requestId);
        try {
            boolean hasReviewed = reviewService.hasUserReviewedRequest(customerId, requestId);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("hasReviewed", hasReviewed);
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            log.error("Request not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error checking review status: {}", e.getMessage());
            throw new RuntimeException("Failed to check review status: " + e.getMessage());
        }
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<ReviewResponseDto> getReviewsByRequestId(@PathVariable Long requestId) {
        log.info("Fetching reviews for request ID: {}", requestId);
        try {
            return ResponseEntity.ok(reviewService.getReviewByRequestId(requestId));
        } catch (ResourceNotFoundException e) {
            log.error("Request not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching reviews for request: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch reviews for request: " + e.getMessage());
        }
    }

}