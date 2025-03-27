package com.repair.mobile.security.config;

import com.repair.mobile.security.service.JwtAndSignatureHandler;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;

@Service
public class JwtService {

    @Autowired
    private TokenBlacklistService tokenBlacklistService;
    
    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    
    // Default expiration times
    private static final long DEFAULT_EXPIRATION_MS = 2 * 60 * 60 * 1000; // 2 hours
    private static final long EXTENDED_EXPIRATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days (or choose your preferred duration)
    
    @Value("${jwt.secret}")
    private String secretKey;

    public String generateToken(String username) {
        // Default to standard expiration
        return generateToken(username, false);
    }

    public String generateToken(String username, boolean rememberMe) {
        HashMap<String, Object> claims = new HashMap<>();
        
        // Calculate expiration time based on rememberMe flag
        long expirationTime = rememberMe ? EXTENDED_EXPIRATION_MS : DEFAULT_EXPIRATION_MS;
        Date expiration = new Date(System.currentTimeMillis() + expirationTime);
        
        log.info("Generating token for user {} with {}expiration", username, 
                 rememberMe ? "extended " : "standard ");
        
        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(expiration)
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
        
        // Track the token for potential invalidation
        tokenBlacklistService.trackUserToken(username, token);
        
        return token;
    }

    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature for token: {}", token);
            throw new JwtAndSignatureHandler("Invalid JWT signature: " + ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("JWT token has expired: {}", token);
            throw new JwtAndSignatureHandler("JWT token has expired: " + ex.getMessage());
        } catch (JwtException ex) {
            log.error("JWT validation failed: {}", ex.getMessage());
            throw new JwtAndSignatureHandler("JWT validation failed: " + ex.getMessage());
        }
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String userName = extractUserName(token);
        return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token) && !isTokenBlacklisted(token));
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    // For debugging/admin purposes
    public long getTokenRemainingValidityMs(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration.getTime() - System.currentTimeMillis();
        } catch (Exception e) {
            return -1; // Invalid or expired token
        }
    }

    public void invalidateAllTokensForUser(String email) {
        tokenBlacklistService.invalidateTokensForUser(email);
        log.info("Invalidated all tokens for user: {}", email);
    }
    
    public boolean isTokenBlacklisted(String token) {
        return tokenBlacklistService.isBlacklisted(token);
    }
    
    // Method to clean up expired tokens
    public void cleanupExpiredBlacklistedTokens() {
        tokenBlacklistService.cleanupExpiredTokens(this::isTokenExpired);
    }
}