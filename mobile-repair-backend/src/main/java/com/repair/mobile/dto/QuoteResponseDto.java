package com.repair.mobile.dto;

import com.repair.mobile.enums.QuoteStatus;
import lombok.Data;

@Data
public class QuoteResponseDto {
    private Long id;
    private RepairRequestResponseDto repairRequest;
    private ShopResponseDto shop;
    private Double estimatedCost;
    private String description;
    private Integer estimatedDays;
    private QuoteStatus status;
}