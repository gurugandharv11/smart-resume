package com.resumeanalyzer.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * ResourceNotFoundException - Thrown when a requested resource is not found in the database.
 *
 * Example usage:
 *   throw new ResourceNotFoundException("Resume not found with id: " + id);
 *
 * The @ResponseStatus annotation tells Spring to return HTTP 404 when this exception is thrown.
 * But since we have GlobalExceptionHandler, the handler takes priority.
 *
 * Interview Tip:
 * Custom exceptions make your code more readable and meaningful.
 * Instead of returning null, we throw a specific exception with a clear message.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    /**
     * @param message - A descriptive message about what was not found
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
