package com.repair.mobile.entity;

import com.repair.mobile.enums.UserRole;
import com.repair.mobile.enums.UserStatus;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private boolean enabled = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // New fields
    private LocalDateTime emailVerifiedAt;
    private LocalDateTime passwordUpdatedAt;
    private String resetToken;
    private LocalDateTime resetTokenExpiryDate;

    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.ACTIVE;

    private String statusReason;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}