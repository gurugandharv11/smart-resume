
# 📄 Smart Resume Analyzer

A **Full Stack Resume Analyzer** web application built for campus placement interviews.
Analyze your resume against job descriptions using a simple, explainable keyword-matching algorithm.

**Tech Stack:** React + Spring Boot + MySQL + JWT + Apache PDFBox

---

## 🗂️ Project Structure

```
smart resume/
├── backend/          ← Spring Boot (Maven)
│   ├── pom.xml
│   └── src/main/java/com/resumeanalyzer/
│       ├── controller/     AuthController, ResumeController, AnalyzeController
│       ├── service/        AuthService, ResumeService, AnalysisService
│       ├── repository/     UserRepository, ResumeRepository
│       ├── entity/         User, Resume
│       ├── dto/            RegisterRequest, LoginRequest, AuthResponse, ResumeResponse, AnalysisResponse
│       ├── security/       JwtService, JwtAuthFilter
│       ├── config/         ApplicationConfig, SecurityConfig
│       ├── exception/      GlobalExceptionHandler, ResourceNotFoundException
│       └── util/           PdfTextExtractor
│
└── frontend/         ← React + Vite + Tailwind CSS
    └── src/
        ├── pages/    Login, Register, Dashboard, UploadResume, ResumeHistory, Analyze, Profile
        ├── components/ Sidebar, PrivateRoute, DashboardCard
        ├── context/  AuthContext
        └── api/      axiosInstance
```

---

## ⚙️ Prerequisites

Make sure these are installed:

| Tool | Version |
|---|---|
| Java JDK | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

## 🗄️ Database Setup

Open MySQL and run:

```sql
CREATE DATABASE resume_analyzer_db;
```

That's it! Spring Boot will create the tables automatically via `spring.jpa.hibernate.ddl-auto=update`.

---

## 🚀 Running the Backend

### Step 1 — Configure your database password

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 2 — Build & Run

```bash
cd "smart resume/backend"
mvn clean install
mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**

---

## 💻 Running the Frontend

```bash
cd "smart resume/frontend"
npm install
npm run dev
```

Frontend starts at: **http://localhost:5173**

The Vite proxy routes all `/api` calls to `http://localhost:8080`.

---

## 🔐 REST API Reference

### Auth (Public — No Token Required)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{fullName, email, password}` | Register new user |
| POST | `/api/auth/login` | `{email, password}` | Login, returns JWT |

### Resume (Protected — Bearer Token Required)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload PDF (multipart/form-data) |
| GET | `/api/resume/all` | Get all resumes for current user |
| GET | `/api/resume/download/{id}` | Download a resume PDF |
| DELETE | `/api/resume/{id}` | Delete a resume |
| GET | `/api/resume/count` | Count resumes for dashboard |

### Analyze (Protected)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/analyze` | `{resumeId, jobDescription}` | Analyze resume vs JD |

---

## 📊 How the Analysis Works

**No AI. No APIs. 100% explainable!**

```
1. User uploads PDF resume
2. Apache PDFBox extracts raw text from PDF
3. User pastes job description text
4. Both texts are lowercased and scanned for known tech keywords
5. Matched skills = skills in BOTH resume and JD
6. Missing skills = skills in JD but NOT in resume
7. Match Score = (matched / total JD keywords) × 100
8. Suggestions = actionable advice for each missing skill
```

**Example:**

```
Resume keywords:    Java, Spring Boot, MySQL
Job Description:    Java, Spring Boot, React, AWS

Match Score:        50% (2 of 4 matched)
Matched Skills:     Java, Spring Boot
Missing Skills:     React, AWS
Suggestions:        Build a project using React
                    Learn AWS Basics and get certified
```

---

## 🎨 Frontend Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | JWT login form |
| Register | `/register` | Account creation |
| Dashboard | `/dashboard` | Stats + recent resumes |
| Upload Resume | `/upload` | Drag & drop PDF upload |
| Resume History | `/history` | Download / delete resumes |
| Analyze Resume | `/analyze` | Match score + skills gap |
| Profile | `/profile` | User account info |

---

## 🔑 JWT Authentication Flow

```
1. POST /api/auth/login  →  { token: "eyJ..." }
2. Frontend stores token in localStorage
3. Every protected API call includes header:
   Authorization: Bearer eyJ...
4. JwtAuthFilter validates token on every request
5. SecurityContext holds the authenticated user
6. Controllers access user via @AuthenticationPrincipal
```

---

## 📁 Uploaded Files

PDF files are stored locally in: `backend/uploads/`

Format: `{UUID}_{originalFileName}.pdf`

The uploads directory is created automatically if it doesn't exist.

---

## 🏛️ Architecture Overview

```
React Frontend
     ↓ HTTP (Axios + JWT)
Spring Boot REST API
     ↓ Spring Security (JwtAuthFilter)
Controller Layer
     ↓
Service Layer (Business Logic)
     ↓
Repository Layer (Spring Data JPA)
     ↓
MySQL Database
```

---

## ❓ Campus Placement Interview Tips

**Q: Why JWT instead of sessions?**
> JWT is stateless — the server doesn't store session data. Every request carries a self-contained token, making the API scalable.

**Q: Why BCrypt for passwords?**
> BCrypt is a one-way hashing algorithm designed for passwords. It includes a salt automatically and is computationally expensive, making brute-force attacks impractical.

**Q: How does Spring Security know who is logged in?**
> The JwtAuthFilter reads the Authorization header on every request, validates the token, and sets the User in Spring's SecurityContext. Controllers then use @AuthenticationPrincipal to access the user.

**Q: Why DTOs instead of returning entities directly?**
> DTOs (Data Transfer Objects) decouple the API contract from the database schema. They let us control exactly what data is exposed, preventing accidental exposure of sensitive fields like passwords or internal IDs.

**Q: How does the keyword matching work?**
> We maintain a curated list of ~100 tech skills. Both the resume text and job description are converted to lowercase and scanned for these skills. The intersection gives matched skills, the difference gives missing skills, and the ratio gives the match score.

---

*Built with ❤️ — Spring Boot + React + MySQL*
# smart-resume
AI-powered Smart Resume Analyzer built with React and Spring Boot.
441dc13099724fbe6770bd6fb5f24beee0ba4952
