import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getObras } from '../api/obras'

export default function Catalogo() {
  const [obras, setObras] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEliminada, setFiltroEliminada] = useState('')
  const [filtroCompleta, setFiltroCompleta] = useState('')
  const [filtroInstrumental, setFiltroInstrumental] = useState('')

  useEffect(() => {
    cargarObras()
  }, [busqueda, filtroEliminada, filtroCompleta, filtroInstrumental])

  const cargarObras = async () => {
    setLoading(true)
    const params = {}
    if (busqueda) params.busqueda = busqueda
    if (filtroEliminada !== '') params.eliminada = filtroEliminada
    if (filtroCompleta !== '') params.completa = filtroCompleta
    if (filtroInstrumental !== '') params.tiene_instrumental = filtroInstrumental
    params.limit = 300
    const res = await getObras(params)
    setObras(res.data)
    setLoading(false)
  }

  const limpiarFecha = (fecha) => {
    if (!fecha) return '—'
    if (fecha.includes('00:00:00')) return fecha.split(' ')[0]
    return fecha
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroEliminada('')
    setFiltroCompleta('')
    setFiltroInstrumental('')
  }

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10 border-b border-line pb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist mb-2">
            Discografía completa
          </p>
          <h1 className="font-display font-bold text-4xl text-paper">Catálogo de obras</h1>
          <p className="text-gray-500 text-sm mt-2">Toda la discografía de Solitario en un solo lugar.</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, feat, beat..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-surface border border-line rounded-lg px-4 py-2 text-sm text-paper placeholder-gray-600 focus:outline-none focus:border-side-artist transition-colors w-72 font-body"
          />
          <Select value={filtroEliminada} onChange={setFiltroEliminada}>
            <option value="">Todas</option>
            <option value="false">Disponibles</option>
            <option value="true">Eliminadas</option>
          </Select>
          <Select value={filtroCompleta} onChange={setFiltroCompleta}>
            <option value="">Completa: todas</option>
            <option value="true">Completas</option>
            <option value="false">Incompletas</option>
          </Select>
          <Select value={filtroInstrumental} onChange={setFiltroInstrumental}>
            <option value="">Instrumental: todas</option>
            <option value="true">Con instrumental</option>
            <option value="false">Sin instrumental</option>
          </Select>
          <button
            onClick={limpiarFiltros}
            className="font-mono text-[11px] uppercase tracking-widest text-gray-500 hover:text-paper border border-line rounded-lg px-4 py-2 transition-colors"
          >
            Limpiar
          </button>
        </div>

        {/* Contador */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-gray-600 mb-4">
          {obras.length} obras encontradas
        </p>

        {/* Tabla */}
        {loading ? (
          <div className="flex items-center gap-3 text-side-artist font-mono text-sm tracking-widest uppercase py-10">
            <span className="w-2 h-2 rounded-full bg-side-artist animate-pulse" />
            Cargando obras...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-surface text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Feat</th>
                  <th className="px-4 py-3 text-left">Canal</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-center">Completa</th>
                  <th className="px-4 py-3 text-center">Eliminada</th>
                  <th className="px-4 py-3 text-center">Instrumental</th>
                  <th className="px-4 py-3 text-center">Ver</th>
                </tr>
              </thead>
              <tbody>
                {obras.map((obra) => (
                  <tr
                    key={obra.id}
                    className={`border-t border-line hover:bg-surface transition-colors ${
                      obra.eliminada ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-paper">{obra.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {obra.feat && obra.feat !== '-' ? obra.feat : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{obra.canal || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs whitespace-nowrap">
                      {limpiarFecha(obra.fecha_obra)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {obra.completa
                        ? <span className="text-green-500 font-mono text-xs">✓</span>
                        : <span className="text-gray-700 font-mono text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {obra.eliminada
                        ? <span className="text-side-artist font-mono text-xs">✓</span>
                        : <span className="text-gray-700 font-mono text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {obra.tiene_instrumental
                        ? <span className="text-side-prod font-mono text-xs">✓</span>
                        : <span className="text-gray-700 font-mono text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/obras/${obra.id}`}
                        className="font-mono text-[10px] uppercase tracking-widest text-side-artist hover:text-paper transition-colors"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface border border-line rounded-lg px-4 py-2 text-sm text-paper font-mono focus:outline-none focus:border-side-artist transition-colors"
    >
      {children}
    </select>
  )
}