import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { format, parseISO } from 'date-fns'

export default function EventsPage() {
  const { data, updateSection } = useData()
  const sorted = [...data.events].sort((a, b) => new Date(b.date) - new Date(a.date))

  function remove(id) {
    if (!confirm('למחוק אירוע זה?')) return
    updateSection('events', data.events.filter(e => e.id !== id))
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800"><span aria-hidden="true">📋</span> אירועים</h1>
        <Link to="/events/new" className="bg-blue-700 text-white text-sm px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none">+ חדש</Link>
      </div>

      {sorted.length === 0 && <div className="text-center text-gray-500 py-12">אין אירועים עדיין</div>}

      <div className="space-y-3">
        {sorted.map(event => (
          <Link key={event.id} to={`/events/${event.id}?view=1`} className="block bg-white rounded-2xl shadow px-4 py-3 active:opacity-75 focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-base">{event.name}</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {event.date ? format(parseISO(event.date), 'dd/MM/yyyy') : ''}
                  {event.multiDay && event.dateEnd ? ` - ${format(parseISO(event.dateEnd), 'dd/MM/yyyy')}` : ''}
                  {event.driverName ? ` • ${event.driverName}` : ''}
                </p>
                {event.location && <p className="text-xs text-gray-500 mt-0.5"><span aria-hidden="true">📍</span> {event.location}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {event.vehicles?.map((v, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full"><span aria-hidden="true">🚗</span> {v.name}</span>
                  ))}
                  {event.trailers?.map((t, i) => (
                    <span key={i} className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full"><span aria-hidden="true">🚜</span> {t.name}</span>
                  ))}
                </div>
              </div>
              <span className="text-gray-300 text-lg mr-2 mt-1" aria-hidden="true">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
