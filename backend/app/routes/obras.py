import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, case, text
from typing import Optional
from app.database import get_db
from app.models.obra import Obra
from app.models.artista import Artista
from app.models.beatmaker import Beatmaker
from app.schemas.obra import ObraCreate, ObraUpdate, ObraOut
from app.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime
import re

router = APIRouter(prefix="/obras", tags=["Obras"])

UPLOADS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "static", "uploads"
)
os.makedirs(UPLOADS_DIR, exist_ok=True)
EXTENSIONES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

# Cache simple para stats
_stats_cache = {"data": None, "ts": None}
CACHE_TTL = 300  # 5 minutos

class ObraCard(BaseModel):
    id: int
    nombre: str
    feat: Optional[str] = None
    fecha_obra: Optional[str] = None
    obra_vigente: Optional[str] = None
    video_estado: Optional[str] = None
    audio_estado: Optional[str] = None
    letra_estado: Optional[str] = None
    instrumental_estado: Optional[str] = None
    completa: Optional[bool] = None
    tiene_instrumental: Optional[bool] = None
    miniatura_obra: Optional[str] = None
    youtube_id_obra: Optional[str] = None
    artista_nombre: Optional[str] = None
    beatmaker_nombre: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedObras(BaseModel):
    items: list[ObraCard]
    total: int
    pagina: int
    total_paginas: int
    tiene_siguiente: bool
    tiene_anterior: bool

def parsear_fecha(fecha_str):
    """Intenta parsear la fecha — retorna None si el formato es raro"""
    if not fecha_str:
        return None
    fecha_str = fecha_str.strip()
    if fecha_str.startswith('(') or fecha_str.startswith('?'):
        return None
    formatos = ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%d/%m/%Y', '%Y/%m/%d']
    for fmt in formatos:
        try:
            return datetime.strptime(fecha_str[:10], fmt[:10])
        except Exception:
            pass
    return None

