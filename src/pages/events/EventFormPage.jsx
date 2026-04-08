import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const EMPTY_EVENT = {
  id: '', name: '', driverName: '', date: format(new Date(), 'yyyy-MM-dd'),
  dateEnd: '', multiDay: false,
  location: '', locationUrl: '', distanceKm: '',
  vehicles: [], trailers: [],
  producer: '', contacts: '', notes: '',
  priceNet: '', priceVat: '',
  extraCosts: '',
}

const VAT = 1.18

export default function EventFormPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data, updateSection, getDieselPriceForDate } = useData()
  const { isAdmin } = useAuth()
  const isNew = !id
  const isViewMode = searchParams.get('view') === '1'

  const [form, setForm] = useState(EMPTY_EVENT)
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    if (!isNew) {
      const found = data.events.find(e => e.id === id)
      if (found) setForm({ ...EMPTY_EVENT, ...found })
    } else {
      setForm({ ...EMPTY_EVENT, id: Date.now().toString() })
    }
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function addVehicle(vehicleId) {
    const v = data.vehicles.find(v => v.id === vehicleId)
    if (!v) return
    setForm(f => ({
      ...f,
      vehicles: [...f.vehicles, { id: v.id, name: v.name, plate: v.plate, kmPerLiter: v.kmPerLiter, kmDriven: '', roundTrip: false }]
    }))
  }

  function removeVehicle(idx) {
    setForm(f => ({ ...f, vehicles: f.vehicles.filter((_, i) => i !== idx) }))
  }

  function setVehicleField(idx, key, val) {
    setForm(f => ({
      ...f,
      vehicles: f.vehicles.map((v, i) => i === idx ? { ...v, [key]: val } : v)
    }))
  }

  function addTrailer(trailerId) {
    const t = data.trailers.find(t => t.id === trailerId)
    if (!t) return
    setForm(f => ({
      ...f,
      trailers: [...f.trailers, { id: t.id, name: t.name, type: t.type, fuelUsed: '', active: true }]
    }))
  }

  function removeTrailer(idx) {
    setForm(f => ({ ...f, trailers: f.trailers.filter((_, i) => i !== idx) }))
  }

  function setTrailerField(idx, key, val) {
    setForm(f => ({
      ...f,
      trailers: f.trailers.map((t, i) => i === idx ? { ...t, [key]: val } : t)
    }))
  }

  function openNavigation(app) {
    if (!form.location) return toast.error('הכנס כתובת יעד קודם')
    const encoded = encodeURIComponent(form.location)
    if (app === 'waze') {
      window.open('https://waze.com/ul?q=' + encoded + '&navigate=yes', '_blank')
    } else {
      window.open('https://www.google.com/maps/dir/?api=1&destination=' + encoded, '_blank')
    }
  }

  function save() {
    if (!form.name.trim()) return toast.error('נדרש שם אירוע')
    const list = isNew
      ? [...data.events, form]
      : data.events.map(e => e.id === id ? form : e)
    updateSection('events', list)
    toast.success('אירוע נשמר')
    navigate('/events')
  }

  // חישוב סיכום
  const diesel = getDieselPriceForDate(form.date)
  const fuelItems = form.vehicles.map(v => {
    const km = parseFloat(v.kmDriven) || 0
    const effectiveKm = v.roundTrip ? km * 2 : km
    const kpl = parseFloat(v.kmPerLiter) || 0
    return { name: v.name, km, effectiveKm, roundTrip: v.roundTrip, liters: kpl > 0 ? (effectiveKm / kpl) : 0 }
  })
  const totalKm = fuelItems.reduce((s, fi) => s + fi.effectiveKm, 0)
  const totalVehicleLiters = fuelItems.reduce((s, fi) => s + fi.liters, 0)
  const trailerLiters = form.trailers.reduce((s, t) => s + (t.active ? (parseFloat(t.fuelUsed) || 0) : 0), 0)
  const totalLiters = totalVehicleLiters + trailerLiters
  const fuelCost = diesel ? totalLiters * diesel.priceVat : 0
  const extraCosts = parseFloat(form.extraCosts) || 0
  const totalCost = fuelCost + extraCosts
  const clientPaysVat = parseFloat(form.priceVat) || 0
  const clientPaysNet = parseFloat(form.priceNet) || 0
  const profitVat = clientPaysVat - totalCost
  const totalCostNet = totalCost / VAT
  const profitNet = clientPaysNet - totalCostNet

  const availableDrivers = [...new Set(data.drivers.map(d => d.name))]

  return (
    <div className="p-4 max-w-lg mx-auto pb-8">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/events" className="text-blue-600 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none rounded">→ חזרה</Link>
        <h1 className="text-xl font-bold text-gray-800">
          {isNew ? '+ אירוע חדש' : isViewMode ? form.name || 'פרטי אירוע' : 'עריכת אירוע'}
        </h1>
        {isViewMode && !isNew && (
          <button
            onClick={() => setSearchParams({})}
            className="mr-auto bg-blue-700 text-white text-sm px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none"
          >
            עריכה
          </button>
        )}
      </div>

      <div className={`space-y-4 ${isViewMode ? 'pointer-events-none select-none' : ''}`}>
        {/* פרטים בסיסיים */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold text-gray-700">פרטי אירוע</h2>
          <div>
            <label htmlFor="ev-name" className="text-sm text-gray-600">שם האירוע *</label>
            <input id="ev-name" value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="שם האירוע" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ev-date" className="text-sm text-gray-600">תאריך התחלה</label>
              <input id="ev-date" type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full border rounded-xl px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="ev-driver" className="text-sm text-gray-600">נהג</label>
              <input
                id="ev-driver"
                list="drivers-list"
                value={form.driverName}
                onChange={e => set('driverName', e.target.value)}
                className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="בחר/הכנס נהג"
              />
              <datalist id="drivers-list">
                {availableDrivers.map(d => <option key={d} value={d} />)}
              </datalist>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.multiDay} onChange={e => set('multiDay', e.target.checked)} className="w-4 h-4 focus:ring-2 focus:ring-blue-500" />
            אירוע מרובה ימים
          </label>
          {form.multiDay && (
            <div>
              <label htmlFor="ev-dateEnd" className="text-sm text-gray-600">תאריך סיום</label>
              <input id="ev-dateEnd" type="date" value={form.dateEnd} onChange={e => set('dateEnd', e.target.value)}
                min={form.date} className="w-full border rounded-xl px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          )}
        </div>

        {/* מיקום */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold text-gray-700">מיקום האירוע</h2>
          <div>
            <label htmlFor="ev-location" className="text-sm text-gray-600">כתובת / מיקום</label>
            <input id="ev-location" value={form.location} onChange={e => set('location', e.target.value)}
              className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="עיר, רחוב, מיקום" />
          </div>
          <div>
            <label htmlFor="ev-distance" className="text-sm text-gray-600">מרחק לכיוון אחד (ק"מ)</label>
            <input id="ev-distance" type="number" value={form.distanceKm} onChange={e => set('distanceKm', e.target.value)}
              className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="הכנס ק''מ לפי Google Maps - כיוון אחד" />
            {form.distanceKm && (
              <p className="text-xs text-blue-600 mt-1">הלוך-חזור: {(parseFloat(form.distanceKm) * 2).toFixed(0)} ק"מ</p>
            )}
          </div>
          {form.location && (
            <div className="flex gap-2">
              <button onClick={() => openNavigation('waze')} aria-label="נווט ב-Waze"
                className="flex-1 flex items-center justify-center gap-2 bg-sky-500 text-white py-2 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-300 focus:outline-none">
                Waze
              </button>
              <button onClick={() => openNavigation('google')} aria-label="נווט ב-Google Maps"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-300 focus:outline-none">
                Google Maps
              </button>
            </div>
          )}
        </div>

        {/* רכבים */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold text-gray-700">רכבים באירוע</h2>
          {form.vehicles.map((v, i) => (
            <div key={i} className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{v.name} <span className="text-gray-500 text-xs">{v.plate}</span></p>
                <button onClick={() => removeVehicle(i)} aria-label={`הסר רכב ${v.name} מהאירוע`} className="text-red-400 text-xl px-1 focus:ring-2 focus:ring-red-400 focus:outline-none rounded">×</button>
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <label htmlFor={`v-km-${i}`} className="text-xs text-gray-600">ק"מ שנסע:</label>
                  <input id={`v-km-${i}`} type="number" value={v.kmDriven}
                    onChange={e => setVehicleField(i, 'kmDriven', e.target.value)}
                    className="w-20 border rounded-lg px-2 py-1 text-right text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0" />
                </div>
                <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={v.roundTrip || false}
                    onChange={e => setVehicleField(i, 'roundTrip', e.target.checked)} className="focus:ring-2 focus:ring-blue-500" />
                  הלוך-חזור
                </label>
                {v.roundTrip && v.kmDriven && (
                  <span className="text-xs text-blue-600 font-medium">
                    = {(parseFloat(v.kmDriven) * 2).toFixed(0)} ק"מ סה"כ
                  </span>
                )}
              </div>
            </div>
          ))}
          {!isViewMode && (
            <select onChange={e => { if (e.target.value) { addVehicle(e.target.value); e.target.value = '' } }}
              aria-label="הוסף רכב לאירוע"
              className="w-full border rounded-xl px-3 py-2 text-right text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">+ הוסף רכב לאירוע</option>
              {data.vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
            </select>
          )}
        </div>

        {/* נגררים */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold text-gray-700">נגררים / גנרטורים</h2>
          {form.trailers.map((t, i) => (
            <div key={i} className="bg-purple-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{t.name} <span className="text-xs text-gray-500">{t.type}</span></p>
                <button onClick={() => removeTrailer(i)} aria-label={`הסר נגרר ${t.name} מהאירוע`} className="text-red-400 text-xl px-1 focus:ring-2 focus:ring-red-400 focus:outline-none rounded">×</button>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={t.active} onChange={e => setTrailerField(i, 'active', e.target.checked)} className="focus:ring-2 focus:ring-blue-500" />
                  עבד באירוע
                </label>
                {t.active && (
                  <div className="flex items-center gap-1">
                    <label htmlFor={`t-fuel-${i}`} className="text-xs text-gray-600">ליטר סולר:</label>
                    <input id={`t-fuel-${i}`} type="number" value={t.fuelUsed} onChange={e => setTrailerField(i, 'fuelUsed', e.target.value)}
                      className="w-20 border rounded-lg px-2 py-1 text-right text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {!isViewMode && (
            <select onChange={e => { if (e.target.value) { addTrailer(e.target.value); e.target.value = '' } }}
              aria-label="הוסף נגרר לאירוע"
              className="w-full border rounded-xl px-3 py-2 text-right text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">+ הוסף נגרר לאירוע</option>
              {data.trailers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
            </select>
          )}
        </div>

        {/* מפיק ואנשי קשר */}
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold text-gray-700">אנשי קשר</h2>
          <div>
            <label htmlFor="ev-producer" className="text-sm text-gray-600">שם מפיק</label>
            <input id="ev-producer" value={form.producer} onChange={e => set('producer', e.target.value)}
              className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="ev-contacts" className="text-sm text-gray-600">אנשי קשר ופרטים</label>
            <textarea id="ev-contacts" value={form.contacts} onChange={e => set('contacts', e.target.value)}
              className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} />
          </div>
          <div>
            <label htmlFor="ev-notes" className="text-sm text-gray-600">הערות נוספות</label>
            <textarea id="ev-notes" value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} />
          </div>
        </div>

        {/* מחיר - מנהל בלבד */}
        {isAdmin && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-2xl p-4 space-y-3">
            <h2 className="font-semibold text-yellow-800">פיננסי - מנהל בלבד</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ev-priceNet" className="text-sm text-gray-600">מחיר לפני מע"מ (₪)</label>
                <input id="ev-priceNet" type="number" value={form.priceNet}
                  onChange={e => { set('priceNet', e.target.value); set('priceVat', (e.target.value * VAT).toFixed(2)) }}
                  className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="ev-priceVat" className="text-sm text-gray-600">מחיר כולל מע"מ (₪)</label>
                <input id="ev-priceVat" type="number" value={form.priceVat}
                  onChange={e => { set('priceVat', e.target.value); set('priceNet', (e.target.value / VAT).toFixed(2)) }}
                  className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="ev-extraCosts" className="text-sm text-gray-600">הוצאות נוספות (₪)</label>
              <input id="ev-extraCosts" type="number" value={form.extraCosts} onChange={e => set('extraCosts', e.target.value)}
                className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
        )}

        {/* סיכום - כפתור זה תמיד לחיץ */}
        <div className="pointer-events-auto">
          <button onClick={() => setShowSummary(!showSummary)}
            aria-expanded={showSummary}
            className="w-full bg-gray-800 text-white py-3 rounded-2xl font-semibold focus:ring-2 focus:ring-gray-500 focus:outline-none">
            {showSummary ? 'סגור סיכום' : 'הצג סיכום אירוע'}
          </button>
        </div>

        {showSummary && (
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="font-semibold text-gray-700">סיכום אירוע</h2>
            <div className="space-y-2 text-sm">
              {fuelItems.map((fi, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-600 pr-4">
                  <span>{fi.name}{fi.roundTrip ? ' (x2)' : ''}</span>
                  <span>{fi.effectiveKm.toFixed(0)} ק"מ | {fi.liters.toFixed(1)} ל'</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">סה"כ ק"מ</span>
                <span className="font-bold">{totalKm.toFixed(0)} ק"מ</span>
              </div>
              {form.trailers.map((t, i) => t.active && parseFloat(t.fuelUsed) > 0 && (
                <div key={i} className="flex justify-between text-xs text-gray-600 pr-4">
                  <span>{t.name} (נגרר)</span><span>{t.fuelUsed} ליטר</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">סה"כ סולר</span>
                <span className="font-bold">{totalLiters.toFixed(1)} ליטר</span>
              </div>
              {diesel && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>מחיר סולר ({format(new Date(diesel.date), 'dd/MM/yy')})</span>
                  <span>₪{diesel.priceVat.toFixed(2)}/ל'</span>
                </div>
              )}
              {isAdmin && (
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between"><span className="text-gray-600">עלות דלק</span><span className="font-semibold text-red-600">₪{fuelCost.toFixed(2)}</span></div>
                  {extraCosts > 0 && <div className="flex justify-between"><span className="text-gray-600">הוצאות נוספות</span><span className="font-semibold text-red-600">₪{extraCosts.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span className="font-semibold text-gray-700">סה"כ הוצאות</span><span className="font-bold text-red-700">₪{totalCost.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-700">הכנסה (כולל מע"מ)</span><span className="font-bold text-green-700">₪{clientPaysVat.toFixed(2)}</span></div>
                  <div className="border-t pt-1 space-y-1">
                    <div className={`flex justify-between font-bold ${profitVat >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      <span>רווח כולל מע"מ</span><span>₪{profitVat.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between text-sm ${profitNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>רווח לפני מע"מ</span><span>₪{profitNet.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!isViewMode && (
          <div className="pointer-events-auto">
            <button onClick={save} className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow focus:ring-2 focus:ring-blue-300 focus:outline-none">
              שמור אירוע
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
