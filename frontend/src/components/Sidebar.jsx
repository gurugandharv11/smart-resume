import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Sidebar - The main navigation sidebar for authenticated pages.
 *
 * Features:
 * - Active link highlighting with NavLink
 * - User avatar with initials
 * - Logout functionality
 * - Smooth hover effects
 *
 * NavLink vs Link:
 * NavLink automatically adds an "active" class when its `to` path matches
 * the current URL. We use this to highlight the active nav item.
 */
const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Handle logout: clear auth state and navigate to login
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get user initials for the avatar (e.g., "John Doe" → "JD")
  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Navigation items
  const navItems = [
    { to: '/dashboard', icon: '', label: 'Dashboard' },
    { to: '/upload', icon: '', label: 'Upload Resume' },
    { to: '/history', icon: '', label: 'Resume History' },
    { to: '/analyze', icon: '', label: 'Analyze Resume' },
    { to: '/profile', icon: '', label: 'Profile' },
  ]

  return (
    <aside className="w-64 min-h-screen bg-dark-800 border-r border-white/5 flex flex-col">

      {/* ---- Logo / Brand ---- */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                          flex items-center justify-center text-xl shadow-lg">
            
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">Smart Resume</h1>
            <p className="text-xs text-white/40">Analyzer</p>
          </div>
        </div>
      </div>

      {/* ---- Navigation Links ---- */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ---- User Info + Logout ---- */}
      <div className="p-4 border-t border-white/5">
        {/* User Avatar + Info */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                          flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {getInitials(user?.fullName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</p>
            <p className="text-xs text-white/40 truncate">{user?.email || ''}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50
                     hover:text-red-400 hover:bg-red-500/10 transition-all duration-300
                     font-medium text-sm"
        >
          
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
