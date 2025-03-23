package com.repair.mobile.dto;

import lombok.Data;

@Data
public class ServicePricingDto {
    private String service;
    private String priceRange;
    private String estimatedTime;

    // Getters and Setters
}
