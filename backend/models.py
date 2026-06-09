from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Boolean
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    saves = relationship("GameSave", back_populates="user", cascade="all, delete-orphan")


class GameSave(Base):
    __tablename__ = "game_saves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    save_slot = Column(Integer, default=1)
    save_version = Column(Integer, default=1)
    game_data = Column(JSON, nullable=False)
    day_reached = Column(Integer, default=1)
    score = Column(Integer, default=0)
    pet_name = Column(String(50), default="Fluffy")
    player_name = Column(String(50), default="Player")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="saves")
