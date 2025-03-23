package com.repair.mobile.repository;

import com.repair.mobile.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByShopId(Long shopId);
    
    List<Review> findByCustomerId(Long customerId);
    
    Optional<Review> findByRepairRequestId(Long repairRequestId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.shop.id = :shopId")
    Double getAverageRatingByShopId(@Param("shopId") Long shopId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.shop.id = :shopId")
    Long getReviewCountByShopId(@Param("shopId") Long shopId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.shop.id = :shopId AND r.rating = :rating")
    Long countByShopIdAndRating(@Param("shopId") Long shopId, @Param("rating") Integer rating);
}