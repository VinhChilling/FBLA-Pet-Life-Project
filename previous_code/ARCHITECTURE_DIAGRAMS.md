# Integration Architecture Diagrams

Visual representations of the frontend-backend integration.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER BROWSER                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              index.html + style.css                      │  │
│  │         (Game UI Layout & Styling)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                      Loaded by:                                  │
│                           │                                      │
│  ┌────────────────────────┴─────────────────────────────────┐  │
│  │                                                           │  │
│  ├─────────────────────┬─────────────────┬─────────────────┤  │
│  │                     │                 │                 │  │
│  ▼                     ▼                 ▼                 ▼  │
│ ┌────────────┐  ┌──────────────┐  ┌────────────────┐  ┌──┐  │
│ │blockedWords│  │   api.js     │  │   script.js    │  │JS│  │
│ │   .js      │  │ (UNIFIED API │  │ (GAME LOGIC)   │  │  │  │
│ │ (LISTS)    │  │   CLIENT)    │  │                │  └──┘  │
│ └────────────┘  └──────────────┘  └────────────────┘         │
│      │               │         │          │                   │
│      │               │         │          │                   │
│      │       ┌───────┴─────────┴──┐       │                   │
│      │       │                    │       │                   │
│      │       ▼                    ▼       ▼                   │
│      └──►┌─────────────────────────────────┐                 │
│          │   Game State Management         │                 │
│          │ - pet {}, player {}             │                 │
│          │ - Actions (feed, play, etc)     │                 │
│          │ - Save/Load cycle               │                 │
│          └─────────────────────────────────┘                 │
│                     │                                         │
│          ┌──────────┴──────────┐                              │
│          │                     │                              │
│          ▼                     ▼                              │
│    ┌──────────────┐     ┌────────────────┐                   │
│    │ localStorage │     │   HTTP Fetch   │                   │
│    │ (LOCAL SAVE  │     │   (API CALLS)  │                   │
│    │   BACKUP)    │     │                │                   │
│    └──────────────┘     └────────────────┘                   │
│          │                     │                              │
│          │                     │ (CORS)                       │
│          │                     │                              │
│          ▼                     ▼                              │
│         [🔒] ──────────────► [🐶 Virtual Pet Game] ◄────     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                           Network Boundary
                                 │
                    HTTPS / HTTP with CORS
                                 │
                                 ▼

