package com.repair.mobile.security.service;

import com.repair.mobile.dto.*;
import com.repair.mobile.entity.User;
import com.repair.mobile.entity.VerificationToken;
import com.repair.mobile.enums.TokenType;
import com.repair.mobile.enums.UserStatus;
import com.repair.mobile.exception.*;
import com.repair.mobile.repository.UserRepository;
import com.repair.mobile.security.config.JwtService;
import com.repair.mobile.service.EmailService;
import com.repair.mobile.validator.EmailValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final EmailService emailService;
    private final VerificationTokenService verificationTokenService;
    private final EmailValidator emailValidator;
    private final JwtService jwtService;

    @Value("${user.email.verification.required:true}")
    private boolean emailVerificationRequired;

    @Value("${user.registration.grace-period-hours:48}")
    private int registrationGracePeriodHours;

    // Original user management methods
    public UserResponseDto registerUser(UserRegistrationDto registrationDto) {
        log.info("Registering new user with email: {}", registrationDto.getEmail());

        // Validate email format
        if (!emailValidator.isValid(registrationDto.getEmail())) {
            throw new InvalidEmailException("Invalid email format: " + registrationDto.getEmail());
        }

        // Check if email exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            User existingUser = userRepository.findByEmail(registrationDto.getEmail()).get();
            
            // If user exists but hasn't verified email within grace period, allow re-registration
            if (!existingUser.isEnabled() && 
                existingUser.getCreatedAt().plusHours(registrationGracePeriodHours).isBefore(LocalDateTime.now())) {
                log.info("Removing unverified user account for re-registration");
                userRepository.delete(existingUser);
            } else {
                throw new EmailAlreadyExistsException("Email already registered: " + registrationDto.getEmail());
            }
        }

        // Validate password strength
        validatePassword(registrationDto.getPassword());

        User user = new User();
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setFullName(registrationDto.getFullName());
        user.setPhoneNumber(registrationDto.getPhoneNumber());
        user.setRole(registrationDto.getRole());
        user.setEnabled(!emailVerificationRequired);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        
        if (emailVerificationRequired) {
            try {
                VerificationToken verificationToken = verificationTokenService
                    .createVerificationToken(savedUser, TokenType.EMAIL_VERIFICATION);
                emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken.getToken())
                    .exceptionally(throwable -> {
                        log.error("Failed to send verification email", throwable);
                        throw new EmailSendException("Failed to send verification email");
                    });
            } catch (Exception e) {
                log.error("Failed to send verification email", e);
                throw new EmailSendException("Failed to send verification email");
            }
        }

        log.info("Successfully registered user with ID: {}", savedUser.getId());
        return modelMapper.map(savedUser, UserResponseDto.class);
    }

    public UserResponseDto updateUser(Long userId, UserUpdateDto updateDto) {
        log.info("Updating user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (updateDto.getFullName() != null) {
            user.setFullName(updateDto.getFullName());
        }
        if (updateDto.getPhoneNumber() != null) {
            user.setPhoneNumber(updateDto.getPhoneNumber());
        }

        User updatedUser = userRepository.save(user);
        log.info("Successfully updated user with ID: {}", userId);

        return modelMapper.map(updatedUser, UserResponseDto.class);
    }

    public UserResponseDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return modelMapper.map(user, UserResponseDto.class);
    }

    public UserResponseDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return modelMapper.map(user, UserResponseDto.class);
    }

    // New authentication methods
    public void verifyEmail(String token) {
        log.info("Verifying email with token");
        
        VerificationToken verificationToken = verificationTokenService
            .validateToken(token, TokenType.EMAIL_VERIFICATION);
        
        User user = verificationToken.getUser();
        user.setEnabled(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        userRepository.save(user);
        
        verificationTokenService.deleteVerificationToken(verificationToken);
        
        // Send welcome email asynchronously
        emailService.sendWelcomeEmail(user.getEmail())
            .exceptionally(throwable -> {
                log.error("Failed to send welcome email", throwable);
                return null;
            });
            
        log.info("Successfully verified email for user: {}", user.getEmail());
    }

    // Add this method to UserService.java
public void resendVerificationEmail(String email) {
    log.info("Resending verification email for: {}", email);
    
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

    if (user.isEnabled()) {
        throw new IllegalStateException("User is already verified");
    }

    try {
        VerificationToken verificationToken = verificationTokenService
            .createVerificationToken(user, TokenType.EMAIL_VERIFICATION);
        
        emailService.sendVerificationEmail(user.getEmail(), verificationToken.getToken())
            .exceptionally(throwable -> {
                log.error("Failed to resend verification email", throwable);
                throw new EmailSendException("Failed to resend verification email");
            });
            
        log.info("Successfully resent verification email to: {}", email);
    } catch (Exception e) {
        log.error("Failed to resend verification email", e);
        throw new EmailSendException("Failed to resend verification email");
    }
}

    public void initiatePasswordReset(String email) {
        log.info("Initiating password reset for email: {}", email);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!user.isEnabled()) {
            throw new AccountNotVerifiedException("Account not verified. Please verify your email first.");
        }

        try {
            VerificationToken resetToken = verificationTokenService
                .createVerificationToken(user, TokenType.PASSWORD_RESET);
            
            emailService.sendPasswordResetEmail(email, resetToken.getToken())
                .exceptionally(throwable -> {
                    log.error("Failed to send password reset email", throwable);
                    throw new EmailSendException("Failed to send password reset email");
                });
                
            log.info("Successfully initiated password reset for user: {}", email);
        } catch (Exception e) {
            log.error("Failed to initiate password reset", e);
            throw new EmailSendException("Failed to send password reset email");
        }
    }

    public void resetPassword(String token, String newPassword) {
        log.info("Resetting password using token");
        
        validatePassword(newPassword);
        
        VerificationToken resetToken = verificationTokenService
            .validateToken(token, TokenType.PASSWORD_RESET);

        User user = resetToken.getUser();
        
        // Prevent reuse of old password
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new InvalidPasswordException("New password must be different from the current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        verificationTokenService.deleteVerificationToken(resetToken);
        
        // Notify user about password change asynchronously
        emailService.sendPasswordChangeNotification(user.getEmail())
            .exceptionally(throwable -> {
                log.error("Failed to send password change notification", throwable);
                return null;
            });
            
        log.info("Successfully reset password for user: {}", user.getEmail());
    }

    public void changePassword(Long userId, String currentPassword, String newPassword) {
        log.info("Changing password for user ID: {}", userId);
        
        validatePassword(newPassword);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new InvalidPasswordException("New password must be different from the current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Notify user about password change asynchronously
        emailService.sendPasswordChangeNotification(user.getEmail())
            .exceptionally(throwable -> {
                log.error("Failed to send password change notification", throwable);
                return null;
            });
            
        log.info("Successfully changed password for user: {}", user.getEmail());
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new InvalidPasswordException("Password must be at least 8 characters long");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new InvalidPasswordException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new InvalidPasswordException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*\\d.*")) {
            throw new InvalidPasswordException("Password must contain at least one number");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new InvalidPasswordException("Password must contain at least one special character");
        }
    }

    // Add these methods to your existing UserService class

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
            .map(user -> modelMapper.map(user, UserResponseDto.class))
            .collect(Collectors.toList());
    }

    public UserResponseDto updateUserStatus(Long userId, UserStatus status, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        user.setStatus(status);
        if (reason != null && !reason.isEmpty()) {
            user.setStatusReason(reason);
        }
        // Log the reason for status change
        log.info("Updating user status for user ID: {} to {}. Reason: {}", userId, status, reason);
        
        // If blocking a user, also log them out (e.g., invalidate tokens)
        if (status == UserStatus.BLOCKED) {
            jwtService.invalidateAllTokensForUser(user.getEmail());
        }
        
        User updatedUser = userRepository.save(user);
        return modelMapper.map(updatedUser, UserResponseDto.class);
    }

    public void adminInitiatePasswordReset(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        // Generate password reset token
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiryDate(LocalDateTime.now().plusHours(24));
        userRepository.save(user);
        
        // Send reset email
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }
}