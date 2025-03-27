package com.repair.mobile.service;

import com.repair.mobile.dto.PageResponseDto;
import com.repair.mobile.dto.QuoteResponseDto;
import com.repair.mobile.dto.RepairRequestDto;
import com.repair.mobile.dto.RepairRequestResponseDto;
import com.repair.mobile.entity.RepairQuote;
import com.repair.mobile.entity.RepairRequest;
import com.repair.mobile.entity.User;
import com.repair.mobile.enums.QuoteStatus;
import com.repair.mobile.enums.RequestStatus;
import com.repair.mobile.exception.FileStorageException;
import com.repair.mobile.exception.InvalidStatusTransitionException;
import com.repair.mobile.exception.ResourceNotFoundException;
import com.repair.mobile.repository.RepairQuoteRepository;
import com.repair.mobile.repository.RepairRequestRepository;
import com.repair.mobile.repository.UserRepository;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.coyote.BadRequestException;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class RepairRequestService {
    private final RepairRequestRepository requestRepository;
    private final RepairQuoteRepository quoteRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ModelMapper modelMapper;
    private final CloudinaryService cloudinaryService;

    public RepairRequestResponseDto createRequest(Long userId, RepairRequestDto requestDto, List<MultipartFile> images) {
        log.info("Creating repair request for user ID: {}", userId);

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        validateRequest(requestDto);

        RepairRequest request = new RepairRequest();
        request.setCustomer(customer);
        request.setDeviceBrand(requestDto.getDeviceBrand());
        request.setDeviceModel(requestDto.getDeviceModel());
        request.setImeiNumber(requestDto.getImeiNumber());
        request.setProblemCategory(requestDto.getProblemCategory());
        request.setProblemDescription(requestDto.getProblemDescription());

        // Handle image uploads
        Set<String> imageUrls = new HashSet<>();
        if (images != null && !images.isEmpty()) {
            if (images.size() > 3) {
                throw new ValidationException("Maximum 3 images allowed per request");
            }
            imageUrls = uploadImages(images);
        }
        request.setImageUrls(imageUrls);

        RepairRequest savedRequest = requestRepository.save(request);
        log.info("Successfully created repair request with ID: {}", savedRequest.getId());

        // Notify nearby shops about new repair request
        notificationService.notifyShopsAboutNewRequest(savedRequest);

        return modelMapper.map(savedRequest, RepairRequestResponseDto.class);
    }

    public RepairRequestResponseDto updateRequestStatus(Long requestId, RequestStatus newStatus) {
        log.info("Updating status of repair request ID: {} to {}", requestId, newStatus);

        RepairRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair request not found with ID: " + requestId));

        validateStatusTransition(request.getStatus(), newStatus);
        request.setStatus(newStatus);
        
        // Set completedAt when status changes to COMPLETED
        if (newStatus == RequestStatus.COMPLETED) {
            request.setCompletedAt(LocalDateTime.now());
            log.info("Setting completion date for request ID: {}", requestId);
        }

        RepairRequest updatedRequest = requestRepository.save(request);
        log.info("Successfully updated status of repair request ID: {}", requestId);

        // Notify relevant parties about status change
        notificationService.notifyRequestStatusChange(updatedRequest);

        return modelMapper.map(updatedRequest, RepairRequestResponseDto.class);
    }
    
    public RepairRequestResponseDto updateRepairDetails(Long requestId, RepairRequestDto requestDto) throws BadRequestException {
        log.info("Updating details of repair request ID: {}", requestId);
        
        RepairRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair request not found with ID: " + requestId));
                
        // Only allow updates for ACCEPTED status
        if (request.getStatus() != RequestStatus.ACCEPTED) {
            throw new BadRequestException("Can only update details for accepted repairs");
        }
        
        validateRequest(requestDto);
        
        // Update fields
        request.setDeviceBrand(requestDto.getDeviceBrand());
        request.setDeviceModel(requestDto.getDeviceModel());
        request.setImeiNumber(requestDto.getImeiNumber());
        request.setProblemCategory(requestDto.getProblemCategory());
        request.setProblemDescription(requestDto.getProblemDescription());
        
        // Change status to IN_PROGRESS
        request.setStatus(RequestStatus.IN_PROGRESS);
        
        RepairRequest updatedRequest = requestRepository.save(request);
        log.info("Successfully updated details and started work on repair request ID: {}", requestId);
        
        // Notify customer that repair has started
        notificationService.notifyRepairStarted(updatedRequest);
        
        return modelMapper.map(updatedRequest, RepairRequestResponseDto.class);
    }

    

    public List<RepairRequestResponseDto> getRequestsByCustomer(Long customerId) {
        return requestRepository.findByCustomerId(customerId).stream()
                .map(request -> modelMapper.map(request, RepairRequestResponseDto.class))
                .collect(Collectors.toList());
    }

public List<RepairRequestResponseDto> getRequestsByShop(Long shopId) {
    List<RepairRequest> requests = requestRepository.findActiveRequestsByShop(shopId);
    
    return requests.stream()
            .map(request -> {
                RepairRequestResponseDto dto = modelMapper.map(request, RepairRequestResponseDto.class);
                
                // Get the shop's quote for this request
                RepairQuote matchingQuote = request.getQuotes()
                    .stream()
                    .filter(quote -> quote.getShop().getId().equals(shopId))
                    .findFirst()
                    .orElse(null);
                
                if (matchingQuote != null) {
                    QuoteResponseDto quoteDto = modelMapper.map(matchingQuote, QuoteResponseDto.class);
                    dto.setQuote(quoteDto);
                }
                
                return dto;
            })
            .collect(Collectors.toList());
}

public List<RepairRequestResponseDto> getActiveRequestsByShop(Long shopId) {
    List<RepairRequest> requests = requestRepository.findActiveRequestsByShop(shopId);
    return mapToResponseDtos(requests, shopId);
}

public List<RepairRequestResponseDto> getCompletedRequestsByShop(Long shopId) {
    List<RepairRequest> requests = requestRepository.findCompletedRequestsByShop(shopId);
    return mapToResponseDtos(requests, shopId);
}

private List<RepairRequestResponseDto> mapToResponseDtos(List<RepairRequest> requests, Long shopId) {
    return requests.stream()
            .map(request -> {
                RepairRequestResponseDto dto = modelMapper.map(request, RepairRequestResponseDto.class);
                
                // Get the shop's quote for this request
                RepairQuote matchingQuote = request.getQuotes()
                    .stream()
                    .filter(quote -> quote.getShop().getId().equals(shopId))
                    .findFirst()
                    .orElse(null);
                
                if (matchingQuote != null) {
                    QuoteResponseDto quoteDto = modelMapper.map(matchingQuote, QuoteResponseDto.class);
                    dto.setQuote(quoteDto);
                }
                
                return dto;
            })
            .collect(Collectors.toList());
}

@Transactional(readOnly = true)
public List<RepairRequestResponseDto> getPendingRequests() {
    log.info("Fetching all pending repair requests");
    
    // Fetch all repair requests with PENDING status
    List<RepairRequest> pendingRequests = requestRepository.findByStatus(RequestStatus.PENDING);
    
    // Convert the entities to DTOs
    return pendingRequests.stream()
            .map(request -> modelMapper.map(request, RepairRequestResponseDto.class))
            .collect(Collectors.toList());
}

@Transactional(readOnly = true)
    public List<RepairRequestResponseDto> getPendingRequestsForQuoting(Long shopId) {
        // Use the new repository method to get eligible requests directly from the database
        List<RepairRequest> availableRequests = requestRepository.findAvailableRequestsForQuoting(shopId);
        
        // Map to DTOs without any filtering
        return availableRequests.stream()
                .map(request -> modelMapper.map(request, RepairRequestResponseDto.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateRequestStatusBasedOnQuotes(Long requestId) {
        RepairRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Repair request not found"));
        
        // Get a fresh count of quotes from the database
        List<RepairQuote> quotes = quoteRepository.findByRepairRequestId(requestId);
        
        // Determine status based on quote counts
        if (quotes.isEmpty()) {
            request.setStatus(RequestStatus.PENDING);
        } else {
            boolean hasAccepted = quotes.stream()
                .anyMatch(quote -> quote.getStatus() == QuoteStatus.ACCEPTED);
            request.setStatus(hasAccepted ? RequestStatus.ACCEPTED : RequestStatus.QUOTED);
        }
        
        requestRepository.save(request);
    }


    // Add these methods to your existing RepairRequestService class

@Transactional(readOnly = true)
public PageResponseDto<RepairRequestResponseDto> getAllRequests(
        RequestStatus status, 
        Pageable pageable) {
    log.info("Fetching repair requests with status: {}, pagination: {}", 
             status, pageable);

    Specification<RepairRequest> spec = Specification.where(null);

    // Add status filter if provided
    if (status != null) {
        spec = spec.and((root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("status"), status));
    }

    // Fetch paginated results with specification
    Page<RepairRequest> requestPage = requestRepository.findAll(spec, pageable);

    // Map to custom PageResponseDto
    return new PageResponseDto<>(
        requestPage.getContent().stream()
            .map(request -> modelMapper.map(request, RepairRequestResponseDto.class))
            .collect(Collectors.toList()),
        requestPage.getNumber(),
        requestPage.getSize(),
        requestPage.getTotalElements(),
        requestPage.getTotalPages(),
        requestPage.isLast(),
        requestPage.isFirst(),
        requestPage.isEmpty()
    );
}

public List<RepairRequestResponseDto> getRequestsByStatus(String statusStr) throws BadRequestException {
    try {
        RequestStatus status = RequestStatus.valueOf(statusStr.toUpperCase());
        return requestRepository.findByStatus(status).stream()
            .map(request -> modelMapper.map(request, RepairRequestResponseDto.class))
            .collect(Collectors.toList());
    } catch (IllegalArgumentException e) {
        throw new BadRequestException("Invalid status: " + statusStr);
    }
}

public RepairRequestResponseDto getRequestById(Long requestId) {
    RepairRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Repair request not found with ID: " + requestId));
    
    return modelMapper.map(request, RepairRequestResponseDto.class);
}


private Set<String> uploadImages(List<MultipartFile> images) {
    Set<String> imageIds = new HashSet<>();
    
    if (images == null || images.isEmpty()) {
        return imageIds;
    }
    
    if (images.size() > 3) {
        throw new ValidationException("Maximum 3 images allowed per request");
    }
    
    images.forEach(image -> {
        try {
            if (image == null || image.isEmpty()) {
                log.warn("Skipping empty image file");
                return;
            }
            
            String publicId = cloudinaryService.uploadImage(image);
            if (publicId != null && !publicId.trim().isEmpty()) {
                imageIds.add(publicId);
            }
        } catch (Exception e) {
            // If upload fails, attempt to clean up any successfully uploaded images
            imageIds.forEach(id -> {
                try {
                    cloudinaryService.deleteImage(id);
                } catch (Exception deleteError) {
                    log.error("Failed to delete image after upload failure", deleteError);
                }
            });
            throw new FileStorageException("Failed to upload images: " + e.getMessage());
        }
    });
    
    return imageIds;
}

    private void validateRequest(RepairRequestDto requestDto) {
        if (!StringUtils.hasText(requestDto.getDeviceBrand())) {
            throw new ValidationException("Device brand is required");
        }
        if (!StringUtils.hasText(requestDto.getDeviceModel())) {
            throw new ValidationException("Device model is required");
        }
        if (!StringUtils.hasText(requestDto.getProblemDescription())) {
            throw new ValidationException("Problem description is required");
        }
    }

    private void validateStatusTransition(RequestStatus currentStatus, RequestStatus newStatus) {
        // Add logic to validate status transitions
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new InvalidStatusTransitionException(
                    "Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }

    private boolean isValidStatusTransition(RequestStatus current, RequestStatus next) {
        // Implement status transition rules
        switch (current) {
            case PENDING:
                return next == RequestStatus.QUOTED || next == RequestStatus.CANCELLED;
            case QUOTED:
                return next == RequestStatus.ACCEPTED || next == RequestStatus.CANCELLED;
            case ACCEPTED:
                return next == RequestStatus.IN_PROGRESS || next == RequestStatus.CANCELLED;
            case IN_PROGRESS:
                return next == RequestStatus.COMPLETED || next == RequestStatus.CANCELLED;
            default:
                return false;
        }
    }
}
