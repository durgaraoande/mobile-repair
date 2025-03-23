package com.repair.mobile.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
public class ReviewDto {
    @NotNull(message = "Repair request ID is required")
    private Long repairRequestId;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;
    
    @NotBlank(message = "Comment is required")
    @Size(max = 500, message = "Comment must be less than 500 characters")
    private String comment;
}