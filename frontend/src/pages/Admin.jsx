import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getObras, editarObra, crearObra,
  getArtistas, crearArtista,
  getBeatmakers, crearBeatmaker
} from '../api/obras'

const OPCIONES = {
  video_estado:        ['no', 'completo', 'fragmento'],
  video_original:      ['si', 'no', 'resubido'],
  audio_estado:        ['no', 'completo', 'fragmento'],
  miniatura_obra_tipo: ['no', 'original', 'aproximado'],
  obra_vigente:        ['publico', 'oculto', 'no'],
  letra_estado:        ['no', 'completa', 'incompleta'],
  instrumental_estado: ['no', 'original', 'resubido', 'aproximado'],
  beat_original:       ['si', 'no', 'resubido'],
  miniatura_beat_tipo: ['no', 'original', 'aproximado'],
  beat_vigente:        ['publico', 'oculto', 'resubido', 'no'],
}

const OBRA_VACIA = {
  nombre: '', feat: '', feat_beat: '',
  artista_id: null, beatmaker_id: null,
  fecha_obra: '', fecha_beat: '',
  link_obra: '', link_beat: '', otros_links_beat: '',
  youtube_id_obra: '', youtube_id_beat: '',
  miniatura_obra: '', miniatura_beat: '',
  miniatura_obra_tipo: 'no', miniatura_beat_tipo: 'no',
  video_estado: 'no', video_original: 'si',
  audio_estado: 'no', obra_vigente: 'publico',
  letra_estado: 'no', letra: '',
  instrumental_estado: 'no',
  tiene_audio: false, tiene_instrumental: false,
  fuente_recuperacion: '',
  nombre_beat: '', beat_original: 'si',
  beat_vigente: 'publico', descripcion_beat: '',
  completa: false, eliminada: false, observacion: '',
  segundo_inicio_obra: 0, segundo_inicio_beat: 0,
}

