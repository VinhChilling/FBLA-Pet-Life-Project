from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class PetState(BaseModel):
    name: str = "Fluffy"
    type: str = "Dog"
    mood: str = "Happy"
    energy: int = 75
    health: int = 90
    evolutionStage: int = 0
    evolutionHistory: list[Any] = Field(default_factory=list)


class PlayerState(BaseModel):
    name: str = "Player"
    currentDay: int = 1
    coins: int = 10
    expenses: int = 0
    health: int = 90
    mood: int = 75
    difficulty: str = "normal"
    currentPoints: int = 0
    potentialPoints: int = 100
    avgSleepHours: float = 0


class GameStateCreate(BaseModel):
    pet: dict[str, Any]
    player: dict[str, Any]
    dailyStats: list[Any] = Field(default_factory=list)
    timestamp: str


class GameSaveResponse(BaseModel):
    id: int
    user_id: int
    save_slot: int
    save_version: int
    day_reached: int
    score: int
    pet_name: str
    player_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GameSaveDetail(GameSaveResponse):
    game_data: dict[str, Any]


class NameValidationRequest(BaseModel):
    name: str
    type: str = "player"


class NameValidationResponse(BaseModel):
    valid: bool
    error: Optional[str] = None
    sanitized_name: Optional[str] = None
