package com.repair.mobile.validator;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class EmailValidator {
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@(.+)$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);
    
    // List of disposable email domains
    private static final String[] DISPOSABLE_DOMAINS = {
        "tempmail.com", "throwawaymail.com"
        // Add more as needed
    };

    public boolean isValid(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        // Check basic format
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return false;
        }

        // Check length
        if (email.length() > 254) {
            return false;
        }

        // Check for disposable email domains
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        for (String disposableDomain : DISPOSABLE_DOMAINS) {
            if (domain.equals(disposableDomain)) {
                return false;
            }
        }

        // Check local part length
        String localPart = email.substring(0, email.indexOf('@'));
        if (localPart.length() > 64) {
            return false;
        }

        // Check domain length
        if (domain.length() > 255) {
            return false;
        }

        return true;
    }
}