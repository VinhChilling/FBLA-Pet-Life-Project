# Frontend-Backend Integration Guide

## Overview

This document describes how the Virtual Pet Game frontend (vanilla JavaScript) integrates with the FastAPI backend for cloud saves, authentication, and validation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │  index.html  │  │  script.js   │  │  blockedWords.js  │ │
│  │              │  │   (game      │  │ (input validation)│ │
│  │ (UI layout)  │  │    logic)    │  │                   │ │
│  └──────────────┘  └──────────────┘  └───────────────────┘ │
│                         │                                    │
│         ┌───────────────┴────────────────┐                  │
│         ▼                                 ▼                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              api.js (NEW - This File)                   ││
│  │  - Authentication (login/register)                       ││
│  │  - Game state synchronization                            ││
│  │  - Name validation via server                            ││
│  │  - Offline fallback with localStorage                    ││
│  │  - Auto-sync every 30 seconds                            ││
│  └─────────────────────────────────────────────────────────┘│
│         │                                                    │
│         ├─► HTTP GET/POST/DELETE (CORS enabled)            │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────────┐│
│  │        localStorage (Local Backup)                      ││
│  │  - Always maintains local copy for offline access       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                         │
                    HTTP │ CORS
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                  FASTAPI BACKEND                             │
│              (Python, FastAPI, SQLAlchemy)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Authentication Endpoints (/api/v1/auth/*)             │ │
│  │  - POST /register - Create new user account            │ │
│  │  - POST /login    - Login and get JWT token            │ │
│  │  - GET /me        - Get current user profile           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Game Save Endpoints (/api/v1/game/*)                  │ │
│  │  - POST /save?save_slot=1 - Save game state            │ │
│  │  - GET /save/{slot}        - Load game state           │ │
│  │  - GET /saves              - List all user saves       │ │
│  │  - DELETE /save/{slot}     - Delete a save            │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Validation Endpoints (/api/v1/validate/*)             │ │
│  │  - POST /name - Server-side name validation            │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SQLAlchemy ORM & Database                             │ │
│  │  - User, GameSave, Achievement, TradeProposal tables   │ │
│  │  - SQLite (dev) or PostgreSQL (prod)                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

### Frontend
- **[api.js](api.js)** - Unified API client (NEW)
  - `apiAuth` - Authentication functions
  - `apiSave` - Game save/load functions
  - `apiValidate` - Name validation
  - `apiSync` - Auto-sync mechanism
  - `apiUI` - Authentication UI components

- **[script.js](script.js)** - Updated game logic
  - `saveGame()` - Now calls `apiSave.save()` + localStorage
  - `loadGame()` - Now tries backend first + localStorage fallback

- **[blockedWords.js](blockedWords.js)** - Input validation (unchanged)
  - Frontend-safe banned words list
  - Used for real-time validation

- **[style.css](style.css)** - Updated with auth UI styles
  - New auth container styles
  - Login/register form styling

### Backend
- **backend/main.py** - FastAPI application
  - All REST endpoints
  - JWT token management
  - CORS configuration

- **backend/validation.py** - Server-side validation
  - NAME_MAX_LENGTH = 50
  - Comprehensive BANNED_WORDS dictionary
  - Profanity/leetspeak detection

- **backend/models.py** - SQLAlchemy ORM models
  - User, GameSave, Achievement, TradeProposal

- **backend/schemas.py** - Pydantic validation schemas
  - PetState, PlayerState, GameStateCreate

## Data Flow

### Save Game Flow

```
User presses "Save" button
       │
       ▼
saveGame() in script.js is called
       │
       ├─► localStorage.setItem("petGameSave", {pet, player})
       │   (Always save locally for offline access)
       │
       └─► Check if apiAuth.isLoggedIn()
           │
           ├─ YES: await apiSave.save(pet, player, slot)
           │       │
           │       ▼
           │       POST /api/v1/game/save?save_slot=1
           │       {
           │         "pet": {
           │           "name": "Fluffy",
           │           "type": "Dog",
           │           "mood": "Happy",
           │           "energy": 75,
           │           ...
           │         },
           │         "player": {
           │           "name": "Player",
           │           "currentDay": 5,
           │           "coins": 100,
           │           ...
           │         },
           │         "timestamp": "2024-01-15T10:30:00Z"
           │       }
           │       │
           │       ├─ Backend validates with validation.py
           │       ├─ Saves to GameSave table
           │       ▼
           │       ✓ Sync indicator shows "💾 Saved!"
           │
           └─ NO: Skip backend, local save only
               ✓ Sync indicator shows "💾 Saved (Local)"
```

### Load Game Flow

```
User clicks "Load Game" button
       │
       ▼
loadGame() in script.js is called
       │
       ├─► Check if apiAuth.isLoggedIn() AND API_STATE.isOnline
       │
       ├─ YES: await apiSave.load(1)
       │       │
       │       ▼
       │       GET /api/v1/game/save/1
       │       │
       │       ├─ Backend verifies JWT token
       │       ├─ Retrieves GameSave record
       │       ▼
       │       {
       │         "id": 123,
       │         "save_slot": 1,
       │         "game_data": {
       │           "pet": {...},
       │           "player": {...}
       │         },
       │         ...
       │       }
       │       │
       │       ▼
       │       formatGameStateForFrontend() converts to frontend format
       │       ✓ Game data loaded from backend
       │
       ├─ NO or Backend Error: localStorage.getItem("petGameSave")
       │       │
       │       ▼
       │       {
       │         "pet": {...},
       │         "player": {...}
       │       }
       │       │
       │       ▼
       │       ✓ Game data loaded from local storage
       │
       ▼
Load pet/player objects into memory
Validate names with defensive checks
Display game screen
```

### Authentication Flow

```
User enters email/password
       │
       ▼
apiUI.handleLogin()
       │
       ├─► Validate inputs (non-empty)
       │
       ▼
apiAuth.login(username, password)
       │
       ▼
apiFetch('/auth/login', {method: 'POST', body: JSON.stringify({...})})
       │
       ▼
POST /api/v1/auth/login
│
├─ Backend verifies credentials
├─ Generates JWT token (expires: 30 days)
├─ Returns: {
│   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
│   "token_type": "bearer",
│   "expires_in": 2592000
│ }
│
▼
Frontend saves token:
├─► localStorage.setItem('access_token', token)
├─► API_STATE.accessToken = token
├─► API_STATE.isAuthenticated = true
│
▼
apiSync.startAutoSync() - Begin auto-sync every 30 seconds
│
▼
✓ Login success - Hide auth screen, show game
```

## Data Structure Compatibility

### Frontend Game State (in script.js)

```javascript
const pet = {
  gameStarted: true,
  name: "Fluffy",
  type: "Dog",
  mood: "Happy",
  energy: 75,
  health: 90,
  fedCounter: 2,
  playCounter: 1,
  hasCleaned: false,
  hadVetVisitThisWeek: false,
  // ... other properties
};

const player = {
  name: "Player",
  currentDay: 5,
  time: 24,
  coins: 100,
  expenses: 50,
  health: 85,
  mood: 75,
  difficulty: "normal",
  currentPoints: 500,
  potentialPoints: 1000,
  // ... other properties
};
```

### Backend Schema (in backend/schemas.py)

```python
class PetState(BaseModel):
    name: str
    type: str
    mood: str = "Happy"
    energy: int = 75
    health: int = 90
    fedCounter: int = 0
    playCounter: int = 0
    hasCleaned: bool = False
    hadVetVisitThisWeek: bool = False
    # ... other fields with defaults

class PlayerState(BaseModel):
    name: str
    currentDay: int = 1
    time: int = 24
    coins: int = 10
    expenses: int = 0
    health: int = 90
    mood: int = 75
    difficulty: str = "normal"
    currentPoints: int = 0
    potentialPoints: int = 100
    # ... other fields with defaults

class GameStateCreate(BaseModel):
    pet: PetState
    player: PlayerState
    timestamp: str
```

### Conversion Functions (in api.js)

```javascript
// Frontend → Backend
formatGameStateForBackend(petObj, playerObj) {
  // Takes frontend objects and creates GameStateCreate payload
  return {
    pet: {...},
    player: {...},
    timestamp: new Date().toISOString()
  };
}

// Backend → Frontend
formatGameStateForFrontend(backendState) {
  // Takes backend response and converts to frontend format
  // Provides defaults for any missing fields
  return {
    pet: {...},
    player: {...}
  };
}
```

## Validation Pipeline

### Input Name Validation

1. **Frontend Real-time (blockedWords.js + script.js)**
   - Character count: 1-50 characters
   - Character types: letters, numbers, space, hyphen, underscore, apostrophe
   - Banned words: Check against BANNED_WORDS array
   - Leetspeak: /3️⃣4️⃣ (converted to e/a in normalize step)
   - UX feedback: Red border + warning message

2. **Backend Server-side (backend/validation.py)**
   - Same character count and type checks
   - Complete BANNED_WORDS list (frontend is subset)
   - Leetspeak normalization
   - Returns: `{valid: bool, error: str, sanitized_name: str}`

3. **Game Start (script.js)**
   - Validates both player and pet names before starting
   - Sanitizes via `validateAndSanitizeName()`
   - Falls back to defaults ("Player", "Fluffy") if invalid

## API Endpoints Reference

### Authentication

**POST /api/v1/auth/register**
```json
Request:
{
  "username": "player123",
  "email": "player@example.com",
  "password": "securePassword123"
}

Response (201):
{
  "id": 1,
  "username": "player123",
  "email": "player@example.com",
  "created_at": "2024-01-15T10:00:00Z"
}
```

**POST /api/v1/auth/login**
```json
Request:
{
  "username": "player123",
  "password": "securePassword123"
}

Response (200):
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 2592000
}
```

**GET /api/v1/auth/me**
```json
Response (200):
{
  "id": 1,
  "username": "player123",
  "email": "player@example.com",
  "created_at": "2024-01-15T10:00:00Z",
  "is_active": true
}
```

### Game Saves

**POST /api/v1/game/save?save_slot=1**
```json
Request:
{
  "pet": {
    "name": "Fluffy",
    "type": "Dog",
    "mood": "Happy",
    "energy": 75,
    "health": 90,
    ...
  },
  "player": {
    "name": "Player",
    "currentDay": 5,
    "coins": 100,
    ...
  },
  "timestamp": "2024-01-15T10:30:00Z"
}

Response (200):
{
  "id": 456,
  "user_id": 1,
  "save_slot": 1,
  "save_version": 1,
  "day_reached": 5,
  "score": 500,
  "pet_name": "Fluffy",
  "player_name": "Player",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**GET /api/v1/game/save/1**
```json
Response (200):
{
  "id": 456,
  "user_id": 1,
  "save_slot": 1,
  "game_data": {
    "pet": {...},
    "player": {...},
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

### Validation

**POST /api/v1/validate/name**
```json
Request:
{
  "name": "TestPlayer123",
  "type": "player"  # or "pet"
}

Response (200):
{
  "valid": true,
  "sanitized_name": "TestPlayer123",
  "error": null
}

# For invalid name:
Response (200):
{
  "valid": false,
  "error": "Name contains banned word: profanity",
  "sanitized_name": null
}
```

## Offline Mode

The game works seamlessly in offline mode:

1. **When offline:**
   - `API_STATE.isOnline = false`
   - `saveGame()` saves to localStorage only
   - `loadGame()` loads from localStorage only
   - No backend calls are attempted

2. **When coming back online:**
   - `window.addEventListener('online')` triggers
   - `apiSync.syncAll()` is called
   - Pending saves are synced to backend
   - Message: "🟢 Backend connection restored"

3. **Auto-sync:**
   - Runs every 30 seconds (if authenticated + online)
   - Syncs current game state to backend
   - Non-blocking (doesn't interrupt gameplay)

## Error Handling

### Backend Errors

```javascript
// Network timeout
{
  error: "Request timeout - backend may be offline"
}

// Auth failed
{
  status: 401,
  detail: "Session expired. Please login again."
}

// Validation failed
{
  status: 422,
  detail: "Name contains banned word: profanity"
}
```

### Frontend Strategies

- **Recoverable Errors**: Show notification, allow retry, fall back to localStorage
- **Auth Errors**: Clear token, log out user, redirect to login
- **Network Errors**: Switch to offline mode, queue for sync when online
- **Validation Errors**: Show field-level feedback, prevent submission

## Security Features

1. **Backend Only** (Not in frontend code):
   - JWT token generation and validation
   - Password hashing with bcrypt
   - Complete profanity list (no slurs in frontend)

2. **Frontend**:
   - Real-time validation for UX
   - Safe banned words subset
   - Input sanitization

3. **Database**:
   - User.password stored as bcrypt hash (never plain text)
   - GameSave.game_data is user-specific (FK to User)
   - JWT expires in 30 days

## Testing Integration

### 1. Test Backend Health
```javascript
await apiFetch('/health')
.then(() => console.log('✅ Backend available'))
.catch(() => console.log('⚠️ Backend unavailable'))
```

### 2. Test Authentication
```javascript
// Register
await apiAuth.register('testuser', 'test@example.com', 'password123')

// Login
await apiAuth.login('testuser', 'password123')

// Check authentication
console.log(apiAuth.isLoggedIn()) // true

// Logout
apiAuth.logout()
console.log(apiAuth.isLoggedIn()) // false
```

### 3. Test Game Save/Load
```javascript
// Save game
await apiSave.save(pet, player, 1)

// Load game
const loaded = await apiSave.load(1)
console.log(loaded.pet.name) // "Fluffy"
```

### 4. Test Name Validation
```javascript
// Valid name
await apiValidate.validateName('Player123', 'player')
// Response: {valid: true, error: null}

// Invalid name
await apiValidate.validateName('fuck', 'player')
// Response: {valid: false, error: "Name contains banned word"}
```

## Deployment Checklist

### Frontend
- [ ] `api.js` loaded in index.html (before script.js)
- [ ] `style.css` includes auth UI styles
- [ ] `API_CONFIG.BASE_URL` set correctly for production
- [ ] CORS origin matches backend allowed origins
- [ ] All game functions export to `window` scope

### Backend
- [ ] `.env` file created with `SECRET_KEY` generated
- [ ] Database migrations run (SQLAlchemy creates tables)
- [ ] CORS_ORIGINS includes frontend domain
- [ ] JWT_ALGORITHM matches (HS256 recommended)
- [ ] `DEBUG=False` in production

### Network
- [ ] Backend API accessible from frontend domain
- [ ] HTTPS enabled (required for cross-origin)
- [ ] CORS headers configured correctly
- [ ] Firewall allows API traffic

## Troubleshooting

### "Request timeout - backend may be offline"
- Check if backend is running
- Verify `API_CONFIG.BASE_URL` is correct
- Check network connection
- Verify CORS is enabled

### "Session expired. Please login again"
- JWT token may have expired
- Clear localStorage: `localStorage.clear()`
- Log in again

### Game saves not syncing to backend
- Check if user is authenticated: `apiAuth.isLoggedIn()`
- Verify internet connection
- Check browser console for errors
- Manual sync: `apiSync.syncAll()`

### "Name contains banned word" but name looks fine
- Check if name contains leetspeak patterns
- Try different characters (replace 3→e, 4→a, etc.)
- Check backend logs for exact flagged word

## Future Enhancements

- [ ] Social features (friend list, pet trading)
- [ ] Multiplayer battles
- [ ] Leaderboards
- [ ] Daily challenges/quests
- [ ] Mobile app integration
- [ ] Push notifications
- [ ] Analytics dashboard

---

**Last Updated:** January 2024
**Version:** 1.0
