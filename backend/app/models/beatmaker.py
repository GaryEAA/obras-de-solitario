from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Beatmaker(Base):
    __tablename__ = "beatmakers"

    id            = Column(Integer, primary_key=True, index=True)
    nombre        = Column(String(255), nullable=False)
    canal_yt      = Column(String(500), nullable=True)
    otros_canales = Column(Text, nullable=True)
    created_at    = Column(DateTime, server_default=func.now())