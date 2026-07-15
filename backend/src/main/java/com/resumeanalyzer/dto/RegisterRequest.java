package com.resumeanalyzer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * RegisterRequest DTO - Data Transfer Object for user registration.
 *
 * DTOs are used to receive data from the client (request body).
 * We use @Valid + validation annotations to validate input before processing.
 *
 * Interview Tip:
 * DTOs decouple the API layer from the database layer.
 * We never expose entity classes directly in request/response bodies.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
