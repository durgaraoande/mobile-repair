package com.repair.mobile.security.service;

import lombok.Data;

@Data
public class SecretKeyGeneratingException extends RuntimeException {
    public SecretKeyGeneratingException(String message) {
        super(message);
    }
}
