package com.repair.mobile.repository;

import com.repair.mobile.entity.RepairRequest;
import com.repair.mobile.entity.User;
import com.repair.mobile.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RepairRequestRepository extends 
        JpaRepository<RepairRequest, Long>, 
        JpaSpecificationExecutor<RepairRequest> {
       List<RepairRequest> findByCustomer(User customer);

       List<RepairRequest> findByCustomerId(Long customerId);

       List<RepairRequest> findByStatus(RequestStatus status);

       @Query("SELECT DISTINCT r FROM RepairRequest r " +
                     "WHERE r.status = 'PENDING' " +
                     "AND NOT EXISTS (" +
                     "    SELECT q FROM RepairQuote q " +
                     "    WHERE q.repairRequest = r " +
                     "    AND (q.shop.id = :shopId OR q.status = 'ACCEPTED')" +
                     ")")
       List<RepairRequest> findAvailableRequestsForQuoting(@Param("shopId") Long shopId);

       @Query("SELECT DISTINCT r FROM RepairRequest r " +
                     "JOIN RepairQuote q ON r = q.repairRequest " +
                     "WHERE q.shop.id = :shopId")
       List<RepairRequest> findRequestsByShopQuotes(@Param("shopId") Long shopId);

       @Query("SELECT DISTINCT r FROM RepairRequest r " +
                     "JOIN FETCH r.quotes q " +
                     "WHERE q.shop.id = :shopId " +
                     "AND (" +
                     "    (r.status = 'QUOTED') " +
                     "    OR (r.status IN ('ACCEPTED', 'IN_PROGRESS') AND q.accepted = true) " +
                     "    OR (r.status IN ('COMPLETED', 'CANCELLED') AND q.accepted = true)" +
                     ")")
       List<RepairRequest> findAllRequestsByShop(@Param("shopId") Long shopId);

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

       long countByStatus(RequestStatus status);

       // Renamed from createdDateAfter to createdAtAfter to match entity field name
       long countByCreatedAtAfter(LocalDateTime date);

       // Renamed from createdDateAfter to createdAtAfter to match entity field name
       List<RepairRequest> findByCreatedAtAfter(LocalDateTime date);

       @Query("SELECT COUNT(q) FROM RepairQuote q WHERE q.shop.id = :shopId")
       long countQuotesByShopId(@Param("shopId") Long shopId);

       @Query("SELECT COUNT(q) FROM RepairQuote q WHERE q.shop.id = :shopId AND q.accepted = true")
       long countAcceptedQuotesByShopId(@Param("shopId") Long shopId);

       @Query("SELECT COUNT(r) FROM RepairRequest r JOIN r.quotes q WHERE q.shop.id = :shopId AND q.accepted = true")
       long countAcceptedRequestsByShopId(@Param("shopId") Long shopId);

       @Query("SELECT COUNT(r) FROM RepairRequest r JOIN r.quotes q WHERE q.shop.id = :shopId AND r.status = :status")
       long countByShopIdAndStatus(@Param("shopId") Long shopId, @Param("status") RequestStatus status);

       @Query("SELECT r FROM RepairRequest r JOIN r.quotes q WHERE q.shop.id = :shopId AND r.status = :status")
       List<RepairRequest> findByShopIdAndStatus(@Param("shopId") Long shopId, @Param("status") RequestStatus status);

       @Query("SELECT COUNT(r) FROM RepairRequest r JOIN r.quotes q WHERE q.shop.id = :shopId")
       Long countByShopId(@Param("shopId") Long shopId);

       @Query("SELECT DISTINCT r FROM RepairRequest r " +
                     "JOIN r.quotes q " +
                     "WHERE q.shop.id = :shopId " +
                     "AND r.status = :status " +
                     "AND r.createdAt > :startDate " +
                     "AND q.status = 'ACCEPTED'")
       List<RepairRequest> findByShopIdAndStatusAndCreatedAtAfter(
                     @Param("shopId") Long shopId,
                     @Param("status") RequestStatus status,
                     @Param("startDate") LocalDateTime startDate);

       @Query("SELECT DISTINCT r FROM RepairRequest r " +
                     "JOIN r.quotes q " +
                     "WHERE q.shop.id = :shopId " +
                     "AND r.status = :status")
       List<RepairRequest> findByStatusAndShopId(@Param("status") RequestStatus status, @Param("shopId") Long shopId);

       @Query("SELECT DISTINCT r FROM RepairRequest r " +
                     "JOIN r.quotes q " +
                     "WHERE q.shop.id = :shopId")
       List<RepairRequest> findByShopId(@Param("shopId") Long shopId);
}