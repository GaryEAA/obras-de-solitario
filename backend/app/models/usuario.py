from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String(100), unique=True, nullable=False)
    password   = Column(String(255), nullable=False)
    es_admin   = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())