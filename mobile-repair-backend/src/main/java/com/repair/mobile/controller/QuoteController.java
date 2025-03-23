// QuoteController.java
package com.repair.mobile.controller;

import com.repair.mobile.dto.QuoteDto;
import com.repair.mobile.dto.QuoteResponseDto;
import com.repair.mobile.service.QuoteService;
import com.repair.mobile.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quotes")
@RequiredArgsConstructor
@Slf4j
public class QuoteController {
    private final QuoteService quoteService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasRole('SHOP_OWNER')")
    public ResponseEntity<QuoteResponseDto> createQuote(@Valid @RequestBody QuoteDto quoteDto) {
        log.info("Creating quote for repair request ID: {}", quoteDto.getRepairRequestId());

        // Get the shop ID for the current authenticated user
        Long shopId = securityUtils.getCurrentUserShopId();

        // Create the quote using the shop ID
        QuoteResponseDto response = quoteService.createQuote(shopId, quoteDto);
        log.info("Successfully created quote with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{quoteId}/accept")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<QuoteResponseDto> acceptQuote(@PathVariable Long quoteId) {
        log.info("Accepting quote ID: {}", quoteId);
        QuoteResponseDto response = quoteService.acceptQuote(quoteId, SecurityUtils.getCurrentUserId());
        log.info("Successfully accepted quote ID: {}", quoteId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<QuoteResponseDto>> getQuotesForRequest(@PathVariable Long requestId) {
        log.info("Fetching quotes for repair request ID: {}", requestId);
        return ResponseEntity.ok(quoteService.getQuotesForRequest(requestId));
    }
}
