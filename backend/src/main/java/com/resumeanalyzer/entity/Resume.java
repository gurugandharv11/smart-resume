package com.resumeanalyzer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Resume Entity - Maps to the 'resumes' table in MySQL.
 *
 * Stores metadata about uploaded PDF files.
 * The actual file is stored on disk; only the path is saved in DB.
 *
 * Interview Tip:
 * - @ManyToOne means many resumes can belong to one user
 * - @JoinColumn creates a foreign key (user_id) in the resumes table
 * - We store the file path, not the file content, in the database
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "resumes")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Foreign Key relationship: Many resumes belong to one user.
     * @JoinColumn(name = "user_id") creates the 'user_id' column in resumes table.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** The name we generated for the file (unique, with UUID prefix) */
    @Column(nullable = false)
    private String fileName;

    /** The original name of the file as uploaded by the user */
    @Column(nullable = false)
    private String originalFileName;

    /** The full path on disk where the file is stored */
    @Column(nullable = false)
    private String filePath;

    /** Timestamp when the resume was uploaded */
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadDate;

    /**
     * Automatically set upload date before first persistence.
     */
    @PrePersist
    protected void onCreate() {
        this.uploadDate = LocalDateTime.now();
    }
}
