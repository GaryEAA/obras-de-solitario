from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.artista import Artista
from app.auth import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/artistas", tags=["Artistas"])

class ArtistaCreate(BaseModel):
    nombre: str
    canal_yt: Optional[str] = None
    otros_canales: Optional[str] = None

class ArtistaOut(BaseModel):
    id: int
    nombre: str
    canal_yt: Optional[str] = None
    otros_canales: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=list[ArtistaOut])
def listar_artistas(db: Session = Depends(get_db)):
    return db.query(Artista).order_by(Artista.nombre).all()

@router.post("/", response_model=ArtistaOut)
def crear_artista(datos: ArtistaCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    artista = Artista(**datos.model_dump())
    db.add(artista)
    db.commit()
    db.refresh(artista)
    return artista

@router.put("/{id}", response_model=ArtistaOut)
def editar_artista(id: int, datos: ArtistaCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    artista = db.query(Artista).filter(Artista.id == id).first()
    if not artista:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(artista, campo, valor)
    db.commit()
    db.refresh(artista)
    return artista

@router.delete("/{id}")
def eliminar_artista(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    from app.models.obra import Obra
    artista = db.query(Artista).filter(Artista.id == id).first()
    if not artista:
        raise HTTPException(status_code=404, detail="Artista no encontrado")
    # Desasignar obras antes de eliminar
    db.query(Obra).filter(Obra.artista_id == id).update({"artista_id": None})
    db.delete(artista)
    db.commit()
    return {"mensaje": "Artista eliminado"}

@router.get("/{id}/obras")
def obras_del_artista(id: int, db: Session = Depends(get_db)):
    from app.models.obra import Obra
    obras = db.query(Obra.id, Obra.nombre).filter(Obra.artista_id == id).all()
    return [{"id": o.id, "nombre": o.nombre} for o in obras]