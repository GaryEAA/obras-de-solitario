from sqlalchemy import Column, Integer, String, Boolean, Date, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Obra(Base):
    __tablename__ = "obras"

    id                  = Column(Integer, primary_key=True, index=True)
    nombre              = Column(String(255), nullable=False)
    feat                = Column(String(255), nullable=True)
    canal               = Column(String(100), nullable=True)
    fecha_obra          = Column(String(100), nullable=True)
    completa            = Column(Boolean, default=False)
    eliminada           = Column(Boolean, default=False)
    autor_beat          = Column(String(255), nullable=True)
    nombre_beat         = Column(String(255), nullable=True)
    fecha_beat          = Column(Date, nullable=True)
    link_obra           = Column(Text, nullable=True)
    link_beat           = Column(Text, nullable=True)
    youtube_id_obra     = Column(String(50), nullable=True)
    youtube_id_beat     = Column(String(50), nullable=True)
    observacion         = Column(Text, nullable=True)
    tiene_audio         = Column(Boolean, default=False)
    tiene_instrumental  = Column(Boolean, default=False)
    fuente_recuperacion = Column(String(255), nullable=True)
    letra               = Column(Text, nullable=True)
    link_canal_artista  = Column(String(500), nullable=True)
    link_canal_beat     = Column(String(500), nullable=True)
    descripcion_beat    = Column(Text, nullable=True)
    created_at          = Column(DateTime, server_default=func.now())
    updated_at          = Column(DateTime, server_default=func.now(), onupdate=func.now())