import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getObra } from '../api/obras'

export default function ObraDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [obra, setObra] = useState(null)
  const [loading, setLoading] = useState(true)
  const [vecinos, setVecinos] = useState({ anterior: null, siguiente: null })

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

  const limpiarFecha = (fecha) => {
    if (!fecha) return null
    if (typeof fecha === 'string' && fecha.includes('00:00:00')) return fecha.split(' ')[0]
    return fecha
  }

  /* -------------------------------------------------------------- */
  /* Reproducción sincronizada de ambos videos (obra + beat)         */
  /* -------------------------------------------------------------- */
  const [reproduciendo, setReproduciendo] = useState(false)
  const startObra = 0
  const startBeat = 0

  const playerObraRef = useRef(null)
  const playerBeatRef = useRef(null)

  const toggleReproduccion = useCallback(() => {
    const siguiente = !reproduciendo
    setReproduciendo(siguiente)
    const accion = siguiente ? 'playVideo' : 'pauseVideo'
    playerObraRef.current?.[accion]?.()
    playerBeatRef.current?.[accion]?.()
  }, [reproduciendo])

  useEffect(() => {
    setReproduciendo(false)
    playerObraRef.current = null
    playerBeatRef.current = null
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
        <div className="flex items-center gap-3 text-side-artist font-mono text-sm tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-side-artist animate-pulse" />
          Cargando ficha técnica...
        </div>
      </div>
    )
  }

  if (!obra) {
    return (
      <div className="min-h-screen bg-ink text-paper flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Obra no encontrada</p>
      </div>
    )
  }

  const fechaObra = limpiarFecha(obra.fecha_obra)
  const fechaBeat = limpiarFecha(obra.fecha_beat)
  const lineasLetra = obra.letra ? obra.letra.split('\n') : []

  const thumbnailObra = obra.youtube_id_obra
    ? `https://img.youtube.com/vi/${obra.youtube_id_obra}/hqdefault.jpg`
    : null

  return (
    <div className="min-h-screen bg-ink text-paper grain-bg">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">

        {/* ===== HEADER ===== */}
        <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
            {obra.eliminada && <Badge tone="red">Eliminada</Badge>}
            {obra.completa && <Badge tone="gray">Completa</Badge>}
            {obra.tiene_instrumental && <Badge tone="red">Instrumental recuperada</Badge>}
        </div>
        </header>

        {/* ===== CUERPO SIMÉTRICO: Artista | Productor ===== */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

            {/* --- LADO ARTISTA (izquierda) --- */}
            <ColumnaLado
              tone="artist"
              eyebrow="Artista"
              tituloPrincipal={obra.canal || 'Solitario'}
              tituloLink={obra.link_canal_artista}
              filas={[
                { label: 'Obra', value: obra.nombre },
                { label: 'Fecha', value: fechaObra },
              ]}
            />

            {/* --- LADO PRODUCTOR (derecha) --- */}
            <ColumnaLado
              tone="prod"
              eyebrow="Beatmaker"
              tituloPrincipal={obra.autor_beat || 'Desconocido'}
              tituloLink={obra.link_canal_beat}
              filas={[
                { label: 'Beat', value: obra.nombre_beat, vacioMsg: 'Aún no se tiene este dato' },
                { label: 'Fecha', value: fechaBeat, vacioMsg: 'Aún no se tiene este dato' },
              ]}
            />
          </div>

          {/* --- VIDEOS, con controles de navegación centrados entre ambos --- */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-6 items-center mt-8">
            <VideoSlot
              tone="artist"
              kicker="Obra"
              youtubeId={obra.youtube_id_obra}
              title={obra.nombre}
              fallbackThumb={thumbnailObra}
              fallbackText="Sin video disponible"
              start={startObra}
              onReady={(player) => { playerObraRef.current = player }}
            />

            {/* Controles centrados: anterior · reproducir/pausar ambos · siguiente */}
            <div className="flex md:flex-col items-center justify-center gap-3 order-first md:order-none">
              <NavBoton
                direccion="anterior"
                habilitado={vecinos.anterior !== null}
                onClick={() => vecinos.anterior !== null && navigate(`/obras/${vecinos.anterior}`)}
              />
              <button
                onClick={toggleReproduccion}
                title={reproduciendo ? 'Pausar obra y beat' : 'Reproducir obra y beat al mismo tiempo'}
                className="flex items-center justify-center w-12 h-12 rounded-full border border-line bg-surface text-gray-400 hover:border-side-artist hover:text-side-artist hover:bg-surface-raised hover:scale-105 active:scale-95 transition-all"
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
              fallbackText={obra.link_beat ? 'Beat en plataforma externa' : 'Sin beat disponible'}
              externalLink={obra.youtube_id_beat ? null : obra.link_beat}
              start={startBeat}
              onReady={(player) => { playerBeatRef.current = player }}
            />
          </div>
        </section>

        {/* ===== Descripción del beat ===== */}
        {obra.descripcion_beat && (
          <Nota tone="gray" titulo="Descripción del beat">
            {obra.descripcion_beat}
          </Nota>
        )}

        {/* ===== Observación ===== */}
        {obra.observacion && (
          <Nota tone="red" titulo="Observación">
            {obra.observacion}
          </Nota>
        )}

        {/* ===== Fuente de recuperación ===== */}
        {obra.fuente_recuperacion && (
          <Nota tone="gray" titulo="Fuente de recuperación">
            {obra.fuente_recuperacion}
          </Nota>
        )}

        {/* ===== LETRA — siempre visible, con mensaje por defecto si falta ===== */}
        <section className="mt-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10 sm:w-20 bg-line" />
            <h2 className="font-mono text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-400">
              Letra
            </h2>
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
                      <p
                        key={i}
                        data-line-index={i}
                        className={
                          vacia
                            ? 'h-4'
                            : 'group flex items-baseline gap-4 font-body text-paper/90 text-base sm:text-lg leading-[1.85] hover:text-side-artist transition-colors cursor-default'
                        }
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

/* ---------------------------------------------------------------- */
/* YouTube IFrame API: helper para cargar el script una sola vez     */
/* ---------------------------------------------------------------- */

let ytApiPromise = null

function cargarYoutubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (ytApiPromise) return ytApiPromise

  ytApiPromise = new Promise((resolve) => {
    const previo = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previo?.()
      resolve(window.YT)
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })
  return ytApiPromise
}

/* ---------------------------------------------------------------- */
/* Componentes internos                                              */
/* ---------------------------------------------------------------- */

function ColumnaLado({ tone, eyebrow, tituloPrincipal, tituloLink, filas }) {
  const accent = tone === 'artist' ? 'text-side-artist' : 'text-side-prod'
  const accentBorder = tone === 'artist' ? 'border-side-artist/40' : 'border-side-prod/40'
  const hoverText = tone === 'artist' ? 'hover:text-side-artist' : 'hover:text-side-prod'

  return (
    <div className="flex flex-col">
      <p className={`font-mono text-[11px] uppercase tracking-widest mb-2 ${accent}`}>
        {eyebrow}
      </p>
      <div className="min-h-16 flex items-start">
        {tituloLink ? (
          <a
            href={tituloLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-display font-bold text-2xl sm:text-3xl mb-5 text-paper ${hoverText} transition-colors inline-flex items-baseline gap-2 w-fit`}
          >
            {tituloPrincipal}
          </a>
        ) : (
          <h3 className="font-display font-bold text-2xl sm:text-3xl mb-5 text-paper">
            {tituloPrincipal}
          </h3>
        )}
      </div>


      <dl className={`flex flex-col gap-3 border-l-2 ${accentBorder} pl-4`}>
        {filas.map((fila, i) => (
          <div key={i} className="group">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">
              {fila.label}
            </dt>
            {fila.value ? (
              <dd className={`text-sm text-gray-200 transition-colors group-hover:${tone === 'artist' ? 'text-side-artist' : 'text-side-prod'}`}>
                {fila.value}
              </dd>
            ) : (
              <dd className="text-sm text-gray-600 italic">{fila.vacioMsg || 'Aún no se tiene este dato'}</dd>
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
  const elementIdRef = useRef(`yt-player-${tone}-${youtubeId || 'none'}-${Math.random().toString(36).slice(2, 8)}`)

  useEffect(() => {
    if (!youtubeId) return
    let destruido = false
    const elementId = elementIdRef.current

    cargarYoutubeApi().then((YT) => {
      if (destruido || !document.getElementById(elementId)) return
      playerRef.current = new YT.Player(elementId, {
        videoId: youtubeId,
        playerVars: {
          start: start || 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e) => onReady?.(e.target),
        },
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
      <p className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${accent}`}>
        {kicker}
      </p>

      {youtubeId ? (
        <div className={`aspect-video rounded-xl overflow-hidden border border-line ring-1 ${ring} ${hoverBorder} transition-colors`}>
          <div id={elementIdRef.current} className="w-full h-full" />
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-xl aspect-video flex flex-col items-center justify-center gap-2 p-4 relative overflow-hidden">
          {fallbackThumb && (
            <img src={fallbackThumb} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <p className="relative text-gray-500 text-xs text-center font-mono uppercase tracking-wide">
            {fallbackText}
          </p>
          {externalLink && (
            <a
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative text-xs text-gray-400 transition-colors ${tone === 'artist' ? 'hover:text-side-artist' : 'hover:text-side-prod'}`}
            >
              Abrir enlace →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function NavBoton({ direccion, habilitado, onClick }) {
  const esAnterior = direccion === 'anterior'
  return (
    <button
      onClick={onClick}
      disabled={!habilitado}
      title={esAnterior ? 'Obra anterior' : 'Obra siguiente'}
      className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
        habilitado
          ? 'border-line text-gray-300 hover:border-side-artist hover:text-side-artist'
          : 'border-line/40 text-gray-700 cursor-not-allowed'
      }`}
    >
      <span aria-hidden className="text-lg leading-none">{esAnterior ? '←' : '→'}</span>
    </button>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  )
}

function Badge({ tone, children }) {
  const styles = {
    red: 'bg-side-artist-dim/40 text-side-artist border-side-artist/40',
    gray: 'bg-surface-raised text-gray-300 border-line',
  }
  return (
    <span className={`px-3 py-1 rounded-full border ${styles[tone]}`}>
      {children}
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