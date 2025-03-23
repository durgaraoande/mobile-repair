package com.repair.mobile.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponseDto {
    private Long id;
    private Long repairRequestId;
    private Long shopId;
    private String shopName;
    private Long customerId;
    private String customerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}