package com.repair.mobile.entity;

import com.repair.mobile.enums.QuoteStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "repair_quotes")
public class RepairQuote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "repair_request_id", nullable = false)
    private RepairRequest repairRequest;

    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private RepairShop shop;

    @Column(nullable = false)
    private Double estimatedCost;

    private String description;

    @Column(nullable = false)
    private Integer estimatedDays;

    @Enumerated(EnumType.STRING)
    private QuoteStatus status = QuoteStatus.PENDING;

    @Column(nullable = false)
    private boolean accepted = false;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void accept() {
        this.status = QuoteStatus.ACCEPTED;
        this.accepted = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void reject() {
        this.status = QuoteStatus.REJECTED;
        this.accepted = false;
        this.updatedAt = LocalDateTime.now();
    }
}