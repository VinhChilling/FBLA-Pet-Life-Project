# FBLA-Pet-Life-Project

## Overview

Pet Life is a browser-based virtual pet simulator that combines pet care with personal time and resource management. The player must balance feeding, training, playing, cleaning, vet visits, sleep, self-care, and earning coins while guiding a pet through a 30-day survival run.

The project includes:
- Front-end gameplay pages in `gameplay/`
- A help and analytics dashboard
- A backend API in `backend/` for authentication and save/load persistence
- Local fallback saves using `localStorage`

## Core Game Flow

1. Start Page
2. Entrance Page (`gameplay/entrance_page/entrance.html`)
3. Game Page (`gameplay/game_page/game.html`)
4. Analytics / End Page (`gameplay/analytics_page/gameEnd.html`)

Additional pages:
- Help Page (`gameplay/help_page/help.html`)
- Minigame pages for training

## Entrance Page

Players choose:
- Player name
- Pet name
- Pet type: `Dog`, `Cat`, or `Dragon`
- Difficulty: `Easy`, `Normal`, `Hard`

Name validation rules are enforced in JavaScript and backend validation:
- 1-20 characters
- Allowed characters: letters, numbers, spaces, `-`, `_`, `'`
- Reserved/banned words are blocked via `blockedWords.js` and backend validation
- Repeated characters are also restricted

Difficulty starts with these actual values from code:
- Easy: 30 coins, pet 90 energy, pet 95 health, player 90 health, player 75 mood
- Normal: 15 coins, pet 75 energy, pet 90 health, player 90 health, player 75 mood
- Hard: 5 coins, pet 60 energy, pet 70 health, player 90 health, player 75 mood

## Gameplay Mechanics

### Daily cycle

Each day gives the player 24 available hours. Most actions consume time, and the day ends when the player sleeps or time runs out.

### End conditions

The game ends when any of the following occurs:
- Pet health reaches 0
- Pet energy reaches 0
- Player health reaches 0
- Player mood reaches 0
- Coins drop below 0
- Player current day exceeds 30 (successful completion)

### Pet care requirements

Daily checks run at the end of each day:
- Pet feed requirement: based on current food tier
- Pet play requirement: based on current toy tier
- Weekly vet check: required on every day divisible by 7
- Daily cleaning requirement

If requirements are missed, penalties are applied immediately.

## Shop and Upgrades

### Food shop

Food must be purchased before feeding. Food purchases expire after 7 days.

| Tier | Cost | Energy per Feed | Health per Feed | Daily minimum feeds |
|---|---|---|---|---|
| Basic Food | $5 | 5 | 5 | 4 |
| Premium Food | $10 | 10 | 5 | 3 |
| Deluxe Food | $15 | 15 | 5 | 2 |
| Gourmet Food | $25 | 20 | 5 | 1 |

### Toy shop

Toys must be purchased before playing with the pet. Toys expire after 7 days.

| Tier | Cost | Daily play requirement |
|---|---|---|
| Basic Toy | $5 | 4 |
| Standard Toy | $10 | 3 |
| Premium Toy | $15 | 2 |
| Deluxe Toy | $25 | 1 |

### Add-on shop

- To-Do Schedule: $15, unlocks the schedule feature and to-do list functionality

## Core Actions

### Pet care actions

- Feed pet: consumes 0.5 hours, increases pet energy and health, counts toward daily pet feeding requirement
- Play with pet: consumes 1 hour, reduces pet energy by 10, increases pet health by 3, counts toward daily play requirement
- Clean pet: costs $3, consumes 2 hours, increases pet health by 5, and satisfies daily cleaning
- Visit vet: costs $40, consumes 4 hours, restores pet health by 50, and marks this week as covered

### Player self-care actions

- Exercise: 2 hours, +5 health, +5 mood
- Read book: 1 hour, +3 health, +5 mood
- Hang out: 3 hours, +12 health, +20 mood
- Do chores: 2 hours, +5 coins
- Study: 2 hours, +5 health, +10 mood
- Fast food: 0.5 hours, -8 health, +6 mood, increments feed counter
- Healthy food: 0.5 hours, +6 health, -4 mood, increments feed counter

## Training and Minigames

The `Train` button starts a minigame.

Minigame selection probabilities in code:
- 40% → `minigame1` (Maze)
- 40% → `minigame2` (Cup shuffle)
- 20% → pet-specific minigame

Pet-specific mapping:
- `Dragon` → `minigame3` (Flappy Dragon)
- `Dog` → `minigame4` (Running Dog)
- `Cat` → `minigame5` (Chase the Mouse)

