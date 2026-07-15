package com.resumeanalyzer.config;

import com.resumeanalyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * ApplicationConfig - Defines core Spring beans for authentication.
 *
 * Beans defined here:
 * 1. UserDetailsService : Loads user from DB by username (email)
 * 2. PasswordEncoder    : BCrypt for hashing passwords
 * 3. AuthenticationProvider : Connects UserDetailsService + PasswordEncoder
 * 4. AuthenticationManager : Used by AuthService to authenticate login requests
 *
 * Interview Tip:
 * BCrypt is a one-way hashing algorithm — you cannot reverse a BCrypt hash.
 * To verify a password, BCrypt re-hashes the input and compares it.
 *
 * @Configuration means Spring creates these beans at startup.
 * @Bean means the method return value is registered as a Spring bean.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    /**
     * UserDetailsService - Spring Security calls this to load the user by username.
     * We use email as the username in this application.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    /**
     * AuthenticationProvider - Combines UserDetailsService and PasswordEncoder.
     * DaoAuthenticationProvider is the standard implementation for DB-based auth.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService()); // tell it how to load users
        authProvider.setPasswordEncoder(passwordEncoder());        // tell it how to verify passwords
        return authProvider;
    }

    /**
     * AuthenticationManager - The main entry point for authentication.
     * Used in AuthService when we call authenticate(email, password).
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * PasswordEncoder - BCrypt with default strength (10 rounds).
     * All passwords are stored as BCrypt hashes in the database.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
