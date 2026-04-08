import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// משתמשים מוגדרים - בעתיד ניתן להעביר ל-Google Drive
const USERS = {
  admin: { password: 'admin123', role: 'admin', company: 'החברה שלי' },
  driver: { password: 'driver123', role: 'viewer', company: 'החברה שלי' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('wb_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
    setLoading(false)
  }, [])

  function login(username, password) {
    const found = USERS[username.toLowerCase()]
    if (!found || found.password !== password) {
      return { success: false, error: 'שם משתמש או סיסמא שגויים' }
    }
    const userData = { username, role: found.role, company: found.company }
    setUser(userData)
    localStorage.setItem('wb_user', JSON.stringify(userData))
    return { success: true }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('wb_user')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
