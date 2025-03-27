package com.repair.mobile.repository;

import com.repair.mobile.entity.*;
import com.repair.mobile.enums.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(UserRole role);
    List<User> findByRole(UserRole role);
    long countByCreatedAt(LocalDateTime createdAt);
    
    @Query("SELECT new map(u.id as id, u.email as email, u.fullName as fullName, u.createdAt as createdAt) " +
           "FROM User u WHERE u.createdAt > :date")
    List<Map<String, Object>> findUserRegistrationsByCreatedAtAfter(@Param("date") LocalDateTime date);
}