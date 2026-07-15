package com.resumeanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AnalysisResponse DTO - The result of comparing resume with job description.
 *
 * This is what gets returned from POST /api/analyze.
 *
 * Fields:
 * - matchScore    : Percentage match between resume and JD keywords (0-100)
 * - matchedSkills : Skills found in both resume and JD
 * - missingSkills : Skills in JD but NOT in resume
 * - suggestions   : Actionable advice for the user
 *
 * Interview Tip:
 * The analysis is done using simple keyword matching — no AI needed!
 * This makes the app explainable and beginner-friendly.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponse {

    /** Match percentage from 0 to 100 */
    private int matchScore;

    /** Skills that appear in both the resume and the job description */
    private List<String> matchedSkills;

    /** Skills required by the job but missing from the resume */
    private List<String> missingSkills;

    /** Suggestions generated from missing skills */
    private List<String> suggestions;

    /** Total keywords found in the job description */
    private int totalJobKeywords;

    /** Total keywords matched */
    private int totalMatched;
}
