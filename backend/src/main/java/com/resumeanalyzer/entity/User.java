package com.resumeanalyzer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * User Entity - Maps to the 'users' table in MySQL.
 *
 * We implement UserDetails so Spring Security can use this class
 * directly for authentication. This avoids creating a separate
 * UserDetailsService wrapper object.
 *
 * Interview Tip:
 * - @Entity tells JPA this is a database table
 * - @Table specifies the exact table name
 * - UserDetails is required by Spring Security to manage authentication
 */
@Data                   // Lombok: generates getters, setters, equals, hashCode, toString
@Builder                // Lombok: provides builder pattern for object creation
@NoArgsConstructor      // Lombok: generates no-args constructor (required by JPA)
@AllArgsConstructor     // Lombok: generates all-args constructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT in MySQL
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // stored as BCrypt hash, never plain text

    @Column(nullable = false)
    private String role; // e.g., "USER" or "ADMIN"

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Set createdAt automatically before first save.
     * @PrePersist runs before the entity is inserted into the database.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ============================================================
    // UserDetails methods - required by Spring Security
    // ============================================================

    /**
     * Returns the authorities (roles) granted to the user.
     * We return a single authority based on the role field.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    /**
     * Spring Security uses getUsername() as the unique identifier.
     * We use email as the username.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /** Account is never expired in this simple app */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /** Account is never locked in this simple app */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /** Credentials never expire in this simple app */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /** Account is always enabled */
    @Override
    public boolean isEnabled() {
        return true;
    }
}
