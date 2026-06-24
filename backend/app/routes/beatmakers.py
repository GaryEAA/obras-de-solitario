from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.beatmaker import Beatmaker
from app.auth import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/beatmakers", tags=["Beatmakers"])

class BeatmakerCreate(BaseModel):
    nombre: str
    canal_yt: Optional[str] = None
    otros_canales: Optional[str] = None

class BeatmakerOut(BaseModel):
    id: int
    nombre: str
    canal_yt: Optional[str] = None
    otros_canales: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=list[BeatmakerOut])
def listar_beatmakers(db: Session = Depends(get_db)):
    return db.query(Beatmaker).order_by(Beatmaker.nombre).all()

@router.post("/", response_model=BeatmakerOut)
def crear_beatmaker(datos: BeatmakerCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    beatmaker = Beatmaker(**datos.model_dump())
    db.add(beatmaker)
    db.commit()
    db.refresh(beatmaker)
    return beatmaker

@router.put("/{id}", response_model=BeatmakerOut)
def editar_beatmaker(id: int, datos: BeatmakerCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    beatmaker = db.query(Beatmaker).filter(Beatmaker.id == id).first()
    if not beatmaker:
        raise HTTPException(status_code=404, detail="Beatmaker no encontrado")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(beatmaker, campo, valor)
    db.commit()
    db.refresh(beatmaker)
    return beatmaker

@router.delete("/{id}")
def eliminar_beatmaker(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    beatmaker = db.query(Beatmaker).filter(Beatmaker.id == id).first()
    if not beatmaker:
        raise HTTPException(status_code=404, detail="Beatmaker no encontrado")
    db.delete(beatmaker)
    db.commit()
    return {"mensaje": "Beatmaker eliminado"}