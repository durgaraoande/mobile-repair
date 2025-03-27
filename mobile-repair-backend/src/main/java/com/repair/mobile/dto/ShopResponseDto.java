package com.repair.mobile.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

import com.repair.mobile.enums.ShopStatus;

@Data
public class ShopResponseDto {
    private Long id;
    private UserResponseDto owner;
    private String shopName;
    private String address;
    private String description;
    private String operatingHours;
    private Set<String> services;
    private Set<String> paymentMethods;
    private String averageRepairTime;
    private Boolean rushServiceAvailable;
    private Set<String> deviceTypes;
    private Integer yearsInBusiness;
    private Set<String> photoUrls;
    private Double latitude;
    private Double longitude;

    private ShopStatus status;
    private String statusReason;
    private boolean verified;
    private LocalDateTime verificationDate;

    // Admin-specific statistics (these fields will only be populated for admin
    // requests)
    private Long totalRepairs;
    private Double averageRating;
    private Double completionRate;
}
