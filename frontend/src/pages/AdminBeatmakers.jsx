import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBeatmakers, crearBeatmaker, editarBeatmaker } from '../api/obras'

export default function AdminBeatmakers() {
  const [beatmakers, setBeatmakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [editando, setEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)
    const res = await getBeatmakers()
    setBeatmakers(res.data)
    setLoading(false)
  }

  const abrirCrear = () => {
    setEditando({ nombre: '', canal_yt: '', otros_canales: '' })
    setModal('crear')
    setMensaje(null)
  }

  const abrirEditar = (bm) => {
    setEditando({ ...bm })
    setModal('editar')
    setMensaje(null)
  }

  const cerrar = () => {
    setModal(null)
    setEditando(null)
    setMensaje(null)
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      if (modal === 'crear') {
        await crearBeatmaker(editando)
      } else {
        await editarBeatmaker(editando.id, editando)
      }
      setMensaje({ tipo: 'ok', texto: modal === 'crear' ? 'Beatmaker creado.' : 'Beatmaker guardado.' })
      cerrar()
      cargar()
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-10 border-b border-line pb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-side-prod mb-2">Admin</p>
            <h1 className="font-display font-bold text-4xl text-paper">Beatmakers</h1>
          </div>
          <button
            onClick={abrirCrear}
            className="bg-side-prod hover:bg-side-prod/80 text-paper font-mono text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-lg transition-colors"
          >
            + Nuevo
          </button>
        </div>

        {mensaje && (
          <div className={`mb-6 px-5 py-3 rounded-xl border font-mono text-[11px] uppercase tracking-widest ${
            mensaje.tipo === 'ok' ? 'border-green-800 text-green-400' : 'border-side-artist/40 text-side-artist'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-side-prod font-mono text-sm tracking-widest uppercase py-10">
            <span className="w-2 h-2 rounded-full bg-side-prod animate-pulse" />
            Cargando...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-surface text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Canal YT</th>
                  <th className="px-4 py-3 text-left">Otros canales</th>
                  <th className="px-4 py-3 text-center">Editar</th>
                </tr>
              </thead>
              <tbody>
                {beatmakers.map((bm) => (
                  <tr key={bm.id} className="border-t border-line hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-medium text-paper">{bm.nombre}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 truncate max-w-xs">
                      {bm.canal_yt ? (
                        <a href={bm.canal_yt} target="_blank" rel="noopener noreferrer"
                          className="text-side-prod hover:text-paper transition-colors">
                          {bm.canal_yt}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 truncate max-w-xs">
                      {bm.otros_canales || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => abrirEditar(bm)}
                        className="font-mono text-[10px] uppercase tracking-widest text-side-prod hover:text-paper transition-colors"
                      >
                        Editar →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && editando && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center px-4">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl">
                {modal === 'crear' ? 'Nuevo beatmaker' : `Editando: ${editando.nombre}`}
              </h2>
              <button onClick={cerrar} className="font-mono text-[11px] uppercase tracking-widest text-gray-500 hover:text-side-prod transition-colors">
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <Campo label="Nombre *" value={editando.nombre} onChange={(v) => setEditando((p) => ({ ...p, nombre: v }))} />
              <Campo label="Canal YouTube" value={editando.canal_yt} onChange={(v) => setEditando((p) => ({ ...p, canal_yt: v }))} />
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
                  Otros canales
                </label>
                <textarea
                  value={editando.otros_canales || ''}
                  onChange={(e) => setEditando((p) => ({ ...p, otros_canales: e.target.value }))}
                  rows={3}
                  placeholder="Un link por línea..."
                  className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-prod transition-colors resize-none font-body"
                />
              </div>
            </div>

            {mensaje && (
              <p className={`font-mono text-[11px] uppercase tracking-widest mt-4 ${
                mensaje.tipo === 'ok' ? 'text-green-400' : 'text-side-artist'
              }`}>
                {mensaje.texto}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={cerrar}
                className="flex-1 font-mono text-[11px] uppercase tracking-widest text-gray-500 border border-line py-2 rounded-lg hover:text-paper transition-colors">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex-1 bg-side-prod hover:bg-side-prod/80 disabled:opacity-50 text-paper font-mono text-[11px] uppercase tracking-widest py-2 rounded-lg transition-colors">
                {guardando ? 'Guardando...' : 'Guardar'}
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
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2 text-paper text-sm focus:outline-none focus:border-side-prod transition-colors font-body"
      />
    </div>
  )
}