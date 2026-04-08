import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, getMonth } from 'date-fns'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]
const MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

export default function ReportsPage() {
  const { isAdmin } = useAuth()
  const { data, getDieselPriceForDate } = useData()

  const [periodType, setPeriodType] = useState('month') // 'month' | 'year' | 'custom'
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()))
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [customFrom, setCustomFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [customTo, setCustomTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [viewFilter, setViewFilter] = useState('all') // 'all' | 'vehicles' | 'trailers'

  if (!isAdmin) return <Navigate to="/" replace />

  function filterEvents(events) {
    let interval
    if (periodType === 'month') {
      const d = new Date(selectedYear, selectedMonth, 1)
      interval = { start: startOfMonth(d), end: endOfMonth(d) }
    } else if (periodType === 'year') {
      const d = new Date(selectedYear, 0, 1)
      interval = { start: startOfYear(d), end: endOfYear(d) }
    } else {
      interval = { start: new Date(customFrom), end: new Date(customTo) }
    }
    return events.filter(e => e.date && isWithinInterval(parseISO(e.date), interval))
  }

  const filtered = filterEvents(data.events)

  // ק"מ לכל רכב (עם חישוב הלוך-חזור)
  const kmByVehicle = {}
  filtered.forEach(event => {
    event.vehicles?.forEach(v => {
      const km = parseFloat(v.kmDriven) || 0
      const effectiveKm = v.roundTrip ? km * 2 : km
      kmByVehicle[v.name] = (kmByVehicle[v.name] || 0) + effectiveKm
    })
  })

  // עבודת נגררים
  const trailerWork = {}
  filtered.forEach(event => {
    event.trailers?.forEach(t => {
      if (!trailerWork[t.name]) trailerWork[t.name] = { count: 0, liters: 0 }
      if (t.active) {
        trailerWork[t.name].count++
        trailerWork[t.name].liters += parseFloat(t.fuelUsed) || 0
      }
    })
  })

  // פיננסי
  let totalIncome = 0, totalFuelCost = 0, totalExtra = 0
  filtered.forEach(event => {
    totalIncome += parseFloat(event.priceVat) || 0
    totalExtra += parseFloat(event.extraCosts) || 0
    const diesel = getDieselPriceForDate(event.date)
    const vehicleLiters = event.vehicles?.reduce((s, v) => {
      const kpl = parseFloat(v.kmPerLiter) || 0
      const km = parseFloat(v.kmDriven) || 0
      const effectiveKm = v.roundTrip ? km * 2 : km
      return s + (kpl > 0 ? effectiveKm / kpl : 0)
    }, 0) || 0
    const trailerLiters = event.trailers?.reduce((s, t) => s + (t.active ? (parseFloat(t.fuelUsed) || 0) : 0), 0) || 0
    totalFuelCost += diesel ? (vehicleLiters + trailerLiters) * diesel.priceVat : 0
  })
  const totalCost = totalFuelCost + totalExtra
  const totalProfit = totalIncome - totalCost
  const totalProfitNet = totalProfit / 1.18
  const totalKm = Object.values(kmByVehicle).reduce((s, k) => s + k, 0)

  const kmChartData = Object.entries(kmByVehicle)
    .sort((a, b) => b[1] - a[1])
    .map(([name, km]) => ({ name, km: Math.round(km) }))

  const trailerChartData = Object.entries(trailerWork)
    .sort((a, b) => b[1].liters - a[1].liters)
    .map(([name, stats]) => ({ name, liters: Math.round(stats.liters), events: stats.count }))

  const showVehicles = viewFilter === 'all' || viewFilter === 'vehicles'
  const showTrailers = viewFilter === 'all' || viewFilter === 'trailers'

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">דוחות וסיכומים</h1>

      {/* בחירת סוג תקופה */}
      <div className="flex gap-2 mb-3" role="group" aria-label="סוג תקופה">
        {[['month','חודשי'],['year','שנתי'],['custom','טווח חופשי']].map(([val, label]) => (
          <button key={val} onClick={() => setPeriodType(val)}
            aria-pressed={periodType === val}
            className={'flex-1 py-2 rounded-xl text-sm font-medium transition focus:ring-2 focus:ring-blue-500 focus:outline-none ' +
              (periodType === val ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 border')}>
            {label}
          </button>
        ))}
      </div>

      {/* בחירת תקופה ספציפית */}
      {periodType === 'month' && (
        <div className="flex gap-2 mb-4">
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}
            aria-label="בחר חודש"
            className="flex-1 border rounded-xl px-3 py-2 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none">
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
            aria-label="בחר שנה"
            className="w-28 border rounded-xl px-3 py-2 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}
      {periodType === 'year' && (
        <div className="mb-4">
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
            aria-label="בחר שנה"
            className="w-full border rounded-xl px-3 py-2 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}
      {periodType === 'custom' && (
        <div className="flex gap-2 mb-4 items-center">
          <div className="flex-1">
            <label htmlFor="rp-from" className="text-xs text-gray-600">מתאריך</label>
            <input id="rp-from" type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 mt-0.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <span className="text-gray-500 mt-4" aria-hidden="true">-</span>
          <div className="flex-1">
            <label htmlFor="rp-to" className="text-xs text-gray-600">עד תאריך</label>
            <input id="rp-to" type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              min={customFrom} className="w-full border rounded-xl px-3 py-2 mt-0.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>
      )}

      {/* סינון לפי רכב/נגרר */}
      <div className="flex gap-2 mb-5" role="group" aria-label="סינון לפי סוג">
        {[['all','הכל'],['vehicles','רכבים'],['trailers','נגררים']].map(([val, label]) => (
          <button key={val} onClick={() => setViewFilter(val)}
            aria-pressed={viewFilter === val}
            className={'flex-1 py-2 rounded-xl text-sm font-medium transition focus:ring-2 focus:ring-gray-500 focus:outline-none ' +
              (viewFilter === val ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border')}>
            {label}
          </button>
        ))}
      </div>

      {/* סיכום פיננסי */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-xs text-green-700">הכנסות (כולל מע"מ)</p>
          <p className="text-xl font-bold text-green-800">₪{totalIncome.toFixed(0)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-xs text-red-700">הוצאות</p>
          <p className="text-xl font-bold text-red-800">₪{totalCost.toFixed(0)}</p>
        </div>
        <div className={'col-span-2 rounded-2xl p-4 ' + (totalProfit >= 0 ? 'bg-blue-50 border border-blue-200' : 'bg-red-100 border border-red-300')}>
          <p className="text-xs text-blue-700 mb-1">רווח</p>
          <div className={'font-bold ' + (totalProfit >= 0 ? 'text-blue-800' : 'text-red-800')}>
            <div className="text-xl">₪{totalProfit.toFixed(0)} <span className="text-sm font-normal">כולל מע"מ</span></div>
            <div className="text-base mt-0.5">₪{totalProfitNet.toFixed(0)} <span className="text-sm font-normal">לפני מע"מ</span></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">{filtered.length} אירועים • {totalKm.toFixed(0)} ק"מ סה"כ</p>
        </div>
      </div>

      {/* גרף ק"מ לרכב */}
      {showVehicles && kmChartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">ק"מ לפי רכב</h2>
          <ResponsiveContainer width="100%" height={Math.max(120, kmChartData.length * 40)}>
            <BarChart data={kmChartData} layout="vertical" role="img" aria-label="גרף קילומטרים לפי רכב">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={v => [v + ' ק"מ', '']} />
              <Bar dataKey="km" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* גרף נגררים */}
      {showTrailers && trailerChartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">סולר לפי נגרר</h2>
          <ResponsiveContainer width="100%" height={Math.max(120, trailerChartData.length * 40)}>
            <BarChart data={trailerChartData} layout="vertical" role="img" aria-label="גרף סולר לפי נגרר">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={v => [v + ' ליטר', '']} />
              <Bar dataKey="liters" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {trailerChartData.map(t => (
              <div key={t.name} className="flex justify-between text-xs text-gray-600">
                <span>{t.name}</span>
                <span>{t.events} אירועים • {t.liters} ליטר</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center text-gray-500 py-8">אין נתונים לתקופה הנבחרת</div>
      )}
    </div>
  )
}
