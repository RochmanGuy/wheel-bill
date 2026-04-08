import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext(null)

// מפתח אחסון localStorage - בהמשך ניתן להחליף ב-Google Drive API
const STORAGE_KEY = 'wb_data'

const DEFAULT_DATA = {
  drivers: [],
  vehicles: [],
  trailers: [],
  dieselPrices: [],
  events: [],
}

export function DataProvider({ children }) {
  const [data, setData] = useState(DEFAULT_DATA)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { setData({ ...DEFAULT_DATA, ...JSON.parse(saved) }) } catch {}
    }
  }, [])

  function save(newData) {
    setData(newData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
  }

  function updateSection(section, items) {
    const updated = { ...data, [section]: items }
    save(updated)
  }

  // מחיר סולר - מחזיר המחיר הרלוונטי לתאריך נתון
  function getDieselPriceForDate(date) {
    const sorted = [...data.dieselPrices].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )
    const target = new Date(date)
    const found = sorted.find(p => new Date(p.date) <= target)
    return found || sorted[sorted.length - 1] || null
  }

  return (
    <DataContext.Provider value={{ data, updateSection, getDieselPriceForDate }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
