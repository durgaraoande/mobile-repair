package com.repair.mobile.repository;

import com.repair.mobile.entity.User;
import com.repair.mobile.entity.VerificationToken;
import com.repair.mobile.enums.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    
    List<VerificationToken> findAllByUserAndTokenType(User user, TokenType tokenType);
    
    List<VerificationToken> findAllByExpiryDateBefore(LocalDateTime date);
    
    int countByUserAndTokenTypeAndCreatedAtAfter(User user, TokenType tokenType, LocalDateTime date);
    
    void deleteAllByUserAndTokenType(User user, TokenType tokenType);
}