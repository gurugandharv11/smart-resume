package com.resumeanalyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Resume Analyzer Spring Boot application.
 *
 * @SpringBootApplication is a shortcut for:
 *   - @Configuration       : Marks this as a configuration class
 *   - @EnableAutoConfiguration : Auto-configures Spring beans
 *   - @ComponentScan       : Scans for components in this package and sub-packages
 *
 * Interview Tip: Spring Boot auto-configuration reads your dependencies
 * (like Spring Security, JPA) and configures them automatically.
 */
@SpringBootApplication
public class ResumeAnalyzerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResumeAnalyzerApplication.class, args);
        System.out.println("==============================================");
        System.out.println("  Resume Analyzer Backend Started!");
        System.out.println("  URL: http://localhost:8080");
        System.out.println("==============================================");
    }
}
