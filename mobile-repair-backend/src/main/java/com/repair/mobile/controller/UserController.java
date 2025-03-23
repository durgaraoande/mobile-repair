// UserController.java
package com.repair.mobile.controller;

import com.repair.mobile.dto.UserResponseDto;
import com.repair.mobile.security.service.UserService;
import com.repair.mobile.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser() {
        log.info("Fetching current user details");
        UserResponseDto response = userService.getUserById(SecurityUtils.getCurrentUserId());
        log.info("Retrieved details for user ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long userId) {
        log.info("Fetching user details for ID: {}", userId);
        return ResponseEntity.ok(userService.getUserById(userId));
    }
}