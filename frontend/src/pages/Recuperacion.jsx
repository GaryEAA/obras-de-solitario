import { useEffect, useState } from 'react'
import { getObras, getStats } from '../api/obras'

export default function Recuperacion() {
  const [stats, setStats] = useState(null)
  const [eliminadas, setEliminadas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getStats(),
      getObras({ eliminada: true, limit: 300 })
    ]).then(([statsRes, obrasRes]) => {
      setStats(statsRes.data)
      setEliminadas(obrasRes.data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
      <div className="flex items-center gap-3 text-side-artist font-mono text-sm tracking-widest uppercase">
        <span className="w-2 h-2 rounded-full bg-side-artist animate-pulse" />
        Cargando...
      </div>
    </div>
  )

  const conAudio = eliminadas.filter((o) => o.tiene_audio)
  const conInstrumental = eliminadas.filter((o) => o.tiene_instrumental)
  const conVideo = eliminadas.filter((o) => o.youtube_id_obra)

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10 border-b border-line pb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist mb-2">
            Proyecto de preservación
          </p>
          <h1 className="font-display font-bold text-4xl text-paper mb-3">
            Recuperación de obras
          </h1>
          <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
            Seguimiento del estado de recuperación de las obras eliminadas del canal de Solitario.
            Algunas han sido rescatadas desde VK, SoundCloud y otras fuentes alternativas.
          </p>
        </div>

        {/* Barra de progreso general */}
        <div className="bg-surface border border-line rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-400">
              Progreso general
            </p>
            <p className="font-display font-bold text-2xl text-side-artist">
              {stats.pct_instrumental_recuperada}%
            </p>
          </div>
          <div className="w-full bg-surface-raised rounded-full h-2 mb-3">
            <div
              className="bg-side-artist h-2 rounded-full transition-all"
              style={{ width: `${stats.pct_instrumental_recuperada}%` }}
            />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
            {stats.con_instrumental} de {stats.eliminadas} obras eliminadas con instrumental recuperada
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard value={stats.eliminadas} label="Total eliminadas" color="text-side-artist" />
          <StatCard value={conVideo.length} label="Con video rescatado" color="text-side-prod" />
          <StatCard value={conAudio.length} label="Con audio recuperado" color="text-yellow-500" />
          <StatCard value={conInstrumental.length} label="Con instrumental" color="text-green-500" />
        </div>

        {/* Lista */}
        <div className="mb-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-gray-500">
            Estado por obra
          </h2>
        </div>

        <div className="space-y-2">
          {eliminadas.map((obra) => {
            const tieneVideo = !!obra.youtube_id_obra
            const tieneInstrumental = obra.tiene_instrumental
            const tieneAudio = obra.tiene_audio

            let estado = 'Sin recuperar'
            let colorEstado = 'text-gray-600'
            if (tieneVideo && tieneInstrumental) {
              estado = 'Recuperada completa'
              colorEstado = 'text-green-500'
            } else if (tieneVideo || tieneAudio) {
              estado = 'Parcialmente recuperada'
              colorEstado = 'text-yellow-500'
            } else if (tieneInstrumental) {
              estado = 'Solo instrumental'
              colorEstado = 'text-side-prod'
            }

            return (
              <div
                key={obra.id}
                className="bg-surface border border-line rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:border-side-artist/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-paper truncate">{obra.nombre}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-0.5">
                    {obra.fecha_obra || 'Sin fecha'}
                  </p>
                </div>
                <div className="flex gap-2 text-xs shrink-0">
                  <Badge active={tieneVideo} label="Video" />
                  <Badge active={tieneAudio} label="Audio" />
                  <Badge active={tieneInstrumental} label="Beat" />
                </div>
                <p className={`font-mono text-[10px] uppercase tracking-widest shrink-0 ${colorEstado}`}>
                  {estado}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

function StatCard({ value, label, color }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-5 text-center hover:border-side-artist/30 transition-colors">
      <p className={`font-display font-bold text-3xl mb-1 ${color}`}>{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">{label}</p>
    </div>
  )
}

function Badge({ active, label }) {
  return (
    <span className={`px-2 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest border ${
      active
        ? 'border-side-artist/40 text-side-artist bg-side-artist-dim/20'
        : 'border-line text-gray-700'
    }`}>
      {label}
    </span>
  )
}