export default function Admin() {
  const [obras, setObras] = useState([])
  const [artistas, setArtistas] = useState([])
  const [beatmakers, setBeatmakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null) // 'editar' | 'crear'
  const [obraEditando, setObraEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [seccion, setSeccion] = useState('obra')
  const [modalNuevo, setModalNuevo] = useState(null) // 'artista' | 'beatmaker'
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoCanalYt, setNuevoCanalYt] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    cargarTodo()
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('token')) return
    cargarObras()
  }, [busqueda])

  const cargarTodo = async () => {
    setLoading(true)
    const [obrasRes, artistasRes, beatmakersRes] = await Promise.all([
      getObras({ limit: 300 }),
      getArtistas(),
      getBeatmakers(),
    ])
    setObras(obrasRes.data)
    setArtistas(artistasRes.data)
    setBeatmakers(beatmakersRes.data)
    setLoading(false)
  }

  const cargarObras = async () => {
    const params = { limit: 300 }
    if (busqueda) params.busqueda = busqueda
    const res = await getObras(params)
    setObras(res.data)
  }

  const abrirEditar = (obra) => {
    setObraEditando({
      ...OBRA_VACIA,
      ...obra,
      _tiempo_obra: segundosAMs(obra.segundo_inicio_obra || 0),
      _tiempo_beat: segundosAMs(obra.segundo_inicio_beat || 0),
    })
    setSeccion('obra')
    setModal('editar')
    setMensaje(null)
  }

  const abrirCrear = () => {
    setObraEditando({
      ...OBRA_VACIA,
      _tiempo_obra: '0:00.000',
      _tiempo_beat: '0:00.000',
    })
    setSeccion('obra')
    setModal('crear')
    setMensaje(null)
  }

  const cerrarModal = () => {
    setModal(null)
    setObraEditando(null)
    setMensaje(null)
  }

  const handleChange = (campo, valor) => {
    setObraEditando((prev) => ({ ...prev, [campo]: valor }))
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      const payload = {
        ...obraEditando,
        segundo_inicio_obra: msASegundos(obraEditando._tiempo_obra),
        segundo_inicio_beat: msASegundos(obraEditando._tiempo_beat),
      }
      if (modal === 'editar') {
        await editarObra(obraEditando.id, payload)
      } else {
        await crearObra(payload)
      }
      setMensaje({ tipo: 'ok', texto: modal === 'editar' ? 'Obra guardada.' : 'Obra creada.' })
      cerrarModal()
      cargarObras()
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  const crearNuevo = async () => {
    if (!nuevoNombre.trim()) return
    try {
      const data = { nombre: nuevoNombre.trim(), canal_yt: nuevoCanalYt.trim() || null }
      if (modalNuevo === 'artista') {
        const res = await crearArtista(data)
        setArtistas((prev) => [...prev, res.data])
        handleChange('artista_id', res.data.id)
      } else {
        const res = await crearBeatmaker(data)
        setBeatmakers((prev) => [...prev, res.data])
        handleChange('beatmaker_id', res.data.id)
      }
      setModalNuevo(null)
      setNuevoNombre('')
      setNuevoCanalYt('')
    } catch {
      alert('Error al crear')
    }
  }

  const secciones = ['obra', 'beat', 'letra', 'reproduccion', 'extra']

  const msASegundos = (str) => {
    if (!str) return 0
    const match = str.match(/^(\d+):(\d{2})\.(\d{1,3})$/)
    if (!match) return parseFloat(str) || 0
    const min = parseInt(match[1])
    const seg = parseInt(match[2])
    const ms = parseInt(match[3].padEnd(3, '0'))
    return min * 60 + seg + ms / 1000
  }

  const segundosAMs = (seg) => {
    if (!seg && seg !== 0) return '0:00.000'
    const total = parseFloat(seg)
    const min = Math.floor(total / 60)
    const s = Math.floor(total % 60)
    const ms = Math.round((total % 1) * 1000)
    return `${min}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
  }

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10 border-b border-line pb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist mb-2">Acceso restringido</p>
            <h1 className="font-display font-bold text-4xl text-paper">Panel Admin</h1>
          </div>
          <button
            onClick={abrirCrear}
            className="bg-side-artist hover:bg-side-artist/80 text-paper font-mono text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-lg transition-colors"
          >
            + Nueva obra
          </button>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div className={`mb-6 px-5 py-3 rounded-xl border font-mono text-[11px] uppercase tracking-widest ${
            mensaje.tipo === 'ok'
              ? 'border-green-800 text-green-400'
              : 'border-side-artist/40 text-side-artist'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Buscador */}
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Buscar obra..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-surface border border-line rounded-lg px-4 py-2 text-sm text-paper placeholder-gray-600 focus:outline-none focus:border-side-artist transition-colors w-72 font-body"
          />
        </div>

        <p className="font-mono text-[11px] uppercase tracking-widest text-gray-600 mb-4">
          {obras.length} obras
        </p>

        {/* Tabla */}
        {loading ? (
          <div className="flex items-center gap-3 text-side-artist font-mono text-sm tracking-widest uppercase py-10">
            <span className="w-2 h-2 rounded-full bg-side-artist animate-pulse" />
            Cargando...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-surface text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Artista</th>
                  <th className="px-4 py-3 text-center">Video</th>
                  <th className="px-4 py-3 text-center">Vigente</th>
                  <th className="px-4 py-3 text-center">Letra</th>
                  <th className="px-4 py-3 text-center">Instrumental</th>
                  <th className="px-4 py-3 text-center">Editar</th>
                </tr>
              </thead>
              <tbody>
                {obras.map((obra) => (
                  <tr key={obra.id} className="border-t border-line hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-medium text-paper">{obra.nombre}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {obra.artista?.nombre || obra.canal || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EstadoBadge valor={obra.video_estado} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EstadoBadge valor={obra.obra_vigente} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EstadoBadge valor={obra.letra_estado} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EstadoBadge valor={obra.instrumental_estado} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => abrirEditar(obra)}
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

      {/* ===== MODAL EDICIÓN / CREACIÓN ===== */}
      {modal && obraEditando && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-start justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-3xl my-auto">

            {/* Header modal */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-line">
              <h2 className="font-display font-bold text-xl">
                {modal === 'editar' ? `Editando: ${obraEditando.nombre}` : 'Nueva obra'}
              </h2>
              <button onClick={cerrarModal} className="font-mono text-[11px] uppercase tracking-widest text-gray-500 hover:text-side-artist transition-colors">
                Cerrar
              </button>
            </div>

            {/* Tabs de secciones */}
            <div className="flex border-b border-line overflow-x-auto">
              {secciones.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeccion(s)}
                  className={`px-6 py-3 font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-colors ${
                    seccion === s
                      ? 'text-side-artist border-b-2 border-side-artist'
                      : 'text-gray-500 hover:text-paper'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="px-8 py-6 space-y-6">

              {/* ── SECCIÓN OBRA ── */}
              {seccion === 'obra' && (
                <>
                  <Seccion titulo="Identidad de la obra">
                    <Combobox
                      label="Artista principal"
                      opciones={artistas}
                      valor={obraEditando.artista_id}
                      onChange={(v) => handleChange('artista_id', v)}
                      onNuevo={() => setModalNuevo('artista')}
                    />
                    <Campo label="Feat (colaboración)" value={obraEditando.feat} onChange={(v) => handleChange('feat', v)} />
                    <Campo label="Nombre de la obra *" value={obraEditando.nombre} onChange={(v) => handleChange('nombre', v)} />
                    <Campo label="Fecha de la obra" value={obraEditando.fecha_obra} onChange={(v) => handleChange('fecha_obra', v)} tipo="date" />
                  </Seccion>

                  <Seccion titulo="Estado del video">
                    <RadioGroup label="¿Hay video?" campo="video_estado" opciones={OPCIONES.video_estado} valor={obraEditando.video_estado} onChange={handleChange} />
                    {obraEditando.video_estado !== 'no' && (
                      <RadioGroup label="¿Es el video original?" campo="video_original" opciones={OPCIONES.video_original} valor={obraEditando.video_original} onChange={handleChange} />
                    )}
                    <RadioGroup label="¿Miniatura disponible?" campo="miniatura_obra_tipo" opciones={OPCIONES.miniatura_obra_tipo} valor={obraEditando.miniatura_obra_tipo} onChange={handleChange} />
                    <RadioGroup label="¿Está vigente la obra?" campo="obra_vigente" opciones={OPCIONES.obra_vigente} valor={obraEditando.obra_vigente} onChange={handleChange} />
                    <RadioGroup label="¿Hay audio (voz + base)?" campo="audio_estado" opciones={OPCIONES.audio_estado} valor={obraEditando.audio_estado} onChange={handleChange} />
                  </Seccion>

                  <Seccion titulo="Links de la obra">
                    <Campo label="Link YouTube obra" value={obraEditando.link_obra} onChange={(v) => handleChange('link_obra', v)} />
                    <Campo label="YouTube ID obra" value={obraEditando.youtube_id_obra} onChange={(v) => handleChange('youtube_id_obra', v)} />
                    <Campo label="Miniatura obra (URL)" value={obraEditando.miniatura_obra} onChange={(v) => handleChange('miniatura_obra', v)} />
                    <SubirImagen
                      label="Miniatura obra (imagen propia)"
                      urlActual={obraEditando.miniatura_obra}
                      onSubida={(url) => handleChange('miniatura_obra', url)}
                    />
                  </Seccion>
                </>
              )}

              {/* ── SECCIÓN BEAT ── */}
              {seccion === 'beat' && (
                <>
                  <Seccion titulo="Identidad del beat">
                    <Combobox
                      label="Beatmaker"
                      opciones={beatmakers}
                      valor={obraEditando.beatmaker_id}
                      onChange={(v) => handleChange('beatmaker_id', v)}
                      onNuevo={() => setModalNuevo('beatmaker')}
                    />
                    <Campo label="Feat (colaboración beat)" value={obraEditando.feat_beat} onChange={(v) => handleChange('feat_beat', v)} />
                    <Campo label="Nombre del beat" value={obraEditando.nombre_beat} onChange={(v) => handleChange('nombre_beat', v)} />
                    <Campo label="Fecha del beat" value={obraEditando.fecha_beat} onChange={(v) => handleChange('fecha_beat', v)} tipo="date" />
                  </Seccion>

                  <Seccion titulo="Estado del beat">
                    <RadioGroup label="¿Es el beat original?" campo="beat_original" opciones={OPCIONES.beat_original} valor={obraEditando.beat_original} onChange={handleChange} />
                    <RadioGroup label="¿Miniatura disponible?" campo="miniatura_beat_tipo" opciones={OPCIONES.miniatura_beat_tipo} valor={obraEditando.miniatura_beat_tipo} onChange={handleChange} />
                    <RadioGroup label="¿Está vigente el beat?" campo="beat_vigente" opciones={OPCIONES.beat_vigente} valor={obraEditando.beat_vigente} onChange={handleChange} />
                  </Seccion>

                  <Seccion titulo="Links del beat">
                    <Campo label="Link YouTube beat" value={obraEditando.link_beat} onChange={(v) => handleChange('link_beat', v)} />
                    <Campo label="YouTube ID beat" value={obraEditando.youtube_id_beat} onChange={(v) => handleChange('youtube_id_beat', v)} />
                    <Campo label="Miniatura beat (URL)" value={obraEditando.miniatura_beat} onChange={(v) => handleChange('miniatura_beat', v)} />
                    <SubirImagen
                      label="Miniatura beat (imagen propia)"
                      urlActual={obraEditando.miniatura_beat}
                      onSubida={(url) => handleChange('miniatura_beat', url)}
                    />
                  </Seccion>

                  <Seccion titulo="Otros links del beat">
                    <div className="col-span-2">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
                        Otros enlaces donde está el beat (VK, SoundCloud, etc.)
                      </label>
                      <textarea
                        value={obraEditando.otros_links_beat || ''}
                        onChange={(e) => handleChange('otros_links_beat', e.target.value)}
                        rows={3}
                        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors resize-none font-body"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">Descripción del beat</label>
                      <textarea
                        value={obraEditando.descripcion_beat || ''}
                        onChange={(e) => handleChange('descripcion_beat', e.target.value)}
                        rows={2}
                        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors resize-none font-body"
                      />
                    </div>
                  </Seccion>
                </>
              )}

              {/* ── SECCIÓN REPRODUCCIÓN ── */}
              {seccion === 'reproduccion' && (
                <>
                  <Seccion titulo="Sincronización de reproducción">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
                        Offset obra (mm:ss.ms)
                      </label>
                      <input
                        type="text"
                        value={obraEditando._tiempo_obra || '0:00.000'}
                        onChange={(e) => handleChange('_tiempo_obra', e.target.value)}
                        placeholder="0:00.000"
                        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors font-mono"
                      />
                      <p className="font-mono text-[10px] text-gray-600 mt-1">
                        = {msASegundos(obraEditando._tiempo_obra || '0:00.000')} segundos
                      </p>
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
                        Offset beat (mm:ss.ms)
                      </label>
                      <input
                        type="text"
                        value={obraEditando._tiempo_beat || '0:00.000'}
                        onChange={(e) => handleChange('_tiempo_beat', e.target.value)}
                        placeholder="0:00.000"
                        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors font-mono"
                      />
                      <p className="font-mono text-[10px] text-gray-600 mt-1">
                        = {msASegundos(obraEditando._tiempo_beat || '0:00.000')} segundos
                      </p>
                    </div>
                  </Seccion>
                  <Seccion titulo="Nota">
                    <div className="col-span-2">
                      <p className="font-mono text-[10px] text-gray-500 leading-relaxed">
                        Estos valores controlan en qué momento empieza cada video al reproducir en simultáneo.
                        Útiles para sincronizar la voz con el beat cuando los videos tienen intros distintos.
                        En el futuro serán usados también para el modo karaoke.
                      </p>
                    </div>
                  </Seccion>
                </>
              )}

              {/* ── SECCIÓN LETRA ── */}
              {seccion === 'letra' && (
                <>
                  <Seccion titulo="Estado de la letra">
                    <RadioGroup label="¿Hay letra disponible?" campo="letra_estado" opciones={OPCIONES.letra_estado} valor={obraEditando.letra_estado} onChange={handleChange} />
                  </Seccion>

                  <Seccion titulo="Contenido">
                    <div className="col-span-2">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
                        Letra de la obra
                      </label>
                      <textarea
                        value={obraEditando.letra || ''}
                        onChange={(e) => handleChange('letra', e.target.value)}
                        rows={16}
                        placeholder="Escribe o pega la letra aquí..."
                        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors resize-none font-body leading-relaxed"
                      />
                    </div>
                  </Seccion>
                </>
              )}

              {/* ── SECCIÓN EXTRA ── */}
              {seccion === 'extra' && (
                <>
                  <Seccion titulo="Instrumental">
                    <RadioGroup label="¿Se encontró la instrumental?" campo="instrumental_estado" opciones={OPCIONES.instrumental_estado} valor={obraEditando.instrumental_estado} onChange={handleChange} />
                    <Campo label="Fuente de recuperación" value={obraEditando.fuente_recuperacion} onChange={(v) => handleChange('fuente_recuperacion', v)} />
                  </Seccion>

                  <Seccion titulo="Flags generales">
                    <div className="col-span-2 flex flex-wrap gap-6">
                      <Checkbox label="Completa" checked={obraEditando.completa} onChange={(v) => handleChange('completa', v)} />
                      <Checkbox label="Eliminada" checked={obraEditando.eliminada} onChange={(v) => handleChange('eliminada', v)} />
                    </div>
                    <div className="col-span-2">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-1">
                        tiene_audio: <span className={obraEditando.audio_estado !== 'no' ? 'text-green-400' : 'text-gray-700'}>{obraEditando.audio_estado !== 'no' ? 'sí' : 'no'}</span>
                        {' · '}
                        tiene_instrumental: <span className={obraEditando.instrumental_estado !== 'no' ? 'text-green-400' : 'text-gray-700'}>{obraEditando.instrumental_estado !== 'no' ? 'sí' : 'no'}</span>
                      </p>
                      <p className="font-mono text-[10px] text-gray-600">Se calculan automáticamente al guardar.</p>
                    </div>
                  </Seccion>

                  <Seccion titulo="Observaciones">
                    <div className="col-span-2">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">Observación</label>
                      <textarea
                        value={obraEditando.observacion || ''}
                        onChange={(e) => handleChange('observacion', e.target.value)}
                        rows={4}
                        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2.5 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors resize-none font-body"
                      />
                    </div>
                  </Seccion>
                </>
              )}

            </div>

            {/* Footer modal */}
            <div className="px-8 py-5 border-t border-line flex items-center justify-between">
              {mensaje && (
                <p className={`font-mono text-[11px] uppercase tracking-widest ${mensaje.tipo === 'ok' ? 'text-green-400' : 'text-side-artist'}`}>
                  {mensaje.texto}
                </p>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={cerrarModal} className="font-mono text-[11px] uppercase tracking-widest text-gray-500 hover:text-paper border border-line px-6 py-2 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="bg-side-artist hover:bg-side-artist/80 disabled:opacity-50 text-paper font-mono text-[11px] uppercase tracking-widest px-8 py-2 rounded-lg transition-colors"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===== MODAL NUEVO ARTISTA / BEATMAKER ===== */}
      {modalNuevo && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center px-4">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-sm p-8">
            <h3 className="font-display font-bold text-xl mb-6">
              Nuevo {modalNuevo === 'artista' ? 'artista' : 'beatmaker'}
            </h3>
            <div className="space-y-4">
              <Campo label="Nombre *" value={nuevoNombre} onChange={setNuevoNombre} />
              <Campo label="Canal YouTube" value={nuevoCanalYt} onChange={setNuevoCanalYt} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModalNuevo(null); setNuevoNombre(''); setNuevoCanalYt('') }}
                className="flex-1 font-mono text-[11px] uppercase tracking-widest text-gray-500 border border-line py-2 rounded-lg hover:text-paper transition-colors">
                Cancelar
              </button>
              <button onClick={crearNuevo}
                className="flex-1 bg-side-artist hover:bg-side-artist/80 text-paper font-mono text-[11px] uppercase tracking-widest py-2 rounded-lg transition-colors">
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Componentes auxiliares ──

function Seccion({ titulo, children }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-side-artist mb-4">{titulo}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

function Campo({ label, value, onChange, tipo = 'text' }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
      <input
        type={tipo}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-raised border border-line rounded-lg px-4 py-2 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors font-body"
      />
    </div>
  )
}

function Combobox({ label, opciones, valor, onChange, onNuevo }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">{label}</label>
      <div className="flex gap-2">
        <select
          value={valor || ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
          className="w-48 bg-surface-raised border border-line rounded-lg px-3 py-2 text-paper text-sm focus:outline-none focus:border-side-artist transition-colors"
        >
          <option value="">— Seleccionar —</option>
          {opciones.map((o) => (
            <option key={o.id} value={o.id}>{o.nombre}</option>
          ))}
        </select>
        <button
          onClick={onNuevo}
          className="font-mono text-[11px] uppercase tracking-widest text-side-artist border border-side-artist/40 hover:bg-side-artist/10 px-3 rounded-lg transition-colors whitespace-nowrap"
        >
          + Nuevo
        </button>
      </div>
    </div>
  )
}

function RadioGroup({ label, campo, opciones, valor, onChange }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {opciones.map((op) => (
          <button
            key={op}
            onClick={() => onChange(campo, op)}
            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${
              valor === op
                ? 'border-side-artist text-side-artist bg-side-artist/10'
                : 'border-line text-gray-500 hover:text-paper hover:border-gray-500'
            }`}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  )
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
          checked ? 'bg-side-artist border-side-artist' : 'border-line bg-surface-raised group-hover:border-side-artist/50'
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-paper">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </div>
      <span className="font-mono text-[11px] uppercase tracking-widest text-gray-400 group-hover:text-paper transition-colors">{label}</span>
    </label>
  )
}

function EstadoBadge({ valor }) {
  if (!valor || valor === 'no') return <span className="text-gray-700 font-mono text-xs">—</span>
  const colores = {
    completo: 'text-green-400', completa: 'text-green-400',
    publico: 'text-green-400', original: 'text-green-400', si: 'text-green-400',
    fragmento: 'text-yellow-400', incompleta: 'text-yellow-400',
    oculto: 'text-yellow-400', aproximado: 'text-yellow-400',
    resubido: 'text-side-prod',
  }
  return (
    <span className={`font-mono text-[10px] uppercase tracking-widest ${colores[valor] || 'text-gray-400'}`}>
      {valor}
    </span>
  )
}

function SubirImagen({ label, urlActual, onSubida }) {
  const [subiendo, setSubiendo] = useState(false)

  const handleArchivo = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    setSubiendo(true)
    try {
      const { subirImagen } = await import('../api/obras')
      const url = await subirImagen(archivo)
      onSubida(url)
    } catch {
      alert('Error al subir imagen')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
        {label}
      </label>
      <div className="flex gap-3 items-start">
        {urlActual && (
          <img
            src={`http://localhost:8000${urlActual}`}
            alt="miniatura"
            className="w-24 h-16 object-cover rounded-lg border border-line"
          />
        )}
        <div className="flex flex-col gap-2">
          <label className={`cursor-pointer font-mono text-[11px] uppercase tracking-widest px-4 py-2 rounded-lg border transition-colors ${
            subiendo
              ? 'border-line text-gray-600'
              : 'border-side-artist/40 text-side-artist hover:bg-side-artist/10'
          }`}>
            {subiendo ? 'Subiendo...' : 'Subir imagen'}
            <input type="file" accept="image/*" onChange={handleArchivo} className="hidden" />
          </label>
          {urlActual && (
            <button
              onClick={() => onSubida(null)}
              className="font-mono text-[10px] uppercase tracking-widest text-gray-600 hover:text-side-artist transition-colors text-left"
            >
              Quitar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}