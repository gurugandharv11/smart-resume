package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.ResumeResponse;
import com.resumeanalyzer.entity.Resume;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ResumeService - Business logic for file upload, retrieval, download, and deletion.
 *
 * File Storage Strategy:
 * - Files are saved to a local directory (configured in application.properties)
 * - A unique filename is generated using UUID to prevent collisions
 * - Only metadata (filename, path) is saved in the database
 *
 * Interview Tip:
 * Always validate file type before saving.
 * Never trust the content-type header alone — check the file extension too.
 * UUID ensures unique filenames even if the same file is uploaded multiple times.
 */
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;

    /** Upload directory path from application.properties */
    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * Upload a resume PDF file.
     *
     * Steps:
     * 1. Validate that the file is a PDF
     * 2. Create the upload directory if it doesn't exist
     * 3. Generate a unique filename using UUID
     * 4. Save the file to disk
     * 5. Save metadata to the database
     * 6. Return the response DTO
     *
     * @param file The uploaded PDF file
     * @param user The currently authenticated user
     * @return ResumeResponse with file metadata
     */
    public ResumeResponse uploadResume(MultipartFile file, User user) throws IOException {

        // Step 1: Validate file is a PDF
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file to upload.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed.");
        }

        // Step 2: Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath); // creates the directory and all parent dirs

        // Step 3: Generate unique filename (UUID + original extension)
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFilename;

        // Step 4: Save file to disk
        Path targetLocation = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Step 5: Save metadata to database
        Resume resume = Resume.builder()
                .user(user)
                .fileName(uniqueFileName)
                .originalFileName(originalFilename)
                .filePath(targetLocation.toString())
                .build();

        Resume savedResume = resumeRepository.save(resume);

        // Step 6: Return DTO
        return mapToResponse(savedResume);
    }

    /**
     * Get all resumes for the authenticated user.
     * Results are ordered by upload date descending (newest first).
     *
     * @param user The currently authenticated user
     * @return List of ResumeResponse DTOs
     */
    public List<ResumeResponse> getAllResumes(User user) {
        return resumeRepository.findByUserOrderByUploadDateDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Download a resume by ID.
     * Only the owner of the resume can download it (security check).
     *
     * @param id   Resume ID
     * @param user The currently authenticated user
     * @return Spring Resource object (used to stream file to client)
     */
    public Resource downloadResume(Long id, User user) throws MalformedURLException {

        // Find resume, ensure it belongs to the requesting user
        Resume resume = resumeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

        Path filePath = Paths.get(resume.getFilePath()).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new ResourceNotFoundException("File not found on server: " + resume.getFileName());
        }

        return resource;
    }

    /**
     * Get the original filename of a resume (for the Content-Disposition header).
     *
     * @param id   Resume ID
     * @param user The currently authenticated user
     * @return The original filename
     */
    public String getOriginalFileName(Long id, User user) {
        Resume resume = resumeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));
        return resume.getOriginalFileName();
    }

    /**
     * Delete a resume by ID.
     * Only the owner can delete their resume.
     * Deletes both the file from disk AND the database record.
     *
     * @param id   Resume ID
     * @param user The currently authenticated user
     */
    public void deleteResume(Long id, User user) {
        Resume resume = resumeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

        // Delete the physical file from disk
        try {
            Path filePath = Paths.get(resume.getFilePath()).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log the error but don't fail the request — still remove from DB
            System.err.println("Warning: Could not delete file from disk: " + e.getMessage());
        }

        // Delete the database record
        resumeRepository.delete(resume);
    }

    /**
     * Count the total number of resumes for a user.
     * Used for the dashboard card.
     *
     * @param user The currently authenticated user
     * @return Total count of uploaded resumes
     */
    public long getResumeCount(User user) {
        return resumeRepository.countByUser(user);
    }

    /**
     * Convert a Resume entity to a ResumeResponse DTO.
     * Private helper method.
     */
    private ResumeResponse mapToResponse(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .originalFileName(resume.getOriginalFileName())
                .uploadDate(resume.getUploadDate())
                .uploadedBy(resume.getUser().getFullName())
                .build();
    }
}
