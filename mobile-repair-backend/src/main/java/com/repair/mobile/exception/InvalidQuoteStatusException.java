package com.repair.mobile.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidQuoteStatusException extends RuntimeException {
    public InvalidQuoteStatusException(String message) {
        super(message);
    }
}
