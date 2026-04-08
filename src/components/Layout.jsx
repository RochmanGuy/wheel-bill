import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { path: '/', label: 'בית', icon: '🏠' },
  { path: '/events', label: 'אירועים', icon: '📋' },
  { path: '/settings', label: 'הגדרות', icon: '⚙️' },
  { path: '/reports', label: 'דוחות', icon: '📊' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wide"><span aria-hidden="true">🚛</span> WHEEL BILL</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-blue-200">{user?.company}</span>
          <button
            onClick={logout}
            aria-label="יציאה מהמערכת"
            className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-full transition focus:ring-2 focus:ring-blue-300 focus:outline-none"
          >
            יציאה
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20" id="main-content">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-lg z-50" aria-label="ניווט ראשי">
        {NAV_ITEMS.map(item => {
          const active = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition focus:ring-2 focus:ring-blue-500 focus:outline-none
                ${active ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}
            >
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
