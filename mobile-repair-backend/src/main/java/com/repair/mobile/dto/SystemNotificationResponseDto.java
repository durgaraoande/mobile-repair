package com.repair.mobile.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SystemNotificationResponseDto {
  
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    @NotNull(message = "Target audience is required")
    private String targetAudience; // ALL_USERS, CUSTOMERS, SHOP_OWNERS

    private int size;

    private List<Long> notifiedUserIds;
}


