package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.AuthResponse;
import com.resumeanalyzer.dto.LoginRequest;
import com.resumeanalyzer.dto.RegisterRequest;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthService - Business logic for user registration and login.
 *
 * The controller just delegates to this service.
 * The service handles:
 * 1. Register: Validate → Save user → Generate JWT
 * 2. Login: Authenticate → Load user → Generate JWT
 *
 * Interview Tip:
 * The @Service layer is where business logic lives.
 * Controllers should be thin — they just route requests to services.
 * Services should not know about HTTP (no HttpServletRequest etc.)
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Register a new user.
     *
     * Steps:
     * 1. Check if email already exists
     * 2. Encode the password with BCrypt
     * 3. Save the new user to the database
     * 4. Generate a JWT token
     * 5. Return token + user info as AuthResponse
     *
     * @param request DTO containing fullName, email, password
     * @return AuthResponse with JWT token and user details
     */
    public AuthResponse register(RegisterRequest request) {

        // Step 1: Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // Step 2 & 3: Build and save the User entity
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash
                .role("USER")
                .build();

        User savedUser = userRepository.save(user);

        // Step 4: Generate JWT token using the saved user
        String jwtToken = jwtService.generateToken(savedUser);

        // Step 5: Return response
        return AuthResponse.builder()
                .token(jwtToken)
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .build();
    }

    /**
     * Login an existing user.
     *
     * Steps:
     * 1. Use AuthenticationManager to verify email + password
     *    (it loads the user by email and checks BCrypt hash)
     * 2. If authentication fails, BadCredentialsException is thrown automatically
     * 3. Load the user from DB to get full details
     * 4. Generate JWT token
     * 5. Return token + user info
     *
     * @param request DTO containing email and password
     * @return AuthResponse with JWT token and user details
     */
    public AuthResponse login(LoginRequest request) {

        // Step 1: Authenticate - throws BadCredentialsException if invalid
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Step 2: Load the full user object from DB
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Step 3: Generate JWT
        String jwtToken = jwtService.generateToken(user);

        // Step 4: Return response
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}
