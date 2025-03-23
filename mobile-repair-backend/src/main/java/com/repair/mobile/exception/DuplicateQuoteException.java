package com.repair.mobile.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateQuoteException extends RuntimeException {
    public DuplicateQuoteException(String message) {
        super(message);
    }
}
