import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.obra import Obra
from app.models.artista import Artista
from app.models.beatmaker import Beatmaker

db = SessionLocal()

# ── Migrar artistas únicos desde el campo "canal" ──
print("Migrando artistas...")
canales = db.query(Obra.canal, Obra.link_canal_artista).distinct().all()

artista_map = {}  # canal → id

for canal, link in canales:
    if not canal or canal.strip() == '' or canal == '¿?':
        continue
    existente = db.query(Artista).filter(Artista.nombre == canal.strip()).first()
    if not existente:
        nuevo = Artista(
            nombre=canal.strip(),
            canal_yt=link if link else None
        )
        db.add(nuevo)
        db.flush()
        artista_map[canal.strip()] = nuevo.id
        print(f"  + Artista: {canal.strip()}")
    else:
        artista_map[canal.strip()] = existente.id

# ── Migrar beatmakers únicos desde el campo "autor_beat" ──
print("\nMigrando beatmakers...")
beats = db.query(Obra.autor_beat, Obra.link_canal_beat).distinct().all()

beatmaker_map = {}  # autor_beat → id

for autor, link in beats:
    if not autor or autor.strip() == '':
        continue
    existente = db.query(Beatmaker).filter(Beatmaker.nombre == autor.strip()).first()
    if not existente:
        nuevo = Beatmaker(
            nombre=autor.strip(),
            canal_yt=link if link else None
        )
        db.add(nuevo)
        db.flush()
        beatmaker_map[autor.strip()] = nuevo.id
        print(f"  + Beatmaker: {autor.strip()}")
    else:
        beatmaker_map[autor.strip()] = existente.id

db.commit()

# ── Actualizar obras con los IDs ──
print("\nActualizando obras con artista_id y beatmaker_id...")
obras = db.query(Obra).all()
actualizadas = 0

for obra in obras:
    if obra.canal and obra.canal.strip() in artista_map:
        obra.artista_id = artista_map[obra.canal.strip()]
    if obra.autor_beat and obra.autor_beat.strip() in beatmaker_map:
        obra.beatmaker_id = beatmaker_map[obra.autor_beat.strip()]
    actualizadas += 1

db.commit()
db.close()

print(f"\n✅ Migración completa:")
print(f"   {len(artista_map)} artistas creados")
print(f"   {len(beatmaker_map)} beatmakers creados")
print(f"   {actualizadas} obras actualizadas")