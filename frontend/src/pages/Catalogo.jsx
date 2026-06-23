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
  if (fecha.includes('00:00:00')) {
      return fecha.split(' ')[0]
  }
  return fecha
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10 max-w-7xl mx-auto">

      <h1 className="text-3xl font-bold mb-2">Catálogo de obras</h1>
      <p className="text-gray-400 mb-8">Toda la discografía de Solitario en un solo lugar.</p>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Buscar por nombre, feat, beat..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-72"
        />
        <Select value={filtroEliminada} onChange={setFiltroEliminada} label="Estado">
          <option value="">Todas</option>
          <option value="true">Eliminadas</option>
          <option value="false">Disponibles</option>
        </Select>
        <Select value={filtroCompleta} onChange={setFiltroCompleta} label="Completa">
          <option value="">Todas</option>
          <option value="true">Completas</option>
          <option value="false">Incompletas</option>
        </Select>
        <Select value={filtroInstrumental} onChange={setFiltroInstrumental} label="Instrumental">
          <option value="">Todas</option>
          <option value="true">Con instrumental</option>
          <option value="false">Sin instrumental</option>
        </Select>
        <button
          onClick={() => {
            setBusqueda('')
            setFiltroEliminada('')
            setFiltroCompleta('')
            setFiltroInstrumental('')
          }}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg px-4 py-2 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Contador */}
      <p className="text-gray-500 text-sm mb-4">{obras.length} obras encontradas</p>

      {/* Tabla */}
      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
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
              {obras.map((obra, i) => (
                <tr
                  key={obra.id}
                  className={`border-t border-gray-800 hover:bg-gray-900 transition-colors ${
                    obra.eliminada ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-white">{obra.nombre}</td>
                  <td className="px-4 py-3 text-gray-400">{obra.feat && obra.feat !== '-' ? obra.feat : '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{obra.canal || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{limpiarFecha(obra.fecha_obra)}</td>
                  <td className="px-4 py-3 text-center">{obra.completa ? '✅' : '❌'}</td>
                  <td className="px-4 py-3 text-center">{obra.eliminada ? '🗑️' : '—'}</td>
                  <td className="px-4 py-3 text-center">{obra.tiene_instrumental ? '🎵' : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      to={`/obras/${obra.id}`}
                      className="text-purple-400 hover:text-purple-300 font-medium"
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
  )
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
    >
      {children}
    </select>
  )
}