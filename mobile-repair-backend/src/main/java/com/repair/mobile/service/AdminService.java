package com.repair.mobile.service;

import com.repair.mobile.dto.SystemNotificationDto;
import com.repair.mobile.dto.SystemNotificationResponseDto;
import com.repair.mobile.entity.User;
import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.entity.RepairRequest;
import com.repair.mobile.entity.VerificationToken;
import com.repair.mobile.repository.*;
import com.repair.mobile.enums.RequestStatus;
import com.repair.mobile.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    private final UserRepository userRepository;
    private final RepairShopRepository shopRepository;
    private final RepairRequestRepository repairRequestRepository;
    private final NotificationService notificationService;
    private final VerificationTokenRepository verificationTokenRepository;
    
    // Comprehensive Dashboard Statistics
    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        // User Statistics
        long totalUsers = userRepository.count();
        Map<UserRole, Long> usersByRole = Arrays.stream(UserRole.values())
                .collect(Collectors.toMap(
                        role -> role,
                        role -> userRepository.countByRole(role)));

        // Shop Statistics
        long totalShops = shopRepository.count();
        long verifiedShops = shopRepository.countByVerifiedTrue();
        Map<String, Object> shopStats = new HashMap<>();
        shopStats.put("total", totalShops);
        shopStats.put("verified", verifiedShops);
        shopStats.put("averageRating", calculateAverageShopRating());

        // Repair Request Statistics
        long totalRequests = repairRequestRepository.count();
        Map<RequestStatus, Long> requestsByStatus = Arrays.stream(RequestStatus.values())
                .collect(Collectors.toMap(
                        status -> status,
                        status -> repairRequestRepository.countByStatus(status)));

        // Recent Activity (Last 7 Days)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long newUsers = userRepository.countByCreatedAt(sevenDaysAgo);
        long newRequests = repairRequestRepository.countByCreatedAtAfter(sevenDaysAgo);
        long newShops = shopRepository.countByCreatedAtAfter(sevenDaysAgo);

        // Compile Statistics
        statistics.put("userStats", Map.of(
                "total", totalUsers,
                "byRole", usersByRole,
                "newLast7Days", newUsers));

        statistics.put("shopStats", shopStats);

        statistics.put("requestStats", Map.of(
                "total", totalRequests,
                "byStatus", requestsByStatus,
                "newLast7Days", newRequests));

        statistics.put("recentActivity", Map.of(
                "newUsers", newUsers,
                "newRequests", newRequests,
                "newShops", newShops));

        return statistics;
    }

    private double calculateAverageShopRating() {
        List<RepairShop> shops = shopRepository.findAll();
        return shops.stream()
                .mapToDouble(shop -> shopRepository.getAverageRatingForShop(shop.getId()))
                .average()
                .orElse(0.0);
    }

    // Comprehensive Analytics
    public Map<String, Object> getComprehensiveAnalytics(String period) {
        Map<String, Object> result = new HashMap<>();
        LocalDateTime startDate = determineStartDate(period);

        // User Growth Analytics
        List<Map<String, Object>> userGrowth = getUserGrowthAnalytics(startDate);

        // Repair Request Analytics
        Map<String, Object> requestAnalytics = getRepairRequestAnalytics(startDate);

        // Shop Performance
        List<Map<String, Object>> shopPerformance = getShopPerformanceData(startDate);

        // Revenue and Financial Insights (Placeholder)
        Map<String, Object> financialInsights = getFinancialInsights(startDate);

        result.put("period", period != null ? period : "default");
        result.put("userGrowth", userGrowth);
        result.put("requestAnalytics", requestAnalytics);
        result.put("shopPerformance", shopPerformance);
        result.put("financialInsights", financialInsights);

        return result;
    }

    private LocalDateTime determineStartDate(String period) {
        switch (period != null ? period.toLowerCase() : "month") {
            case "week":
                return LocalDateTime.now().minusWeeks(1);
            case "year":
                return LocalDateTime.now().minusYears(1);
            case "month":
            default:
                return LocalDateTime.now().minusMonths(1);
        }
    }

    private List<Map<String, Object>> getUserGrowthAnalytics(LocalDateTime startDate) {
        return userRepository.findUserRegistrationsByCreatedAtAfter(startDate);
    }

    private Map<String, Object> getRepairRequestAnalytics(LocalDateTime startDate) {
        List<RepairRequest> requests = repairRequestRepository.findByCreatedAtAfter(startDate);

        Map<String, Long> requestsByDeviceType = requests.stream()
                .collect(Collectors.groupingBy(
                        request -> request.getDeviceBrand(),
                        Collectors.counting()));

        Map<RequestStatus, Long> requestsByStatus = requests.stream()
                .collect(Collectors.groupingBy(
                        request -> request.getStatus(),
                        Collectors.counting()));

        return Map.of(
                "totalRequests", (long) requests.size(),
                "byDeviceType", requestsByDeviceType,
                "byStatus", requestsByStatus);
    }

    private List<Map<String, Object>> getShopPerformanceData(LocalDateTime startDate) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<RepairShop> shops = shopRepository.findAll();

        for (RepairShop shop : shops) {
            Map<String, Object> shopData = new HashMap<>();
            shopData.put("shopId", shop.getId());
            shopData.put("shopName", shop.getShopName());

            // Completed repairs in the given period
            List<RepairRequest> completedRepairs = repairRequestRepository.findByShopIdAndStatusAndCreatedAtAfter(
                    shop.getId(), RequestStatus.COMPLETED, startDate);

            // Calculate average repair time
            double avgRepairTime = completedRepairs.stream()
                    .filter(r -> r.getCompletedAt() != null)
                    .mapToLong(r -> java.time.Duration.between(
                            r.getCreatedAt(), r.getCompletedAt()).toDays())
                    .average()
                    .orElse(0);

            // Calculate quote and request metrics
            long totalQuotes = repairRequestRepository.countQuotesByShopId(shop.getId());
            long acceptedQuotes = repairRequestRepository.countAcceptedQuotesByShopId(shop.getId());
            double quoteAcceptanceRate = totalQuotes > 0 ? (double) acceptedQuotes / totalQuotes * 100 : 0;

            // Average rating
            double avgRating = shopRepository.getAverageRatingForShop(shop.getId());

            shopData.put("completedRepairs", completedRepairs.size());
            shopData.put("avgRepairTime", avgRepairTime);
            shopData.put("quoteAcceptanceRate", quoteAcceptanceRate);
            shopData.put("avgRating", avgRating);

            result.add(shopData);
        }

        return result;
    }

    private Map<String, Object> getFinancialInsights(LocalDateTime startDate) {
        // Placeholder for financial insights
        // In a real-world scenario, this would involve more complex financial
        // calculations
        return Map.of(
                "estimatedTotalRevenue", 0,
                "averageRepairCost", 0,
                "topEarningShops", Collections.emptyList());
    }

    // Enhanced System Notification
    @Transactional
    public SystemNotificationResponseDto sendSystemNotification(SystemNotificationDto notificationDto) {
        // Determine recipients based on target audience
        List<User> recipients = determineNotificationRecipients(notificationDto.getTargetAudience());

        // Send notification to each user
        List<Long> notifiedUserIds = new ArrayList<>();
        for (User user : recipients) {
            notificationService.sendNotification(
                    user.getId(),
                    notificationDto.getTitle(),
                    notificationDto.getMessage(),
                    "SYSTEM",
                    null);
            notifiedUserIds.add(user.getId());
        }

        log.info("System notification sent to {} recipients", recipients.size());

        return new SystemNotificationResponseDto(
                notificationDto.getTitle(),
                notificationDto.getMessage(),
                notificationDto.getTargetAudience(),
                recipients.size(),
                notifiedUserIds);
    }

    private List<User> determineNotificationRecipients(String targetAudience) {
        switch (targetAudience) {
            case "ALL_USERS":
                return userRepository.findAll();
            case "CUSTOMERS":
                return userRepository.findByRole(UserRole.CUSTOMER);
            case "SHOP_OWNERS":
                return userRepository.findByRole(UserRole.SHOP_OWNER);
            default:
                throw new IllegalArgumentException("Invalid target audience: " + targetAudience);
        }
    }

    // Token Cleanup
    @Transactional
    public int cleanupExpiredVerificationTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<VerificationToken> expiredTokens = verificationTokenRepository.findAllByExpiryDateBefore(now);

        int deletedTokens = expiredTokens.size();
        verificationTokenRepository.deleteAll(expiredTokens);

        log.info("Cleaned up {} expired verification tokens", deletedTokens);
        return deletedTokens;
    }

    // Add these methods to the existing AdminService class

