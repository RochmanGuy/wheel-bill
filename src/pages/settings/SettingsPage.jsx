import { Link, Routes, Route } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DriversPage from './DriversPage'
import VehiclesPage from './VehiclesPage'
import TrailersPage from './TrailersPage'
import DieselPricePage from './DieselPricePage'

const SECTIONS = [
  { path: 'drivers', label: 'נהגים', icon: '👤', desc: 'ניהול רשימת נהגים ורישיונות', adminOnly: false },
  { path: 'vehicles', label: 'כרטיסיות רכבים', icon: '🚗', desc: 'פרטים, תאריכים והתראות', adminOnly: false },
  { path: 'trailers', label: 'כרטיסיות נגררים', icon: '🚜', desc: 'נגררים, גנרטורים ועוד', adminOnly: false },
  { path: 'diesel', label: 'מחיר סולר', icon: '⛽', desc: 'עדכון מחיר לפי תאריכים', adminOnly: true },
]

function SettingsMenu() {
  const { isAdmin } = useAuth()
  const visible = SECTIONS.filter(s => !s.adminOnly || isAdmin)
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">⚙️ הגדרות ותשתית</h1>
      <div className="space-y-3">
        {visible.map(s => (
          <Link
            key={s.path}
            to={s.path}
            className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow border border-gray-100 hover:bg-blue-50 transition"
          >
            <span className="text-3xl">{s.icon}</span>
            <div>
              <div className="font-semibold text-gray-800">{s.label}</div>
              <div className="text-xs text-gray-500">{s.desc}</div>
            </div>
            <span className="mr-auto text-gray-400">←</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Routes>
      <Route index element={<SettingsMenu />} />
      <Route path="drivers" element={<DriversPage />} />
      <Route path="vehicles" element={<VehiclesPage />} />
      <Route path="trailers" element={<TrailersPage />} />
      <Route path="diesel" element={<DieselPricePage />} />
    </Routes>
  )
}
