package com.repair.mobile.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import com.repair.mobile.security.config.JwtService;

@Configuration
@EnableScheduling
public class TokenCleanupScheduler {
    private static final Logger log = LoggerFactory.getLogger(TokenCleanupScheduler.class);
    
    @Autowired
    private JwtService jwtService;
    
    // Run cleanup every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduledCleanup() {
        log.info("Starting scheduled blacklisted token cleanup");
        jwtService.cleanupExpiredBlacklistedTokens();
    }
}