┌─────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                               │
│                   (Python, Port 8000)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FastAPI Application                         │  │
│  │         (Handles HTTP Requests & Routes)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│           │           │          │         │                   │
│           │           │          │         │                   │
│  ┌────────┴───┐   ┌───┴────────┐ │   ┌────┴──────────┐        │
│  │             │   │            │ │   │               │        │
│  ▼             ▼   ▼            ▼ ▼   ▼               ▼        │
│ ┌─────────┐ ┌────────────┐ ┌────────┐ ┌────────┐ ┌─────────┐  │
│ │ /auth/* │ │ /game/*    │ │/validate│ │ /info │ │/health  │  │
│ │         │ │            │ │ /*     │ │       │ │         │  │
│ │ Register│ │ Save       │ │Validate│ │Info   │ │Health   │  │
│ │ Login   │ │ Load       │ │ Name   │ │Endpoint│ │Check    │  │
│ │ Me      │ │ List       │ │        │ │       │ │         │  │
│ │         │ │ Delete     │ │        │ │       │ │         │  │
│ └─────────┘ └────────────┘ └────────┘ └────────┘ └─────────┘  │
│      │             │           │                                │
│      │             │           │                                │
│      └─────────────┴───────────┴────────┐                       │
│                                         │                       │
│              ┌───────────────────────────┴──┐                  │
│              │                              │                  │
│              ▼                              ▼                  │
│   ┌──────────────────────┐    ┌──────────────────────────┐   │
│   │  Validation Layer    │    │  Authentication Layer    │   │
│   │  (validation.py)     │    │  (JWT, bcrypt)           │   │
│   │                      │    │                          │   │
│   │ - NAME_MAX_LENGTH=50 │    │ - Hash passwords         │   │
│   │ - NAME_REGEX pattern │    │ - Generate JWT tokens    │   │
│   │ - BANNED_WORDS dict  │    │ - Verify JWT token       │   │
│   │ - Profanity filter   │    │ - Require auth headers   │   │
│   │ - Leetspeak ✓        │    │                          │   │
│   └──────────────────────┘    └──────────────────────────┘   │
│              │                              │                  │
│              └──────────────┬───────────────┘                  │
│                             │                                  │
│                             ▼                                  │
│                   ┌──────────────────────┐                    │
│                   │  SQLAlchemy ORM      │                    │
│                   │  (Database Layer)    │                    │
│                   └──────────────────────┘                    │
│                             │                                  │
│              ┌──────────────┴──────────────┐                  │
│              │                             │                  │
│              ▼                             ▼                  │
│  ┌──────────────────────┐    ┌───────────────────────────┐  │
│  │  SQLite (Dev)        │    │  PostgreSQL (Prod)        │  │
│  │  (instance/app.db)   │    │  (Cloud Database)         │  │
│  │                      │    │                           │  │
│  │  Tables:             │    │  Tables:                  │  │
│  │  - user              │    │  - user                   │  │
│  │  - game_save         │    │  - game_save              │  │
│  │  - achievement       │    │  - achievement            │  │
│  │  - trade_proposal    │    │  - trade_proposal         │  │
│  │  - session_log       │    │  - session_log            │  │
│  └──────────────────────┘    └───────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Save Game

```
┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND: User clicks "Feed Pet"                                 │
└──────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                   ┌────────────────────┐
                   │ Update game state: │
                   │ pet.fedCounter++   │
                   │ pet.energy -= 10   │
                   │ player.coins--     │
                   └────────────────────┘
                             │
                             ▼
                   ┌────────────────────┐
                   │  Call saveGame()   │
                   │  in script.js      │
                   └────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌─────────────────────────┐  ┌──────────────────────────┐
    │ localStorage.setItem(   │  │ if apiAuth.isLoggedIn(): │
    │   'petGameSave',        │  │   await apiSave.save()   │
    │   JSON.stringify({      │  │                          │
    │     pet, player         │  │ (Try to sync to backend) │
    │   })                    │  │                          │
    │ )                       │  │ POST /api/v1/game/save   │
    │                         │  │                          │
    │ ✅ Always succeeds      │  │ ├─ Local fails: ⚠️ log   │
    │ (Local backup)          │  │ └─ Success: ✅ sync ok   │
    └─────────────────────────┘  └──────────────────────────┘
                │                         │
                │                 ┌───────▼────────┐
                │                 │ Convert Data:  │
                │                 │formatGameState  │
                │                 │ForBackend()    │
                │                 └───────┬────────┘
                │                         │
                │                 ┌───────▼──────────────────┐
                │                 │ Backend validates:       │
                │                 │ - Pet name syntax        │
                │                 │ - Banned words check     │
                │                 │ - Game state integrity   │
                │                 │ - Verify JWT token       │
                │                 └───────┬──────────────────┘
                │                         │
                │                 ┌───────▼──────────────┐
                │                 │ Insert/Update DB:    │
                │                 │ INSERT OR            │
                │                 │ UPDATE game_save     │
                │                 │ WHERE user_id = ?    │
                │                 │ AND save_slot = 1    │
                │                 └───────┬──────────────┘
                │                         │
                │                 ┌───────▼──────────────┐
                │                 │ Return response:     │
                │                 │ {                    │
                │                 │   "id": 123,         │
                │                 │   "save_slot": 1,    │
                │                 │   "day_reached": 5,  │
                │                 │   "score": 750,      │
                │                 │   ...                │
                │                 │ }                    │
                │                 └───────┬──────────────┘
                │                         │
                └─────────────┬───────────┘
                              │
                    ┌─────────▼────────┐
                    │ Show UI Feedback │
                    │ "💾 Saved!"      │
                    │ (Fade animation) │
                    └──────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ Continue Gameplay    │
                   │ (No interruption)    │
                   └──────────────────────┘


OFFLINE MODE (No Network):
- ✅ localStorage save succeeds
- ⚠️ Backend save fails (caught)
- ⚠️ User sees notification but can continue
- 🔄 Queued for sync when online
```

## Data Flow: Load Game

```
┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND: User clicks "Load Game" button                         │
└──────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                   ┌────────────────────┐
                   │ Call loadGame()    │
                   │ in script.js       │
                   └────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌──────────────────────────┐  ┌────────────────────────┐
    │ if apiAuth.isLoggedIn(): │  │ else:                  │
    │   Try backend first      │  │ Use localStorage only  │
    │                          │  │                        │
    │   GET /api/v1/game/save/1│  │ localStorage.getItem(  │
    │   + Authorization header │  │   'petGameSave'        │
    │                          │  │ )                      │
    │ ├─ Success: ✅ use it    │  │                        │
    │ └─ Error: ⚠️ fallback    │  │ ├─ Found: Use it       │
    └──────────────────────────┘  │ └─ Not found: Error    │
                │                         │
                └────────────┬────────────┘
                             │
                    ┌────────▼──────────┐
                    │ Backend Response: │
                    │ {                 │
                    │   "id": 123,      │
                    │   "game_data": {  │
                    │     "pet": {...}, │
                    │     "player": {.} │
                    │   }               │
                    │ }                 │
                    └────────┬──────────┘
                             │
                    ┌────────▼────────────────────┐
                    │ Convert data via:           │
                    │ formatGameStateForFrontend()│
                    │                             │
                    │ Provides defaults for       │
                    │ any missing fields          │
                    └────────┬────────────────────┘
                             │
                    ┌────────▼──────────────────┐
                    │ Defensive Validation:      │
                    │                            │
                    │ - Check pet object valid   │
                    │ - Check player object      │
                    │ - Validate pet name        │
                    │ - Validate player name     │
                    │ - Check content filters    │
                    │                            │
                    │ ├─ Valid: Use loaded data  │
                    │ └─ Invalid: Use defaults   │
                    └────────┬──────────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ Update Game State:    │
                    │ pet = {...}           │
                    │ player = {...}        │
                    └────────┬──────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ Update UI:            │
                    │ - Hide setup screen   │
                    │ - Show game screen    │
                    │ - Display pet emoji   │
                    │ - Display pet name    │
                    │ - Update stats        │
                    │ - Update day display  │
                    └────────┬──────────────┘
                             │
                             ▼
                   ┌──────────────────────┐
                   │ Resume Gameplay      │
                   │ (Can save again)     │
                   └──────────────────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: User sees auth screen                                 │
│ (New "Login" / "Register" tab UI)                              │
└─────────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴────────────┐
              │                          │
           ┌──▼───┐                  ┌──▼──────┐
           │LOGIN │                  │REGISTER │
           └──┬───┘                  └──┬──────┘
              │                         │
    ┌─────────▼─────────┐   ┌──────────▼─────────┐
    │ Enter username    │   │ Enter username     │
    │ Enter password    │   │ Enter email        │
    │ Click "Login"     │   │ Enter password     │
    └─────────┬─────────┘   │ Click "Register"   │
              │             └──────────┬─────────┘
              │                        │
              │             ┌──────────▼──────────┐
              │             │ POST /auth/register │
              │             │ {                  │
              │             │   username,        │
              │             │   email,           │
              │             │   password         │
              │             │ }                  │
              │             └──────────┬──────────┘
              │                        │
              │             ┌──────────▼──────────┐
              │             │ Backend checks:    │
              │             │ - Username unique? │
              │             │ - Email unique?    │
              │             │ - Pass > 8 chars?  │
              │             └──────────┬──────────┘
              │                        │
              │             ┌──────────▼──────────┐
              │             │ Hash password:     │
              │             │ bcrypt.hash(pass)  │
              │             └──────────┬──────────┘
              │                        │
              │             ┌──────────▼──────────┐
              │             │ Create user in DB  │
              │             └──────────┬──────────┘
              │                        │
              │             ┌──────────▼──────────┐
              │             │ Return 201 Created │
              │             │ User object        │
              │             └──────────┬──────────┘
              │                        │
              │             ┌──────────▼──────────┐
              │             │ Show "Success"     │
              │             │ message            │
              │             │ Switch to login tab│
              │             └──────────┬──────────┘
              │                        │
              └────────────┬───────────┘
                           │
              ┌────────────▼────────────┐
              │ POST /auth/login        │
              │ {                       │
              │   username,             │
              │   password              │
              │ }                       │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │ Backend checks:         │
              │ - User exists?          │
              │ - Password correct?     │
              │ (bcrypt.verify())       │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │ Generate JWT token:     │
              │ jwt.encode({            │
              │   user_id,              │
              │   exp: + 30 days        │
              │ }, SECRET_KEY)          │
              └────────────┬────────────┘
                           │
              ┌────────────▼───────────────┐
              │ Return 200 OK              │
              │ {                          │
              │   "access_token": "...",   │
              │   "token_type": "bearer",  │
              │   "expires_in": 2592000    │
              │ }                          │
              └────────────┬───────────────┘
                           │
              ┌────────────▼──────────────┐
              │ Frontend saves token:     │
              │ localStorage.setItem(     │
              │   'access_token', token   │
              │ )                         │
              │ API_STATE.accessToken=tok │
              └────────────┬──────────────┘
                           │
              ┌────────────▼──────────────┐
              │ Start auto-sync:          │
              │ apiSync.startAutoSync()   │
              │ (every 30 seconds)        │
              └────────────┬──────────────┘
                           │
              ┌────────────▼──────────────┐
              │ Hide auth screen          │
              │ Show game setup           │
              └──────────────────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │ User continues to game   │
              │ (Now authenticated)      │
              │ Cloud saves enabled ✅   │
              └──────────────────────────┘

LOGOUT FLOW (Click logout):
┌──────────────────────────────────────┐
│ apiAuth.logout()                     │
├──────────────────────────────────────┤
│ Clear API_STATE.accessToken          │
│ localStorage.removeItem('access_token')
│ Stop auto-sync                       │
│ Return to auth screen                │
│ Game saves → localStorage only       │
└──────────────────────────────────────┘
```

## Error Scenarios & Recovery

```
SCENARIO 1: Backend Offline

Frontend Request
        │
        ▼
    apiFetch()
        │
        ▼
  Network Timeout
  (10 sec wait)
        │
        ▼
  ┌─────────────────────┐
  │ Backend unavailable │
  │ ❌ Request fails    │
  └─────────────────────┘
        │
        ▼
  ┌──────────────────────────────────┐
  │ Catch error in apiSave.save()    │
  │ console.warn() + fallback        │
  └──────────────────────────────────┘
        │
        ▼
  ┌──────────────────────────────────┐
  │ Return {local: true, error: msg} │
  └──────────────────────────────────┘
        │
        ▼
  ┌──────────────────────────────────┐
  │ localStorage already updated     │
  │ Game continues seamlessly        │
  │ User notification:               │
  │ "⚠️ Using local save"            │
  └──────────────────────────────────┘

SCENARIO 2: Banned Word in Name

Frontend Input
"fuck123"
        │
        ▼
  Real-time check
  containsBannedWord()
        │
        ▼
  ┌─────────────────────────┐
  │ Word matches BANNED_WORD│
  │ Show red border         │
  │ Show: "Word detected"   │
  │ Disable start button    │
  └─────────────────────────┘
        │
        ▼
  If user bypasses (hacks):
  startGame() calls validateAndSanitizeName()
        │
        ▼
  ┌──────────────────────────────┐
  │ Server-side check:           │
  │ POST /validate/name          │
  │ Receives: {valid: false}     │
  │ Abort game start             │
  │ Show: "Invalid name"         │
  └──────────────────────────────┘

SCENARIO 3: Network Comes Online

┌─────────────────────────────┐
│ User was offline            │
│ Played game locally         │
│ Made 5 saves                │
└─────────────────────────────┘
        │
        ▼
  Network comes online
  (window 'online' event)
        │
        ▼
  ┌──────────────────────────────┐
  │ apiSync auto-triggers        │
  │ "🟢 Backend connection...    │
  │ API_STATE.isOnline = true    │
  └──────────────────────────────┘
        │
        ▼
  ┌──────────────────────────────┐
  │ Call apiSync.syncAll()       │
  │ GET current game from        │
  │ localStorage                 │
  │ POST to /api/v1/game/save    │
  └──────────────────────────────┘
        │
        ▼
  ┌──────────────────────────────┐
  │ All pending saves synced     │
  │ Cloud now has latest state   │
  │ Auto-sync resumes every 30s  │
  └──────────────────────────────┘
```

---

**Key Principles:**

1. **Frontend-first**: UI never breaks, always works locally
2. **Defensive**: Assume backend might fail, gracefully degrade
3. **Seamless**: User doesn't see complexity, just plays
4. **Secure**: Validation on both sides, passwords never exposed
5. **Resilient**: Offline → Online transitions automatic

