import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import axiosInstance from '../api/axiosInstance'

/**
 * UploadResume Page - Allows users to upload a PDF resume.
 *
 * Features:
 * - Drag & drop file area
 * - File type validation (PDF only)
 * - File size validation (max 5MB)
 * - Upload progress feedback
 * - Success redirect to history page
 */
const UploadResume = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ---- File Validation ----
  const validateFile = (file) => {
    if (!file) return 'Please select a file'
    if (!file.name.toLowerCase().endsWith('.pdf')) return 'Only PDF files are allowed'
    if (file.size > 5 * 1024 * 1024) return 'File size must be less than 5MB'
    return null
  }

  // ---- File Selection Handlers ----
  const handleFileSelect = (file) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }
    setSelectedFile(file)
    setError('')
    setSuccess('')
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFileSelect(file)
  }

  // ---- Drag & Drop Handlers ----
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

  // ---- Upload Handler ----
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first')
      return
    }

    setUploading(true)
    setError('')

    // FormData is used for multipart/form-data (file uploads)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      await axiosInstance.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Override JSON content type
        },
      })

      setSuccess('Resume uploaded successfully!')
      setSelectedFile(null)

      // Navigate to history after 1.5 seconds
      setTimeout(() => navigate('/history'), 1500)
    } catch (err) {
      const message = err.response?.data?.message || 'Upload failed. Please try again.'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  // ---- Format file size ----
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h2 className="section-title">Upload Resume</h2>
          <p className="text-white/40 mt-1">Upload your PDF resume to get started with analysis</p>
        </div>

        <div className="max-w-2xl">

          {/* Alert messages */}
          {error && (
            <div className="alert-error mb-4 animate-slide-up">
              
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert-success mb-4 animate-slide-up">
              
              <span>{success}</span>
            </div>
          )}

          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-300
              ${isDragging
                ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                : 'border-white/20 hover:border-indigo-400/50 hover:bg-white/3'
              }
            `}
          >
            <div className="text-6xl mb-4 animate-bounce">
              {isDragging ? '' : ''}
            </div>
            <p className="text-white/70 font-medium text-lg">
              {isDragging ? 'Drop your resume here!' : 'Drag & drop your resume here'}
            </p>
            <p className="text-white/30 text-sm mt-2">or click to browse files</p>
            <p className="text-white/20 text-xs mt-4">PDF only • Max 5MB</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleInputChange}
              className="hidden"
              id="resumeFileInput"
            />
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="glass-card mt-4 animate-slide-up">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{selectedFile.name}</p>
                  <p className="text-white/40 text-sm">{formatSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={() => { setSelectedFile(null); setError('') }}
                  className="text-white/30 hover:text-red-400 transition-colors text-xl p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-primary w-full mt-6"
          >
            {uploading ? (
              <>
                <div className="spinner" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                
                <span>Upload Resume</span>
              </>
            )}
          </button>

          {/* Info card */}
          <div className="glass-card mt-6">
            <h4 className="text-white/70 font-semibold mb-3 flex items-center gap-2">
               Tips for best analysis results
            </h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                Use a text-based PDF (not a scanned image)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                Include your technical skills section clearly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                Mention technologies by name (e.g., "Spring Boot", "React")
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                Keep file size under 5MB
              </li>
            </ul>
          </div>

        </div>
      </main>
    </div>
  )
}

export default UploadResume
