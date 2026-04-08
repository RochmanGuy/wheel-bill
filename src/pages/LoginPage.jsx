import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) return
    setLoading(true)
    const result = login(username, password)
    if (!result.success) {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-3">🚛</div>
        <h1 className="text-white text-3xl font-bold tracking-widest">WHEEL BILL</h1>
        <p className="text-blue-300 text-sm mt-1">ניהול צי רכבים</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-gray-700 text-xl font-semibold mb-5 text-center">כניסה למערכת</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">שם משתמש</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="הכנס שם משתמש"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">סיסמא</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="הכנס סיסמא"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition mt-1"
          >
            {loading ? 'נכנס...' : 'כניסה'}
          </button>
        </form>
      </div>

      <p className="text-blue-400 text-xs mt-6">WHEEL BILL v1.0</p>
    </div>
  )
}
