package com.repair.mobile.security.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

@Service
public class TokenBlacklistService {
    private static final Logger log = LoggerFactory.getLogger(TokenBlacklistService.class);
    
    // Use a Redis store or in-memory cache for production
    private final Set<String> blacklistedTokens = new ConcurrentHashMap<String, Boolean>().newKeySet();
    private final Map<String, Set<String>> userTokensMap = new ConcurrentHashMap<>();
    
    // Remove the JwtService dependency to break the circular reference
    
    public void invalidateTokensForUser(String email) {
        // Get all tokens associated with this user
        Set<String> userTokens = userTokensMap.getOrDefault(email, Collections.emptySet());
        
        // Add all tokens to blacklist
        blacklistedTokens.addAll(userTokens);
        
        // Clear user's tokens from mapping
        userTokensMap.remove(email);
        
        log.info("All tokens for user {} have been invalidated", email);
    }
    
    // Method to track token when generated
    public void trackUserToken(String email, String token) {
        new ConcurrentHashMap<String, Boolean>();
        userTokensMap.computeIfAbsent(email, k -> ConcurrentHashMap.newKeySet())
                     .add(token);
        log.debug("Token for user {} has been tracked", email);
    }
    
    // Method to check if a token is blacklisted
    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
    
    // Simplified cleanup method without JwtService dependency
    public void cleanupExpiredTokens(Function<String, Boolean> expirationChecker) {
        Iterator<String> iterator = blacklistedTokens.iterator();
        int removedCount = 0;
        
        while (iterator.hasNext()) {
            String token = iterator.next();
            try {
                if (expirationChecker.apply(token)) {
                    iterator.remove();
                    removedCount++;
                }
            } catch (Exception e) {
                // If we can't parse the token, it's likely invalid, so remove it
                iterator.remove();
                removedCount++;
                log.warn("Removed invalid token from blacklist during cleanup");
            }
        }
        
        log.info("Expired tokens cleanup completed: removed {} tokens", removedCount);
    }
}