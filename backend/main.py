import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import GameSave, User
from schemas import (
    GameSaveDetail,
    GameSaveResponse,
    GameStateCreate,
    NameValidationRequest,
    NameValidationResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from validation import validate_name

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

app = FastAPI(title="Pet Life API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int, username: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "username": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "pet-life-api"}


@app.post("/api/v1/auth/register", response_model=UserResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        username=payload.username.strip(),
        email=str(payload.email).lower(),
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username.strip()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(user.id, user.username)
    return TokenResponse(
        access_token=token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@app.get("/api/v1/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/api/v1/game/save", response_model=GameSaveResponse)
def save_game(
    payload: GameStateCreate,
    save_slot: int = Query(1, ge=1, le=3),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pet = payload.pet or {}
    player = payload.player or {}
    game_data = {
        "pet": pet,
        "player": player,
        "dailyStats": payload.dailyStats,
        "timestamp": payload.timestamp,
    }

    save = (
        db.query(GameSave)
        .filter(GameSave.user_id == current_user.id, GameSave.save_slot == save_slot)
        .first()
    )

    if save:
        save.game_data = game_data
        save.day_reached = int(player.get("currentDay", 1))
        save.score = int(player.get("currentPoints", 0))
        save.pet_name = str(pet.get("name", "Fluffy"))
        save.player_name = str(player.get("name", "Player"))
        save.updated_at = datetime.utcnow()
    else:
        save = GameSave(
            user_id=current_user.id,
            save_slot=save_slot,
            game_data=game_data,
            day_reached=int(player.get("currentDay", 1)),
            score=int(player.get("currentPoints", 0)),
            pet_name=str(pet.get("name", "Fluffy")),
            player_name=str(player.get("name", "Player")),
        )
        db.add(save)

    db.commit()
    db.refresh(save)
    return save


@app.get("/api/v1/game/save/{save_slot}", response_model=GameSaveDetail)
def load_game(
    save_slot: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    save = (
        db.query(GameSave)
        .filter(GameSave.user_id == current_user.id, GameSave.save_slot == save_slot)
        .first()
    )
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    return save


@app.get("/api/v1/game/saves")
def list_saves(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saves = db.query(GameSave).filter(GameSave.user_id == current_user.id).all()
    return [
        {
            "save_slot": s.save_slot,
            "timestamp": (s.updated_at or s.created_at).isoformat(),
            "playerName": s.player_name,
            "petName": s.pet_name,
            "day_reached": s.day_reached,
            "score": s.score,
        }
        for s in saves
    ]


@app.delete("/api/v1/game/save/{save_slot}", status_code=204)
def delete_save(
    save_slot: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    save = (
        db.query(GameSave)
        .filter(GameSave.user_id == current_user.id, GameSave.save_slot == save_slot)
        .first()
    )
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    db.delete(save)
    db.commit()


@app.post("/api/v1/validate/name", response_model=NameValidationResponse)
def validate_name_endpoint(payload: NameValidationRequest):
    result = validate_name(payload.name)
    return NameValidationResponse(**result)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
