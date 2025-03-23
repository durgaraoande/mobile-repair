package com.repair.mobile.dto;

import com.repair.mobile.enums.ProblemCategory;
import com.repair.mobile.enums.RequestStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class RepairRequestResponseDto {
    private Long id;
    private UserResponseDto customer;
    private String deviceBrand;
    private String deviceModel;
    private String imeiNumber;
    private ProblemCategory problemCategory;
    private String problemDescription;
    private Set<String> imageUrls;
    private RequestStatus status;
    private String createdAt;
    private LocalDateTime completedAt;
    private QuoteResponseDto quote;
}
