package com.resumeanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponse DTO - Sent back to the client after successful login/register.
 *
 * Contains the JWT token and basic user info.
 * The frontend stores this token and sends it in every subsequent request
 * in the Authorization header: "Bearer <token>"
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /** JWT token to be stored on the client side */
    private String token;

    /** User's email - useful for displaying in the UI */
    private String email;

    /** User's full name - for display in the dashboard */
    private String fullName;

    /** User's role - can be used for role-based access on frontend */
    private String role;
}
