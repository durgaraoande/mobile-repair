package com.repair.mobile.controller;

import com.repair.mobile.dto.*;
import com.repair.mobile.enums.UserStatus;
import com.repair.mobile.enums.ShopStatus;
import com.repair.mobile.enums.RequestStatus;
import com.repair.mobile.security.service.UserService;
import com.repair.mobile.service.ShopService;
import com.repair.mobile.service.RepairRequestService;
import com.repair.mobile.service.AdminService;
import com.repair.mobile.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserService userService;
    private final ShopService shopService;
    private final RepairRequestService repairRequestService;
    private final AdminService adminService;
    private final ReviewService reviewService;
    
    // Enhanced Dashboard Statistics
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        log.info("Admin fetching comprehensive dashboard statistics");
        Map<String, Object> statistics = adminService.getDashboardStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    // Enhanced User Management
    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsersWithDetails() {
        log.info("Admin fetching all users with detailed information");
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponseDto> getUserDetails(@PathVariable Long userId) {
        log.info("Admin fetching details for user ID: {}", userId);
        return ResponseEntity.ok(userService.getUserById(userId));
    }
    
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UserResponseDto> updateUserStatus(
            @PathVariable Long userId, 
            @RequestParam UserStatus status,
            @RequestParam(required = false) String reason) {
        log.info("Admin updating status for user ID: {} to {} with reason: {}", userId, status, reason);
        UserResponseDto updatedUser = userService.updateUserStatus(userId, status, reason);
        return ResponseEntity.ok(updatedUser);
    }
    
    @PostMapping("/users/{userId}/reset-password")
    public ResponseEntity<String> resetUserPassword(@PathVariable Long userId) {
        log.info("Admin initiating password reset for user ID: {}", userId);
        userService.adminInitiatePasswordReset(userId);
        return ResponseEntity.ok("Password reset email has been sent to the user");
    }
    
    // Enhanced Shop Management
    @GetMapping("/shops")
    public ResponseEntity<List<ShopResponseDto>> getAllShopsWithComprehensiveDetails() {
        log.info("Admin fetching all shops with comprehensive details");
        return ResponseEntity.ok(shopService.getAllShopsWithDetailedInfo());
    }
    
    @GetMapping("/shops/{shopId}")
    public ResponseEntity<ShopResponseDto> getShopDetails(@PathVariable Long shopId) {
        log.info("Admin fetching details for shop ID: {}", shopId);
        return ResponseEntity.ok(shopService.getShopById(shopId));
    }
    
    @PutMapping("/shops/{shopId}/status")
    public ResponseEntity<ShopResponseDto> updateShopStatus(
            @PathVariable Long shopId, 
            @RequestParam ShopStatus status,
            @RequestParam(required = false) String reason) {
        log.info("Admin updating status for shop ID: {} to {}", shopId, status);
        ShopResponseDto updatedShop = shopService.updateShopStatus(shopId, status, reason);
        return ResponseEntity.ok(updatedShop);
    }
    
    @PutMapping("/shops/{shopId}/verify")
    public ResponseEntity<ShopResponseDto> verifyShop(@PathVariable Long shopId) {
        log.info("Admin verifying shop ID: {}", shopId);
        ShopResponseDto verifiedShop = shopService.verifyShop(shopId);
        return ResponseEntity.ok(verifiedShop);
    }
    
    @GetMapping("/repair-requests")
public ResponseEntity<PageResponseDto<RepairRequestResponseDto>> getAllRepairRequests(
        @RequestParam(required = false) RequestStatus status,
        @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    log.info("Admin fetching repair requests with status: {}", status);
    return ResponseEntity.ok(repairRequestService.getAllRequests(status, pageable));
}
    
    @GetMapping("/repair-requests/{requestId}")
    public ResponseEntity<RepairRequestResponseDto> getRepairRequestDetails(@PathVariable Long requestId) {
        log.info("Admin fetching comprehensive details for repair request ID: {}", requestId);
        return ResponseEntity.ok(repairRequestService.getRequestById(requestId));
    }
    
    // Enhanced Analytics and Reports
    @GetMapping("/analytics/comprehensive")
    public ResponseEntity<Map<String, Object>> getComprehensiveAnalytics(
            @RequestParam(required = false) String period) {
        log.info("Admin fetching comprehensive analytics for period: {}", period);
        return ResponseEntity.ok(adminService.getComprehensiveAnalytics(period));
    }
    
    @GetMapping("/analytics/reviews")
    public ResponseEntity<Map<String, Object>> getReviewAnalytics() {
        log.info("Admin fetching review analytics");
        return ResponseEntity.ok(reviewService.getReviewAnalytics());
    }
    
    // Enhanced System Notifications
    @PostMapping("/notifications/system")
    public ResponseEntity<SystemNotificationResponseDto> sendSystemNotification(
            @Valid @RequestBody SystemNotificationDto notificationDto) {
        log.info("Admin sending system notification: {}", notificationDto.getTitle());
        SystemNotificationResponseDto response = adminService.sendSystemNotification(notificationDto);
        return ResponseEntity.ok(response);
    }
    
    // Cleanup and Maintenance
    @DeleteMapping("/cleanup/expired-tokens")
    public ResponseEntity<Integer> cleanupExpiredTokens() {
        log.info("Admin initiating cleanup of expired verification tokens");
        int deletedTokens = adminService.cleanupExpiredVerificationTokens();
        return ResponseEntity.ok(deletedTokens);
    }


/**
 * Retrieves user growth analytics for a specified period
 * @param period Optional time period for analytics (week/month/year)
 * @return User growth analytics data
 */
@GetMapping("/analytics/user-growth")
public ResponseEntity<List<Map<String, Object>>> getUserGrowthAnalytics(
        @RequestParam(required = false) String period) {
    log.info("Admin fetching user growth analytics for period: {}", period);
    return ResponseEntity.ok(adminService.getUserGrowthAnalytics(period));
}

/**
 * Retrieves repair request analytics for a specified period
 * @param period Optional time period for analytics (week/month/year)
 * @return Repair request analytics data
 */
@GetMapping("/analytics/repair-requests")
public ResponseEntity<Map<String, Object>> getRepairRequestAnalytics(
        @RequestParam(required = false) String period) {
    log.info("Admin fetching repair request analytics for period: {}", period);
    return ResponseEntity.ok(adminService.getRepairRequestAnalytics(period));
}

/**
 * Retrieves performance data for all repair shops
 * @return List of shop performance metrics
 */
@GetMapping("/analytics/shop-performance")
public ResponseEntity<List<Map<String, Object>>> getShopPerformanceData() {
    log.info("Admin fetching shop performance data");
    return ResponseEntity.ok(adminService.getShopPerformanceData());
}
}