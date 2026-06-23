from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import obras

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ObrasDeSolitario API",
    description="Archivo completo de la discografía de Solitario",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL de React en dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(obras.router)

@app.get("/")
def root():
    return {"mensaje": "ObrasDeSolitario API funcionando ✓"}