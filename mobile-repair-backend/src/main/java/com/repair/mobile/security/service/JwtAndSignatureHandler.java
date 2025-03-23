package com.repair.mobile.security.service;

import lombok.Data;

@Data
public class JwtAndSignatureHandler extends RuntimeException {
    public JwtAndSignatureHandler(String message) {
        super(message);
    }
}