/**
 * Retrieves user registration analytics for a specified period
 * @param period Time period for analytics (defaults to 'month')
 * @return List of user registration data points
 */
public List<Map<String, Object>> getUserGrowthAnalytics(String period) {
    LocalDateTime startDate = determineStartDate(period);
    
    // Retrieve user registration data from repository
    return userRepository.findUserRegistrationsByCreatedAtAfter(startDate);
}

/**
 * Retrieves comprehensive repair request analytics
 * @param period Time period for analytics (defaults to 'month')
 * @return Map of repair request analytics
 */
public Map<String, Object> getRepairRequestAnalytics(String period) {
    LocalDateTime startDate = determineStartDate(period);
    
    // Fetch repair requests within the specified time period
    List<RepairRequest> requests = repairRequestRepository.findByCreatedAtAfter(startDate);

    // Group requests by device type
    Map<String, Long> requestsByDeviceType = requests.stream()
        .collect(Collectors.groupingBy(
            request -> request.getDeviceBrand(),
            Collectors.counting()
        ));

    // Group requests by status
    Map<RequestStatus, Long> requestsByStatus = requests.stream()
        .collect(Collectors.groupingBy(
            request -> request.getStatus(),
            Collectors.counting()
        ));

    // Compile analytics
    return Map.of(
        "totalRequests", (long) requests.size(),
        "byDeviceType", requestsByDeviceType,
        "byStatus", requestsByStatus
    );
}

