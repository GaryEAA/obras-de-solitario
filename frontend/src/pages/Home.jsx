import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../api/obras'

export default function Home() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats().then((res) => setStats(res.data))
  }, [])

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 border-b border-line">
        <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist mb-4">
          Archivo no oficial
        </p>
        <h1 className="font-display font-bold text-5xl sm:text-6xl mb-5 leading-tight">
          Toda la discografía<br />
          <span className="text-side-artist">de Solitario</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-10 font-body leading-relaxed">
          Obras publicadas, eliminadas y recuperadas — incluyendo instrumentales
          rescatadas de VK, SoundCloud y otras fuentes.
        </p>
        <Link
          to="/catalogo"
          className="border border-side-artist text-side-artist hover:bg-side-artist hover:text-paper font-mono text-sm uppercase tracking-widest px-8 py-3 rounded-full transition-colors"
        >
          Ver catálogo completo
        </Link>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="col-span-4 text-center">
            <span className="font-mono text-[11px] uppercase tracking-widest text-gray-600">
              Cargando estadísticas...
            </span>
          </div>
        )}
      </section>

      {/* CTA recuperación */}
      <section className="border-t border-line px-6 py-20 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-side-prod mb-3">
          Proyecto de preservación
        </p>
        <h2 className="font-display font-bold text-3xl mb-3">Progreso de recuperación</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Seguimiento de las obras eliminadas que se están recuperando.
        </p>
        <Link
          to="/recuperacion"
          className="border border-side-prod text-side-prod hover:bg-side-prod hover:text-paper font-mono text-sm uppercase tracking-widest px-8 py-3 rounded-full transition-colors"
        >
          Ver progreso
        </Link>
      </section>

    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-6 text-center hover:border-side-artist/40 transition-colors">
      <p className="text-4xl font-display font-bold text-side-artist mb-1">{value}</p>
      <p className="text-xs font-mono uppercase tracking-widest text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  )
}