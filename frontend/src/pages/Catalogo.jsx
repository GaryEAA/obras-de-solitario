import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getCatalogo, getBeatmakers } from '../api/obras'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const VIGENTE_OPCIONES = [
  { value: '', label: 'Todas' },
  { value: 'publico', label: 'Públicas' },
  { value: 'oculto', label: 'Ocultas' },
  { value: 'no', label: 'Eliminadas' },
]

const LETRA_OPCIONES = [
  { value: '', label: 'Todas' },
  { value: 'completa', label: 'Completa' },
  { value: 'incompleta', label: 'Incompleta' },
  { value: 'no', label: 'Sin letra' },
]

export default function Catalogo() {
  const [obras, setObras] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [pagina, setPagina] = useState(1)
  const [beatmakers, setBeatmakers] = useState([])
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  const [filtros, setFiltros] = useState({
    busqueda: '',
    obra_vigente: '',
    completa: '',
    tiene_instrumental: '',
    beatmaker_id: '',
    tiene_feat: '',
    letra_estado: '',
    tiene_miniatura: '',
  })

  useEffect(() => {
    getBeatmakers().then((r) => setBeatmakers(r.data))
  }, [])

  useEffect(() => {
    cargar()
  }, [filtros, pagina])

  const cargar = async () => {
    setLoading(true)
    const params = { pagina, por_pagina: 24 }
    if (filtros.busqueda) params.busqueda = filtros.busqueda
    if (filtros.obra_vigente) params.obra_vigente = filtros.obra_vigente
    if (filtros.completa !== '') params.completa = filtros.completa
    if (filtros.tiene_instrumental !== '') params.tiene_instrumental = filtros.tiene_instrumental
    if (filtros.beatmaker_id) params.beatmaker_id = filtros.beatmaker_id
    if (filtros.tiene_feat !== '') params.tiene_feat = filtros.tiene_feat
    if (filtros.letra_estado) params.letra_estado = filtros.letra_estado
    if (filtros.tiene_miniatura !== '') params.tiene_miniatura = filtros.tiene_miniatura
    const res = await getCatalogo(params)
    setObras(res.data.items)
    setTotal(res.data.total)
    setTotalPaginas(res.data.total_paginas)
    setLoading(false)
  }

  const setFiltro = (key, val) => {
    setFiltros((prev) => ({ ...prev, [key]: val }))
    setPagina(1)
  }

  const limpiarFiltros = () => {
    setFiltros({ busqueda: '', obra_vigente: '', completa: '', tiene_instrumental: '', beatmaker_id: '', tiene_feat: '', letra_estado: '', tiene_miniatura: '' })
    setPagina(1)
  }

  const filtrosActivos = Object.values(filtros).some((v) => v !== '')

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8 border-b border-line pb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist mb-2">Discografía completa</p>
          <h1 className="font-display font-bold text-4xl text-paper">Catálogo de obras</h1>
          <p className="text-gray-500 text-sm mt-2">Toda la discografía de Solitario en un solo lugar.</p>
        </div>

        {/* Búsqueda + toggle filtros */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o feat..."
            value={filtros.busqueda}
            onChange={(e) => setFiltro('busqueda', e.target.value)}
            className="flex-1 bg-surface border border-line rounded-lg px-4 py-2 text-sm text-paper placeholder-gray-600 focus:outline-none focus:border-side-artist transition-colors font-body"
          />
          <button
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            className={`font-mono text-[11px] uppercase tracking-widest px-4 py-2 rounded-lg border transition-colors ${
              filtrosActivos
                ? 'border-side-artist text-side-artist'
                : 'border-line text-gray-500 hover:text-paper'
            }`}
          >
            Filtros {filtrosActivos ? '●' : ''}
          </button>
          {filtrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="font-mono text-[11px] uppercase tracking-widest text-gray-600 hover:text-side-artist border border-line px-4 py-2 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Panel de filtros */}
        {filtrosAbiertos && (
          <div className="bg-surface border border-line rounded-xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <FiltroSelect label="Estado" value={filtros.obra_vigente} onChange={(v) => setFiltro('obra_vigente', v)} opciones={VIGENTE_OPCIONES} />
            <FiltroSelect label="Completa" value={filtros.completa} onChange={(v) => setFiltro('completa', v)} opciones={[
              { value: '', label: 'Todas' },
              { value: 'true', label: 'Sí' },
              { value: 'false', label: 'No' },
            ]} />
            <FiltroSelect label="Instrumental" value={filtros.tiene_instrumental} onChange={(v) => setFiltro('tiene_instrumental', v)} opciones={[
              { value: '', label: 'Todas' },
              { value: 'true', label: 'Con instrumental' },
              { value: 'false', label: 'Sin instrumental' },
            ]} />
            <FiltroSelect label="Beatmaker" value={filtros.beatmaker_id} onChange={(v) => setFiltro('beatmaker_id', v)} opciones={[
              { value: '', label: 'Todos' },
              ...beatmakers.map((b) => ({ value: String(b.id), label: b.nombre }))
            ]} />
            <FiltroSelect label="Feat" value={filtros.tiene_feat} onChange={(v) => setFiltro('tiene_feat', v)} opciones={[
              { value: '', label: 'Todas' },
              { value: 'true', label: 'Con feat' },
              { value: 'false', label: 'Sin feat' },
            ]} />
            <FiltroSelect label="Letra" value={filtros.letra_estado} onChange={(v) => setFiltro('letra_estado', v)} opciones={LETRA_OPCIONES} />
            <FiltroSelect label="Miniatura" value={filtros.tiene_miniatura} onChange={(v) => setFiltro('tiene_miniatura', v)} opciones={[
              { value: '', label: 'Todas' },
              { value: 'true', label: 'Con miniatura' },
              { value: 'false', label: 'Sin miniatura' },
            ]} />
          </div>
        )}

        {/* Contador */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-gray-600 mb-6">
          {total} obras · página {pagina} de {totalPaginas}
        </p>

        {/* Grid de cards */}
        {loading ? (
          <div className="flex items-center gap-3 text-side-artist font-mono text-sm tracking-widest uppercase py-20 justify-center">
            <span className="w-2 h-2 rounded-full bg-side-artist animate-pulse" />
            Cargando obras...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
            {obras.map((obra) => (
              <ObraCard key={obra.id} obra={obra} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 pb-10">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="font-mono text-[11px] uppercase tracking-widest px-4 py-2 rounded-lg border border-line text-gray-500 hover:text-paper hover:border-side-artist disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
              let p
              if (totalPaginas <= 5) p = i + 1
              else if (pagina <= 3) p = i + 1
              else if (pagina >= totalPaginas - 2) p = totalPaginas - 4 + i
              else p = pagina - 2 + i
              return (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className={`font-mono text-[11px] w-9 h-9 rounded-lg border transition-colors ${
                    p === pagina
                      ? 'border-side-artist text-side-artist bg-side-artist/10'
                      : 'border-line text-gray-500 hover:text-paper hover:border-gray-500'
                  }`}
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="font-mono text-[11px] uppercase tracking-widest px-4 py-2 rounded-lg border border-line text-gray-500 hover:text-paper hover:border-side-artist disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ObraCard({ obra }) {
  const thumbnail = obra.miniatura_obra
    ? (obra.miniatura_obra.startsWith('http') ? obra.miniatura_obra : `${BACKEND}${obra.miniatura_obra}`)
    : obra.youtube_id_obra
      ? `https://img.youtube.com/vi/${obra.youtube_id_obra}/hqdefault.jpg`
      : null

  const limpiarFecha = (f) => {
    if (!f) return null
    if (f.includes('(') || f.includes('?')) return null
    if (f.includes('00:00:00')) return f.split(' ')[0]
    return f.slice(0, 10)
  }

  const fecha = limpiarFecha(obra.fecha_obra)

  const vigenteBadge = {
    oculto: { label: 'Oculta', color: 'text-yellow-400 border-yellow-700/40' },
    no: { label: 'Eliminada', color: 'text-side-artist border-side-artist/40' },
  }[obra.obra_vigente]

  return (
    <Link to={`/obras/${obra.id}`} className="group block h-full">
      <div className="bg-surface border border-line rounded-2xl overflow-hidden hover:border-side-artist/50 transition-all duration-200 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 h-full flex flex-col">

        {/* Miniatura */}
        <div className="aspect-video bg-surface-raised relative overflow-hidden shrink-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={obra.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gray-700">Sin imagen</span>
            </div>
          )}
          {vigenteBadge && (
            <div className="absolute top-2 left-2">
              <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border bg-ink/80 ${vigenteBadge.color}`}>
                {vigenteBadge.label}
              </span>
            </div>
          )}
          {obra.video_estado && obra.video_estado !== 'no' && (
            <div className="absolute top-2 right-2">
              <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-green-700/40 text-green-400 bg-ink/80">
                ▶ {obra.video_estado}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">

          {/* Artista + feat */}
          <div className="flex items-baseline gap-2 mb-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-side-artist">
              {obra.artista_nombre || 'Solitario'}
            </p>
            {obra.feat && obra.feat !== '-' && (
              <p className="font-mono text-[9px] text-gray-500 truncate">ft. {obra.feat}</p>
            )}
          </div>

          {/* Título */}
          <h3 className="font-display font-bold text-base text-paper leading-tight mb-2 group-hover:text-side-artist transition-colors line-clamp-2">
            {obra.nombre}
          </h3>

          {/* Fecha + Beatmaker */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-gray-600">
              {fecha || 'Sin fecha'}
            </span>
            {obra.beatmaker_nombre && (
              <span className="font-mono text-[10px] text-side-prod truncate ml-2 max-w-30">
                {obra.beatmaker_nombre}
              </span>
            )}
          </div>

          {/* Badges — siempre al fondo */}
          <div className="flex flex-wrap gap-1 mt-auto">
            {obra.completa && <Badge color="green">Completa</Badge>}
            {obra.tiene_instrumental && <Badge color="blue">Instrumental</Badge>}
            {obra.letra_estado && obra.letra_estado !== 'no' && (
              <Badge color="gray">Letra {obra.letra_estado}</Badge>
            )}
            {obra.audio_estado && obra.audio_estado !== 'no' && (
              <Badge color="yellow">Audio {obra.audio_estado}</Badge>
            )}
          </div>

        </div>
      </div>
    </Link>
  )
}

function Badge({ color, children }) {
  const colores = {
    green: 'text-green-400 border-green-800/50',
    blue: 'text-side-prod border-side-prod/30',
    gray: 'text-gray-400 border-line',
    yellow: 'text-yellow-400 border-yellow-800/50',
  }
  return (
    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${colores[color]}`}>
      {children}
    </span>
  )
}

function FiltroSelect({ label, value, onChange, opciones }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-raised border border-line rounded-lg px-3 py-2 text-paper text-xs font-mono focus:outline-none focus:border-side-artist transition-colors"
      >
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}