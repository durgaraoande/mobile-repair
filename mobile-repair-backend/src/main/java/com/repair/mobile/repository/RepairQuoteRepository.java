package com.repair.mobile.repository;

import com.repair.mobile.entity.RepairQuote;
import com.repair.mobile.entity.RepairRequest;
import com.repair.mobile.entity.RepairShop;
import com.repair.mobile.enums.QuoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepairQuoteRepository extends JpaRepository<RepairQuote, Long> {
    List<RepairQuote> findByRepairRequest(RepairRequest repairRequest);
    List<RepairQuote> findByShop(RepairShop shop);
    List<RepairQuote> findByStatus(QuoteStatus status);
    List<RepairQuote> findByRepairRequestId(Long requestId);
    boolean existsByShopAndRepairRequest(RepairShop shop, RepairRequest request);
    List<RepairQuote> findByShopId(Long shopId);
    List<RepairQuote> findByRepairRequestAndIdNot(RepairRequest request, Long quoteId);

    @Query("SELECT q.id FROM RepairQuote q WHERE q.repairRequest.id = :requestId")
    List<Long> findIdsByRepairRequestId(Long requestId);

    
    @Query("SELECT CASE WHEN COUNT(q) > 0 THEN true ELSE false END FROM RepairQuote q " +
           "WHERE q.repairRequest.id = :requestId AND q.status = 'ACCEPTED'")
    boolean hasAcceptedQuote(Long requestId);

   Optional<RepairQuote> findByRepairRequestAndAcceptedTrue(RepairRequest request);

   @Modifying
   @Query("UPDATE RepairQuote q SET q.status = :status " +
          "WHERE q.repairRequest.id = :requestId " +
          "AND q.id != :quoteId")
   void updateAllQuotesStatusForRequest(
       @Param("requestId") Long requestId, 
       @Param("status") QuoteStatus status,
       @Param("quoteId") Long quoteId
   );

   @Query("SELECT CASE WHEN COUNT(q) > 0 THEN true ELSE false END FROM RepairQuote q " +
          "WHERE q.repairRequest.id = :requestId AND q.status = :status")
   boolean existsByRepairRequestIdAndStatus(
       @Param("requestId") Long requestId, 
       @Param("status") QuoteStatus status
   );

   Optional<RepairQuote> findByRepairRequestIdAndStatus(Long repairRequestId, QuoteStatus status);
}
