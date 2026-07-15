package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.AnalysisResponse;
import com.resumeanalyzer.entity.Resume;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.util.PdfTextExtractor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AnalysisService - The core analysis engine of the application.
 *
 * Algorithm: Simple Keyword Matching (No AI required!)
 *
 * How it works:
 * 1. Extract text from the uploaded PDF using PDFBox
 * 2. Tokenize both resume text and job description into keywords
 * 3. Find the intersection (matched skills)
 * 4. Find the difference (missing skills — in JD but not in resume)
 * 5. Calculate match score as a percentage
 * 6. Generate suggestions from missing skills
 *
 * This is 100% explainable in a campus placement interview!
 *
 * Interview Tip:
 * Keyword matching is O(n*m) where n = resume keywords, m = JD keywords.
 * For production, you'd use NLP / embeddings, but for this project,
 * simple matching is perfect and easy to explain.
 */
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final ResumeRepository resumeRepository;
    private final PdfTextExtractor pdfTextExtractor;

    /**
     * A curated list of tech skills to look for in resumes and job descriptions.
     * This acts as our "vocabulary" for keyword matching.
     *
     * In a more advanced version, this could be loaded from a database or config file.
     */
    private static final Set<String> TECH_SKILLS = new HashSet<>(Arrays.asList(
        // Programming Languages
        "java", "python", "javascript", "typescript", "c", "c++", "c#", "go", "ruby",
        "php", "swift", "kotlin", "scala", "r", "matlab", "rust", "dart", "perl",

        // Web Frameworks
        "spring", "spring boot", "spring mvc", "spring security", "hibernate",
        "react", "reactjs", "angular", "angularjs", "vue", "vuejs", "nextjs", "nuxtjs",
        "express", "expressjs", "django", "flask", "fastapi", "laravel", "rails",
        "nodejs", "node", "asp.net", "dotnet",

        // Databases
        "mysql", "postgresql", "mongodb", "redis", "oracle", "sqlite", "cassandra",
        "dynamodb", "elasticsearch", "mssql", "mariadb", "firebase", "supabase",

        // Cloud & DevOps
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "jenkins",
        "github actions", "ci/cd", "terraform", "ansible", "linux", "bash",

        // Tools & Technologies
        "git", "github", "gitlab", "bitbucket", "maven", "gradle", "npm", "yarn",
        "webpack", "vite", "jira", "confluence", "postman", "swagger",

        // Concepts
        "rest", "restful", "api", "microservices", "jwt", "oauth", "graphql",
        "html", "css", "tailwind", "bootstrap", "sass", "sql", "nosql",
        "oop", "design patterns", "data structures", "algorithms",

        // Testing
        "junit", "mockito", "selenium", "jest", "cypress", "testng",

        // Data & ML
        "machine learning", "deep learning", "tensorflow", "pytorch", "pandas",
        "numpy", "scikit-learn", "data analysis", "nlp", "computer vision",

        // Mobile
        "android", "ios", "flutter", "react native", "xamarin",

        // Methodologies
        "agile", "scrum", "kanban", "tdd", "bdd"
    ));

    /**
     * Analyze a resume against a job description.
     *
     * @param resumeId         ID of the uploaded resume to analyze
     * @param jobDescription   The job description text pasted by the user
     * @param user             The authenticated user (for ownership check)
     * @return AnalysisResponse with score, matched/missing skills, suggestions
     */
    public AnalysisResponse analyzeResume(Long resumeId, String jobDescription, User user) throws IOException {

        // Step 1: Load the resume from DB (ownership check included)
        Resume resume = resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        // Step 2: Extract text from PDF using PDFBox
        String resumeText = pdfTextExtractor.extractTextFromPath(resume.getFilePath());

        // Step 3-8: Perform common analysis logic
        return performAnalysis(resumeText, jobDescription);
    }

    /**
     * Analyze a resume from a multipart file directly (Public endpoint).
     *
     * @param file             The PDF resume file
     * @param jobDescription   The job description text
     * @return AnalysisResponse with score, matched/missing skills, suggestions
     */
    public AnalysisResponse analyzePublicResume(org.springframework.web.multipart.MultipartFile file, String jobDescription) throws IOException {
        // Step 1 & 2: Extract text from PDF MultipartFile
        String resumeText = pdfTextExtractor.extractText(file);

        // Step 3-8: Perform common analysis logic
        return performAnalysis(resumeText, jobDescription);
    }

    /**
     * Core logic to compare resume text with job description text.
     */
    private AnalysisResponse performAnalysis(String resumeText, String jobDescription) {
        // Step 3: Extract keywords from both texts
        Set<String> resumeKeywords = extractKeywords(resumeText);
        Set<String> jdKeywords = extractKeywords(jobDescription);

        // Step 4: Find matched skills (intersection)
        Set<String> matched = new HashSet<>(jdKeywords);
        matched.retainAll(resumeKeywords); // keeps only skills present in BOTH

        // Step 5: Find missing skills (in JD but NOT in resume)
        Set<String> missing = new HashSet<>(jdKeywords);
        missing.removeAll(resumeKeywords); // removes skills already in resume

        // Step 6: Calculate match score
        int matchScore = 0;
        if (!jdKeywords.isEmpty()) {
            matchScore = (int) Math.round((double) matched.size() / jdKeywords.size() * 100);
        }

        // Step 7: Generate suggestions from missing skills
        List<String> suggestions = generateSuggestions(missing);

        // Step 8: Build and return response
        return AnalysisResponse.builder()
                .matchScore(matchScore)
                .matchedSkills(new ArrayList<>(matched).stream().sorted().collect(Collectors.toList()))
                .missingSkills(new ArrayList<>(missing).stream().sorted().collect(Collectors.toList()))
                .suggestions(suggestions)
                .totalJobKeywords(jdKeywords.size())
                .totalMatched(matched.size())
                .build();
    }

    /**
     * Extract relevant keywords from a block of text.
     *
     * Steps:
     * 1. Convert text to lowercase
     * 2. Split into words/phrases
     * 3. Match against our TECH_SKILLS vocabulary
     *
     * @param text Raw text (from PDF or job description)
     * @return Set of recognized skill keywords found in the text
     */
    private Set<String> extractKeywords(String text) {
        String lowerText = text.toLowerCase();
        Set<String> foundKeywords = new HashSet<>();

        for (String skill : TECH_SKILLS) {
            // Check if the skill appears in the text as a whole word
            // Using word boundaries to avoid false matches (e.g., "go" in "good")
            if (containsSkill(lowerText, skill)) {
                foundKeywords.add(skill);
            }
        }

        return foundKeywords;
    }

    /**
     * Check if a specific skill appears in the text.
     * Uses word boundary checking for single words,
     * and simple contains() for multi-word phrases.
     *
     * @param text  Lowercase text
     * @param skill Skill to search for
     * @return true if the skill is found
     */
    private boolean containsSkill(String text, String skill) {
        if (skill.contains(" ")) {
            // Multi-word skills (e.g., "spring boot", "machine learning")
            return text.contains(skill);
        } else {
            // Single-word skills: check with word boundaries
            // Regex: (^|\\W) matches start of string or non-word character before the skill
            // (\\W|$) matches non-word character or end of string after the skill
            return text.matches("(?s).*(?:^|\\W)" + skill + "(?:\\W|$).*");
        }
    }

    /**
     * Generate human-readable suggestions from missing skills.
     *
     * Example: missing "React" → suggestion "Learn React"
     *          missing "AWS"   → suggestion "Learn AWS Basics"
     *
     * @param missingSkills Set of skills not found in the resume
     * @return List of actionable suggestion strings
     */
    private List<String> generateSuggestions(Set<String> missingSkills) {
        List<String> suggestions = new ArrayList<>();

        for (String skill : missingSkills) {
            String capitalizedSkill = capitalizeWords(skill);

            // Customize suggestions based on skill category
            if (isCloudSkill(skill)) {
                suggestions.add("Learn " + capitalizedSkill + " Basics and get certified");
            } else if (isFrameworkSkill(skill)) {
                suggestions.add("Build a project using " + capitalizedSkill);
            } else if (isDatabaseSkill(skill)) {
                suggestions.add("Practice " + capitalizedSkill + " with real-world queries");
            } else {
                suggestions.add("Learn " + capitalizedSkill + " and add it to your projects");
            }
        }

        // Sort suggestions alphabetically
        Collections.sort(suggestions);
        return suggestions;
    }

    /** Check if a skill is cloud-related */
    private boolean isCloudSkill(String skill) {
        return Arrays.asList("aws", "azure", "gcp", "google cloud", "docker", "kubernetes").contains(skill);
    }

    /** Check if a skill is a framework */
    private boolean isFrameworkSkill(String skill) {
        return Arrays.asList("react", "angular", "vue", "spring boot", "django", "flask", "nodejs").contains(skill);
    }

    /** Check if a skill is a database */
    private boolean isDatabaseSkill(String skill) {
        return Arrays.asList("mysql", "postgresql", "mongodb", "redis", "oracle", "cassandra").contains(skill);
    }

    /** Capitalize the first letter of each word */
    private String capitalizeWords(String text) {
        return Arrays.stream(text.split(" "))
                .map(word -> Character.toUpperCase(word.charAt(0)) + word.substring(1))
                .collect(Collectors.joining(" "));
    }
}
