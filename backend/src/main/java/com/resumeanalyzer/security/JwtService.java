package com.resumeanalyzer.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JwtService - Handles all JWT operations.
 *
 * Responsibilities:
 * 1. Generate a JWT token for a user after login
 * 2. Validate a JWT token
 * 3. Extract user information (email) from a token
 *
 * JWT Structure: header.payload.signature
 * - Header : algorithm type (HS256)
 * - Payload: claims (email, role, expiry time)
 * - Signature: HMAC-SHA256 of header + payload using secret key
 *
 * Interview Tip:
 * JWT is stateless — the server doesn't store sessions.
 * The token itself contains all the info needed to verify the user.
 */
@Service
public class JwtService {

    /** Secret key from application.properties */
    @Value("${jwt.secret}")
    private String secretKey;

    /** Token expiration time from application.properties */
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // ============================================================
    // Public Methods
    // ============================================================

    /**
     * Generate a JWT token for the given user.
     * The email is used as the "subject" claim.
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generate a token with extra claims (e.g., roles, userId).
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)                          // Add extra claims
                .setSubject(userDetails.getUsername())            // Set subject = email
                .setIssuedAt(new Date(System.currentTimeMillis())) // Issue time = now
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration)) // Expiry
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Sign with secret
                .compact();                                       // Build the token string
    }

    /**
     * Validate a token:
     * 1. Extract the username from token
     * 2. Check if it matches the userDetails
     * 3. Check if the token is not expired
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Extract the username (email) from the JWT token's subject claim.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // ============================================================
    // Private Helper Methods
    // ============================================================

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic claim extractor - takes a function that maps Claims → T.
     */
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parse and verify the token, returning all its claims.
     * Throws an exception if the token is invalid or expired.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Set the signing key for verification
                .build()
                .parseClaimsJws(token)           // Parse and validate
                .getBody();                      // Get the payload (claims)
    }

    /**
     * Build the signing Key from the base64-encoded secret string.
     * HMAC-SHA256 requires a Key object, not a plain string.
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
