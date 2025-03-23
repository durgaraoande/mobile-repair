package com.repair.mobile.repository;

import com.repair.mobile.entity.RepairRequest;
import com.repair.mobile.entity.User;
import com.repair.mobile.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, Long> {
    List<RepairRequest> findByCustomer(User customer);
    List<RepairRequest> findByCustomerId(Long customerId);
//    List<RepairRequest> findByShopId(Long shopId);
    List<RepairRequest> findByStatus(RequestStatus status);

    @Query("SELECT DISTINCT r FROM RepairRequest r " +
           "WHERE r.status = 'PENDING' " +
           "AND NOT EXISTS (" +
           "    SELECT q FROM RepairQuote q " +
           "    WHERE q.repairRequest = r " +
           "    AND (q.shop.id = :shopId OR q.status = 'ACCEPTED')" +
           ")")
    List<RepairRequest> findAvailableRequestsForQuoting(@Param("shopId") Long shopId);

    @Query("SELECT DISTINCT r FROM RepairRequest r JOIN RepairQuote q ON r = q.repairRequest WHERE q.shop.id = :shopId")
    List<RepairRequest> findRequestsByShopQuotes(@Param("shopId") Long shopId);

    // @Query("SELECT DISTINCT r FROM RepairRequest r " +
    //    "JOIN FETCH r.quotes q " +
    //    "WHERE q.shop.id = :shopId " +
    //    "AND ((r.status = 'QUOTED') " +
    //    "    OR (r.status IN ('ACCEPTED', 'IN_PROGRESS') AND q.accepted = true))")
    // List<RepairRequest> findActiveRequestsByShop(@Param("shopId") Long shopId);


    @Query("SELECT DISTINCT r FROM RepairRequest r " +
       "JOIN FETCH r.quotes q " +
       "WHERE q.shop.id = :shopId " +
       "AND (" +
       "    (r.status = 'QUOTED') " +  // All shops can see their quoted requests
       "    OR (r.status IN ('ACCEPTED', 'IN_PROGRESS') AND q.accepted = true) " +  // Only accepted shop can see in-progress
       "    OR (r.status IN ('COMPLETED', 'CANCELLED') AND q.accepted = true) " +  // Only accepted shop can see completed/cancelled
       ")")
List<RepairRequest> findAllRequestsByShop(@Param("shopId") Long shopId);

// You might want to split this into two separate methods for better organization
@Query("SELECT DISTINCT r FROM RepairRequest r " +
       "JOIN FETCH r.quotes q " +
       "WHERE q.shop.id = :shopId " +
       "AND r.status IN ('QUOTED', 'ACCEPTED', 'IN_PROGRESS') " +
       "AND (" +
       "    r.status = 'QUOTED' " +
       "    OR (r.status IN ('ACCEPTED', 'IN_PROGRESS') AND q.accepted = true)" +
       ")")
List<RepairRequest> findActiveRequestsByShop(@Param("shopId") Long shopId);

@Query("SELECT DISTINCT r FROM RepairRequest r " +
       "JOIN FETCH r.quotes q " +
       "WHERE q.shop.id = :shopId " +
       "AND r.status IN ('COMPLETED', 'CANCELLED') " +
       "AND q.accepted = true " +
       "ORDER BY r.updatedAt DESC")
List<RepairRequest> findCompletedRequestsByShop(@Param("shopId") Long shopId);
}
