import { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Link, useSearchParams } from 'react-router-dom'
import { differenceInDays, parseISO, format } from 'date-fns'

const EMPTY_VEHICLE = {
  id: '', name: '', plate: '', kmPerLiter: '', testDate: '', insuranceDate: '',
  licenseDate: '', testDone: false, insuranceDone: false, notes: '',
  costs: [],
  docTest: '', docInsurance: '', docLicense: '',
}

const COST_PRESETS = ['רישיון', 'טסט', 'ביטוח', 'טיפול', 'אחר']

function AlertDot({ date, doneKey, item }) {
  if (!date) return null
  const diff = differenceInDays(parseISO(date), new Date())
  if (item[doneKey]) return <span className="text-green-500 text-xs" aria-label="טופל">✓</span>
  if (diff < 0) return <span className="text-red-600 text-xs font-bold" aria-label="פג תוקף">פג!</span>
  if (diff <= 7) return <span className="text-red-500 text-xs" aria-label="פג תוקף בשבוע הקרוב"><span aria-hidden="true">🔴</span></span>
  if (diff <= 14) return <span className="text-orange-500 text-xs" aria-label="פג תוקף בשבועיים הקרובים"><span aria-hidden="true">🟠</span></span>
  return null
}

function DocLink({ url, label }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="text-blue-500 text-xs underline mr-1 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
      aria-label={`פתח מסמך${label ? ` - ${label}` : ''}`}
      onClick={e => e.stopPropagation()}>
      <span aria-hidden="true">📄</span>
    </a>
  )
}

function DocField({ label, fieldId, value, onChange }) {
  return (
    <div className="mt-2">
      <label htmlFor={fieldId} className="text-xs text-gray-500">{label} - קישור למסמך</label>
      <div className="flex gap-2 mt-0.5">
        <input
          id={fieldId}
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="הדבק קישור מגוגל דרייב..."
          className="flex-1 border rounded-lg px-2 py-1.5 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
          dir="ltr"
        />
        {value && (
          <a href={value} target="_blank" rel="noopener noreferrer"
            aria-label={`פתח ${label}`}
            className="bg-blue-50 text-blue-600 border border-blue-200 px-3 rounded-lg text-sm flex items-center focus:ring-2 focus:ring-blue-500 focus:outline-none">
            פתח
          </a>
        )}
      </div>
    </div>
  )
}

