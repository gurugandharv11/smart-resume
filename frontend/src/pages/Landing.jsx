import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

const Landing = () => {
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // ---- File Validation & Selection ----
  const validateFile = (file) => {
    if (!file) return 'Please select a file'
    if (!file.name.toLowerCase().endsWith('.pdf')) return 'Only PDF files are allowed'
    if (file.size > 5 * 1024 * 1024) return 'File size must be less than 5MB'
    return null
  }

  const handleFileSelect = (file) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }
    setSelectedFile(file)
    setError('')
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  // ---- Analyze Handler ----
  const handleAnalyze = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!selectedFile) {
      setError('Please select a resume (PDF)')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please paste a job description')
      return
    }
    if (jobDescription.trim().length < 50) {
      setError('Job description is too short. Please provide a more detailed description.')
      return
    }

    setAnalyzing(true)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('jobDescription', jobDescription)

    try {
      const response = await axiosInstance.post('/analyze/public', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setResult(response.data)
    } catch (err) {
      const message = err.response?.data?.message || 'Analysis failed. Please try again.'
      setError(message)
    } finally {
      setAnalyzing(false)
    }
  }

  // ---- Format file size ----
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
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
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
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
    <div className="min-h-screen bg-dark-900 overflow-auto flex flex-col">
      {/* Basic Navbar */}
      <nav className="border-b border-white/5 py-4 px-8 flex justify-between items-center bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"></div>
          <span className="font-bold text-white text-lg tracking-wide">Smart Resume</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Log In</Link>
          <Link to="/register" className="btn-primary py-2 px-5 text-sm">Sign Up</Link>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto p-8 flex flex-col">
        {/* Hero Section */}
        <div className="text-center mb-12 mt-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Match Your Resume to Any Job
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Upload your resume, paste a job description, and get an instant AI-powered analysis highlighting your matched skills and areas for improvement.
          </p>
        </div>

        {/* Public Analyzer Form */}
        <div className="glass-card mb-8 animate-slide-up">
          <form onSubmit={handleAnalyze} className="space-y-6">
            {error && (
              <div className="alert-error">
                <span>{error}</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Col: Upload Dropzone */}
              <div>
                <label className="form-label block mb-2">1. Upload Resume (PDF)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 h-64 flex flex-col items-center justify-center
                    ${isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/20 hover:border-indigo-400/50 hover:bg-white/3'}`}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl"></div>
                      <p className="text-white font-medium truncate max-w-full px-4">{selectedFile.name}</p>
                      <p className="text-white/40 text-sm">{formatSize(selectedFile.size)}</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setError(''); }}
                        className="text-white/30 hover:text-red-400 transition-colors text-sm underline mt-2"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-3">{isDragging ? '' : ''}</div>
                      <p className="text-white/70 font-medium text-sm">
                        {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
                      </p>
                      <p className="text-white/30 text-xs mt-2">or click to browse</p>
                      <p className="text-white/20 text-xs mt-3">PDF only (Max 5MB)</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Right Col: JD Textarea */}
              <div className="flex flex-col">
                <label htmlFor="jobDescription" className="form-label block mb-2">2. Paste Job Description</label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="form-input resize-none flex-1 h-64 bg-dark-900 border-white/10"
                  required
                />
              </div>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={analyzing || !selectedFile || !jobDescription.trim()}
                className="btn-primary py-4 px-10 text-lg w-full md:w-auto"
              >
                {analyzing ? (
                  <>
                    <div className="spinner" />
                    <span>Analyzing Match...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Match</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-slide-up pb-16">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
              <p className="text-white/50 text-sm">Create an account to save these results and track your progress.</p>
            </div>

            {/* Score + Summary */}
            <div className="glass-card">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ScoreCircle score={result.matchScore} />
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
      </main>
    </div>
  )
}

export default Landing
