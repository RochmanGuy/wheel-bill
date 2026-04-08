import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { format, differenceInDays, parseISO } from 'date-fns'

export default function HomePage() {
  const { user, isAdmin } = useAuth()
  const { data } = useData()

  // חישוב התראות
  const today = new Date()
  const alerts = []

  const checkExpiry = (items, section) => {
    items.forEach(item => {
      const fields = [
        { key: 'testDate', label: 'טסט' },
        { key: 'insuranceDate', label: 'ביטוח' },
        { key: 'licenseDate', label: 'רישיון' },
      ]
      fields.forEach(({ key, label }) => {
        if (!item[key]) return
        const diff = differenceInDays(parseISO(item[key]), today)
        if (diff <= 14 && diff >= 0) {
          alerts.push({ type: diff <= 7 ? 'red' : 'orange', message: `${item.name} - ${label} בעוד ${diff} ימים`, link: `/settings/${section}?open=${item.id}` })
        } else if (diff < 0) {
          alerts.push({ type: 'red', message: `${item.name} - ${label} פג תוקף לפני ${Math.abs(diff)} ימים`, link: `/settings/${section}?open=${item.id}` })
        }
      })
    })
  }

  checkExpiry(data.vehicles, 'vehicles')
  checkExpiry(data.trailers, 'trailers')

  const quickStats = [
    { label: 'נהגים', value: data.drivers.length, icon: '👤', color: 'bg-green-100 text-green-700', link: '/settings/drivers' },
    { label: 'רכבים', value: data.vehicles.length, icon: '🚗', color: 'bg-blue-100 text-blue-700', link: '/settings/vehicles' },
    { label: 'נגררים', value: data.trailers.length, icon: '🚜', color: 'bg-purple-100 text-purple-700', link: '/settings/trailers' },
    { label: 'אירועים', value: data.events.length, icon: '📋', color: 'bg-orange-100 text-orange-700', link: '/events' },
  ]

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* ברכה */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">שלום, {user?.username} <span aria-hidden="true">👋</span></h1>
        <p className="text-gray-600 text-sm">{user?.company} • {format(today, 'dd/MM/yyyy')}</p>
      </div>

      {/* התראות */}
      {alerts.length > 0 && (
        <section className="mb-5 space-y-2" aria-label="התראות פעילות">
          <h2 className="text-sm font-semibold text-gray-600 mb-2"><span aria-hidden="true">⚠️</span> התראות פעילות</h2>
          {alerts.map((a, i) => (
            <Link key={i} to={a.link} className={`block rounded-xl px-4 py-3 text-sm font-medium active:opacity-75 focus:ring-2 focus:outline-none
              ${a.type === 'red' ? 'bg-red-100 text-red-700 border border-red-200 focus:ring-red-400' : 'bg-orange-100 text-orange-700 border border-orange-200 focus:ring-orange-400'}`}>
              {a.message} <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>
      )}

      {/* סטטיסטיקות מהירות */}
      <div className="grid grid-cols-2 gap-3 mb-5" role="list" aria-label="סיכום נתונים">
        {quickStats.map(s => (
          <Link key={s.label} to={s.link} role="listitem" className={`rounded-2xl p-4 ${s.color} flex items-center gap-3 active:opacity-80 focus:ring-2 focus:ring-blue-500 focus:outline-none`}>
            <span className="text-3xl" aria-hidden="true">{s.icon}</span>
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* כפתורי גישה מהירה */}
      <nav aria-label="גישה מהירה" className="space-y-3">
        <Link to="/events/new" className="flex items-center gap-3 bg-blue-700 text-white rounded-2xl px-5 py-4 font-semibold text-lg shadow hover:bg-blue-600 transition focus:ring-2 focus:ring-blue-300 focus:outline-none">
          <span className="text-2xl" aria-hidden="true">➕</span>
          <span>אירוע חדש</span>
        </Link>
        <Link to="/events" className="flex items-center gap-3 bg-white text-gray-700 rounded-2xl px-5 py-4 font-medium shadow border border-gray-100 hover:bg-gray-50 transition focus:ring-2 focus:ring-blue-500 focus:outline-none">
          <span className="text-2xl" aria-hidden="true">📋</span>
          <span>כל האירועים</span>
        </Link>
        <Link to="/settings" className="flex items-center gap-3 bg-white text-gray-700 rounded-2xl px-5 py-4 font-medium shadow border border-gray-100 hover:bg-gray-50 transition focus:ring-2 focus:ring-blue-500 focus:outline-none">
          <span className="text-2xl" aria-hidden="true">⚙️</span>
          <span>הגדרות ותשתית</span>
        </Link>
        {isAdmin && (
          <Link to="/reports" className="flex items-center gap-3 bg-white text-gray-700 rounded-2xl px-5 py-4 font-medium shadow border border-gray-100 hover:bg-gray-50 transition focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <span className="text-2xl" aria-hidden="true">📊</span>
            <span>דוחות וסיכומים</span>
          </Link>
        )}
      </nav>
    </div>
  )
}