export default function VehiclesPage() {
  const { data, updateSection } = useData()
  const { isAdmin } = useAuth()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_VEHICLE)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const openId = searchParams.get('open')
    if (openId && data.vehicles.length > 0) {
      const v = data.vehicles.find(v => v.id === openId)
      if (v) { setForm({ ...EMPTY_VEHICLE, ...v }); setEditing(v.id) }
    }
  }, [searchParams, data.vehicles])

  function openNew() {
    setForm({ ...EMPTY_VEHICLE, id: Date.now().toString() })
    setEditing('new')
  }

  function openEdit(v) { setForm({ ...EMPTY_VEHICLE, ...v }); setEditing(v.id) }
  function closeForm() { setEditing(null); setForm(EMPTY_VEHICLE) }

  function save() {
    if (!form.name.trim() || !form.plate.trim()) return toast.error('נדרש שם ולוחית רישוי')
    const list = editing === 'new'
      ? [...data.vehicles, form]
      : data.vehicles.map(v => v.id === editing ? form : v)
    updateSection('vehicles', list)
    toast.success('נשמר בהצלחה')
    closeForm()
  }

  function remove(id) {
    if (!confirm('למחוק רכב זה?')) return
    updateSection('vehicles', data.vehicles.filter(v => v.id !== id))
    toast.success('נמחק')
  }

  function openCalendar(date, label) {
    if (!date) return
    const d = parseISO(date)
    const title = encodeURIComponent(`WHEEL BILL - ${label}`)
    const dateStr = format(d, 'yyyyMMdd')
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}`, '_blank')
  }

  const f = form
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/settings" className="text-blue-600 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none rounded">→ חזרה</Link>
        <h1 className="text-xl font-bold text-gray-800"><span aria-hidden="true">🚗</span> כרטיסיות רכבים</h1>
        <button onClick={openNew} className="mr-auto bg-blue-700 text-white text-sm px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none">+ הוסף</button>
      </div>

      {data.vehicles.length === 0 && <div className="text-center text-gray-500 py-10">אין רכבים עדיין</div>}

      <div className="space-y-3">
        {data.vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-2xl shadow px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800">{v.name}</span>
                <span className="mr-2 text-sm text-gray-600">{v.plate}</span>
                <DocLink url={v.docLicense} label="רישיון" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(v)} aria-label={`ערוך רכב ${v.name}`} className="text-blue-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none rounded px-1">עריכה</button>
                <button onClick={() => remove(v.id, v.name)} aria-label={`מחק רכב ${v.name}`} className="text-red-400 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none rounded px-1">מחק</button>
              </div>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-600 flex-wrap">
              {v.kmPerLiter && <span><span aria-hidden="true">⛽</span> {v.kmPerLiter} ק"מ/ליטר</span>}
              {v.testDate && (
                <span className="flex items-center gap-1">
                  טסט: {format(parseISO(v.testDate), 'dd/MM/yy')}
                  <AlertDot date={v.testDate} doneKey="testDone" item={v} />
                  <DocLink url={v.docTest} label="טסט" />
                </span>
              )}
              {v.insuranceDate && (
                <span className="flex items-center gap-1">
                  ביטוח: {format(parseISO(v.insuranceDate), 'dd/MM/yy')}
                  <AlertDot date={v.insuranceDate} doneKey="insuranceDone" item={v} />
                  <DocLink url={v.docInsurance} label="ביטוח" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={closeForm} role="dialog" aria-modal="true" aria-label={editing === 'new' ? 'הוספת רכב חדש' : 'עריכת רכב'}>
          <div className="bg-white w-full rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto pb-safe" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{editing === 'new' ? 'רכב חדש' : 'עריכת רכב'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="v-name" className="text-sm text-gray-600">שם הרכב *</label>
                  <input id="v-name" value={f.name} onChange={e => set('name', e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="v-plate" className="text-sm text-gray-600">לוחית רישוי *</label>
                  <input id="v-plate" value={f.plate} onChange={e => set('plate', e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label htmlFor="v-kpl" className="text-sm text-gray-600">ק"מ ממוצע לליטר</label>
                <input id="v-kpl" type="number" value={f.kmPerLiter} onChange={e => set('kmPerLiter', e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="לדוג' 8.5" />
              </div>

              {/* רישיון */}
              <div className="border rounded-xl p-3 space-y-1">
                <label htmlFor="v-licenseDate" className="text-sm font-medium text-gray-700">רישיון רכב</label>
                {f.licenseDate && <p className="text-xs text-gray-600">תאריך: {format(parseISO(f.licenseDate), 'dd/MM/yyyy')}</p>}
                <input id="v-licenseDate" type="date" value={f.licenseDate} onChange={e => set('licenseDate', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <DocField label="רישיון" fieldId="v-docLicense" value={f.docLicense || ''} onChange={v => set('docLicense', v)} />
              </div>

              {/* טסט */}
              <div className="border rounded-xl p-3 space-y-1">
                <label htmlFor="v-testDate" className="text-sm font-medium text-gray-700">טסט</label>
                <input id="v-testDate" type="date" value={f.testDate} onChange={e => set('testDate', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                {f.testDate && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="testDone" checked={f.testDone} onChange={e => set('testDone', e.target.checked)} className="focus:ring-2 focus:ring-blue-500" />
                    <label htmlFor="testDone" className="text-xs text-gray-600">טופל</label>
                    <button onClick={() => openCalendar(f.testDate, `טסט - ${f.name}`)} aria-label="הוסף תאריך טסט לגוגל קאלנדר" className="text-xs text-blue-500 mr-auto focus:ring-2 focus:ring-blue-500 focus:outline-none rounded px-1"><span aria-hidden="true">📅</span> יומן</button>
                  </div>
                )}
                <DocField label="אישור טסט" fieldId="v-docTest" value={f.docTest || ''} onChange={v => set('docTest', v)} />
              </div>

              {/* ביטוח */}
              <div className="border rounded-xl p-3 space-y-1">
                <label htmlFor="v-insuranceDate" className="text-sm font-medium text-gray-700">ביטוח</label>
                <input id="v-insuranceDate" type="date" value={f.insuranceDate} onChange={e => set('insuranceDate', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                {f.insuranceDate && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="insDone" checked={f.insuranceDone} onChange={e => set('insuranceDone', e.target.checked)} className="focus:ring-2 focus:ring-blue-500" />
                    <label htmlFor="insDone" className="text-xs text-gray-600">טופל</label>
                    <button onClick={() => openCalendar(f.insuranceDate, `ביטוח - ${f.name}`)} aria-label="הוסף תאריך ביטוח לגוגל קאלנדר" className="text-xs text-blue-500 mr-auto focus:ring-2 focus:ring-blue-500 focus:outline-none rounded px-1"><span aria-hidden="true">📅</span> יומן</button>
                  </div>
                )}
                <DocField label="פוליסת ביטוח" fieldId="v-docInsurance" value={f.docInsurance || ''} onChange={v => set('docInsurance', v)} />
              </div>

              {/* עלויות - רק מנהל */}
              {isAdmin && (
                <div className="bg-yellow-100 border border-yellow-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-yellow-800 mb-2"><span aria-hidden="true">🔒</span> עלויות - מנהל בלבד</p>
                  <div className="space-y-2">
                    {(f.costs || []).map((cost, i) => (
                      <div key={cost.id} className="flex gap-2 items-center">
                        <input
                          list={`cost-presets-v-${i}`}
                          value={cost.label}
                          aria-label={`סוג עלות ${i + 1}`}
                          onChange={e => {
                            const updated = [...f.costs]
                            updated[i] = { ...updated[i], label: e.target.value }
                            set('costs', updated)
                          }}
                          placeholder="סוג עלות"
                          className="flex-1 border rounded-lg px-2 py-1.5 text-right text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <datalist id={`cost-presets-v-${i}`}>
                          {COST_PRESETS.map(p => <option key={p} value={p} />)}
                        </datalist>
                        <input
                          type="number"
                          value={cost.amount}
                          aria-label={`סכום עלות ${i + 1} בשקלים`}
                          onChange={e => {
                            const updated = [...f.costs]
                            updated[i] = { ...updated[i], amount: e.target.value }
                            set('costs', updated)
                          }}
                          placeholder="₪"
                          className="w-24 border rounded-lg px-2 py-1.5 text-right text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => set('costs', f.costs.filter((_, j) => j !== i))}
                          aria-label={`הסר עלות ${cost.label || i + 1}`}
                          className="text-red-400 text-lg px-1 focus:ring-2 focus:ring-red-400 focus:outline-none rounded">×</button>
                      </div>
                    ))}
                    <button
                      onClick={() => set('costs', [...(f.costs || []), { id: Date.now().toString(), label: '', amount: '' }])}
                      className="text-blue-600 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded px-1">+ הוסף עלות</button>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="v-notes" className="text-sm text-gray-600">הערות</label>
                <textarea id="v-notes" value={f.notes} onChange={e => set('notes', e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 mt-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} />
              </div>
            </div>
            <div className="flex gap-3 mt-5 sticky bottom-0 bg-white pt-3 pb-2 border-t border-gray-100">
              <button onClick={save} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-semibold focus:ring-2 focus:ring-blue-300 focus:outline-none">שמור</button>
              <button onClick={closeForm} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl focus:ring-2 focus:ring-gray-400 focus:outline-none">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
