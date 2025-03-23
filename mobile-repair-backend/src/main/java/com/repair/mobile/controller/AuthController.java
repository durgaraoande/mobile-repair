package com.repair.mobile.controller;

import com.repair.mobile.dto.*;
import com.repair.mobile.enums.UserRole;
import com.repair.mobile.exception.ResourceNotFoundException;
import com.repair.mobile.security.config.JwtService;
import com.repair.mobile.security.service.UserService;
import com.repair.mobile.service.ShopService;
import com.repair.mobile.util.SecurityUtils;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final ShopService shopService;

    @PostMapping("/register/user")
    public ResponseEntity<UserResponseDto> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto) {
        log.info("Received registration request for email: {}", registrationDto.getEmail());
        UserResponseDto response = userService.registerUser(registrationDto);
        log.info("Successfully registered user with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

//     @PostMapping("/login")
// public ResponseEntity<Map<String, Object>> login(
//         @Valid @RequestBody LoginDto loginDto,
//         HttpSession session) {
//     log.info("Login attempt for user: {}", loginDto.getEmail());

//     try {
//         // First check if user exists and is verified
//         UserResponseDto userResponse = userService.getUserByEmail(loginDto.getEmail());
        
//         if (!userResponse.isEnabled()) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("error", "Email not verified");
//             response.put("message", "Please verify your email before logging in");
//             response.put("email", loginDto.getEmail());
//             return ResponseEntity.status(403).body(response);
//         }

//         // Proceed with authentication
//         Authentication authentication = authenticationManager.authenticate(
//                 new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
//         );

//         String token = jwtService.generateToken(loginDto.getEmail());
//         session.setAttribute("jwt_token", token);

//         Map<String, Object> response = new HashMap<>();
//         response.put("token", token);
//         response.put("user", userResponse);

//         // Check if the user is a shop owner and include shop details if available
//         if (userResponse.getRole().equals(UserRole.SHOP_OWNER)) {
//             try {
//                 ShopResponseDto shopResponse = shopService.getShopByOwnerId(userResponse.getId());
//                 response.put("shop", shopResponse);
//             } catch (ResourceNotFoundException e) {
//                 log.info("User is a shop owner but no shop is registered yet.");
//             }
//         }

//         log.info("Successfully authenticated user: {}", loginDto.getEmail());
//         return ResponseEntity.ok(response);
        
//     } catch (ResourceNotFoundException e) {
//         Map<String, Object> response = new HashMap<>();
//         response.put("error", "Invalid credentials");
//         response.put("message", "Email or password is incorrect");
//         return ResponseEntity.status(401).body(response);
//     } catch (Exception e) {
//         Map<String, Object> response = new HashMap<>();
//         response.put("error", "Authentication failed");
//         response.put("message", "An error occurred during authentication");
//         log.error("Authentication error for user {}: {}", loginDto.getEmail(), e.getMessage());
//         return ResponseEntity.status(500).body(response);
//     }
// }

@PostMapping("/login")
public ResponseEntity<Map<String, Object>> login(
        @Valid @RequestBody LoginDto loginDto,
        HttpSession session) {
    log.info("Login attempt for user: {}", loginDto.getEmail());

    try {
        // First check if user exists and is verified
        UserResponseDto userResponse = userService.getUserByEmail(loginDto.getEmail());
        
        if (!userResponse.isEnabled()) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Email not verified");
            response.put("message", "Please verify your email before logging in");
            response.put("email", loginDto.getEmail());
            return ResponseEntity.status(403).body(response);
        }

        // Proceed with authentication
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );

        // Generate token with appropriate expiration based on rememberMe flag
        String token = jwtService.generateToken(loginDto.getEmail(), loginDto.isRememberMe());
        session.setAttribute("jwt_token", token);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userResponse);

        // Check if the user is a shop owner and include shop details if available
        if (userResponse.getRole().equals(UserRole.SHOP_OWNER)) {
            try {
                ShopResponseDto shopResponse = shopService.getShopByOwnerId(userResponse.getId());
                response.put("shop", shopResponse);
            } catch (ResourceNotFoundException e) {
                log.info("User is a shop owner but no shop is registered yet.");
            }
        }

        log.info("Successfully authenticated user: {}", loginDto.getEmail());
        return ResponseEntity.ok(response);
        
    } catch (ResourceNotFoundException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Invalid credentials");
        response.put("message", "Email or password is incorrect");
        return ResponseEntity.status(401).body(response);
    } catch (Exception e) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Authentication failed");
        response.put("message", "An error occurred during authentication");
        log.error("Authentication error for user {}: {}", loginDto.getEmail(), e.getMessage());
        return ResponseEntity.status(500).body(response);
    }
}


    @PutMapping("/update/user/{userId}")
    public ResponseEntity<UserResponseDto> updateUser(@PathVariable Long userId, @Valid @RequestBody UserUpdateDto updateDto) {
        log.info("Received update request for user ID: {}", userId);
        UserResponseDto response = userService.updateUser(userId, updateDto);
        log.info("Successfully updated user with ID: {}", userId);
        return ResponseEntity.ok(response);
    }


     @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        log.info("Processing email verification request");
        userService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully. You can now log in.");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestParam String email) {
        log.info("Processing verification email resend request for: {}", email);
        userService.resendVerificationEmail(email);
        return ResponseEntity.ok("Verification email has been resent");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        log.info("Processing forgot password request for email: {}", email);
        userService.initiatePasswordReset(email);
        return ResponseEntity.ok("If the email exists in our system, you will receive password reset instructions");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        log.info("Processing password reset request");
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        log.info("Processing password change request for user ID: {}", SecurityUtils.getCurrentUserId());
        userService.changePassword(
            SecurityUtils.getCurrentUserId(),
            request.getCurrentPassword(),
            request.getNewPassword()
        );
        return ResponseEntity.ok("Password changed successfully");
    }
}