@router.post("/upload")
def subir_archivo(
    archivo: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    nombre_original = archivo.filename or ""
    extension = os.path.splitext(nombre_original)[1].lower()
    if extension not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(status_code=400, detail=f"Extensión no permitida.")
    nombre_archivo = f"{uuid.uuid4().hex}{extension}"
    ruta_destino = os.path.join(UPLOADS_DIR, nombre_archivo)
    with open(ruta_destino, "wb") as buffer:
        buffer.write(archivo.file.read())
    return {"url": f"/static/uploads/{nombre_archivo}"}

@router.get("/catalogo", response_model=PaginatedObras)
def catalogo(
    busqueda: Optional[str] = Query(None),
    obra_vigente: Optional[str] = Query(None),
    completa: Optional[bool] = Query(None),
    tiene_instrumental: Optional[bool] = Query(None),
    beatmaker_id: Optional[int] = Query(None),
    tiene_feat: Optional[bool] = Query(None),
    letra_estado: Optional[str] = Query(None),
    tiene_miniatura: Optional[bool] = Query(None),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(
        Obra.id, Obra.nombre, Obra.feat, Obra.fecha_obra,
        Obra.obra_vigente, Obra.video_estado, Obra.audio_estado,
        Obra.letra_estado, Obra.instrumental_estado,
        Obra.completa, Obra.tiene_instrumental,
        Obra.miniatura_obra, Obra.youtube_id_obra,
        Artista.nombre.label('artista_nombre'),
        Beatmaker.nombre.label('beatmaker_nombre'),
    ).outerjoin(Artista, Obra.artista_id == Artista.id)\
     .outerjoin(Beatmaker, Obra.beatmaker_id == Beatmaker.id)

    if busqueda:
        query = query.filter(or_(
            Obra.nombre.ilike(f"%{busqueda}%"),
            Obra.feat.ilike(f"%{busqueda}%"),
        ))
    if obra_vigente:
        query = query.filter(Obra.obra_vigente == obra_vigente)
    if completa is not None:
        query = query.filter(Obra.completa == completa)
    if tiene_instrumental is not None:
        query = query.filter(Obra.tiene_instrumental == tiene_instrumental)
    if beatmaker_id is not None:
        query = query.filter(Obra.beatmaker_id == beatmaker_id)
    if tiene_feat is not None:
        if tiene_feat:
            query = query.filter(Obra.feat.isnot(None), Obra.feat != '', Obra.feat != '-')
        else:
            query = query.filter(or_(Obra.feat.is_(None), Obra.feat == '', Obra.feat == '-'))
    if letra_estado:
        query = query.filter(Obra.letra_estado == letra_estado)
    if tiene_miniatura is not None:
        if tiene_miniatura:
            query = query.filter(or_(
                Obra.miniatura_obra.isnot(None),
                Obra.youtube_id_obra.isnot(None)
            ))
        else:
            query = query.filter(
                Obra.miniatura_obra.is_(None),
                Obra.youtube_id_obra.is_(None)
            )

    # Ordenar por fecha — sin fecha al final
    query = query.order_by(
        case(
            (Obra.fecha_obra.is_(None), 1),
            (Obra.fecha_obra == '', 1),
            (Obra.fecha_obra.like('(%'), 1),
            else_=0
        ),
        Obra.fecha_obra.desc()
    )

    total = query.count()
    offset = (pagina - 1) * por_pagina
    items_raw = query.offset(offset).limit(por_pagina).all()

    items = [ObraCard(
        id=r.id, nombre=r.nombre, feat=r.feat,
        fecha_obra=r.fecha_obra, obra_vigente=r.obra_vigente,
        video_estado=r.video_estado, audio_estado=r.audio_estado,
        letra_estado=r.letra_estado, instrumental_estado=r.instrumental_estado,
        completa=r.completa, tiene_instrumental=r.tiene_instrumental,
        miniatura_obra=r.miniatura_obra, youtube_id_obra=r.youtube_id_obra,
        artista_nombre=r.artista_nombre, beatmaker_nombre=r.beatmaker_nombre,
    ) for r in items_raw]

    total_paginas = (total + por_pagina - 1) // por_pagina

    return PaginatedObras(
        items=items,
        total=total,
        pagina=pagina,
        total_paginas=total_paginas,
        tiene_siguiente=pagina < total_paginas,
        tiene_anterior=pagina > 1,
    )

@router.get("/", response_model=list[ObraOut])
def listar_obras(
    busqueda: Optional[str] = Query(None),
    canal: Optional[str] = Query(None),
    completa: Optional[bool] = Query(None),
    eliminada: Optional[bool] = Query(None),
    tiene_instrumental: Optional[bool] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Obra).options(
        joinedload(Obra.artista),
        joinedload(Obra.beatmaker)
    )
    if busqueda:
        query = query.filter(or_(
            Obra.nombre.ilike(f"%{busqueda}%"),
            Obra.feat.ilike(f"%{busqueda}%"),
            Obra.autor_beat.ilike(f"%{busqueda}%"),
        ))
    if canal is not None:
        query = query.filter(Obra.canal == canal)
    if completa is not None:
        query = query.filter(Obra.completa == completa)
    if eliminada is not None:
        query = query.filter(Obra.eliminada == eliminada)
    if tiene_instrumental is not None:
        query = query.filter(Obra.tiene_instrumental == tiene_instrumental)
    return query.offset(skip).limit(limit).all()

@router.get("/stats")
def estadisticas(db: Session = Depends(get_db)):
    from datetime import datetime as dt
    now = dt.now().timestamp()
    if _stats_cache["data"] and _stats_cache["ts"] and (now - _stats_cache["ts"]) < CACHE_TTL:
        return _stats_cache["data"]

    total = db.query(Obra).count()
    completas = db.query(Obra).filter(Obra.completa == True).count()
    eliminadas = db.query(Obra).filter(Obra.obra_vigente == 'no').count()
    con_instrumental = db.query(Obra).filter(Obra.tiene_instrumental == True).count()
    con_audio = db.query(Obra).filter(Obra.tiene_audio == True).count()

    data = {
        "total": total,
        "completas": completas,
        "eliminadas": eliminadas,
        "con_instrumental": con_instrumental,
        "con_audio": con_audio,
        "pct_completas": round(completas / total * 100, 1) if total else 0,
        "pct_eliminadas": round(eliminadas / total * 100, 1) if total else 0,
        "pct_instrumental_recuperada": round(con_instrumental / eliminadas * 100, 1) if eliminadas else 0,
    }
    _stats_cache["data"] = data
    _stats_cache["ts"] = now
    return data

@router.get("/{id}", response_model=ObraOut)
def obtener_obra(id: int, db: Session = Depends(get_db)):
    obra = db.query(Obra).options(
        joinedload(Obra.artista),
        joinedload(Obra.beatmaker)
    ).filter(Obra.id == id).first()
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    return obra

@router.post("/", response_model=ObraOut)
def crear_obra(obra: ObraCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    nueva = Obra(**obra.model_dump())
    nueva.tiene_audio = (nueva.audio_estado or 'no') != 'no'
    nueva.tiene_instrumental = (nueva.instrumental_estado or 'no') != 'no'
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    _stats_cache["data"] = None
    return nueva

@router.put("/{id}", response_model=ObraOut)
def editar_obra(id: int, datos: ObraUpdate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    obra = db.query(Obra).filter(Obra.id == id).first()
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(obra, campo, valor)
    obra.tiene_audio = (obra.audio_estado or 'no') != 'no'
    obra.tiene_instrumental = (obra.instrumental_estado or 'no') != 'no'
    db.commit()
    db.refresh(obra)
    _stats_cache["data"] = None
    return obra

@router.delete("/{id}")
def eliminar_obra(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    obra = db.query(Obra).filter(Obra.id == id).first()
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    db.delete(obra)
    db.commit()
    _stats_cache["data"] = None
    return {"mensaje": "Obra eliminada"}