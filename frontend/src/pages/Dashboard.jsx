import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'

/**
 * Dashboard Page - The main landing page after login.
 *
 * Displays:
 * - Welcome message with user's name
 * - Stats cards: total resumes, latest score, total analyses
 * - Quick action buttons
 * - Recent resumes list
 */
const Dashboard = () => {
  const { user } = useAuth()

  const [stats, setStats] = useState({
    totalResumes: 0,
    latestScore: null,
    totalAnalyses: 0,
  })
  const [recentResumes, setRecentResumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch resumes and count in parallel
      const [resumesRes, countRes] = await Promise.all([
        axiosInstance.get('/resume/all'),
        axiosInstance.get('/resume/count'),
      ])

      const resumes = resumesRes.data
      setRecentResumes(resumes.slice(0, 5)) // Show only last 5

      setStats(prev => ({
        ...prev,
        totalResumes: countRes.data.count,
      }))

      // Load last analysis score from localStorage (stored after analysis)
      const lastScore = localStorage.getItem('lastAnalysisScore')
      const analysisCount = localStorage.getItem('analysisCount') || 0
      if (lastScore) {
        setStats(prev => ({
          ...prev,
          latestScore: parseInt(lastScore),
          totalAnalyses: parseInt(analysisCount),
        }))
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Format upload date nicely
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Get score color based on match percentage
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">

        {/* ---- Header ---- */}
        <div className="mb-8 animate-fade-in">
          <h2 className="section-title">
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'} 
          </h2>
          <p className="text-white/40 mt-1">
            Here's an overview of your resume analysis activity
          </p>
        </div>

        {/* ---- Stats Cards ---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Total Uploaded Resumes"
            value={loading ? '...' : stats.totalResumes}
            icon=""
            color="bg-indigo-500/20"
            subtitle="All time uploads"
          />
          <DashboardCard
            title="Latest Match Score"
            value={
              loading ? '...' :
              stats.latestScore !== null ? `${stats.latestScore}%` : 'N/A'
            }
            icon=""
            color="bg-emerald-500/20"
            subtitle={stats.latestScore !== null ? 'From last analysis' : 'No analysis yet'}
          />
          <DashboardCard
            title="Total Analyses Done"
            value={loading ? '...' : stats.totalAnalyses}
            icon=""
            color="bg-purple-500/20"
            subtitle="Resume analyses run"
          />
        </div>

        {/* ---- Quick Actions ---- */}
        <div className="glass-card mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/upload" className="btn-primary">
              
              <span>Upload Resume</span>
            </Link>
            <Link to="/analyze" className="btn-secondary">
              
              <span>Analyze Resume</span>
            </Link>
            <Link to="/history" className="btn-secondary">
              
              <span>View History</span>
            </Link>
          </div>
        </div>

        {/* ---- Recent Resumes ---- */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Resumes</h3>
            <Link to="/history" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner w-8 h-8" />
            </div>
          ) : recentResumes.length === 0 ? (
            <div className="text-center py-10">
              
              <p className="text-white/40 text-sm">No resumes uploaded yet</p>
              <Link to="/upload" className="btn-primary inline-flex mt-4">
                
                <span>Upload Your First Resume</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl
                             bg-white/3 hover:bg-white/6 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <p className="text-sm font-medium text-white/80 truncate max-w-xs">
                        {resume.originalFileName}
                      </p>
                      <p className="text-xs text-white/40">{formatDate(resume.uploadDate)}</p>
                    </div>
                  </div>
                  <span className="badge-success text-xs">Uploaded</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

export default Dashboard
