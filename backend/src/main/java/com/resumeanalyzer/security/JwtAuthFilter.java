package com.resumeanalyzer.security;

import com.resumeanalyzer.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthFilter - A custom Spring Security filter that runs on every request.
 *
 * What it does:
 * 1. Reads the "Authorization" header from the HTTP request
 * 2. Extracts the JWT token (removes "Bearer " prefix)
 * 3. Validates the token using JwtService
 * 4. If valid, sets the user in Spring Security's SecurityContext
 *    so that @PreAuthorize and authentication checks work correctly
 *
 * Interview Tip:
 * OncePerRequestFilter guarantees this filter runs exactly once per request,
 * even if the request is forwarded internally.
 * SecurityContext is Spring's way of storing "who is the current user?"
 *
 * Filter Chain Flow:
 * Request → JwtAuthFilter → SecurityConfig → Controller
 */
@Component
@RequiredArgsConstructor // Lombok: generates constructor for final fields
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Step 1: Read the Authorization header
        final String authHeader = request.getHeader("Authorization");

        // If there's no Authorization header or it doesn't start with "Bearer ", skip this filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // pass to next filter
            return;
        }

        // Step 2: Extract the token by removing "Bearer " prefix (7 characters)
        final String jwt = authHeader.substring(7);

        try {
            // Step 3: Extract username (email) from the token
            final String userEmail = jwtService.extractUsername(jwt);

            // Step 4: If we have a username and the user is NOT already authenticated
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Load user from database
                UserDetails userDetails = userRepository.findByEmail(userEmail)
                        .orElse(null);

                if (userDetails != null && jwtService.isTokenValid(jwt, userDetails)) {
                    // Create an authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // credentials (not needed after authentication)
                            userDetails.getAuthorities()
                    );

                    // Attach request details (IP address, session ID etc.)
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Step 5: Set the authentication in SecurityContext
                    // This tells Spring Security: "This user is authenticated"
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // If JWT parsing fails (expired, signature mismatch, malformed), do not block the request.
            // Spring Security will block unauthorized access to protected endpoints, but allow public ones.
            logger.warn("JWT authentication failed: " + e.getMessage());
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}
