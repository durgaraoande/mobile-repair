package com.repair.mobile.dto;

import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class ShopRegistrationDto {
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
}
