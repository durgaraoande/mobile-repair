package com.repair.mobile.entity;

import com.repair.mobile.enums.ProblemCategory;
import com.repair.mobile.enums.QuoteStatus;
import com.repair.mobile.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "repair_requests")
public class RepairRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false)
    private String deviceBrand;

    @Column(nullable = false)
    private String deviceModel;

    private String imeiNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ProblemCategory problemCategory;

    @Column(nullable = false)
    private String problemDescription;

    @ElementCollection
    @CollectionTable(name = "request_images")
    private Set<String> imageUrls = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "repairRequest")
    private Set<RepairQuote> quotes = new HashSet<>();

    // Check if a shop has already quoted
    public boolean hasQuoteFromShop(Long shopId) {
        return quotes.stream()
            .anyMatch(quote -> quote.getShop().getId().equals(shopId));
    }

    // Check if any quote is accepted
    public boolean hasAcceptedQuote() {
        return quotes.stream()
            .anyMatch(quote -> quote.getStatus() == QuoteStatus.ACCEPTED);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}