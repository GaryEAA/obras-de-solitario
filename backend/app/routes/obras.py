from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.database import get_db
from app.models.obra import Obra
from app.schemas.obra import ObraCreate, ObraUpdate, ObraOut

router = APIRouter(prefix="/obras", tags=["Obras"])

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
def crear_obra(obra: ObraCreate, db: Session = Depends(get_db)):
    nueva = Obra(**obra.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.put("/{id}", response_model=ObraOut)
def editar_obra(id: int, datos: ObraUpdate, db: Session = Depends(get_db)):
    obra = db.query(Obra).filter(Obra.id == id).first()
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(obra, campo, valor)
    db.commit()
    db.refresh(obra)
    return obra

@router.delete("/{id}")
def eliminar_obra(id: int, db: Session = Depends(get_db)):
    obra = db.query(Obra).filter(Obra.id == id).first()
    if not obra:
        raise HTTPException(status_code=404, detail="Obra no encontrada")
    db.delete(obra)
    db.commit()
    return {"mensaje": "Obra eliminada"}