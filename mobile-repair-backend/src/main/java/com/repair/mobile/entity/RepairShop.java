package com.repair.mobile.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.repair.mobile.enums.ShopStatus;

@Data
@Entity
@Table(name = "repair_shops")
public class RepairShop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String shopName;

    @Column(nullable = false)
    private String address;

    private String description;

    @Column(name = "operating_hours")
    private String operatingHours;

    private double averageRating;

    @ElementCollection
    @CollectionTable(name = "shop_services")
    private Set<String> services = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "shop_payment_methods")
    private Set<String> paymentMethods = new HashSet<>();

    private String averageRepairTime;

    private boolean rushServiceAvailable;

    @ElementCollection
    @CollectionTable(name = "shop_device_types")
    private Set<String> deviceTypes = new HashSet<>();

    private Integer yearsInBusiness;

    @ElementCollection
    @CollectionTable(name = "shop_photo_urls")
    private Set<String> photoUrls = new HashSet<>();

    private Double latitude;

    private Double longitude;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private ShopStatus status;

    private String statusReason;

    private boolean verified = false;

    private LocalDateTime verificationDate;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = ShopStatus.PENDING_VERIFICATION;
        verified = false; 
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    } 
}