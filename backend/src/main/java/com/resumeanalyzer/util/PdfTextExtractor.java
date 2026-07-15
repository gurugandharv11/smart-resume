package com.resumeanalyzer.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

/**
 * PdfTextExtractor - Utility class for extracting plain text from PDF files.
 *
 * Uses Apache PDFBox — a pure Java library for reading PDF files.
 * No AI, no cloud services — completely offline and explainable!
 *
 * How PDFBox works:
 * 1. Loads the PDF file as a PDDocument object
 * 2. PDFTextStripper traverses all pages and collects text
 * 3. Returns the raw text string
 *
 * Interview Tip:
 * This is a great example of the Utility pattern in Spring Boot.
 * @Component makes it a Spring bean so it can be injected with @Autowired.
 * Utility classes should have no state (no instance variables).
 */
@Component
public class PdfTextExtractor {

    /**
     * Extract all text from a PDF file uploaded via multipart request.
     *
     * @param file The uploaded MultipartFile (PDF only)
     * @return Extracted text as a single string
     * @throws IOException if the file cannot be read or is not a valid PDF
     */
    public String extractText(MultipartFile file) throws IOException {
        // Open the file as an InputStream (memory-efficient)
        try (InputStream inputStream = file.getInputStream();
             PDDocument document = PDDocument.load(inputStream)) {

            // PDFTextStripper extracts all text from all pages
            PDFTextStripper stripper = new PDFTextStripper();

            // Extract and return the text
            return stripper.getText(document);
        }
    }

    /**
     * Extract text from a PDF file on disk (by file path).
     *
     * @param filePath Absolute path to the PDF file
     * @return Extracted text as a single string
     * @throws IOException if the file cannot be read
     */
    public String extractTextFromPath(String filePath) throws IOException {
        java.io.File file = new java.io.File(filePath);
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }
}
