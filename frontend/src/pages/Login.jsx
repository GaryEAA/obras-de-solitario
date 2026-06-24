import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(username, password)
      localStorage.setItem('token', data.access_token)
      navigate('/admin')
    } catch {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist mb-2">
            Acceso restringido
          </p>
          <h1 className="font-display font-bold text-3xl text-paper">Panel Admin</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">ObrasDeSolitario</p>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors"
                required
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors"
                required
              />
            </div>

            {error && (
              <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-side-artist hover:bg-side-artist/80 disabled:opacity-50 text-paper font-mono text-sm uppercase tracking-widest py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}