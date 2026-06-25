from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routes import obras, auth, artistas, beatmakers
import os
import app.models.usuario
import app.models.artista
import app.models.beatmaker

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ObrasDeSolitario API",
    description="Archivo completo de la discografía de Solitario",
    version="1.0.0"
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(obras.router)
app.include_router(auth.router)
app.include_router(artistas.router)
app.include_router(beatmakers.router)

@app.get("/")
def root():
    return {"mensaje": "ObrasDeSolitario API funcionando ✓"}