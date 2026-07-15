package com.resumeanalyzer.repository;

import com.resumeanalyzer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository - Data Access Layer for User entity.
 *
 * By extending JpaRepository, we get all CRUD operations for free:
 * - save()       : Insert or update a user
 * - findById()   : Find user by ID
 * - findAll()    : Get all users
 * - delete()     : Delete a user
 * - count()      : Count users
 *
 * We only add custom query methods that JPA cannot generate automatically.
 *
 * Interview Tip:
 * Spring Data JPA generates SQL from method names!
 * "findByEmail" → SELECT * FROM users WHERE email = ?
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their email address.
     * Used during login and JWT validation.
     * Returns Optional to safely handle the case where user doesn't exist.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user with the given email already exists.
     * Used during registration to prevent duplicate accounts.
     */
    boolean existsByEmail(String email);
}
