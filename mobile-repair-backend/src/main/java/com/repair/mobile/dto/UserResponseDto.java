package com.repair.mobile.dto;

import java.time.LocalDateTime;

import com.repair.mobile.enums.UserRole;
import lombok.Data;

@Data
public class UserResponseDto {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private UserRole role;
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime emailVerifiedAt;
    private LocalDateTime passwordUpdatedAt;
}
