// package com.repair.mobile.service;

// import com.repair.mobile.entity.RepairQuote;
// import com.repair.mobile.entity.RepairRequest;
// import com.repair.mobile.entity.RepairShop;
// import com.repair.mobile.entity.User;
// import com.repair.mobile.repository.RepairQuoteRepository;
// import com.repair.mobile.repository.RepairRequestRepository;
// import com.repair.mobile.repository.RepairShopRepository;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;

// import org.springframework.scheduling.annotation.Async;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.util.List;
// import java.util.Optional;
// import java.util.concurrent.CompletableFuture;

// @Service
// @Transactional
// @RequiredArgsConstructor
// @Slf4j
// public class NotificationService {
//     private final EmailService emailService;
//     private final RepairShopRepository shopRepository;
//     private final RepairRequestRepository repairRequestRepository;
//     private final RepairQuoteRepository quoteRepository;

//     @Async
//     @Transactional(readOnly = true)
//     public CompletableFuture<Void> notifyShopsAboutNewRequest(RepairRequest request) {
//         log.info("Notifying shops about new repair request ID: {}", request.getId());

//         // Fetch all relevant shops (you can add filtering logic here)
//         List<RepairShop> shops = shopRepository.findAll();

//         // Send bulk notification
//         return emailService.sendNewRequestNotificationBulk(
//             shops,
//             request.getDeviceBrand(),
//             request.getDeviceModel(),
//             request.getProblemCategory().name()
//         );
//     }
//     // public void notifyShopsAboutNewRequest(RepairRequest request) {
//     //     log.info("Notifying shops about new repair request ID: {}", request.getId());

//     //     // In a real production environment, you would:
//     //     // 1. Use geolocation to find nearby shops
//     //     // 2. Filter shops based on their service categories
//     //     // 3. Consider shop operating hours
//     //     // For now, we'll notify all shops
//     //     List<RepairShop> shops = shopRepository.findAll();

//     //     for (RepairShop shop : shops) {
//     //         try {
//     //             emailService.sendNewRequestNotification(
//     //                     shop.getOwner().getEmail(),
//     //                     request.getDeviceBrand(),
//     //                     request.getDeviceModel(),
//     //                     request.getProblemCategory().name()
//     //             );
//     //         } catch (Exception e) {
//     //             log.error("Failed to send notification to shop ID: {}", shop.getId(), e);
//     //             // Consider implementing a retry mechanism
//     //         }
//     //     }
//     // }

//     public void notifyNewQuote(RepairQuote quote) {
//         log.info("Notifying customer about new quote ID: {}", quote.getId());

//         try {
//             emailService.sendQuoteNotification(
//                     quote.getRepairRequest().getCustomer().getEmail(),
//                     quote.getShop().getShopName(),
//                     quote.getEstimatedCost()
//             );
//         } catch (Exception e) {
//             log.error("Failed to send quote notification", e);
//             // Implement retry logic or queue for later retry
//         }
//     }

//     public void notifyQuoteAccepted(RepairQuote quote) {
//         log.info("Notifying shop about accepted quote ID: {}", quote.getId());

//         try {
//             emailService.sendQuoteAcceptedNotification(
//                     quote.getShop().getOwner().getEmail(),
//                     quote.getRepairRequest().getCustomer().getFullName()
//             );
//         } catch (Exception e) {
//             log.error("Failed to send quote acceptance notification", e);
//         }
//     }

//     public void notifyRequestStatusChange(RepairRequest request) {
//         log.info("Notifying about request status change. Request ID: {}, New Status: {}",
//                 request.getId(), request.getStatus());

//         try {
//             // Notify customer
//             emailService.sendStatusUpdateNotification(
//                     request.getCustomer().getEmail(),
//                     request.getStatus(),
//                     request.getDeviceBrand(),
//                     request.getDeviceModel()
//             );

//             // Check if a shop is assigned before notifying
//             RepairShop assignedShop = getAssignedShop(request);
//             if (assignedShop != null) {
//                 emailService.sendStatusUpdateNotification(
//                         assignedShop.getOwner().getEmail(),
//                         request.getStatus(),
//                         request.getDeviceBrand(),
//                         request.getDeviceModel()
//                 );
//             }
//         } catch (Exception e) {
//             log.error("Failed to send status update notification", e);
//         }
//     }
// //    private RepairShop getAssignedShop(RepairRequest request) {
// //        log.debug("Fetching assigned shop for repair request ID: {}", request.getId());
// //
// //        try {
// //            // Find the accepted quote for this repair request
// //            Optional<RepairQuote> acceptedQuote = repairRequestRepository.findByRepairRequestAndAcceptedTrue(request);
// //
// //            if (acceptedQuote.isPresent()) {
// //                RepairShop shop = acceptedQuote.get().getShop();
// //                log.debug("Found assigned shop: {} for request ID: {}",
// //                        shop.getShopName(), request.getId());
// //                return shop;
// //            }
// //
// //            log.debug("No accepted quote found for request ID: {}", request.getId());
// //            return null;
// //
// //        } catch (Exception e) {
// //            log.error("Error while fetching assigned shop for request ID: {}",
// //                    request.getId(), e);
// //            return null;
// //        }
// //    }
// private RepairShop getAssignedShop(RepairRequest request) {
//     log.debug("Fetching assigned shop for repair request ID: {}", request.getId());

//     try {
//         // Fetch the accepted repair quote for this repair request
//         Optional<RepairQuote> acceptedQuoteOpt = quoteRepository.findByRepairRequestAndAcceptedTrue(request);

//         if (acceptedQuoteOpt.isPresent()) {
//             // Get the associated shop from the accepted quote
//             RepairShop shop = acceptedQuoteOpt.get().getShop();

//             log.debug("Found assigned shop: {} for request ID: {}", shop.getShopName(), request.getId());
//             return shop;
//         }

//         log.debug("No accepted quote found for request ID: {}", request.getId());
//         return null;

//     } catch (Exception e) {
//         log.error("Error while fetching assigned shop for request ID: {}", request.getId(), e);
//         return null;
//     }
// }

// }

package com.repair.mobile.service;

import com.repair.mobile.entity.RepairQuote;
import com.repair.mobile.entity.RepairRequest;
import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.entity.Review;
import com.repair.mobile.repository.RepairQuoteRepository;
import com.repair.mobile.repository.RepairShopRepository;
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
}