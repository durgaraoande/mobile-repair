package com.repair.mobile.service;

import com.repair.mobile.dto.QuoteDto;
import com.repair.mobile.dto.QuoteResponseDto;
import com.repair.mobile.entity.RepairQuote;
import com.repair.mobile.entity.RepairRequest;
import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.enums.QuoteStatus;
import com.repair.mobile.enums.RequestStatus;
import com.repair.mobile.exception.*;
import com.repair.mobile.repository.RepairQuoteRepository;
import com.repair.mobile.repository.RepairRequestRepository;
import com.repair.mobile.repository.RepairShopRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class QuoteService {
    private final RepairQuoteRepository quoteRepository;
    private final RepairRequestRepository requestRepository;
    private final RepairShopRepository shopRepository;
    private final NotificationService notificationService;
    private final ModelMapper modelMapper;

    public QuoteResponseDto createQuote(Long shopId, QuoteDto quoteDto) {
        log.info("Creating quote from shop ID: {} for request ID: {}",
                shopId, quoteDto.getRepairRequestId());

        RepairRequest request = requestRepository.findById(quoteDto.getRepairRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Repair request not found"));

        RepairShop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));

        validateQuoteSubmission(shop, request);

        RepairQuote quote = new RepairQuote();
        quote.setRepairRequest(request);
        quote.setShop(shop);
        quote.setEstimatedCost(quoteDto.getEstimatedCost());
        quote.setDescription(quoteDto.getDescription());
        quote.setEstimatedDays(quoteDto.getEstimatedDays());
        quote.setStatus(QuoteStatus.PENDING);

        RepairQuote savedQuote = quoteRepository.save(quote);
        log.info("Successfully created quote with ID: {}", savedQuote.getId());

        // Don't change the request status here anymore
        // Let it remain PENDING until a quote is accepted
        
        notificationService.notifyNewQuote(savedQuote);

        return modelMapper.map(savedQuote, QuoteResponseDto.class);
    }

    @Transactional
    public QuoteResponseDto acceptQuote(Long quoteId, Long customerId) {
        log.info("Accepting quote ID: {} by customer ID: {}", quoteId, customerId);

        // 1. First fetch and validate the quote to be accepted
        RepairQuote quoteToAccept = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found"));

        validateQuoteAcceptance(quoteToAccept, customerId);

        // 2. Get the request ID and update all other quotes first
        Long requestId = quoteToAccept.getRepairRequest().getId();
        
        // 3. Update all OTHER quotes to REJECTED status using a single query
        quoteRepository.updateAllQuotesStatusForRequest(
            requestId, 
            QuoteStatus.REJECTED,
            quoteId  // Added the quoteId parameter
        );

        // 4. Now update the accepted quote
        quoteToAccept.setStatus(QuoteStatus.ACCEPTED);
        quoteToAccept.setAccepted(true);
        RepairQuote savedQuote = quoteRepository.save(quoteToAccept);

        // 5. Update the request status
        RepairRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        request.setStatus(RequestStatus.ACCEPTED);
        requestRepository.save(request);

        // 6. Send notification
        notificationService.notifyQuoteAccepted(savedQuote);

        return modelMapper.map(savedQuote, QuoteResponseDto.class);
    }

    public List<QuoteResponseDto> getQuotesForRequest(Long requestId) {
        return quoteRepository.findByRepairRequestId(requestId).stream()
                .map(quote -> modelMapper.map(quote, QuoteResponseDto.class))
                .collect(Collectors.toList());
    }

    private void validateQuoteSubmission(RepairShop shop, RepairRequest request) {
        // Only check if the request is open for quotes (PENDING)
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new InvalidRequestStatusException("Cannot submit quote for request in " + request.getStatus() + " status");
        }

        // Check if this shop has already submitted a quote for this request
        if (quoteRepository.existsByShopAndRepairRequest(shop, request)) {
            throw new DuplicateQuoteException("Shop has already submitted a quote for this request");
        }

        // Check if request already has an accepted quote
        if (quoteRepository.findByRepairRequestAndAcceptedTrue(request).isPresent()) {
            throw new InvalidRequestStatusException("Request already has an accepted quote");
        }
    }

    private void validateQuoteAcceptance(RepairQuote quote, Long customerId) {
        // Fetch the latest status from database
        RepairQuote freshQuote = quoteRepository.findById(quote.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found"));
        
        if (freshQuote.getStatus() != QuoteStatus.PENDING) {
            throw new InvalidQuoteStatusException("Cannot accept non-pending quote");
        }

        if (!freshQuote.getRepairRequest().getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedException("User not authorized to accept this quote");
        }

        // Check request status directly from database
        RepairRequest request = requestRepository.findById(freshQuote.getRepairRequest().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
                
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new InvalidRequestStatusException("Request is no longer open for acceptance");
        }

        // Check for already accepted quotes using a direct database query
        boolean hasAcceptedQuote = quoteRepository.existsByRepairRequestIdAndStatus(
            request.getId(), 
            QuoteStatus.ACCEPTED
        );
        
        if (hasAcceptedQuote) {
            throw new InvalidQuoteStatusException("Another quote has already been accepted for this request");
        }
    }

    // New helper method to check if a shop has already quoted for a request
    public boolean hasShopQuoted(Long shopId, Long requestId) {
        RepairShop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));
        RepairRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        
        return quoteRepository.existsByShopAndRepairRequest(shop, request);
    }
}