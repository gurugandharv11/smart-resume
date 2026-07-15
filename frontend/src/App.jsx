import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UploadResume from './pages/UploadResume'
import ResumeHistory from './pages/ResumeHistory'
import Analyze from './pages/Analyze'
import Profile from './pages/Profile'
import Landing from './pages/Landing'

/**
 * App - Root component that sets up routing and global providers.
 *
 * Routing structure:
 * /          → redirect to /dashboard
 * /login     → Login page (public)
 * /register  → Register page (public)
 * /dashboard → Dashboard (protected)
 * /upload    → Upload Resume (protected)
 * /history   → Resume History (protected)
 * /analyze   → Analyze Resume (protected)
 * /profile   → Profile (protected)
 *
 * PrivateRoute wraps all protected pages. If the user is not logged in,
 * they are redirected to /login automatically.
 */
function App() {
  return (
    // AuthProvider wraps everything so all components can access auth state
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - require JWT token */}
          <Route
            path="/dashboard"
            element={<PrivateRoute><Dashboard /></PrivateRoute>}
          />
          <Route
            path="/upload"
            element={<PrivateRoute><UploadResume /></PrivateRoute>}
          />
          <Route
            path="/history"
            element={<PrivateRoute><ResumeHistory /></PrivateRoute>}
          />
          <Route
            path="/analyze"
            element={<PrivateRoute><Analyze /></PrivateRoute>}
          />
          <Route
            path="/profile"
            element={<PrivateRoute><Profile /></PrivateRoute>}
          />

          {/* Default: Landing page */}
          <Route path="/" element={<Landing />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