/**
 * Retrieves performance metrics for all repair shops
 * @return List of shop performance details
 */
public List<Map<String, Object>> getShopPerformanceData() {
    List<Map<String, Object>> result = new ArrayList<>();
    
    // Fetch all shops
    List<RepairShop> shops = shopRepository.findAll();

    for (RepairShop shop : shops) {
        Map<String, Object> shopData = new HashMap<>();
        
        // Basic shop information
        shopData.put("shopId", shop.getId());
        shopData.put("shopName", shop.getShopName());

        // Calculate completed repairs
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        List<RepairRequest> completedRepairs = repairRequestRepository.findByShopIdAndStatusAndCreatedAtAfter(
            shop.getId(), 
            RequestStatus.COMPLETED, 
            oneMonthAgo
        );

        // Average repair time calculation
        double avgRepairTime = completedRepairs.stream()
            .filter(r -> r.getCompletedAt() != null)
            .mapToLong(r -> java.time.Duration.between(r.getCreatedAt(), r.getCompletedAt()).toDays())
            .average()
            .orElse(0);

        // Quote metrics
        long totalQuotes = repairRequestRepository.countQuotesByShopId(shop.getId());
        long acceptedQuotes = repairRequestRepository.countAcceptedQuotesByShopId(shop.getId());
        double quoteAcceptanceRate = totalQuotes > 0 
            ? (double) acceptedQuotes / totalQuotes * 100 
            : 0;

        // Average rating
        double avgRating = shopRepository.getAverageRatingForShop(shop.getId());

        // Populate shop performance data
        shopData.put("completedRepairs", completedRepairs.size());
        shopData.put("avgRepairTime", avgRepairTime);
        shopData.put("quoteAcceptanceRate", quoteAcceptanceRate);
        shopData.put("avgRating", avgRating);

        result.add(shopData);
    }

    return result;
}
}