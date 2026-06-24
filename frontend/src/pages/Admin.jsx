import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getObras, crearObra, editarObra, subirArchivo, API_BASE_URL } from '../api/obras'

const OBRA_VACIA = {
  nombre: '',
  feat: '',
  canal: '',
  fecha_obra: '',
  completa: false,
  eliminada: false,
  autor_beat: '',
  nombre_beat: '',
  fecha_beat: '',
  fecha_subida_beat: '',
  link_obra: '',
  link_beat: '',
  youtube_id_obra: '',
  youtube_id_beat: '',
  observacion: '',
  tiene_audio: false,
  tiene_instrumental: false,
  fuente_recuperacion: '',
  letra: '',
  link_canal_artista: '',
  link_canal_beat: '',
  descripcion_beat: '',
  miniatura_obra: '',
  miniatura_beat: '',
  segundo_inicio_obra: 0,
  segundo_inicio_beat: 0,
}

const SECCIONES = [
  { id: 'general', label: 'General' },
  { id: 'beat', label: 'Beat' },
  { id: 'multimedia', label: 'Multimedia y sincronización' },
  { id: 'letra', label: 'Letra y notas' },
]

export default function Admin() {
  const [obras, setObras] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [obraEditando, setObraEditando] = useState(null)
  const [esNueva, setEsNueva] = useState(false)
  const [seccionActiva, setSeccionActiva] = useState('general')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }
    cargarObras()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda])

  async function cargarObras() {
    setLoading(true)
    const params = { limit: 300 }
    if (busqueda) params.busqueda = busqueda
    const res = await getObras(params)
    setObras(res.data)
    setLoading(false)
  }

  const handleEditar = (obra) => {
    setObraEditando({ ...obra })
    setEsNueva(false)
    setSeccionActiva('general')
    setMensaje(null)
  }

  const handleCrear = () => {
    setObraEditando({ ...OBRA_VACIA })
    setEsNueva(true)
    setSeccionActiva('general')
    setMensaje(null)
  }

  const handleCancelar = () => {
    setObraEditando(null)
    setMensaje(null)
  }

  const handleGuardar = async () => {
    if (!obraEditando.nombre || !obraEditando.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre de la obra es obligatorio.' })
      setSeccionActiva('general')
      return
    }

    setGuardando(true)
    try {
      // Limpiamos campos de fecha vacíos para no enviar "" donde se espera null
      const payload = { ...obraEditando }
      ;['fecha_beat', 'fecha_subida_beat'].forEach((campo) => {
        if (!payload[campo]) payload[campo] = null
      })

      if (esNueva) {
        await crearObra(payload)
        setMensaje({ tipo: 'ok', texto: 'Obra creada correctamente.' })
      } else {
        await editarObra(obraEditando.id, payload)
        setMensaje({ tipo: 'ok', texto: 'Obra guardada correctamente.' })
      }
      setObraEditando(null)
      cargarObras()
    } catch (err) {
      const detalle = err?.response?.data?.detail
      setMensaje({
        tipo: 'error',
        texto: detalle ? `Error: ${detalle}` : 'Error al guardar. Intenta de nuevo.',
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleChange = (campo, valor) => {
    setObraEditando((prev) => ({ ...prev, [campo]: valor }))
  }

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10 border-b border-line pb-8 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist mb-2">
              Acceso restringido
            </p>
            <h1 className="font-display font-bold text-4xl text-paper">Panel Admin</h1>
            <p className="text-gray-500 text-sm mt-2">Crea y edita las obras del catálogo.</p>
          </div>
          <button
            onClick={handleCrear}
            className="bg-side-artist hover:bg-side-artist/80 text-paper font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Crear nueva obra
          </button>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div className={`mb-6 px-5 py-3 rounded-xl border font-mono text-[11px] uppercase tracking-widest ${
            mensaje.tipo === 'ok'
              ? 'border-green-800 text-green-400 bg-green-950/30'
              : 'border-side-artist/40 text-side-artist bg-side-artist-dim/20'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Modal de edición / creación */}
        {obraEditando && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
            <div className="bg-surface border border-line rounded-2xl w-full max-w-4xl p-0 my-auto flex flex-col max-h-[88vh]">

              {/* Cabecera del modal */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-line shrink-0">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-side-artist mb-1">
                    {esNueva ? 'Nueva obra' : `Editando · #${obraEditando.id}`}
                  </p>
                  <h2 className="font-display font-bold text-2xl">
                    {obraEditando.nombre || (esNueva ? 'Sin título todavía' : 'Editando obra')}
                  </h2>
                </div>
                <button
                  onClick={handleCancelar}
                  className="font-mono text-[11px] uppercase tracking-widest text-gray-500 hover:text-side-artist transition-colors"
                >
                  Cancelar
                </button>
              </div>

              {/* Tabs de secciones */}
              <div className="flex gap-1 px-8 pt-4 border-b border-line shrink-0 overflow-x-auto">
                {SECCIONES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSeccionActiva(s.id)}
                    className={`font-mono text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-t-lg whitespace-nowrap transition-colors border-b-2 ${
                      seccionActiva === s.id
                        ? 'text-side-artist border-side-artist'
                        : 'text-gray-500 border-transparent hover:text-gray-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Contenido de la sección activa */}
              <div className="px-8 py-6 overflow-y-auto flex-1">

                {seccionActiva === 'general' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Campo label="Nombre *" value={obraEditando.nombre} onChange={(v) => handleChange('nombre', v)} />
                      <Campo label="Feat" value={obraEditando.feat} onChange={(v) => handleChange('feat', v)} />
                      <Campo label="Canal" value={obraEditando.canal} onChange={(v) => handleChange('canal', v)} />
                      <Campo label="Fecha de la obra" value={obraEditando.fecha_obra} onChange={(v) => handleChange('fecha_obra', v)} placeholder="ej. 2015 o 12/04/2015" />
                      <Campo label="Link obra (YouTube)" value={obraEditando.link_obra} onChange={(v) => handleChange('link_obra', v)} />
                      <Campo label="YouTube ID obra" value={obraEditando.youtube_id_obra} onChange={(v) => handleChange('youtube_id_obra', v)} />
                      <Campo label="Link canal artista" value={obraEditando.link_canal_artista} onChange={(v) => handleChange('link_canal_artista', v)} />
                      <Campo label="Fuente de recuperación" value={obraEditando.fuente_recuperacion} onChange={(v) => handleChange('fuente_recuperacion', v)} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <Checkbox label="Completa" checked={obraEditando.completa} onChange={(v) => handleChange('completa', v)} />
                      <Checkbox label="Eliminada" checked={obraEditando.eliminada} onChange={(v) => handleChange('eliminada', v)} />
                      <Checkbox label="Tiene audio" checked={obraEditando.tiene_audio} onChange={(v) => handleChange('tiene_audio', v)} />
                      <Checkbox label="Tiene instrumental" checked={obraEditando.tiene_instrumental} onChange={(v) => handleChange('tiene_instrumental', v)} />
                    </div>
                  </div>
                )}

                {seccionActiva === 'beat' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Campo label="Autor del beat" value={obraEditando.autor_beat} onChange={(v) => handleChange('autor_beat', v)} />
                      <Campo label="Nombre del beat" value={obraEditando.nombre_beat} onChange={(v) => handleChange('nombre_beat', v)} />
                      <Campo
                        label="Fecha del beat"
                        type="date"
                        value={obraEditando.fecha_beat}
                        onChange={(v) => handleChange('fecha_beat', v)}
                      />
                      <Campo
                        label="Fecha de subida del beat"
                        type="date"
                        value={obraEditando.fecha_subida_beat}
                        onChange={(v) => handleChange('fecha_subida_beat', v)}
                      />
                      <Campo label="Link beat (YouTube)" value={obraEditando.link_beat} onChange={(v) => handleChange('link_beat', v)} />
                      <Campo label="YouTube ID beat" value={obraEditando.youtube_id_beat} onChange={(v) => handleChange('youtube_id_beat', v)} />
                      <Campo label="Link canal del beatmaker" value={obraEditando.link_canal_beat} onChange={(v) => handleChange('link_canal_beat', v)} />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
                        Descripción del beat
                      </label>
                      <textarea
                        value={obraEditando.descripcion_beat || ''}
                        onChange={(e) => handleChange('descripcion_beat', e.target.value)}
                        rows={3}
                        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors resize-none font-body"
                      />
                    </div>
                  </div>
                )}

                {seccionActiva === 'multimedia' && (
                  <div className="space-y-7">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-side-artist mb-3">
                        Miniaturas
                      </p>
                      <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                        Sube una imagen o pega una URL. La miniatura del beat es útil cuando todavía no existe
                        el video de la obra: sirve como portada provisional.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CampoImagen
                          label="Miniatura de la obra"
                          value={obraEditando.miniatura_obra}
                          onChange={(v) => handleChange('miniatura_obra', v)}
                        />
                        <CampoImagen
                          label="Miniatura del beat"
                          value={obraEditando.miniatura_beat}
                          onChange={(v) => handleChange('miniatura_beat', v)}
                        />
                      </div>
                    </div>

                    <div className="border-t border-line pt-6">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-side-artist mb-3">
                        Sincronización de reproducción
                      </p>
                      <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                        Define en qué segundo empieza cada pista. Se usa al reproducir obra y beat
                        simultáneamente, y servirá de base para el futuro modo karaoke.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CampoTiempo
                          label="Inicio de la obra"
                          segundos={obraEditando.segundo_inicio_obra}
                          onChange={(v) => handleChange('segundo_inicio_obra', v)}
                        />
                        <CampoTiempo
                          label="Inicio del beat"
                          segundos={obraEditando.segundo_inicio_beat}
                          onChange={(v) => handleChange('segundo_inicio_beat', v)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {seccionActiva === 'letra' && (
                  <div className="space-y-5">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
                        Observación
                      </label>
                      <textarea
                        value={obraEditando.observacion || ''}
                        onChange={(e) => handleChange('observacion', e.target.value)}
                        rows={3}
                        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors resize-none font-body"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
                        Letra
                      </label>
                      <textarea
                        value={obraEditando.letra || ''}
                        onChange={(e) => handleChange('letra', e.target.value)}
                        rows={12}
                        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors resize-none font-body"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Footer del modal */}
              <div className="px-8 py-5 border-t border-line flex justify-end gap-3 shrink-0">
                <button
                  onClick={handleCancelar}
                  className="font-mono text-xs uppercase tracking-widest text-gray-400 hover:text-paper px-5 py-2.5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="bg-side-artist hover:bg-side-artist/80 disabled:opacity-50 text-paper font-mono text-sm uppercase tracking-widest px-8 py-2.5 rounded-lg transition-colors"
                >
                  {guardando ? 'Guardando...' : esNueva ? 'Crear obra' : 'Guardar cambios'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Buscador */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar obra..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-surface border border-line rounded-lg px-4 py-2 text-sm text-paper placeholder-gray-600 focus:outline-none focus:border-side-artist transition-colors w-72 font-body"
          />
        </div>

        {/* Contador */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-gray-600 mb-4">
          {obras.length} obras
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
                  <th className="px-4 py-3 text-left">Canal</th>
                  <th className="px-4 py-3 text-center">Completa</th>
                  <th className="px-4 py-3 text-center">Eliminada</th>
                  <th className="px-4 py-3 text-center">Instrumental</th>
                  <th className="px-4 py-3 text-center">Video</th>
                  <th className="px-4 py-3 text-center">Editar</th>
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
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{obra.canal || '—'}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs">
                      {obra.completa ? <span className="text-green-500">✓</span> : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">
                      {obra.eliminada ? <span className="text-side-artist">✓</span> : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">
                      {obra.tiene_instrumental ? <span className="text-side-prod">✓</span> : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">
                      {obra.youtube_id_obra ? <span className="text-green-500">✓</span> : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEditar(obra)}
                        className="font-mono text-[10px] uppercase tracking-widest text-side-artist hover:text-paper transition-colors"
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
    </div>
  )
}

function Campo({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
        {label}
      </label>
      <input
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors font-body [color-scheme:dark]"
      />
    </div>
  )
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
          checked
            ? 'bg-side-artist border-side-artist'
            : 'border-line bg-surface-raised group-hover:border-side-artist/50'
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-paper">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </div>
      <span className="font-mono text-[11px] uppercase tracking-widest text-gray-400 group-hover:text-paper transition-colors">
        {label}
      </span>
    </label>
  )
}

// Resuelve una URL de imagen: si es relativa (/static/uploads/...) la ancla al backend
function resolverUrlImagen(valor) {
  if (!valor) return null
  if (valor.startsWith('http://') || valor.startsWith('https://')) return valor
  return `${API_BASE_URL}${valor}`
}

function CampoImagen({ label, value, onChange }) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)
  const previewUrl = resolverUrlImagen(value)
  const esArchivoSubido = !!value && value.startsWith('/static/')

  const handleArchivo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    setError(null)
    try {
      const res = await subirArchivo(file)
      onChange(res.data.url)
    } catch (err) {
      setError(err?.response?.data?.detail || 'No se pudo subir el archivo.')
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
        {label}
      </label>

      <div className="flex gap-4">
        <div className="w-28 h-28 rounded-lg border border-line bg-surface-raised shrink-0 overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-700">
              <path strokeWidth="1.5" d="M4 16l4.5-6 3.5 4.5 2.5-3L20 16M4 5h16v14H4z" />
            </svg>
          )}
        </div>

        <div className="flex-1 space-y-2.5 min-w-0">
          <label className="block">
            <span className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
              subiendo
                ? 'border-line text-gray-600 cursor-wait'
                : 'border-line text-gray-300 hover:border-side-artist hover:text-side-artist'
            }`}>
              {subiendo ? 'Subiendo...' : 'Subir imagen'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleArchivo}
                disabled={subiendo}
                className="hidden"
              />
            </span>
          </label>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-gray-600 shrink-0">o URL</span>
            <input
              type="text"
              value={esArchivoSubido ? '' : (value || '')}
              placeholder={esArchivoSubido ? 'Archivo subido (borra para usar URL)' : 'https://...'}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 bg-surface-raised border border-line rounded-lg px-3 py-1.5 text-paper text-xs focus:outline-none focus:border-side-artist transition-colors font-body min-w-0"
            />
          </div>

          {value && (
            <button
              onClick={() => onChange('')}
              className="font-mono text-[9px] uppercase tracking-widest text-gray-600 hover:text-side-artist transition-colors"
            >
              Quitar imagen
            </button>
          )}

          {error && (
            <p className="font-mono text-[9px] uppercase tracking-widest text-side-artist">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Convierte segundos -> "mm:ss" para mostrar en el input
function segundosAMMSS(totalSegundos) {
  const seg = Number.isFinite(totalSegundos) ? Math.max(0, Math.floor(totalSegundos)) : 0
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Convierte "mm:ss" (o solo segundos) -> número de segundos
function mmssASegundos(texto) {
  if (!texto) return 0
  const limpio = texto.trim()
  if (limpio.includes(':')) {
    const [m, s] = limpio.split(':')
    const minutos = parseInt(m, 10) || 0
    const segundos = parseInt(s, 10) || 0
    return minutos * 60 + segundos
  }
  return parseInt(limpio, 10) || 0
}

function CampoTiempo({ label, segundos, onChange }) {
  const [editando, setEditando] = useState(null) // texto en edición, o null si no se está editando

  const valorMostrado = editando !== null ? editando : segundosAMMSS(segundos)

  const handleBlur = () => {
    const valorEnSegundos = mmssASegundos(editando ?? '')
    onChange(valorEnSegundos)
    setEditando(null)
  }

  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={valorMostrado}
          placeholder="0:00"
          onChange={(e) => setEditando(e.target.value)}
          onBlur={handleBlur}
          className="w-28 bg-surface-raised border border-line rounded-lg px-4 py-2 text-paper text-sm font-mono focus:outline-none focus:border-side-artist transition-colors"
        />
        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
          mm:ss · {Math.max(0, Math.floor(segundos || 0))}s
        </span>
      </div>
    </div>
  )
}