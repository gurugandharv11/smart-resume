package com.resumeanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ResumeResponse DTO - Sent to the client when returning resume data.
 *
 * We never send the entity directly — that would expose internal details
 * like file paths and JPA associations. DTOs give us control over
 * what data we expose.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {

    private Long id;
    private String fileName;
    private String originalFileName;
    private LocalDateTime uploadDate;

    /**
     * We expose the uploader's name instead of the full User entity.
     * This is a good example of why DTOs are important.
     */
    private String uploadedBy;
}
