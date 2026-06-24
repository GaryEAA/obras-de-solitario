from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ArtistaEmbed(BaseModel):
    id: int
    nombre: str
    canal_yt: Optional[str] = None
    otros_canales: Optional[str] = None
    class Config:
        from_attributes = True

class BeatmakerEmbed(BaseModel):
    id: int
    nombre: str
    canal_yt: Optional[str] = None
    otros_canales: Optional[str] = None
    class Config:
        from_attributes = True

class ObraBase(BaseModel):
    nombre: str
    feat: Optional[str] = None
    feat_beat: Optional[str] = None
    artista_id: Optional[int] = None
    beatmaker_id: Optional[int] = None

    # Legacy
    canal: Optional[str] = None
    autor_beat: Optional[str] = None
    link_canal_artista: Optional[str] = None
    link_canal_beat: Optional[str] = None

    # Fechas
    fecha_obra: Optional[str] = None
    fecha_beat: Optional[date] = None

    # Links
    link_obra: Optional[str] = None
    link_beat: Optional[str] = None
    otros_links_beat: Optional[str] = None
    youtube_id_obra: Optional[str] = None
    youtube_id_beat: Optional[str] = None

    # Miniaturas
    miniatura_obra: Optional[str] = None
    miniatura_beat: Optional[str] = None
    miniatura_obra_tipo: Optional[str] = 'no'
    miniatura_beat_tipo: Optional[str] = 'no'

    # Estado obra
    video_estado: Optional[str] = 'no'
    video_original: Optional[str] = 'si'
    audio_estado: Optional[str] = 'no'
    obra_vigente: Optional[str] = 'publico'
    letra_estado: Optional[str] = 'no'
    letra: Optional[str] = None

    # Estado instrumental
    instrumental_estado: Optional[str] = 'no'
    tiene_audio: Optional[bool] = False
    tiene_instrumental: Optional[bool] = False
    fuente_recuperacion: Optional[str] = None

    # Beat
    nombre_beat: Optional[str] = None
    beat_original: Optional[str] = 'si'
    beat_vigente: Optional[str] = 'publico'
    descripcion_beat: Optional[str] = None

    # Flags legacy
    completa: Optional[bool] = False
    eliminada: Optional[bool] = False
    observacion: Optional[str] = None

    # Sincronización
    segundo_inicio_obra: Optional[float] = 0.0
    segundo_inicio_beat: Optional[float] = 0.0

class ObraCreate(ObraBase):
    pass

class ObraUpdate(ObraBase):
    nombre: Optional[str] = None

class ObraOut(ObraBase):
    id: int
    artista: Optional[ArtistaEmbed] = None
    beatmaker: Optional[BeatmakerEmbed] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True