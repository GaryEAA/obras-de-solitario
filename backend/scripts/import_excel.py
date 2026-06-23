import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from app.database import SessionLocal, engine, Base
from app.models.obra import Obra

Base.metadata.create_all(bind=engine)

def extraer_youtube_id(url):
    """Extrae el ID de YouTube de un link"""
    if not url or pd.isna(url):
        return None
    url = str(url).strip()
    if "youtu.be/" in url:
        return url.split("youtu.be/")[-1].split("?")[0]
    if "v=" in url:
        return url.split("v=")[-1].split("&")[0]
    return None

def limpiar_bool(valor):
    if pd.isna(valor):
        return False
    return str(valor).strip().lower() == "sí"

def importar():
    ruta_excel = os.path.join(os.path.dirname(__file__), "..", "obras.xlsx")
    
    df = pd.read_excel(ruta_excel, header=None)

    db = SessionLocal()
    insertadas = 0
    errores = 0

    for i, row in df.iloc[2:].iterrows():
        try:
            nombre = str(row[2]).strip() if not pd.isna(row[2]) else None
            if not nombre or nombre == "nan":
                continue

            obra = Obra(
                nombre=nombre,
                feat=str(row[3]).strip() if not pd.isna(row[3]) else None,
                canal=str(row[4]).strip() if not pd.isna(row[4]) else None,
                fecha_obra=str(row[5]).strip() if not pd.isna(row[5]) else None,
                completa=limpiar_bool(row[6]),
                eliminada=limpiar_bool(row[7]),
                autor_beat=str(row[8]).strip() if not pd.isna(row[8]) else None,
                beat_original=str(row[9]).strip() if not pd.isna(row[9]) else None,
                link_obra=str(row[11]).strip() if not pd.isna(row[11]) else None,
                link_beat=str(row[12]).strip() if not pd.isna(row[12]) else None,
                youtube_id_obra=extraer_youtube_id(row[11]),
                youtube_id_beat=extraer_youtube_id(row[12]),
                observacion=str(row[13]).strip() if not pd.isna(row[13]) else None,
            )
            db.add(obra)
            insertadas += 1

        except Exception as e:
            print(f"Error en fila {i}: {e}")
            errores += 1

    db.commit()
    db.close()
    print(f"\nImportación completa: {insertadas} obras insertadas, {errores} errores")

if __name__ == "__main__":
    importar()