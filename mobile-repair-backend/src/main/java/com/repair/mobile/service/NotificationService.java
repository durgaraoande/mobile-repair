package com.repair.mobile.service;

import com.repair.mobile.entity.RepairQuote;
import com.repair.mobile.entity.RepairRequest;
import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.entity.Review;
import com.repair.mobile.entity.User;
import com.repair.mobile.repository.RepairQuoteRepository;
import com.repair.mobile.repository.RepairShopRepository;
import com.repair.mobile.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final EmailService emailService;
    private final RepairShopRepository shopRepository;
    private final RepairQuoteRepository quoteRepository;
    private final UserRepository userRepository;

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> notifyShopsAboutNewRequest(RepairRequest request) {
        log.info("Notifying shops about new repair request ID: {}", request.getId());
        List<RepairShop> shops = shopRepository.findAll();
        return emailService.sendNewRequestNotificationBulk(
            shops,
            request.getDeviceBrand(),
            request.getDeviceModel(),
            request.getProblemCategory().name()
        );
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> notifyNewQuote(RepairQuote quote) {
        log.info("Notifying customer about new quote ID: {}", quote.getId());
        return emailService.sendQuoteNotification(
            quote.getRepairRequest().getCustomer().getEmail(),
            quote.getShop().getShopName(),
            quote.getEstimatedCost()
        );
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> notifyQuoteAccepted(RepairQuote quote) {
        log.info("Notifying shop about accepted quote ID: {}", quote.getId());
        return emailService.sendQuoteAcceptedNotification(
            quote.getShop().getOwner().getEmail(),
            quote.getRepairRequest().getCustomer().getFullName()
        );
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> notifyRequestStatusChange(RepairRequest request) {
        log.info("Notifying about request status change. Request ID: {}, New Status: {}",
                request.getId(), request.getStatus());

        CompletableFuture<Void> customerNotification = emailService.sendStatusUpdateNotification(
            request.getCustomer().getEmail(),
            request.getStatus(),
            request.getDeviceBrand(),
            request.getDeviceModel()
        );

        RepairShop assignedShop = getAssignedShop(request);
        if (assignedShop != null) {
            CompletableFuture<Void> shopNotification = emailService.sendStatusUpdateNotification(
                assignedShop.getOwner().getEmail(),
                request.getStatus(),
                request.getDeviceBrand(),
                request.getDeviceModel()
            );
            
            // Wait for both notifications to complete
            return CompletableFuture.allOf(customerNotification, shopNotification);
        }

        return customerNotification;
    }

    private RepairShop getAssignedShop(RepairRequest request) {
        log.debug("Fetching assigned shop for repair request ID: {}", request.getId());
        try {
            Optional<RepairQuote> acceptedQuoteOpt = quoteRepository.findByRepairRequestAndAcceptedTrue(request);
            if (acceptedQuoteOpt.isPresent()) {
                RepairShop shop = acceptedQuoteOpt.get().getShop();
                log.debug("Found assigned shop: {} for request ID: {}", shop.getShopName(), request.getId());
                return shop;
            }
            log.debug("No accepted quote found for request ID: {}", request.getId());
            return null;
        } catch (Exception e) {
            log.error("Error while fetching assigned shop for request ID: {}", request.getId(), e);
            return null;
        }
    }

    public void notifyRepairStarted(RepairRequest updatedRequest) {
        log.info("Notifying about repair started. Request ID: {}", updatedRequest.getId());

        try {
            // Notify customer
            emailService.sendRepairStartedNotification(
                updatedRequest.getCustomer().getEmail(),
                updatedRequest.getDeviceBrand(),
                updatedRequest.getDeviceModel()
            );

            // Check if a shop is assigned before notifying
            RepairShop assignedShop = getAssignedShop(updatedRequest);
            if (assignedShop != null) {
                emailService.sendRepairStartedNotification(
                    assignedShop.getOwner().getEmail(),
                    updatedRequest.getDeviceBrand(),
                    updatedRequest.getDeviceModel()
                );
            }
        } catch (Exception e) {
            log.error("Failed to send repair started notification", e);
        }
    }

    public void notifyShopAboutNewReview(Review savedReview) {
        log.info("Notifying shop about new review ID: {}", savedReview.getId());

        try {
            emailService.sendReviewNotification(
                savedReview.getShop().getOwner().getEmail(),
                savedReview.getCustomer().getFullName(),
                savedReview.getRating()
            );
        } catch (Exception e) {
            log.error("Failed to send review notification", e);
        }
    }

    public void sendNotification(Long userId, String title, String message, String type, Object additionalData) {
    // Get the user by ID instead of fetching all users
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
    
    log.info("Sending notification to user ID: {}", userId);

    try {
        emailService.sendNotification(
            user.getEmail(),
            title,
            message,
            type,
            additionalData
        );
    } catch (Exception e) {
        log.error("Failed to send notification to user ID: {}", userId, e);
        // Consider implementing a retry mechanism
    }
}
}