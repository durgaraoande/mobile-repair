package com.repair.mobile.dto;

import com.repair.mobile.enums.UserRole;
import lombok.Data;

@Data
public class UserRegistrationDto {
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
    private UserRole role;
}
