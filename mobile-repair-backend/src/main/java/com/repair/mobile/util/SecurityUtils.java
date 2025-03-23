package com.repair.mobile.util;

import com.repair.mobile.entity.User;
import com.repair.mobile.enums.UserRole;
import com.repair.mobile.exception.ResourceNotFoundException;
import com.repair.mobile.exception.UnauthorizedException;
import com.repair.mobile.repository.RepairShopRepository;
import com.repair.mobile.repository.UserRepository;
import com.repair.mobile.security.service.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private final UserRepository userRepository;
    private final RepairShopRepository repairShopRepository;

    public SecurityUtils(UserRepository userRepository, RepairShopRepository repairShopRepository) {
        this.userRepository = userRepository;
        this.repairShopRepository = repairShopRepository;
    }

    public static Long getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return principal.getId();
    }

    public Long getCurrentUserShopId() {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (user.getRole().equals(UserRole.SHOP_OWNER)) {
            return repairShopRepository.findByOwnerId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shop not found for owner ID: " + userId))
                    .getId();
        } else {
            throw new UnauthorizedException("User is not a shop owner");
        }
    }

    public static String getCurrentUserEmail() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return principal.getEmail();
    }

    public static boolean hasRole(String role) {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(grantedAuthority ->
                        grantedAuthority.getAuthority().equals("ROLE_" + role));
    }
}
