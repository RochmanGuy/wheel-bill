import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Link, Navigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

const VAT = 1.18

export default function DieselPricePage() {
  const { data, updateSection } = useData()
  const { isAdmin } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [priceNet, setPriceNet] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  if (!isAdmin) return <Navigate to="/settings" replace />

  const sorted = [...data.dieselPrices].sort((a, b) => new Date(b.date) - new Date(a.date))

  function save() {
    if (!priceNet || !date) return toast.error('נדרש מחיר ותאריך')
    const entry = {
      id: Date.now().toString(),
      date,
      priceNet: parseFloat(priceNet),
      priceVat: parseFloat((priceNet * VAT).toFixed(4)),
    }
    updateSection('dieselPrices', [...data.dieselPrices, entry])
    toast.success('מחיר נשמר')
    setPriceNet('')
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setShowForm(false)
  }

  function remove(id) {
    if (!confirm('למחוק?')) return
    updateSection('dieselPrices', data.dieselPrices.filter(p => p.id !== id))
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/settings" className="text-blue-600 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none rounded">→ חזרה</Link>
        <h1 className="text-xl font-bold text-gray-800"><span aria-hidden="true">⛽</span> מחיר סולר</h1>
        <button onClick={() => setShowForm(true)} className="mr-auto bg-blue-700 text-white text-sm px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none">+ עדכן</button>
      </div>

      {sorted.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <p className="text-xs text-blue-600 mb-1">מחיר נוכחי (עדכון אחרון)</p>
          <p className="text-2xl font-bold text-blue-800">₪{sorted[0].priceVat.toFixed(2)} <span className="text-sm font-normal">כולל מע"מ</span></p>
          <p className="text-sm text-blue-700">₪{sorted[0].priceNet.toFixed(2)} לפני מע"מ • {format(parseISO(sorted[0].date), 'dd/MM/yyyy')}</p>
        </div>
      )}

      {sorted.length === 0 && <div className="text-center text-gray-500 py-8">לא הוזן מחיר סולר עדיין</div>}

      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.id} className={`bg-white rounded-xl shadow px-4 py-3 flex items-center ${i === 0 ? 'border-2 border-blue-200' : ''}`}>
            <div className="flex-1">
              <span className="font-semibold text-gray-800">{format(parseISO(p.date), 'dd/MM/yyyy')}</span>
              {i === 0 && <span className="mr-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">נוכחי</span>}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-gray-800">₪{p.priceVat.toFixed(2)} עם מע"מ</div>
              <div className="text-xs text-gray-600">₪{p.priceNet.toFixed(2)} לפני מע"מ</div>
            </div>
            <button onClick={() => remove(p.id)} aria-label={`מחק מחיר מתאריך ${format(parseISO(p.date), 'dd/MM/yyyy')}`} className="text-red-400 text-sm pr-3 mr-2 focus:ring-2 focus:ring-red-400 focus:outline-none rounded px-1">✕</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowForm(false)} role="dialog" aria-modal="true" aria-label="עדכון מחיר סולר">
          <div className="bg-white w-full rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">עדכון מחיר סולר</h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="dp-date" className="text-sm text-gray-600">תאריך עדכון</label>
                <input id="dp-date" type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="dp-price" className="text-sm text-gray-600">מחיר לפני מע"מ (₪ לליטר)</label>
                <input id="dp-price" type="number" step="0.001" value={priceNet} onChange={e => setPriceNet(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0.000" />
                {priceNet && (
                  <p className="text-xs text-blue-600 mt-1">כולל מע"מ: ₪{(priceNet * VAT).toFixed(3)}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-5 sticky bottom-0 bg-white pt-3 pb-2 border-t border-gray-100">
              <button onClick={save} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-semibold focus:ring-2 focus:ring-blue-300 focus:outline-none">שמור</button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl focus:ring-2 focus:ring-gray-400 focus:outline-none">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
