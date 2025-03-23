// RepairRequestController.java
package com.repair.mobile.controller;

import com.repair.mobile.dto.RepairRequestDto;
import com.repair.mobile.dto.RepairRequestResponseDto;
import com.repair.mobile.enums.RequestStatus;
import com.repair.mobile.service.RepairRequestService;
import com.repair.mobile.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/repair-requests")
@RequiredArgsConstructor
@Slf4j
public class RepairRequestController {
    private final RepairRequestService repairRequestService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RepairRequestResponseDto> createRequest(
            @Valid @RequestPart("request") RepairRequestDto requestDto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        log.info("Creating repair request for user ID: {}", SecurityUtils.getCurrentUserId());
        RepairRequestResponseDto response = repairRequestService.createRequest(
                SecurityUtils.getCurrentUserId(),
                requestDto,
                images
        );
        log.info("Successfully created repair request with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{requestId}/status")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<RepairRequestResponseDto> updateStatus(
            @PathVariable Long requestId,
            @RequestParam RequestStatus status) {
        log.info("Updating status of repair request ID: {} to {}", requestId, status);
        RepairRequestResponseDto response = repairRequestService.updateRequestStatus(requestId, status);
        log.info("Successfully updated status of repair request ID: {}", requestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RepairRequestResponseDto>> getCustomerRequests() {
        log.info("Fetching repair requests for customer ID: {}", SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(repairRequestService.getRequestsByCustomer(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/shop")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<List<RepairRequestResponseDto>> getShopRequests() {
        log.info("Fetching repair requests for shop owner ID: {}", SecurityUtils.getCurrentUserId());
        // return ResponseEntity.ok(repairRequestService.getRequestsByShop(SecurityUtils.getCurrentUserId()));
        return ResponseEntity.ok(repairRequestService.getRequestsByShop(securityUtils.getCurrentUserShopId()));
    }

    @GetMapping("/shop/pending")
@PreAuthorize("hasRole('SHOP_OWNER')")
public ResponseEntity<List<RepairRequestResponseDto>> getPendingRequests() {
    log.info("Fetching pending repair requests for shop owner ID: {}", SecurityUtils.getCurrentUserId());
    return ResponseEntity.ok(repairRequestService.getPendingRequests());
}

@GetMapping("/shop/available-for-quote")
@PreAuthorize("hasRole('SHOP_OWNER')")
public ResponseEntity<List<RepairRequestResponseDto>> getRequestsAvailableForQuote() {
    Long shopId = securityUtils.getCurrentUserShopId();
    log.info("Fetching requests available for quote for shop ID: {}", shopId);
    return ResponseEntity.ok(repairRequestService.getPendingRequestsForQuoting(shopId));
}

@GetMapping("/repairs/active")
public ResponseEntity<List<RepairRequestResponseDto>> getActiveRepairs() {
    Long shopId = securityUtils.getCurrentUserShopId();
    log.info("Fetching active repairs for shop ID: {}", shopId);
    return ResponseEntity.ok(repairRequestService.getActiveRequestsByShop(shopId));
}

@GetMapping("/repairs/completed")
public ResponseEntity<List<RepairRequestResponseDto>> getCompletedRepairs() {
    Long shopId = securityUtils.getCurrentUserShopId();
    log.info("Fetching completed repairs for shop ID: {}", shopId);
    return ResponseEntity.ok(repairRequestService.getCompletedRequestsByShop(shopId));
}

@PutMapping("/{requestId}/details")
@PreAuthorize("hasRole('SHOP_OWNER')")
public ResponseEntity<RepairRequestResponseDto> updateRepairDetails(
        @PathVariable Long requestId,
        @Valid @RequestBody RepairRequestDto requestDto) throws BadRequestException {
    log.info("Updating details of repair request ID: {}", requestId);
    RepairRequestResponseDto response = repairRequestService.updateRepairDetails(requestId, requestDto);
    log.info("Successfully updated details of repair request ID: {}", requestId);
    return ResponseEntity.ok(response);
}
}