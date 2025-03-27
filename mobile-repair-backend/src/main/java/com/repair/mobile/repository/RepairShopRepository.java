package com.repair.mobile.repository;

import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.entity.User;
import com.repair.mobile.enums.ShopStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepairShopRepository extends JpaRepository<RepairShop, Long> {
    List<RepairShop> findByOwner(User owner);
    Optional<RepairShop> findByOwnerId(Long ownerId);
    boolean existsByOwnerId(Long ownerId);
    long countByVerifiedTrue();
    
    List<RepairShop> findByStatusAndVerifiedTrue(ShopStatus status);
    
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.shop.id = :shopId")
    double getAverageRatingForShop(@Param("shopId") Long shopId);

    long countByCreatedAtAfter(LocalDateTime date);
}