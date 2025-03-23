package com.repair.mobile.service;

import com.repair.mobile.dto.ShopRegistrationDto;
import com.repair.mobile.dto.ShopResponseDto;
import com.repair.mobile.dto.ShopUpdateDto;
import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.entity.User;
import com.repair.mobile.enums.UserRole;
import com.repair.mobile.exception.ResourceNotFoundException;
import com.repair.mobile.exception.ShopAlreadyExistsException;
import com.repair.mobile.exception.UnauthorizedException;
import com.repair.mobile.repository.RepairShopRepository;
import com.repair.mobile.repository.UserRepository;
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
public class ShopService {
    private final RepairShopRepository shopRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

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
            // shop.setServices(registrationDto.getServices());
            // shop.setPaymentMethods(registrationDto.getPaymentMethods());
            // shop.setAverageRepairTime(registrationDto.getAverageRepairTime());
            // shop.setRushServiceAvailable(registrationDto.getRushServiceAvailable());
            // shop.setDeviceTypes(registrationDto.getDeviceTypes());
            // shop.setYearsInBusiness(registrationDto.getYearsInBusiness());
            // shop.setPhotoUrls(registrationDto.getPhotoUrls());
            // shop.setLatitude(registrationDto.getLatitude());
            // shop.setLongitude(registrationDto.getLongitude());
        
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
}