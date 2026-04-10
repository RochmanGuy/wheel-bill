import { useState } from 'react'
import { useData } from '../../context/DataContext'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const LICENSE_TYPES = ['B', 'C', 'C1', 'D', 'D1', 'E', 'A', 'A1', 'A2']

const EMPTY_DRIVER = { id: '', name: '', phone: '', licenses: [], notes: '' }

export default function DriversPage() {
  const { data, updateSection } = useData()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_DRIVER)

  function openNew() {
    setForm({ ...EMPTY_DRIVER, id: Date.now().toString() })
    setEditing('new')
  }

  function openEdit(driver) {
    setForm({ ...driver })
    setEditing(driver.id)
  }

  function closeForm() {
    setEditing(null)
    setForm(EMPTY_DRIVER)
  }

  function toggleLicense(lic) {
    setForm(f => ({
      ...f,
      licenses: f.licenses.includes(lic) ? f.licenses.filter(l => l !== lic) : [...f.licenses, lic]
    }))
  }

  function save() {
    if (!form.name.trim()) return toast.error('נדרש שם נהג')
    const list = editing === 'new'
      ? [...data.drivers, form]
      : data.drivers.map(d => d.id === editing ? form : d)
    updateSection('drivers', list)
    toast.success('נשמר בהצלחה')
    closeForm()
  }

  function remove(id) {
    if (!confirm('למחוק נהג זה?')) return
    updateSection('drivers', data.drivers.filter(d => d.id !== id))
    toast.success('נמחק')
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/settings" className="text-blue-600 text-sm">← חזרה</Link>
        <h1 className="text-xl font-bold text-gray-800">👤 נהגים</h1>
        <button onClick={openNew} className="mr-auto bg-blue-700 text-white text-sm px-4 py-2 rounded-xl">+ הוסף</button>
      </div>

      {data.drivers.length === 0 && (
        <div className="text-center text-gray-400 py-10">אין נהגים עדיין</div>
      )}

      <div className="space-y-3">
        {data.drivers.map(driver => (
          <div key={driver.id} className="bg-white rounded-2xl shadow px-4 py-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-semibold text-gray-800">{driver.name}</div>
              <div className="text-xs text-gray-500">{driver.phone}</div>
              {driver.licenses.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {driver.licenses.map(l => (
                    <span key={l} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => openEdit(driver)} className="text-blue-500 text-sm px-2">עריכה</button>
            <button onClick={() => remove(driver.id)} className="text-red-400 text-sm px-2">מחק</button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={closeForm}>
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto pb-safe" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{editing === 'new' ? 'נהג חדש' : 'עריכת נהג'}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">שם מלא *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-xl px-3 py-2 mt-1 text-right" placeholder="שם הנהג" />
              </div>
              <div>
                <label className="text-sm text-gray-600">טלפון</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border rounded-xl px-3 py-2 mt-1 text-right" placeholder="050-0000000" type="tel" />
              </div>
              <div>
                <label className="text-sm text-gray-600">סוגי רישיון</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LICENSE_TYPES.map(l => (
                    <button key={l} onClick={() => toggleLicense(l)}
                      className={`px-3 py-1 rounded-full text-sm border transition
                        ${form.licenses.includes(l) ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-300'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">הערות</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border rounded-xl px-3 py-2 mt-1 text-right" rows={2} />
              </div>
            </div>
            <div className="flex gap-3 mt-5 sticky bottom-0 bg-white pt-3 pb-2 border-t border-gray-100">
              <button onClick={save} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-semibold">שמור</button>
              <button onClick={closeForm} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
