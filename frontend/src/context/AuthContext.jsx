import { createContext, useContext, useState, useEffect } from 'react'

/**
 * AuthContext - Global state management for authentication.
 *
 * What is React Context?
 * Context provides a way to pass data through the component tree
 * without having to pass props down manually at every level.
 *
 * We use AuthContext to store:
 * - user     : The logged-in user's info (email, name, role)
 * - token    : The JWT token
 * - isAuthenticated : Quick boolean check
 *
 * These are available to any component without prop drilling.
 *
 * Interview Tip:
 * For small/medium apps, Context + useState is perfect for auth state.
 * Redux is overkill for this use case.
 */

// Create the context
const AuthContext = createContext(null)

/**
 * AuthProvider - Wraps the entire app and provides auth state.
 * Place this at the root (in App.jsx) so all children can access it.
 */
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage (persists across page refreshes)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  // isAuthenticated is true when we have both a user and a token
  const isAuthenticated = !!user && !!token

  /**
   * login - Called after successful registration or login API call.
   * Stores user info and token in state AND localStorage.
   *
   * @param {Object} userData - { email, fullName, role }
   * @param {string} jwtToken - The JWT token from the backend
   */
  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', jwtToken)
  }

  /**
   * logout - Clears auth state and redirects to login.
   */
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // The value object passed to all consumers
  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth - Custom hook for consuming AuthContext.
 *
 * Usage: const { user, login, logout, isAuthenticated } = useAuth()
 *
 * Throws an error if used outside of AuthProvider
 * (helps catch bugs early during development).
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
