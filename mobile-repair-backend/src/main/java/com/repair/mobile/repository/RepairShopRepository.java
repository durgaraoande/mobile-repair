package com.repair.mobile.repository;

import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepairShopRepository extends JpaRepository<RepairShop, Long> {
    List<RepairShop> findByOwner(User owner);
    Optional<RepairShop> findByOwnerId(Long ownerId);
    boolean existsByOwnerId(Long ownerId);
}
