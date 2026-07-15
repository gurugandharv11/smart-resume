package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.ResumeResponse;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * ResumeController - REST API controller for resume management.
 *
 * All endpoints are PROTECTED (require valid JWT token).
 *
 * Endpoints:
 *   POST   /api/resume/upload       - Upload a PDF resume
 *   GET    /api/resume/all          - Get all resumes for logged-in user
 *   DELETE /api/resume/{id}         - Delete a resume by ID
 *   GET    /api/resume/download/{id} - Download a resume PDF
 *
 * @AuthenticationPrincipal User user
 *   → Spring Security injects the currently authenticated User object
 *   from the SecurityContext (set by JwtAuthFilter).
 *
 * Interview Tip:
 * @AuthenticationPrincipal is the recommended way to get the current user
 * in Spring Security. It avoids calling SecurityContextHolder manually.
 */
@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    /**
     * Upload a PDF resume.
     *
     * Uses multipart/form-data (not JSON) because we're uploading a binary file.
     * The 'file' parameter must match the name in the form data.
     *
     * @param file The PDF file from multipart form data
     * @param user The currently authenticated user (injected by Spring Security)
     * @return ResumeResponse with file metadata, HTTP 201 Created
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {

        ResumeResponse response = resumeService.uploadResume(file, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all resumes for the authenticated user.
     *
     * @param user The currently authenticated user
     * @return List of ResumeResponse DTOs, HTTP 200 OK
     */
    @GetMapping("/all")
    public ResponseEntity<List<ResumeResponse>> getAllResumes(@AuthenticationPrincipal User user) {
        List<ResumeResponse> resumes = resumeService.getAllResumes(user);
        return ResponseEntity.ok(resumes);
    }

    /**
     * Download a specific resume PDF.
     *
     * Returns the file as a binary stream with proper headers so the browser
     * knows it's a PDF and triggers a download.
     *
     * @param id   Resume ID from the URL path
     * @param user The currently authenticated user
     * @return Binary PDF data as a Resource
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadResume(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) throws IOException {

        Resource resource = resumeService.downloadResume(id, user);
        String originalFileName = resumeService.getOriginalFileName(id, user);

        return ResponseEntity.ok()
                // Tell the browser this is a PDF
                .contentType(MediaType.APPLICATION_PDF)
                // attachment; filename = triggers a file download
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + originalFileName + "\"")
                .body(resource);
    }

    /**
     * Delete a resume by ID.
     * Deletes both the file from disk and the database record.
     *
     * @param id   Resume ID from the URL path
     * @param user The currently authenticated user
     * @return Success message, HTTP 200 OK
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteResume(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        resumeService.deleteResume(id, user);
        return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
    }

    /**
     * Get the count of resumes for the dashboard.
     *
     * @param user The currently authenticated user
     * @return Total resume count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getResumeCount(@AuthenticationPrincipal User user) {
        long count = resumeService.getResumeCount(user);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
