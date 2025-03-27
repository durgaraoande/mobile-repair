package com.repair.mobile.controller;

import com.repair.mobile.dto.ShopRegistrationDto;
import com.repair.mobile.dto.ShopResponseDto;
import com.repair.mobile.dto.ShopUpdateDto;
import com.repair.mobile.exception.ErrorResponse;
import com.repair.mobile.exception.ResourceNotFoundException;
import com.repair.mobile.exception.ShopAlreadyExistsException;
import com.repair.mobile.exception.UnauthorizedException;
import com.repair.mobile.service.ShopService;
import com.repair.mobile.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/shops")
@RequiredArgsConstructor
@Slf4j
public class ShopController {
    private final ShopService shopService;

    @PostMapping
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ShopResponseDto> registerShop(
            @Valid @RequestBody ShopRegistrationDto registrationDto) {
        log.info("Registering new shop for user ID: {}", SecurityUtils.getCurrentUserId());
        ShopResponseDto response = shopService.registerShop(SecurityUtils.getCurrentUserId(), registrationDto);
        log.info("Successfully registered shop with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{shopId}")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<ShopResponseDto> updateShop(
            @PathVariable Long shopId,
            @Valid @RequestBody ShopUpdateDto updateDto) {
        log.info("Updating shop ID: {}", shopId);
        ShopResponseDto response = shopService.updateShop(shopId, updateDto);
        log.info("Successfully updated shop ID: {}", shopId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ShopResponseDto>> getAllShops() {
        log.info("Fetching all shops");
        return ResponseEntity.ok(shopService.getAllShops());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ShopResponseDto>> getActiveAndVerifiedShops() {
        log.info("Fetching active and verified shops");
        return ResponseEntity.ok(shopService.getAllActiveAndVerifiedShops());
    }

    @GetMapping("/{shopId}")
    public ResponseEntity<ShopResponseDto> getShopById(@PathVariable Long shopId) {
        log.info("Fetching shop details for ID: {}", shopId);
        return ResponseEntity.ok(shopService.getShopById(shopId));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ShopResponseDto> getShopByOwnerId(@PathVariable Long ownerId) {
        log.info("Fetching shop details for owner ID: {}", ownerId);
        return ResponseEntity.ok(shopService.getShopByOwnerId(ownerId));
    }

    // Exception handlers
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ShopAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleShopAlreadyExistsException(ShopAlreadyExistsException ex) {
        log.error("Shop already exists: {}", ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex) {
        log.error("Unauthorized access: {}", ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        log.error("Validation error: {}", errors);
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed: " + errors,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred. Please try again later.",
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}