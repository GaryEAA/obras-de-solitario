from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ObraBase(BaseModel):
    nombre: str
    feat: Optional[str] = None
    canal: Optional[str] = None
    fecha_obra: Optional[str] = None
    completa: Optional[bool] = False
    eliminada: Optional[bool] = False
    autor_beat: Optional[str] = None
    beat_original: Optional[str] = None
    fecha_beat: Optional[date] = None
    link_obra: Optional[str] = None
    link_beat: Optional[str] = None
    youtube_id_obra: Optional[str] = None
    youtube_id_beat: Optional[str] = None
    observacion: Optional[str] = None
    tiene_audio: Optional[bool] = False
    tiene_instrumental: Optional[bool] = False
    fuente_recuperacion: Optional[str] = None

class ObraCreate(ObraBase):
    pass

class ObraUpdate(ObraBase):
    nombre: Optional[str] = None  # todos opcionales al editar

class ObraOut(ObraBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True