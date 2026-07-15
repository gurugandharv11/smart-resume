import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'

/**
 * Register Page - Allows new users to create an account.
 *
 * Flow:
 * 1. User fills in fullName, email, password
 * 2. POST /api/auth/register → backend creates user, returns JWT
 * 3. Call login() to store credentials
 * 4. Navigate to /dashboard
 */
const Register = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client-side validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await axiosInstance.post('/auth/register', formData)
      const { token, email, fullName, role } = response.data

      // Store in context + localStorage
      login({ email, fullName, role }, token)

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 
                          rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 
                          shadow-xl glow-indigo">
            
          </div>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-white/50 mt-2">Start analyzing your resume today</p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error Alert */}
            {error && (
              <div className="alert-error">
                
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="form-input"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
                <span className="text-white/30 font-normal ml-2">(min. 6 characters)</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-white/50 text-sm mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>


      </div>
    </div>
  )
}

export default Register
