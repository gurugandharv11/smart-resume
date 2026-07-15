import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import axiosInstance from '../api/axiosInstance'

/**
 * Analyze Page - Core feature: analyze resume vs job description.
 *
 * Flow:
 * 1. User selects a previously uploaded resume from dropdown
 * 2. User pastes a job description
 * 3. POST /api/analyze → backend extracts PDF text + runs keyword matching
 * 4. Display results:
 *    - Match Score (with animated circle)
 *    - Matched Skills (green tags)
 *    - Missing Skills (red tags)
 *    - Suggestions (blue list)
 */
const Analyze = () => {
  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loadingResumes, setLoadingResumes] = useState(true)

  // Load user's resumes for the dropdown
  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const response = await axiosInstance.get('/resume/all')
      setResumes(response.data)
    } catch (err) {
      setError('Failed to load resumes.')
    } finally {
      setLoadingResumes(false)
    }
  }

  // ---- Analyze Handler ----
  const handleAnalyze = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!selectedResumeId) {
      setError('Please select a resume')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please paste a job description')
      return
    }
    if (jobDescription.trim().length < 50) {
      setError('Job description is too short. Please paste a more detailed description.')
      return
    }

    setAnalyzing(true)

    try {
      const response = await axiosInstance.post('/analyze', {
        resumeId: selectedResumeId,
        jobDescription: jobDescription,
      })

      const analysisResult = response.data
      setResult(analysisResult)

      // Save to localStorage for dashboard stats
      localStorage.setItem('lastAnalysisScore', analysisResult.matchScore.toString())
      const prevCount = parseInt(localStorage.getItem('analysisCount') || '0')
      localStorage.setItem('analysisCount', (prevCount + 1).toString())
    } catch (err) {
      const message = err.response?.data?.message || 'Analysis failed. Please try again.'
      setError(message)
    } finally {
      setAnalyzing(false)
    }
  }

  // ---- Score color & label ----
  const getScoreInfo = (score) => {
    if (score >= 75) return { color: 'text-emerald-400', ring: '#10b981', label: 'Excellent Match!' }
    if (score >= 50) return { color: 'text-amber-400', ring: '#f59e0b', label: 'Good Match' }
    if (score >= 25) return { color: 'text-orange-400', ring: '#f97316', label: 'Needs Improvement' }
    return { color: 'text-red-400', ring: '#ef4444', label: 'Poor Match' }
  }

  // ---- SVG Circle Score ----
  const ScoreCircle = ({ score }) => {
    const info = getScoreInfo(score)
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            {/* Score ring */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={info.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="score-ring transition-all duration-1000"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${info.color}`}>{score}%</span>
            <span className="text-white/30 text-xs">match</span>
          </div>
        </div>
        <p className={`font-semibold mt-2 ${info.color}`}>{info.label}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h2 className="section-title">Analyze Resume</h2>
          <p className="text-white/40 mt-1">Match your resume against a job description</p>
        </div>

        <div className="max-w-4xl">

          {/* ---- Input Form ---- */}
          <div className="glass-card mb-6 animate-slide-up">
            <form onSubmit={handleAnalyze} className="space-y-6">

              {error && (
                <div className="alert-error">
                  <span>{error}</span>
                </div>
              )}

              {/* Resume Selector */}
              <div>
                <label htmlFor="resumeSelect" className="form-label">Select Resume</label>
                {loadingResumes ? (
                  <div className="form-input flex items-center gap-2 text-white/40">
                    <div className="spinner w-4 h-4" />
                    <span>Loading resumes...</span>
                  </div>
                ) : (
                  <select
                    id="resumeSelect"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="" className="bg-dark-800">-- Select a resume --</option>
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id} className="bg-dark-800">
                        {resume.originalFileName}
                      </option>
                    ))}
                  </select>
                )}
                {resumes.length === 0 && !loadingResumes && (
                  <p className="text-amber-400/70 text-xs mt-2">
                     No resumes found.{' '}
                    <a href="/upload" className="underline hover:text-amber-300">Upload one first.</a>
                  </p>
                )}
              </div>

              {/* Job Description */}
              <div>
                <label htmlFor="jobDescription" className="form-label">
                  Paste Job Description
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here...&#10;&#10;Example:&#10;We are looking for a Java Developer with experience in Spring Boot, React, MySQL, and AWS. The candidate should know REST APIs, JPA, and Git."
                  rows={8}
                  className="form-input resize-none"
                  required
                />
                <p className="text-white/25 text-xs mt-1">
                  {jobDescription.trim().length} characters
                </p>
              </div>

              {/* Analyze Button */}
              <button
                type="submit"
                disabled={analyzing || !selectedResumeId || !jobDescription.trim()}
                className="btn-primary"
              >
                {analyzing ? (
                  <>
                    <div className="spinner" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    
                    <span>Analyze Resume</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ---- Analysis Results ---- */}
          {result && (
            <div className="space-y-6 animate-slide-up">

              {/* Score + Summary */}
              <div className="glass-card">
                <div className="flex flex-col md:flex-row items-center gap-8">

                  {/* Score Circle */}
                  <ScoreCircle score={result.matchScore} />

                  {/* Summary stats */}
                  <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-indigo-400">{result.totalJobKeywords}</p>
                      <p className="text-xs text-white/40 mt-1">Job Keywords</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-400">{result.totalMatched}</p>
                      <p className="text-xs text-white/40 mt-1">Matched</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-red-400">{result.missingSkills?.length || 0}</p>
                      <p className="text-xs text-white/40 mt-1">Missing Skills</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-purple-400">{result.suggestions?.length || 0}</p>
                      <p className="text-xs text-white/40 mt-1">Suggestions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched Skills */}
              {result.matchedSkills?.length > 0 && (
                <div className="glass-card">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                     Matching Skills
                    <span className="badge-success ml-2">{result.matchedSkills.length}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedSkills.map((skill) => (
                      <span key={skill} className="skill-tag-matched capitalize">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {result.missingSkills?.length > 0 && (
                <div className="glass-card">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                     Missing Skills
                    <span className="badge-danger ml-2">{result.missingSkills.length}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill) => (
                      <span key={skill} className="skill-tag-missing capitalize">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="glass-card">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                     Suggestions to Improve Your Resume
                  </h3>
                  <ul className="space-y-3">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30
                                         flex items-center justify-center text-xs text-indigo-400 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-white/70 text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Perfect match case */}
              {result.missingSkills?.length === 0 && result.matchedSkills?.length > 0 && (
                <div className="glass-card text-center py-8">
                  
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Perfect Match!</h3>
                  <p className="text-white/50">Your resume matches all the skills in this job description.</p>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Analyze
