package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.AuthResponse;
import com.resumeanalyzer.dto.LoginRequest;
import com.resumeanalyzer.dto.RegisterRequest;
import com.resumeanalyzer.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController - Handles user authentication REST APIs.
 *
 * Endpoints:
 *   POST /api/auth/register - Register a new user
 *   POST /api/auth/login    - Login and get JWT token
 *
 * These endpoints are PUBLIC (no JWT required) — configured in SecurityConfig.
 *
 * Interview Tip:
 * @RestController = @Controller + @ResponseBody
 * Every method automatically serializes the return value to JSON.
 *
 * @RequestMapping("/api/auth") sets the base URL for all endpoints in this controller.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account.
     *
     * Request Body (JSON):
     * {
     *   "fullName": "John Doe",
     *   "email": "john@example.com",
     *   "password": "password123"
     * }
     *
     * @Valid triggers validation annotations on RegisterRequest DTO
     * @ResponseBody – the return value will be serialized to JSON
     * HTTP 201 Created on success
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login with existing credentials and get a JWT token.
     *
     * Request Body (JSON):
     * {
     *   "email": "john@example.com",
     *   "password": "password123"
     * }
     *
     * Response (JSON):
     * {
     *   "token": "eyJhbGciOiJIUzI1NiJ9...",
     *   "email": "john@example.com",
     *   "fullName": "John Doe",
     *   "role": "USER"
     * }
     *
     * HTTP 200 OK on success
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
