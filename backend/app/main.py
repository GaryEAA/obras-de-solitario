from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import obras
from app.routes import auth
import app.models.usuario

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ObrasDeSolitario API",
    description="Archivo completo de la discografía de Solitario",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(obras.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"mensaje": "ObrasDeSolitario API funcionando ✓"}