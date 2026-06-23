import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../api/obras'

export default function Home() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats().then((res) => setStats(res.data))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 border-b border-gray-800">
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-4">
          Archivo no oficial
        </p>
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          Toda la discografía de <br />
          <span className="text-purple-400">Solitario</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-8">
          Obras publicadas, eliminadas y recuperadas — incluyendo instrumentales
          rescatadas de plataformas como VK y SoundCloud.
        </p>
        <Link
          to="/catalogo"
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Ver catálogo completo
        </Link>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats ? (
          <>
            <StatCard label="Total de obras" value={stats.total} />
            <StatCard label="Obras completas" value={stats.completas} />
            <StatCard
              label="Obras eliminadas"
              value={stats.eliminadas}
              sub={`${stats.pct_eliminadas}% del total`}
            />
            <StatCard
              label="Instrumentales recuperadas"
              value={stats.con_instrumental}
              sub={`${stats.pct_instrumental_recuperada}% de eliminadas`}
            />
          </>
        ) : (
          <p className="text-gray-500 col-span-4 text-center">Cargando estadísticas...</p>
        )}
      </section>

      {/* CTA recuperación */}
      <section className="border-t border-gray-800 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Progreso de recuperación</h2>
        <p className="text-gray-400 mb-6">
          Seguimiento de las obras eliminadas que se están recuperando.
        </p>
        <Link
          to="/recuperacion"
          className="border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Ver progreso
        </Link>
      </section>

    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
      <p className="text-4xl font-bold text-purple-400 mb-1">{value}</p>
      <p className="text-sm text-gray-300 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}