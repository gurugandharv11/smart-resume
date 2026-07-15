package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.AnalysisResponse;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

/**
 * AnalyzeController - REST API for resume analysis.
 *
 * Endpoint:
 *   POST /api/analyze - Analyze a resume against a job description
 *
 * The client sends:
 *   - resumeId     : ID of the already-uploaded resume
 *   - jobDescription : The full text of the job description
 *
 * The server responds with:
 *   - matchScore    : 0-100%
 *   - matchedSkills : Skills found in both
 *   - missingSkills : Skills in JD but not in resume
 *   - suggestions   : What to learn
 *
 * Interview Tip:
 * We receive the request body as a Map<String, String> for simplicity.
 * In a production app, we'd create a dedicated AnalysisRequest DTO with validation.
 */
@RestController
@RequestMapping("/api/analyze")
@RequiredArgsConstructor
public class AnalyzeController {

    private final AnalysisService analysisService;

    /**
     * Analyze a resume against a job description.
     *
     * Request Body (JSON):
     * {
     *   "resumeId": "1",
     *   "jobDescription": "We are looking for a Java developer with Spring Boot, React, AWS..."
     * }
     *
     * Response (JSON):
     * {
     *   "matchScore": 75,
     *   "matchedSkills": ["java", "spring boot", "mysql"],
     *   "missingSkills": ["react", "aws"],
     *   "suggestions": ["Build a project using React", "Learn AWS Basics and get certified"],
     *   "totalJobKeywords": 8,
     *   "totalMatched": 6
     * }
     *
     * @param requestBody Map with "resumeId" and "jobDescription" keys
     * @param user        The currently authenticated user
     * @return AnalysisResponse with full analysis results
     */
    @PostMapping
    public ResponseEntity<AnalysisResponse> analyzeResume(
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal User user) throws IOException {

        // Extract values from request body
        String resumeIdStr = requestBody.get("resumeId");
        String jobDescription = requestBody.get("jobDescription");

        // Basic validation
        if (resumeIdStr == null || resumeIdStr.isBlank()) {
            throw new IllegalArgumentException("resumeId is required");
        }
        if (jobDescription == null || jobDescription.isBlank()) {
            throw new IllegalArgumentException("jobDescription is required");
        }

        Long resumeId = Long.parseLong(resumeIdStr);

        // Delegate to service for analysis
        AnalysisResponse response = analysisService.analyzeResume(resumeId, jobDescription, user);

        return ResponseEntity.ok(response);
    }

    /**
     * Public endpoint to analyze a resume without logging in.
     * Takes a multipart file and a job description string.
     */
    @PostMapping(value = "/public", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnalysisResponse> analyzePublicResume(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("jobDescription") String jobDescription) throws IOException {

        // Basic validation
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Resume file is required");
        }
        if (jobDescription == null || jobDescription.isBlank()) {
            throw new IllegalArgumentException("jobDescription is required");
        }

        AnalysisResponse response = analysisService.analyzePublicResume(file, jobDescription);
        return ResponseEntity.ok(response);
    }
}
