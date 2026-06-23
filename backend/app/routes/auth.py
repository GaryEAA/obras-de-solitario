from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.auth import verificar_password, crear_token, hashear_password

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == form.username).first()
    if not usuario or not verificar_password(form.password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    token = crear_token({"sub": usuario.username})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def me(db: Session = Depends(get_db), username: str = Depends(lambda token=None: token)):
    return {"username": username}