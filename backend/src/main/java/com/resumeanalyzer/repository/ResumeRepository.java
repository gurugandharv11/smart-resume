package com.resumeanalyzer.repository;

import com.resumeanalyzer.entity.Resume;
import com.resumeanalyzer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ResumeRepository - Data Access Layer for Resume entity.
 *
 * Custom queries for fetching resumes by user.
 *
 * Interview Tip:
 * "findByUser" → SELECT * FROM resumes WHERE user_id = ?
 * "findByIdAndUser" → SELECT * FROM resumes WHERE id = ? AND user_id = ?
 * Spring generates these queries automatically from method names!
 */
@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    /**
     * Get all resumes belonging to a specific user.
     * Results are ordered by upload date descending (newest first).
     */
    List<Resume> findByUserOrderByUploadDateDesc(User user);

    /**
     * Find a specific resume by ID, but only if it belongs to the given user.
     * This prevents users from accessing other users' resumes.
     */
    Optional<Resume> findByIdAndUser(Long id, User user);

    /**
     * Count how many resumes a user has uploaded.
     * Used for the dashboard card.
     */
    long countByUser(User user);
}
