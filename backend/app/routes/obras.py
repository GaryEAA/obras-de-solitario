import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.database import get_db
from app.models.obra import Obra
from app.schemas.obra import ObraCreate, ObraUpdate, ObraOut
from app.auth import get_current_user

router = APIRouter(prefix="/obras", tags=["Obras"])

UPLOADS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "static", "uploads"
)
os.makedirs(UPLOADS_DIR, exist_ok=True)

EXTENSIONES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

@router.post("/upload")
def subir_archivo(
    archivo: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    nombre_original = archivo.filename or ""
    extension = os.path.splitext(nombre_original)[1].lower()

    if extension not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(
            status_code=400,
            detail=f"Extensión no permitida. Usa: {', '.join(sorted(EXTENSIONES_PERMITIDAS))}"
        )

    nombre_archivo = f"{uuid.uuid4().hex}{extension}"
    ruta_destino = os.path.join(UPLOADS_DIR, nombre_archivo)

    with open(ruta_destino, "wb") as buffer:
        buffer.write(archivo.file.read())

    return {"url": f"/static/uploads/{nombre_archivo}"}

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
    query = db.query(Obra)

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
    total = db.query(Obra).count()
    completas = db.query(Obra).filter(Obra.completa == True).count()
    eliminadas = db.query(Obra).filter(Obra.eliminada == True).count()
    con_instrumental = db.query(Obra).filter(Obra.tiene_instrumental == True).count()
    con_audio = db.query(Obra).filter(Obra.tiene_audio == True).count()

    return {
        "total": total,
        "completas": completas,
        "eliminadas": eliminadas,
        "con_instrumental": con_instrumental,
        "con_audio": con_audio,
        "pct_completas": round(completas / total * 100, 1) if total else 0,
        "pct_eliminadas": round(eliminadas / total * 100, 1) if total else 0,
        "pct_instrumental_recuperada": round(con_instrumental / eliminadas * 100, 1) if eliminadas else 0,
    }

@router.get("/{id}", response_model=ObraOut)
def obtener_obra(id: int, db: Session = Depends(get_db)):
    obra = db.query(Obra).filter(Obra.id == id).first()
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
    return obra

@router.delete("/{id}")
def eliminar_obra(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    obra = db.query(Obra).filter(Obra.id == id).first()
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    db.delete(obra)
    db.commit()
    return {"mensaje": "Obra eliminada"}