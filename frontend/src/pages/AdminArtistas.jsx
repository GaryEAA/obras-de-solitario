import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getArtistas, crearArtista, editarArtista, eliminarArtista, getObrasDeArtista } from '../api/obras'

export default function AdminArtistas() {
  const [artistas, setArtistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [editando, setEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)
    const res = await getArtistas()
    setArtistas(res.data)
    setLoading(false)
  }

  const abrirCrear = () => {
    setEditando({ nombre: '', canal_yt: '', otros_canales: '' })
    setModal('crear')
    setMensaje(null)
  }

  const abrirEditar = (a) => {
    setEditando({ ...a })
    setModal('editar')
    setMensaje(null)
  }

  const cerrar = () => { setModal(null); setEditando(null); setMensaje(null) }

  const guardar = async () => {
    setGuardando(true)
    try {
      if (modal === 'crear') await crearArtista(editando)
      else await editarArtista(editando.id, editando)
      cerrar()
      cargar()
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  const [obrasAfectadas, setObrasAfectadas] = useState([])

  const abrirConfirmarEliminar = async (a) => {
    const res = await getObrasDeArtista(a.id)
    setObrasAfectadas(res.data)
    setConfirmarEliminar(a)
  }

  const handleEliminar = async () => {
    try {
      await eliminarArtista(confirmarEliminar.id)
      setConfirmarEliminar(null)
      setObrasAfectadas([])
      cargar()
    } catch {
      alert('Error al eliminar')
      setConfirmarEliminar(null)
    }
  }

  const filtrados = artistas.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8 border-b border-line pb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist mb-2">Admin</p>
            <h1 className="font-display font-bold text-4xl text-paper">Artistas</h1>
            <p className="text-gray-500 text-sm mt-1">{artistas.length} artistas registrados</p>
          </div>
          <button onClick={abrirCrear}
            className="bg-side-artist hover:bg-side-artist/80 text-paper font-mono text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-lg transition-colors">
            + Nuevo
          </button>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <input type="text" placeholder="Buscar artista..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            className="bg-surface border border-line rounded-lg px-4 py-2 text-sm text-paper placeholder-gray-600 focus:outline-none focus:border-side-artist transition-colors w-72 font-body"
          />
        </div>

        {/* Grid de cards */}
        {loading ? (
          <div className="flex items-center gap-3 text-side-artist font-mono text-sm tracking-widest uppercase py-20 justify-center">
            <span className="w-2 h-2 rounded-full bg-side-artist animate-pulse" />
            Cargando...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtrados.map((a) => (
              <div key={a.id} className="bg-surface border border-line rounded-2xl p-5 flex flex-col gap-3 hover:border-side-artist/40 transition-colors group">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-side-artist mb-1">Artista</p>
                  <h3 className="font-display font-bold text-lg text-paper leading-tight">{a.nombre}</h3>
                </div>
                {a.canal_yt && (
                  <a href={a.canal_yt} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-[10px] uppercase tracking-widest text-side-prod hover:text-paper transition-colors truncate">
                    Canal YT →
                  </a>
                )}
                {a.otros_canales && (
                  <p className="font-mono text-[10px] text-gray-600 truncate">{a.otros_canales}</p>
                )}
                <div className="flex gap-2 mt-auto pt-3 border-t border-line">
                  <button onClick={() => abrirEditar(a)}
                    className="flex-1 font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:text-paper border border-line py-1.5 rounded-lg transition-colors">
                    ✏️ Editar
                  </button>
                  <button onClick={() => abrirConfirmarEliminar(a)}
                    className="flex-1 font-mono text-[10px] uppercase tracking-widest text-side-artist hover:bg-side-artist/10 border border-side-artist/30 py-1.5 rounded-lg transition-colors">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal editar/crear */}
      {modal && editando && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center px-4">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl">
                {modal === 'crear' ? 'Nuevo artista' : `Editando: ${editando.nombre}`}
              </h2>
              <button onClick={cerrar} className="font-mono text-[11px] uppercase tracking-widest text-gray-500 hover:text-side-artist transition-colors">
                Cerrar
              </button>
            </div>
            <div className="space-y-4">
              <Campo label="Nombre *" value={editando.nombre} onChange={(v) => setEditando((p) => ({ ...p, nombre: v }))} />
              <Campo label="Canal YouTube" value={editando.canal_yt} onChange={(v) => setEditando((p) => ({ ...p, canal_yt: v }))} />
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">Otros canales</label>
                <textarea value={editando.otros_canales || ''} onChange={(e) => setEditando((p) => ({ ...p, otros_canales: e.target.value }))}
                  rows={3} placeholder="Un link por línea..."
                  className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors resize-none font-body" />
              </div>
            </div>
            {mensaje && (
              <p className="font-mono text-[11px] uppercase tracking-widest mt-4 text-side-artist">{mensaje.texto}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={cerrar}
                className="flex-1 font-mono text-[11px] uppercase tracking-widest text-gray-500 border border-line py-2 rounded-lg hover:text-paper transition-colors">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex-1 bg-side-artist hover:bg-side-artist/80 disabled:opacity-50 text-paper font-mono text-[11px] uppercase tracking-widest py-2 rounded-lg transition-colors">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmarEliminar && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center px-4">
          <div className="bg-surface border border-side-artist/30 rounded-2xl w-full max-w-sm p-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist mb-3">Confirmar eliminación</p>
            <h3 className="font-display font-bold text-xl mb-3">{confirmarEliminar.nombre}</h3>
            {obrasAfectadas.length > 0 ? (
              <div className="text-left mb-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                  {obrasAfectadas.length} obra(s) quedarán sin artista:
                </p>
                <div className="bg-surface-raised rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
                  {obrasAfectadas.map((o) => (
                    <p key={o.id} className="font-mono text-[10px] text-gray-400 truncate">· {o.nombre}</p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-4">No tiene obras asignadas.</p>
            )}
            <p className="text-gray-600 text-xs mb-6 font-mono">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => { setConfirmarEliminar(null); setObrasAfectadas([]) }}
                className="flex-1 font-mono text-[11px] uppercase tracking-widest text-gray-500 border border-line py-2 rounded-lg hover:text-paper transition-colors">
                Cancelar
              </button>
              <button onClick={handleEliminar}
                className="flex-1 bg-side-artist hover:bg-side-artist/80 text-paper font-mono text-[11px] uppercase tracking-widest py-2 rounded-lg transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Campo({ label, value, onChange }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors font-body" />
    </div>
  )
}