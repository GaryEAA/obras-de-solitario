from sqlalchemy import Column, Integer, String, Boolean, Date, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Obra(Base):
    __tablename__ = "obras"

    id                  = Column(Integer, primary_key=True, index=True)
    nombre              = Column(String(255), nullable=False)
    feat                = Column(String(255), nullable=True)
    feat_beat = Column(String(255), nullable=True)
    
    # Relaciones
    artista_id          = Column(Integer, ForeignKey("artistas.id"), nullable=True)
    beatmaker_id        = Column(Integer, ForeignKey("beatmakers.id"), nullable=True)
    artista             = relationship("Artista", foreign_keys=[artista_id])
    beatmaker           = relationship("Beatmaker", foreign_keys=[beatmaker_id])

    # Campos legacy
    canal               = Column(String(100), nullable=True)
    autor_beat          = Column(String(255), nullable=True)
    link_canal_artista  = Column(String(500), nullable=True)
    link_canal_beat     = Column(String(500), nullable=True)

    # Fechas
    fecha_obra          = Column(String(100), nullable=True)
    fecha_beat          = Column(Date, nullable=True)

    # Links
    link_obra           = Column(Text, nullable=True)
    link_beat           = Column(Text, nullable=True)
    otros_links_beat    = Column(Text, nullable=True)
    youtube_id_obra     = Column(String(50), nullable=True)
    youtube_id_beat     = Column(String(50), nullable=True)

    # Miniaturas
    miniatura_obra      = Column(String(500), nullable=True)
    miniatura_beat      = Column(String(500), nullable=True)
    miniatura_obra_tipo = Column(String(20), default='no')
    miniatura_beat_tipo = Column(String(20), default='no')

    # Estado obra
    video_estado        = Column(String(20), default='no')
    video_original      = Column(String(20), default='si')
    audio_estado        = Column(String(20), default='no')
    obra_vigente        = Column(String(20), default='publico')
    letra_estado        = Column(String(20), default='no')
    letra               = Column(Text, nullable=True)

    # Estado instrumental
    instrumental_estado = Column(String(20), default='no')
    tiene_audio         = Column(Boolean, default=False)
    tiene_instrumental  = Column(Boolean, default=False)
    fuente_recuperacion = Column(String(255), nullable=True)

    # Estado beat
    nombre_beat         = Column(String(255), nullable=True)
    beat_original       = Column(String(20), default='si')
    beat_vigente        = Column(String(20), default='publico')
    descripcion_beat    = Column(Text, nullable=True)

    # Flags legacy
    completa            = Column(Boolean, default=False)
    eliminada           = Column(Boolean, default=False)
    observacion         = Column(Text, nullable=True)

    # Sincronización
    segundo_inicio_obra = Column(Float, nullable=True, default=0.0)
    segundo_inicio_beat = Column(Float, nullable=True, default=0.0)

    created_at          = Column(DateTime, server_default=func.now())
    updated_at          = Column(DateTime, server_default=func.now(), onupdate=func.now())