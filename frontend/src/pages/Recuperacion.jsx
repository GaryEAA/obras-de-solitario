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
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  )

  const conAudio = eliminadas.filter((o) => o.tiene_audio)
  const conInstrumental = eliminadas.filter((o) => o.tiene_instrumental)
  const conVideo = eliminadas.filter((o) => o.youtube_id_obra)
  const sinNada = eliminadas.filter((o) => !o.tiene_audio && !o.youtube_id_obra)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Proyecto de preservación
          </p>
          <h1 className="text-4xl font-bold mb-3">Recuperación de obras</h1>
          <p className="text-gray-400 max-w-2xl">
            Seguimiento del estado de recuperación de las obras eliminadas del canal de Solitario.
            Algunas han sido rescatadas desde VK, SoundCloud y otras fuentes alternativas.
          </p>
        </div>

        {/* Barra de progreso general */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold">Progreso general de recuperación</p>
            <p className="text-purple-400 font-bold text-lg">
              {stats.pct_instrumental_recuperada}%
            </p>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
            <div
              className="bg-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${stats.pct_instrumental_recuperada}%` }}
            />
          </div>
          <p className="text-gray-500 text-sm">
            {stats.con_instrumental} de {stats.eliminadas} obras eliminadas con instrumental recuperada
          </p>
        </div>

        {/* Stats de recuperación */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            value={stats.eliminadas}
            label="Total eliminadas"
            color="text-red-400"
          />
          <StatCard
            value={conVideo.length}
            label="Con video rescatado"
            color="text-blue-400"
          />
          <StatCard
            value={conAudio.length}
            label="Con audio recuperado"
            color="text-yellow-400"
          />
          <StatCard
            value={conInstrumental.length}
            label="Con instrumental"
            color="text-purple-400"
          />
        </div>

        {/* Lista de obras eliminadas */}
        <h2 className="text-xl font-bold mb-4">Estado por obra</h2>
        <div className="space-y-3">
          {eliminadas.map((obra) => {
            const tieneVideo = !!obra.youtube_id_obra
            const tieneInstrumental = obra.tiene_instrumental
            const tieneAudio = obra.tiene_audio

            let estado = 'Sin recuperar'
            let colorEstado = 'text-red-400'
            if (tieneVideo && tieneInstrumental) {
              estado = 'Recuperada completa'
              colorEstado = 'text-green-400'
            } else if (tieneVideo || tieneAudio) {
              estado = 'Parcialmente recuperada'
              colorEstado = 'text-yellow-400'
            } else if (tieneInstrumental) {
              estado = 'Solo instrumental'
              colorEstado = 'text-purple-400'
            }

            return (
              <div
                key={obra.id}
                className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{obra.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{obra.fecha_obra || 'Sin fecha'}</p>
                </div>
                <div className="flex gap-3 text-xs shrink-0">
                  <Badge active={tieneVideo} label="Video" />
                  <Badge active={tieneAudio} label="Audio" />
                  <Badge active={tieneInstrumental} label="Beat" />
                </div>
                <p className={`text-xs font-semibold shrink-0 ${colorEstado}`}>
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
      <p className={`text-3xl font-bold mb-1 ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}

function Badge({ active, label }) {
  return (
    <span className={`px-2 py-1 rounded-full font-semibold ${
      active
        ? 'bg-purple-900 text-purple-300'
        : 'bg-gray-800 text-gray-600'
    }`}>
      {label}
    </span>
  )
}