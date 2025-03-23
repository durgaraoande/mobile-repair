package com.repair.mobile.dto;

import lombok.Data;

@Data
public class QuoteDto {
    private Long repairRequestId;
    private Double estimatedCost;
    private String description;
    private Integer estimatedDays;
}
