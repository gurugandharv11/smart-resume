package com.resumeanalyzer.config;

import com.resumeanalyzer.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * SecurityConfig - Configures Spring Security for the application.
 *
 * Key configurations:
 * 1. CORS: Allow requests from React frontend (port 5173)
 * 2. CSRF: Disabled (not needed for stateless REST APIs with JWT)
 * 3. Authorization: Define which endpoints are public vs protected
 * 4. Session: STATELESS (no server-side sessions, JWT handles state)
 * 5. Filter: Add JwtAuthFilter before the default auth filter
 *
 * Interview Tip:
 * - CSRF attacks work by exploiting browser session cookies.
 *   Since we use JWT in headers (not cookies), CSRF is not a threat.
 * - SessionCreationPolicy.STATELESS means no HttpSession is created.
 *   Every request must carry a valid JWT token.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    /**
     * SecurityFilterChain - The main security configuration.
     * Defines the entire security pipeline for HTTP requests.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ---- CORS Configuration ----
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ---- CSRF: Disable for stateless REST API ----
            .csrf(AbstractHttpConfigurer::disable)

            // ---- Authorization Rules ----
            .authorizeHttpRequests(auth -> auth
                // Allow all preflight OPTIONS requests without authentication
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                // Allow error dispatches in Spring Boot 3
                .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR).permitAll()

                // Public endpoints - no token required
                .requestMatchers("/api/auth/**", "/api/analyze/public", "/error", "/error/**").permitAll()

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            // ---- Session Management: Stateless (use JWT, not sessions) ----
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ---- Authentication Provider ----
            .authenticationProvider(authenticationProvider)

            // ---- Add JWT Filter before Spring's default auth filter ----
            // The JWT filter runs before UsernamePasswordAuthenticationFilter
            // so it can set the authentication in SecurityContext first
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS Configuration - Allows the React frontend to call this backend.
     *
     * Without this, browsers block cross-origin requests (frontend on 5173,
     * backend on 8080 — different ports = different origins).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow requests from React dev server and any other origin temporarily for testing
        configuration.setAllowedOriginPatterns(List.of("*"));

        // Allow all common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow all headers (important for Authorization header)
        configuration.setAllowedHeaders(List.of("*"));

        // Allow credentials (cookies, auth headers)
        configuration.setAllowCredentials(true);

        // Apply CORS config to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
