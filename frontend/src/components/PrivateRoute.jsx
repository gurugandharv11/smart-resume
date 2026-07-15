import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * PrivateRoute - Protects routes that require authentication.
 *
 * How it works:
 * - If the user is authenticated, render the protected component (children)
 * - If NOT authenticated, redirect to /login
 *
 * Usage in App.jsx:
 *   <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
 *
 * Interview Tip:
 * This is the standard pattern for route protection in React Router v6.
 * The <Navigate> component performs a declarative redirect.
 * The `replace` prop replaces the current history entry (no back-button loop).
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    // Not logged in - redirect to login page
    return <Navigate to="/login" replace />
  }

  // Logged in - render the protected component
  return children
}

export default PrivateRoute
