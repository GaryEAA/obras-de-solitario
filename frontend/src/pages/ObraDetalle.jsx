import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getObra } from '../api/obras'

export default function ObraDetalle() {
  const { id } = useParams()
  const [obra, setObra] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getObra(id).then((res) => {
      setObra(res.data)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-500">Cargando obra...</p>
    </div>
  )

  if (!obra) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-500">Obra no encontrada.</p>
    </div>
  )

  const limpiarFecha = (fecha) => {
    if (!fecha) return '—'
    if (fecha.includes('00:00:00')) return fecha.split(' ')[0]
    return fecha
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Volver */}
        <Link to="/catalogo" className="text-purple-400 hover:text-purple-300 text-sm mb-6 inline-block">
          ← Volver al catálogo
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {obra.eliminada && (
              <span className="bg-red-900 text-red-300 text-xs font-semibold px-3 py-1 rounded-full">
                🗑️ Eliminada
              </span>
            )}
            {obra.completa && (
              <span className="bg-green-900 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                ✅ Completa
              </span>
            )}
            {obra.tiene_instrumental && (
              <span className="bg-purple-900 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full">
                🎵 Instrumental recuperada
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">{obra.nombre}</h1>
          {obra.feat && obra.feat !== '-' && (
            <p className="text-gray-400 text-lg">feat. {obra.feat}</p>
          )}
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <InfoCard label="Canal" value={obra.canal || '—'} />
          <InfoCard label="Fecha obra" value={limpiarFecha(obra.fecha_obra)} />
          <InfoCard label="Autor del beat" value={obra.autor_beat || '—'} />
          <InfoCard label="Beat original" value={obra.beat_original || '—'} />
        </div>

        {/* Observación */}
        {obra.observacion && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-10">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Observación</p>
            <p className="text-gray-300 text-sm">{obra.observacion}</p>
          </div>
        )}

        {/* Embeds YouTube */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {obra.youtube_id_obra ? (
            <div>
              <p className="text-sm text-gray-400 uppercase font-semibold mb-3">🎤 Obra</p>
              <div className="aspect-video rounded-xl overflow-hidden border border-gray-800">
                <iframe
                  src={`https://www.youtube.com/embed/${obra.youtube_id_obra}`}
                  title={obra.nombre}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              {obra.link_obra && (
                <a href={obra.link_obra} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block">
                  Ver en YouTube →
                </a>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl aspect-video flex items-center justify-center">
              <p className="text-gray-600 text-sm">Sin video disponible</p>
            </div>
          )}

          {obra.youtube_id_beat ? (
            <div>
              <p className="text-sm text-gray-400 uppercase font-semibold mb-3">🎵 Instrumental / Beat</p>
              <div className="aspect-video rounded-xl overflow-hidden border border-gray-800">
                <iframe
                  src={`https://www.youtube.com/embed/${obra.youtube_id_beat}`}
                  title={`Beat - ${obra.nombre}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              {obra.link_beat && (
                <a href={obra.link_beat} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block">
                  Ver en YouTube →
                </a>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl aspect-video flex items-center justify-center">
              <p className="text-gray-600 text-sm">
                {obra.link_beat ? '🔗 Beat en plataforma externa' : 'Sin beat disponible'}
              </p>
              {obra.link_beat && (
                <a href={obra.link_beat} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 mt-1 block text-center">
                  Abrir enlace →
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{label}</p>
      <p className="text-white text-sm">{value}</p>
    </div>
  )
}