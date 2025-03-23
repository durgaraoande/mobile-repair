package com.repair.mobile.dto;

import lombok.Data;

@Data
public class PasswordResetRequest {
    private String token;
    private String newPassword;
    // getters, setters
}

