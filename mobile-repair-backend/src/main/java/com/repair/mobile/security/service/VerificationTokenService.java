package com.repair.mobile.security.service;

import com.repair.mobile.entity.User;
import com.repair.mobile.entity.VerificationToken;
import com.repair.mobile.enums.TokenType;
import com.repair.mobile.exception.TokenException;
import com.repair.mobile.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VerificationTokenService {
    private final VerificationTokenRepository tokenRepository;
    
    @Value("${verification.token.expiry.minutes:1440}") // 24 hours by default
    private int tokenExpiryMinutes;
    
    @Value("${verification.token.email.max-attempts:3}")
    private int maxEmailVerificationAttempts;
    
    @Value("${verification.token.password.max-attempts:3}")
    private int maxPasswordResetAttempts;

    public VerificationToken createVerificationToken(User user, TokenType tokenType) {
        log.debug("Creating new {} token for user: {}", tokenType, user.getEmail());
        
        // Invalidate any existing tokens of the same type for this user
        List<VerificationToken> existingTokens = tokenRepository.findAllByUserAndTokenType(user, tokenType);
        if (!existingTokens.isEmpty()) {
            log.debug("Found {} existing tokens. Invalidating...", existingTokens.size());
            tokenRepository.deleteAll(existingTokens);
        }

        // Check maximum attempts within 24 hours
        int attemptCount = tokenRepository.countByUserAndTokenTypeAndCreatedAtAfter(
            user, tokenType, LocalDateTime.now().minusHours(24)
        );
        
        int maxAttempts = tokenType == TokenType.EMAIL_VERIFICATION ? 
            maxEmailVerificationAttempts : maxPasswordResetAttempts;
            
        if (attemptCount >= maxAttempts) {
            throw new TokenException("Too many " + tokenType + " attempts. Please try again later.");
        }

        VerificationToken token = new VerificationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setTokenType(tokenType);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(tokenExpiryMinutes));
        token.setAttempts(0);
        
        return tokenRepository.save(token);
    }

    public VerificationToken validateToken(String token, TokenType expectedType) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new TokenException("Invalid token"));

        if (verificationToken.getTokenType() != expectedType) {
            throw new TokenException("Invalid token type");
        }

        if (isTokenExpired(verificationToken)) {
            tokenRepository.delete(verificationToken);
            throw new TokenException("Token has expired");
        }

        if (verificationToken.getAttempts() >= 3) {
            tokenRepository.delete(verificationToken);
            throw new TokenException("Too many invalid attempts");
        }

        verificationToken.setAttempts(verificationToken.getAttempts() + 1);
        tokenRepository.save(verificationToken);

        return verificationToken;
    }

    public void deleteVerificationToken(VerificationToken token) {
        tokenRepository.delete(token);
    }

    private boolean isTokenExpired(VerificationToken token) {
        return token.getExpiryDate().isBefore(LocalDateTime.now());
    }

    public void cleanupExpiredTokens() {
        log.debug("Cleaning up expired tokens");
        List<VerificationToken> expiredTokens = 
            tokenRepository.findAllByExpiryDateBefore(LocalDateTime.now());
        tokenRepository.deleteAll(expiredTokens);
    }
}