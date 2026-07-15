/**
 * DashboardCard - A reusable statistics card for the dashboard.
 *
 * Props:
 *   - title   : Card label (e.g., "Total Resumes")
 *   - value   : The big number or value to display
 *   - icon    : Emoji or icon character
 *   - color   : Tailwind gradient classes for the icon background
 *   - subtitle: Optional small text below the value
 */
const DashboardCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <div className="glass-card group animate-slide-up">
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl 
                         ${color} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>

        {/* Decorative dot */}
        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 animate-pulse-slow" />
      </div>

      {/* Value */}
      <div className="mt-4">
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-white/50 mt-2">{title}</p>
    </div>
  )
}

export default DashboardCard
