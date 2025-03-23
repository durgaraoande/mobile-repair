package com.repair.mobile.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidRequestStatusException extends RuntimeException {
    public InvalidRequestStatusException(String message) {
        super(message);
    }
}
