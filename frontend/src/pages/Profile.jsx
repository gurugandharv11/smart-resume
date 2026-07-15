import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

/**
 * Profile Page - Displays the current user's account information.
 *
 * Shows:
 * - Full name
 * - Email address
 * - Account role
 * - Account creation info (static for now)
 *
 * This is a simple read-only page — no edit functionality needed
 * for the campus placement project. Could be extended with
 * password change, avatar upload etc. in a production app.
 */
const Profile = () => {
  const { user } = useAuth()

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const profileFields = [
    { label: 'Full Name', value: user?.fullName || 'N/A', icon: '' },
    { label: 'Email Address', value: user?.email || 'N/A', icon: '' },
    { label: 'Account Role', value: user?.role || 'USER', icon: '' },
    { label: 'Account Status', value: 'Active', icon: '' },
  ]

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h2 className="section-title">My Profile</h2>
          <p className="text-white/40 mt-1">Your account information</p>
        </div>

        <div className="max-w-2xl">

          {/* Avatar Card */}
          <div className="glass-card mb-6 animate-slide-up text-center">
            {/* Large Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                            flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4
                            shadow-xl ring-4 ring-indigo-500/20">
              {getInitials(user?.fullName)}
            </div>

            <h3 className="text-2xl font-bold text-white">{user?.fullName || 'User'}</h3>
            <p className="text-white/40 mt-1">{user?.email}</p>
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full 
                            bg-indigo-500/15 border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-indigo-400 text-sm font-medium">{user?.role || 'USER'}</span>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
               Account Details
            </h4>
            <div className="space-y-4">
              {profileFields.map((field) => (
                <div key={field.label}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{field.icon}</span>
                    <span className="text-white/50 text-sm">{field.label}</span>
                  </div>
                  <span className="text-white font-medium text-sm">{field.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Profile
