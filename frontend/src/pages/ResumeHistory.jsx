import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import axiosInstance from '../api/axiosInstance'

/**
 * ResumeHistory Page - Shows all uploaded resumes for the logged-in user.
 *
 * Features:
 * - List all resumes in a table/card layout
 * - Download a resume (PDF)
 * - Delete a resume (with confirmation)
 * - Empty state when no resumes exist
 */
const ResumeHistory = () => {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch resumes when component mounts
  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/resume/all')
      setResumes(response.data)
    } catch (err) {
      setError('Failed to load resumes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ---- Download Resume ----
  const handleDownload = async (resume) => {
    try {
      // Use axios to get the file as a blob (binary data)
      const response = await axiosInstance.get(`/resume/download/${resume.id}`, {
        responseType: 'blob', // Important! Tell axios to expect binary data
      })

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', resume.originalFileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Download failed. Please try again.')
    }
  }

  // ---- Delete Resume ----
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return

    setDeletingId(id)
    setError('')

    try {
      await axiosInstance.delete(`/resume/${id}`)
      setResumes(prev => prev.filter(r => r.id !== id)) // Remove from UI
      setSuccess('Resume deleted successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete resume. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // ---- Format Date ----
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="mb-8 animate-fade-in flex items-center justify-between">
          <div>
            <h2 className="section-title">Resume History</h2>
            <p className="text-white/40 mt-1">All your uploaded resumes</p>
          </div>
          <div className="text-white/40 text-sm font-medium">
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Alerts */}
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

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="spinner w-10 h-10 mx-auto mb-4" />
              <p className="text-white/40">Loading resumes...</p>
            </div>
          </div>
        ) : resumes.length === 0 ? (
          /* Empty State */
          <div className="glass-card text-center py-16">
            
            <h3 className="text-xl font-semibold text-white mb-2">No resumes yet</h3>
            <p className="text-white/40 mb-6">Upload your first resume to get started</p>
            <a href="/upload" className="btn-primary inline-flex">
              
              <span>Upload Resume</span>
            </a>
          </div>
        ) : (
          /* Resume Cards */
          <div className="space-y-4">
            {resumes.map((resume, index) => (
              <div
                key={resume.id}
                className="glass-card animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">

                  {/* PDF Icon */}
                  <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/20
                                  flex items-center justify-center text-2xl flex-shrink-0">
                    
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {resume.originalFileName}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40">{formatDate(resume.uploadDate)}</span>
                      <span className="badge-success">PDF</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Download */}
                    <button
                      onClick={() => handleDownload(resume)}
                      className="btn-secondary py-2 px-4 text-sm"
                      title="Download resume"
                    >
                      
                      <span className="hidden sm:inline">Download</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                      className="btn-danger py-2 px-4 text-sm"
                      title="Delete resume"
                    >
                      {deletingId === resume.id ? (
                        <div className="spinner w-4 h-4" />
                      ) : (
                        <>
                          
                          <span className="hidden sm:inline">Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ResumeHistory