Training consumes 1 hour and saves the current pet/player state to `sessionStorage` before navigation.

## Sleep Mechanics

When the player sleeps, the game records the remaining hours as sleep time and adjusts stats:
- `>= 8` hours: +5 health and +5 mood for both player and pet
- `6-7` hours: -5 health and -5 mood for both player and pet
- `4-5` hours: -20 health and -20 mood for both player and pet
- `< 4` hours: -40 health and -40 mood for both player and pet

## Scoring

Each completed day adds to `player.currentPoints`. The code evaluates daily score from:

- Pet Care (up to 35 points)
  - Feeding: 10 points if `pet.fedCounter >= 3`, otherwise 3.33 points per feed
  - Play: 10 points if `pet.playCounter >= 4`, otherwise proportional
  - Health/Mood: 10 points if pet health >= 80 and mood is `Happy`; 5 points if health >= 60
  - Cleaning: 5 points if pet was cleaned

- Player Care (up to 35 points)
  - Sleep: 10 points for >= 8h, 5 for 6-7h, 2 for 4-5h
  - Exercise: 10 points if exercised
  - Social: 10 points if hung out
  - Education: 5 points if read
  - Health/Mood: 5 points if player health >= 80 and mood >= 75; 2 points if player health >= 60

- Efficiency (up to 20 points)
  - Money: 10 points if coins >= 20, 7 if coins >= 10, 4 if coins >= 0
  - Time: 10 points if at least 18 hours were used, 7 if 12-17 hours, 4 if 6-11 hours

- Penalties (up to -50 points)
  - -20 if pet health < 30
  - -20 if player health < 30
  - -10 if the pet was never fed, never played with, and never cleaned that day

Final daily score is clamped to `0-100` and added to the cumulative score.

## Random Events

Random daily events are triggered after sleep and can affect the pet's hunger, sickness, or energy needs.

## Analytics and End Page

The end-game analytics dashboard includes:
- Overview of final pet and player stats
- Performance charts and grades
- Achievements summary
- Reports and export controls

Final stats are stored in `localStorage` as `gameEndStats` when the run ends.

## Save / Load System

The game saves to `localStorage` by default using keys like `petGameSave` and `petGameSave_slot1`.

If the player is authenticated and a backend is available, saves are also synced to:
- `POST /api/v1/game/save?save_slot=1`
- `GET /api/v1/game/save/{save_slot}`
- `GET /api/v1/game/saves`
- `DELETE /api/v1/game/save/{save_slot}`

Backend save logic falls back to local storage if the backend is unavailable.

## Backend API

The backend provides a FastAPI service in `backend/main.py` with these features:
- User registration: `POST /api/v1/auth/register`
- Login: `POST /api/v1/auth/login`
- Get current user: `GET /api/v1/auth/me`
- Save game: `POST /api/v1/game/save`
- Load game: `GET /api/v1/game/save/{save_slot}`
- List saves: `GET /api/v1/game/saves`
- Delete save: `DELETE /api/v1/game/save/{save_slot}`
- Name validation: `POST /api/v1/validate/name`

The backend uses SQLite by default at `sqlite:///./petlife.db` and stores users and game saves with SQLAlchemy models.

### Backend dependencies

Defined in `backend/requirements.txt`:
- fastapi
- uvicorn[standard]
- sqlalchemy
- python-jose[cryptography]
- passlib[bcrypt]
- python-multipart
- pydantic
- pydantic-settings
- email-validator

## Running the Project

### Frontend

Open the HTML files in `gameplay/` in a browser, or serve the folder with a static HTTP server.

### Backend

From the `backend/` folder:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The API will run on `http://127.0.0.1:8000` by default.

## Image Attributions
- Cat Image used in Cat-specific Minigame: https://www.magnific.com/free-photos-vectors/cat-clipart 
- Ball Image used in Dog-specific Minigame: https://clipart-library.com/dog-ball-clipart.html
- Bone Image used in Dog-specific Minigame: https://www.pinterest.com/pin/206250857924068039/
- Stick Image used in Dog-specific Minigame: https://www.magnific.com/free-photos-vectors/stick-clip-art 
- Other Images generated by Gemini 4.0 AI using NanoBanana

## Notes

- The game includes local validation of player and pet names plus optional backend validation.
- Food and toy purchases expire after 7 days.
- Training randomly chooses a minigame and sends the player to a dedicated minigame page.
- The analytics dashboard is driven from saved daily progress and end-game stats.
- Current code behavior is applied exactly, including the difficulty start values and shop effects.

