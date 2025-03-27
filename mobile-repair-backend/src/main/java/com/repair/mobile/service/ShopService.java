package com.repair.mobile.service;

import com.repair.mobile.dto.ShopRegistrationDto;
import com.repair.mobile.dto.ShopResponseDto;
import com.repair.mobile.dto.ShopUpdateDto;
import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.entity.User;
import com.repair.mobile.enums.RequestStatus;
import com.repair.mobile.enums.ShopStatus;
import com.repair.mobile.enums.UserRole;
import com.repair.mobile.exception.ResourceNotFoundException;
import com.repair.mobile.exception.ShopAlreadyExistsException;
import com.repair.mobile.exception.UnauthorizedException;
import com.repair.mobile.repository.RepairRequestRepository;
import com.repair.mobile.repository.RepairShopRepository;
import com.repair.mobile.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ShopService {
    private final RepairShopRepository shopRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final RepairRequestRepository repairRequestRepository;
    private final NotificationService notificationService;
    

    public ShopResponseDto registerShop(Long ownerId, ShopRegistrationDto registrationDto) {
        log.info("Registering new shop for user ID: {}", ownerId);
        try {
            User owner = userRepository.findById(ownerId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + ownerId));
        
            if (!owner.getRole().equals(UserRole.SHOP_OWNER)) {
                throw new UnauthorizedException("User is not authorized to register a shop");
            }
        
            if (shopRepository.existsByOwnerId(ownerId)) {
                throw new ShopAlreadyExistsException("User already has a registered shop");
            }
        
            RepairShop shop = new RepairShop();
            shop.setOwner(owner);
            shop.setShopName(registrationDto.getShopName());
            shop.setAddress(registrationDto.getAddress());
            shop.setDescription(registrationDto.getDescription());
            shop.setOperatingHours(registrationDto.getOperatingHours());
        
            RepairShop savedShop = shopRepository.save(shop);
            log.info("Successfully registered shop with ID: {}", savedShop.getId());
            return modelMapper.map(savedShop, ShopResponseDto.class);
        } catch (ResourceNotFoundException | UnauthorizedException | ShopAlreadyExistsException e) {
            // Let these exceptions propagate to be handled by controller
            throw e;
        } catch (Exception e) {
            log.error("Error registering shop for user ID: {}", ownerId, e);
            throw new RuntimeException("Failed to register shop: " + e.getMessage(), e);
        }
    }

    public ShopResponseDto updateShop(Long shopId, ShopUpdateDto updateDto) {
        log.info("Updating shop with ID: {}", shopId);
        try {
            RepairShop shop = shopRepository.findById(shopId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shop not found with ID: " + shopId));
        
            if (updateDto.getShopName() != null) {
                shop.setShopName(updateDto.getShopName());
            }
            if (updateDto.getAddress() != null) {
                shop.setAddress(updateDto.getAddress());
            }
            if (updateDto.getDescription() != null) {
                shop.setDescription(updateDto.getDescription());
            }
            if (updateDto.getOperatingHours() != null) {
                shop.setOperatingHours(updateDto.getOperatingHours());
            }
            if (updateDto.getServices() != null) {
                shop.setServices(updateDto.getServices());
            }
            // Handle the newly added fields
            if (updateDto.getPaymentMethods() != null) {
                shop.setPaymentMethods(updateDto.getPaymentMethods());
            }
            if (updateDto.getAverageRepairTime() != null) {
                shop.setAverageRepairTime(updateDto.getAverageRepairTime());
            }
            if (updateDto.getRushServiceAvailable() != null) {
                shop.setRushServiceAvailable(updateDto.getRushServiceAvailable());
            }
            if (updateDto.getDeviceTypes() != null) {
                shop.setDeviceTypes(updateDto.getDeviceTypes());
            }
            if (updateDto.getYearsInBusiness() != null) {
                shop.setYearsInBusiness(updateDto.getYearsInBusiness());
            }
            if (updateDto.getPhotoUrls() != null) {
                shop.setPhotoUrls(updateDto.getPhotoUrls());
            }
            if (updateDto.getLatitude() != null) {
                shop.setLatitude(updateDto.getLatitude());
            }
            if (updateDto.getLongitude() != null) {
                shop.setLongitude(updateDto.getLongitude());
            }
        
            RepairShop updatedShop = shopRepository.save(shop);
            log.info("Successfully updated shop with ID: {}", shopId);
        
            return modelMapper.map(updatedShop, ShopResponseDto.class);
        } catch (ResourceNotFoundException e) {
            // Let these exceptions propagate to be handled by controller
            throw e;
        } catch (Exception e) {
            log.error("Error updating shop with ID: {}", shopId, e);
            throw new RuntimeException("Failed to update shop: " + e.getMessage(), e);
        }
    }

    public List<ShopResponseDto> getAllShops() {
        try {
            log.info("Fetching all shops");
            return shopRepository.findAll().stream()
                    .map(shop -> modelMapper.map(shop, ShopResponseDto.class))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching all shops", e);
            throw new RuntimeException("Failed to fetch shops: " + e.getMessage(), e);
        }
    }

    public List<ShopResponseDto> getAllActiveAndVerifiedShops() {
        try {
            log.info("Fetching active and verified shops");
            return shopRepository.findByStatusAndVerifiedTrue(ShopStatus.ACTIVE)
                .stream()
                .map(shop -> modelMapper.map(shop, ShopResponseDto.class))
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching active and verified shops", e);
            throw new RuntimeException("Failed to fetch active shops: " + e.getMessage(), e);
        }
    }

    public ShopResponseDto getShopById(Long shopId) {
        try {
            log.info("Fetching shop with ID: {}", shopId);
            RepairShop shop = shopRepository.findById(shopId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shop not found with ID: " + shopId));
            return modelMapper.map(shop, ShopResponseDto.class);
        } catch (ResourceNotFoundException e) {
            // Let this exception propagate to be handled by controller
            throw e;
        } catch (Exception e) {
            log.error("Error fetching shop with ID: {}", shopId, e);
            throw new RuntimeException("Failed to fetch shop: " + e.getMessage(), e);
        }
    }

    public ShopResponseDto getShopByOwnerId(Long ownerId) {
        try {
            log.info("Fetching shop for owner ID: {}", ownerId);
            RepairShop shop = shopRepository.findByOwnerId(ownerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shop not found for owner ID: " + ownerId));
            return modelMapper.map(shop, ShopResponseDto.class);
        } catch (ResourceNotFoundException e) {
            // Let this exception propagate to be handled by controller
            throw e;
        } catch (Exception e) {
            log.error("Error fetching shop for owner ID: {}", ownerId, e);
            throw new RuntimeException("Failed to fetch shop: " + e.getMessage(), e);
        }
    }

    // Add these methods to your existing ShopService class

public List<ShopResponseDto> getAllShopsWithDetailedInfo() {
    List<RepairShop> shops = shopRepository.findAll();
    return shops.stream()
            .map(shop -> {
                ShopResponseDto dto = modelMapper.map(shop, ShopResponseDto.class);
                
                // Add extra information for admin
                dto.setTotalRepairs(repairRequestRepository.countByShopId(shop.getId()));
                dto.setAverageRating(shopRepository.getAverageRatingForShop(shop.getId()));
                dto.setCompletionRate(calculateCompletionRate(shop.getId()));
                
                return dto;
            })
            .collect(Collectors.toList());
}

@Transactional
public ShopResponseDto updateShopStatus(Long shopId, ShopStatus status, String reason) {
    try {
        log.info("Attempting to update shop status for shop ID: {}", shopId);
        
        // Validate input
        if (status == null) {
            throw new IllegalArgumentException("Shop status cannot be null");
        }

        // Fetch the shop with error handling
        RepairShop shop = shopRepository.findById(shopId)
            .orElseThrow(() -> {
                log.error("Shop not found with ID: {}", shopId);
                return new ResourceNotFoundException("Shop not found with ID: " + shopId);
            });

        // Prevent unnecessary updates
        if (shop.getStatus() == status) {
            log.info("Shop {} is already in {} status. No update needed.", shopId, status);
            return modelMapper.map(shop, ShopResponseDto.class);
        }

        // Additional validation based on current status
        validateStatusTransition(shop.getStatus(), status);

        // Update shop status
        shop.setStatus(status);
        
        // Set status reason if provided
        if (StringUtils.hasText(reason)) {
            shop.setStatusReason(reason);
            log.info("Added status reason for shop {}: {}", shopId, reason);
        }

        // Update verification status based on new status
        updateVerificationStatus(shop, status);

        // Save updated shop
        RepairShop updatedShop = shopRepository.save(shop);
        log.info("Successfully updated status for shop {} to {}", shopId, status);

        // Send notification
        sendStatusUpdateNotification(shop, status, reason);

        return modelMapper.map(updatedShop, ShopResponseDto.class);
    } catch (IllegalArgumentException | ResourceNotFoundException e) {
        log.error("Validation error when updating shop status: {}", e.getMessage());
        throw e;
    } catch (Exception e) {
        log.error("Unexpected error updating shop status for shop ID: {}", shopId, e);
        throw new RuntimeException("Failed to update shop status: " + e.getMessage(), e);
    }
}

@Transactional
public ShopResponseDto verifyShop(Long shopId) {
    try {
        log.info("Attempting to verify shop with ID: {}", shopId);

        // Fetch the shop with error handling
        RepairShop shop = shopRepository.findById(shopId)
            .orElseThrow(() -> {
                log.error("Shop not found with ID: {}", shopId);
                return new ResourceNotFoundException("Shop not found with ID: " + shopId);
            });

        // Check if shop is already verified
        if (shop.isVerified()) {
            log.info("Shop {} is already verified. No further action needed.", shopId);
            return modelMapper.map(shop, ShopResponseDto.class);
        }

        // Perform pre-verification checks
        performPreVerificationChecks(shop);

        // Update shop verification status
        shop.setVerified(true);
        shop.setStatus(ShopStatus.ACTIVE);
        shop.setVerificationDate(LocalDateTime.now());

        // Save verified shop
        RepairShop verifiedShop = shopRepository.save(shop);
        log.info("Successfully verified shop {}", shopId);

        // Send verification notification
        sendVerificationNotification(shop);

        return modelMapper.map(verifiedShop, ShopResponseDto.class);
    } catch (ResourceNotFoundException | IllegalStateException e) {
        log.error("Verification failed for shop ID: {}: {}", shopId, e.getMessage());
        throw e;
    } catch (Exception e) {
        log.error("Unexpected error verifying shop ID: {}", shopId, e);
        throw new RuntimeException("Failed to verify shop: " + e.getMessage(), e);
    }
}

// Helper method to validate status transitions
private void validateStatusTransition(ShopStatus currentStatus, ShopStatus newStatus) {
    // Define allowed status transitions
    Map<ShopStatus, Set<ShopStatus>> allowedTransitions = new EnumMap<>(ShopStatus.class);
    allowedTransitions.put(ShopStatus.PENDING_VERIFICATION, 
        Set.of(ShopStatus.ACTIVE, ShopStatus.SUSPENDED, ShopStatus.DEACTIVATED));
    allowedTransitions.put(ShopStatus.ACTIVE, 
        Set.of(ShopStatus.SUSPENDED, ShopStatus.DEACTIVATED));
    allowedTransitions.put(ShopStatus.SUSPENDED, 
        Set.of(ShopStatus.ACTIVE, ShopStatus.DEACTIVATED));
    allowedTransitions.put(ShopStatus.DEACTIVATED, 
        Set.of(ShopStatus.ACTIVE, ShopStatus.SUSPENDED));

    if (!allowedTransitions.getOrDefault(currentStatus, Collections.emptySet()).contains(newStatus)) {
        log.warn("Invalid status transition from {} to {}", currentStatus, newStatus);
        throw new IllegalStateException(
            "Invalid status transition from " + currentStatus + " to " + newStatus
        );
    }
}

// Helper method to update verification status
private void updateVerificationStatus(RepairShop shop, ShopStatus status) {
    switch (status) {
        case ACTIVE:
            shop.setVerified(true);
            shop.setVerificationDate(LocalDateTime.now());
            break;
        case SUSPENDED:
        case DEACTIVATED:
            shop.setVerified(false);
            break;
        default:
            // No change to verification for other statuses
    }
}

// Helper method to send status update notification
private void sendStatusUpdateNotification(RepairShop shop, ShopStatus status, String reason) {
    try {
        String notificationTitle = "Shop Status Updated";
        String notificationBody = String.format(
            "Your shop status has been updated to: %s%s", 
            status, 
            (StringUtils.hasText(reason) ? ". Reason: " + reason : "")
        );

        notificationService.sendNotification(
            shop.getOwner().getId(),
            notificationTitle,
            notificationBody,
            "SHOP_STATUS",
            shop.getId()
        );
        log.info("Notification sent for shop status update: {}", shop.getId());
    } catch (Exception e) {
        log.error("Failed to send notification for shop status update", e);
    }
}

// Helper method to send verification notification
private void sendVerificationNotification(RepairShop shop) {
    try {
        notificationService.sendNotification(
            shop.getOwner().getId(),
            "Shop Verified",
            "Congratulations! Your shop has been verified and is now active on our platform.",
            "SHOP_VERIFICATION",
            shop.getId()
        );
        log.info("Verification notification sent for shop: {}", shop.getId());
    } catch (Exception e) {
        log.error("Failed to send verification notification", e);
    }
}

// Pre-verification checks
private void performPreVerificationChecks(RepairShop shop) {
    // Example checks - customize based on your requirements
    if (!StringUtils.hasText(shop.getShopName())) {
        throw new IllegalStateException("Shop name is required for verification");
    }

    if (!StringUtils.hasText(shop.getAddress())) {
        throw new IllegalStateException("Shop address is required for verification");
    }

    // Add more verification checks as needed
}

private double calculateCompletionRate(Long shopId) {
    long totalRepairs = repairRequestRepository.countAcceptedRequestsByShopId(shopId);
    long completedRepairs = repairRequestRepository.countByShopIdAndStatus(shopId, RequestStatus.COMPLETED);
    
    return totalRepairs > 0 ? (double) completedRepairs / totalRepairs * 100 : 0;
}
}