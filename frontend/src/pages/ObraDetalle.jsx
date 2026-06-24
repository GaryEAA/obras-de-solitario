import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getObra } from '../api/obras'

export default function ObraDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [obra, setObra] = useState(null)
  const [loading, setLoading] = useState(true)
  const [vecinos, setVecinos] = useState({ anterior: null, siguiente: null })
  const [reproduciendo, setReproduciendo] = useState(false)
  const playerObraRef = useRef(null)
  const playerBeatRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    getObra(id).then((res) => {
      setObra(res.data)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    const idNum = parseInt(id, 10)
    let activo = true
    getObra(idNum - 1)
      .then(() => activo && setVecinos((v) => ({ ...v, anterior: idNum - 1 })))
      .catch(() => activo && setVecinos((v) => ({ ...v, anterior: null })))
    getObra(idNum + 1)
      .then(() => activo && setVecinos((v) => ({ ...v, siguiente: idNum + 1 })))
      .catch(() => activo && setVecinos((v) => ({ ...v, siguiente: null })))
    return () => { activo = false }
  }, [id])

  useEffect(() => {
    setReproduciendo(false)
    playerObraRef.current = null
    playerBeatRef.current = null
  }, [id])

  const toggleReproduccion = useCallback(() => {
    const siguiente = !reproduciendo
    setReproduciendo(siguiente)
    const accion = siguiente ? 'playVideo' : 'pauseVideo'
    playerObraRef.current?.[accion]?.()
    playerBeatRef.current?.[accion]?.()
  }, [reproduciendo])

  const limpiarFecha = (fecha) => {
    if (!fecha) return null
    if (typeof fecha === 'string' && fecha.includes('00:00:00')) return fecha.split(' ')[0]
    return fecha
  }

  if (loading) return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
      <div className="flex items-center gap-3 text-side-artist font-mono text-sm tracking-widest uppercase">
        <span className="w-2 h-2 rounded-full bg-side-artist animate-pulse" />
        Cargando ficha técnica...
      </div>
    </div>
  )

  if (!obra) return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
      <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Obra no encontrada</p>
    </div>
  )

  const fechaObra = limpiarFecha(obra.fecha_obra)
  const fechaBeat = limpiarFecha(obra.fecha_beat)
  const lineasLetra = obra.letra ? obra.letra.split('\n') : []

  // Artista y beatmaker desde relaciones o fallback legacy
  const nombreArtista = obra.artista?.nombre || obra.canal || 'Solitario'
  const linkArtista = obra.artista?.canal_yt || obra.link_canal_artista
  const nombreBeatmaker = obra.beatmaker?.nombre || obra.autor_beat || 'Desconocido'
  const linkBeatmaker = obra.beatmaker?.canal_yt || obra.link_canal_beat

  // Miniatura — propia o generada del youtube_id
  const thumbnailObra = obra.miniatura_obra
    || (obra.youtube_id_obra ? `https://img.youtube.com/vi/${obra.youtube_id_obra}/hqdefault.jpg` : null)
  const thumbnailBeat = obra.miniatura_beat
    || (obra.youtube_id_beat ? `https://img.youtube.com/vi/${obra.youtube_id_beat}/hqdefault.jpg` : null)

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">

        {/* Badges */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
            <Badge valor={obra.obra_vigente} mapa={{
              publico: { label: 'Pública', tono: 'green' },
              oculto: { label: 'Oculta', tono: 'yellow' },
              no: { label: 'Eliminada', tono: 'red' },
            }} />
            <Badge valor={obra.video_estado} mapa={{
              completo: { label: 'Video completo', tono: 'green' },
              fragmento: { label: 'Video fragmento', tono: 'yellow' },
            }} />
            <Badge valor={obra.audio_estado} mapa={{
              completo: { label: 'Audio completo', tono: 'green' },
              fragmento: { label: 'Audio fragmento', tono: 'yellow' },
            }} />
            <Badge valor={obra.instrumental_estado} mapa={{
              original: { label: 'Instrumental original', tono: 'green' },
              resubido: { label: 'Instrumental resubida', tono: 'blue' },
              aproximado: { label: 'Instrumental aproximada', tono: 'yellow' },
            }} />
            <Badge valor={obra.letra_estado} mapa={{
              completa: { label: 'Letra completa', tono: 'green' },
              incompleta: { label: 'Letra incompleta', tono: 'yellow' },
            }} />
          </div>
        </header>

        {/* Cuerpo simétrico */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

            {/* Columna artista */}
            <ColumnaLado
              tone="artist"
              eyebrow="Artista"
              tituloPrincipal={nombreArtista}
              tituloLink={linkArtista}
              feat={obra.feat && obra.feat !== '-' ? obra.feat : null}
              filas={[
                { label: 'Obra', value: obra.nombre },
                { label: 'Fecha', value: fechaObra },
              ]}
            />


            {/* Columna beatmaker */}
            <ColumnaLado
              tone="prod"
              eyebrow="Beatmaker"
              tituloPrincipal={nombreBeatmaker}
              tituloLink={linkBeatmaker}
              feat={obra.feat_beat || null}
              filas={[
                { label: 'Beat', value: obra.nombre_beat, vacioMsg: 'Aún no se tiene este dato' },
                { label: 'Fecha', value: fechaBeat, vacioMsg: 'Aún no se tiene este dato' },
              ]}
            />
          </div>

          {/* Videos con controles */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mt-8">
            <VideoSlot
              tone="artist"
              kicker="Obra"
              youtubeId={obra.youtube_id_obra}
              title={obra.nombre}
              fallbackThumb={thumbnailObra}
              fallbackText={obra.video_estado === 'no' ? 'Sin video disponible' : 'Sin embed disponible'}
              externalLink={obra.link_obra}
              start={obra.segundo_inicio_obra || 0}
              onReady={(player) => { playerObraRef.current = player }}
            />

            <div className="flex md:flex-col items-center justify-center gap-3 order-first md:order-none">
              <NavBoton
                direccion="anterior"
                habilitado={vecinos.anterior !== null}
                onClick={() => vecinos.anterior !== null && navigate(`/obras/${vecinos.anterior}`)}
              />
              <button
                onClick={toggleReproduccion}
                title={reproduciendo ? 'Pausar' : 'Reproducir obra y beat'}
                className="flex items-center justify-center w-12 h-12 rounded-full border border-line bg-surface text-gray-400 hover:border-side-artist hover:text-side-artist hover:scale-105 active:scale-95 transition-all"
              >
                {reproduciendo ? <PauseIcon /> : <PlayIcon />}
              </button>
              <NavBoton
                direccion="siguiente"
                habilitado={vecinos.siguiente !== null}
                onClick={() => vecinos.siguiente !== null && navigate(`/obras/${vecinos.siguiente}`)}
              />
            </div>

            <VideoSlot
              tone="prod"
              kicker="Beat"
              youtubeId={obra.youtube_id_beat}
              title={`Beat - ${obra.nombre}`}
              fallbackThumb={thumbnailBeat}
              fallbackText={obra.beat_vigente === 'no' ? 'Beat eliminado' : 'Sin video del beat'}
              externalLink={obra.link_beat}
              start={obra.segundo_inicio_beat || 0}
              onReady={(player) => { playerBeatRef.current = player }}
            />
          </div>

          {/* Links externos si no hay embed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              {!obra.youtube_id_obra && obra.link_obra && (
                <a href={obra.link_obra} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[10px] uppercase tracking-widest text-side-artist hover:text-paper transition-colors">
                  Ver obra en YouTube →
                </a>
              )}
            </div>
            <div>
              {!obra.youtube_id_beat && obra.link_beat && (
                <a href={obra.link_beat} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[10px] uppercase tracking-widest text-side-prod hover:text-paper transition-colors">
                  Ver beat →
                </a>
              )}
              {obra.otros_links_beat && (
                <div className="mt-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1">Otros links del beat:</p>
                  {obra.otros_links_beat.split('\n').filter(Boolean).map((link, i) => (
                    <a key={i} href={link.trim()} target="_blank" rel="noopener noreferrer"
                      className="block font-mono text-[10px] text-side-prod hover:text-paper transition-colors truncate">
                      {link.trim()}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Notas */}
        {obra.descripcion_beat && (
          <Nota tone="gray" titulo="Descripción del beat">{obra.descripcion_beat}</Nota>
        )}
        {obra.observacion && (
          <Nota tone="red" titulo="Observación">{obra.observacion}</Nota>
        )}
        {obra.fuente_recuperacion && (
          <Nota tone="gray" titulo="Fuente de recuperación">{obra.fuente_recuperacion}</Nota>
        )}

        {/* Letra */}
        <section className="mt-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10 sm:w-20 bg-line" />
            <h2 className="font-mono text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-400">Letra</h2>
            <div className="h-px w-10 sm:w-20 bg-line" />
          </div>

          <div className="bg-surface border border-line rounded-2xl px-6 sm:px-10 py-8 sm:py-10">
            {lineasLetra.length > 0 ? (
              <div className="max-w-2xl mx-auto">
                {(() => {
                  let contador = 0
                  return lineasLetra.map((linea, i) => {
                    const vacia = linea.trim() === ''
                    if (!vacia) contador++
                    const num = contador
                    return (
                      <p key={i} data-line-index={i}
                        className={vacia ? 'h-4' : 'group flex items-baseline gap-4 font-body text-paper/90 text-base sm:text-lg leading-[1.85] hover:text-side-artist transition-colors cursor-default'}
                      >
                        {!vacia && (
                          <span className="font-mono text-[10px] text-gray-600 group-hover:text-side-artist transition-colors w-7 shrink-0 text-right tabular-nums">
                            {String(num).padStart(2, '0')}
                          </span>
                        )}
                        <span>{linea}</span>
                      </p>
                    )
                  })
                })()}
              </div>
            ) : (
              <p className="text-center text-gray-500 font-mono text-sm uppercase tracking-widest py-6">
                Aún no se tiene la letra de esta obra
              </p>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}

/* ── YouTube API ── */
let ytApiPromise = null
function cargarYoutubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise((resolve) => {
    const previo = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { previo?.(); resolve(window.YT) }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })
  return ytApiPromise
}

/* ── Componentes ── */

function ColumnaLado({ tone, eyebrow, tituloPrincipal, tituloLink, feat, filas }) {
  const accent = tone === 'artist' ? 'text-side-artist' : 'text-side-prod'
  const accentBorder = tone === 'artist' ? 'border-side-artist/40' : 'border-side-prod/40'
  const hoverText = tone === 'artist' ? 'hover:text-side-artist' : 'hover:text-side-prod'

  return (
    <div className="flex flex-col">
      <p className={`font-mono text-[11px] uppercase tracking-widest mb-2 ${accent}`}>{eyebrow}</p>
      <div className="min-h-16 flex flex-col justify-start mb-5">
        {tituloLink ? (
          <a href={tituloLink} target="_blank" rel="noopener noreferrer"
            className={`font-display font-bold text-2xl sm:text-3xl text-paper ${hoverText} transition-colors`}>
            {tituloPrincipal}
          </a>
        ) : (
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-paper">{tituloPrincipal}</h3>
        )}
        {feat && (
          <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 mt-1">
            ft. {feat}
          </p>
        )}
      </div>
      <dl className={`flex flex-col gap-3 border-l-2 ${accentBorder} pl-4`}>
        {filas.map((fila, i) => (
          <div key={i} className="group">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">{fila.label}</dt>
            {fila.value ? (
              <dd className={`text-sm text-gray-200 transition-colors group-hover:${tone === 'artist' ? 'text-side-artist' : 'text-side-prod'}`}>
                {fila.value}
              </dd>
            ) : (
              <dd className="text-sm text-gray-600 italic">{fila.vacioMsg || '—'}</dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  )
}

function VideoSlot({ tone, kicker, youtubeId, title, fallbackThumb, fallbackText, externalLink, start, onReady }) {
  const accent = tone === 'artist' ? 'text-side-artist' : 'text-side-prod'
  const ring = tone === 'artist' ? 'ring-side-artist/20' : 'ring-side-prod/20'
  const hoverBorder = tone === 'artist' ? 'hover:border-side-artist/60' : 'hover:border-side-prod/60'

  const playerRef = useRef(null)
  const elementIdRef = useRef(`yt-${tone}-${Math.random().toString(36).slice(2, 8)}`)

  useEffect(() => {
    if (!youtubeId) return
    let destruido = false
    const elementId = elementIdRef.current
    cargarYoutubeApi().then((YT) => {
      if (destruido || !document.getElementById(elementId)) return
      playerRef.current = new YT.Player(elementId, {
        videoId: youtubeId,
        playerVars: { start: Math.floor(start || 0), rel: 0, modestbranding: 1 },
        events: { onReady: (e) => onReady?.(e.target) },
      })
    })
    return () => {
      destruido = true
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [youtubeId])

  return (
    <div>
      <p className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${accent}`}>{kicker}</p>
      {youtubeId ? (
        <div className={`aspect-video rounded-xl overflow-hidden border border-line ring-1 ${ring} ${hoverBorder} transition-colors`}>
          <div id={elementIdRef.current} className="w-full h-full" />
        </div>
      ) : (
        <div className="aspect-video rounded-xl border border-line relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4">
          {fallbackThumb && (
            <img src={fallbackThumb} alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-25" />
          )}
          <p className="relative font-mono text-[10px] uppercase tracking-widest text-gray-500 text-center">
            {fallbackText}
          </p>
          {externalLink && (
            <a href={externalLink} target="_blank" rel="noopener noreferrer"
              className={`relative font-mono text-[10px] uppercase tracking-widest text-gray-400 transition-colors ${tone === 'artist' ? 'hover:text-side-artist' : 'hover:text-side-prod'}`}>
              Abrir enlace →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function Badge({ valor, mapa }) {
  if (!valor || valor === 'no' || !mapa[valor]) return null
  const { label, tono } = mapa[valor]
  const colores = {
    green: 'border-green-700/50 text-green-400 bg-green-950/30',
    yellow: 'border-yellow-700/50 text-yellow-400 bg-yellow-950/30',
    red: 'border-side-artist/40 text-side-artist bg-side-artist-dim/20',
    blue: 'border-side-prod/40 text-side-prod bg-side-prod-dim/20',
  }
  return (
    <span className={`px-3 py-1 rounded-full border font-mono text-[10px] uppercase tracking-widest ${colores[tono]}`}>
      {label}
    </span>
  )
}

function Nota({ tone, titulo, children }) {
  const styles = {
    red: 'border-side-artist/30 text-side-artist',
    gray: 'border-line text-gray-300',
  }
  return (
    <div className={`bg-surface border ${styles[tone]} rounded-xl p-5 mb-4`}>
      <p className="font-mono text-[10px] uppercase tracking-widest mb-1.5">{titulo}</p>
      <p className="text-gray-300 text-sm leading-relaxed">{children}</p>
    </div>
  )
}

function NavBoton({ direccion, habilitado, onClick }) {
  return (
    <button onClick={onClick} disabled={!habilitado}
      title={direccion === 'anterior' ? 'Obra anterior' : 'Obra siguiente'}
      className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
        habilitado
          ? 'border-line text-gray-300 hover:border-side-artist hover:text-side-artist'
          : 'border-line/40 text-gray-700 cursor-not-allowed'
      }`}>
      <span className="text-lg leading-none">{direccion === 'anterior' ? '←' : '→'}</span>
    </button>
  )
}

function PlayIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
}

function PauseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
}