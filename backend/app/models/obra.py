from sqlalchemy import Column, Integer, String, Boolean, Date, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Obra(Base):
    __tablename__ = "obras"

    id               = Column(Integer, primary_key=True, index=True)
    nombre           = Column(String(255), nullable=False)
    feat             = Column(String(255), nullable=True)
    canal            = Column(String(100), nullable=True)
    fecha_obra       = Column(String(100), nullable=True)  # string por formato variado en el Excel
    completa         = Column(Boolean, default=False)
    eliminada        = Column(Boolean, default=False)
    autor_beat       = Column(String(255), nullable=True)
    beat_original    = Column(String(255), nullable=True)
    fecha_beat       = Column(Date, nullable=True)
    link_obra        = Column(Text, nullable=True)
    link_beat        = Column(Text, nullable=True)
    youtube_id_obra  = Column(String(50), nullable=True)   # extraído del link_obra
    youtube_id_beat  = Column(String(50), nullable=True)   # extraído del link_beat
    observacion      = Column(Text, nullable=True)
    tiene_audio      = Column(Boolean, default=False)      # recuperación
    tiene_instrumental = Column(Boolean, default=False)    # recuperación
    fuente_recuperacion = Column(String(255), nullable=True)
    created_at       = Column(DateTime, server_default=func.now())
    updated_at       = Column(DateTime, server_default=func.now(), onupdate=func.now())