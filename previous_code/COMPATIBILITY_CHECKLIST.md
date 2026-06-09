# Integration Compatibility Checklist

Complete this checklist to verify your frontend-backend integration is working correctly.

## ✅ Pre-Integration Setup

### Backend

- [ ] Backend directory structure exists (`backend/main.py`, `backend/requirements.txt`, etc.)
- [ ] Python 3.10+ is installed
- [ ] Virtual environment created and activated
- [ ] `pip install -r requirements.txt` completed without errors
- [ ] `.env` file created with `SECRET_KEY` set
- [ ] Can run `py main.py` without errors
- [ ] Backend listens on `http://localhost:8000`
- [ ] API docs available at `http://localhost:8000/docs`

### Frontend

- [ ] All game files exist: `index.html`, `script.js`, `style.css`, `blockedWords.js`
- [ ] New files created: `api.js`, `INTEGRATION_TEST_SUITE.js`
- [ ] Frontend can be served via HTTP (not file://)
- [ ] Browser can reach frontend at `http://localhost:3000` (or your port)

## ✅ File Integration

### index.html

- [ ] Script tags in correct order:
  ```html
  <script src="blockedWords.js"></script>
  <script src="api.js"></script>
  <script src="script.js"></script>
  ```
- [ ] `setup` element with id exists (for auth UI)
- [ ] `game` element with id exists
- [ ] All form inputs have correct IDs:
  - [ ] `playerNameInput`
  - [ ] `petNameInput`
  - [ ] `petType`
  - [ ] `loadBtn`
  - [ ] `saveIndicator`

### style.css

- [ ] Auth UI styles added (auth-container, auth-tabs, auth-input, etc.)
- [ ] No CSS errors in browser console
- [ ] Auth form displays properly

### api.js

- [ ] File exists and is loaded before `script.js`
- [ ] `window.apiAuth` is available in browser console
- [ ] `window.apiSave` is available in browser console
- [ ] `window.apiValidate` is available in browser console
- [ ] `window.apiSync` is available in browser console
- [ ] `window.API_STATE` is available in browser console

### script.js

- [ ] `saveGame()` function updated to call `apiSave.save()`
- [ ] `loadGame()` function updated to try backend first
- [ ] Both functions have `try/catch` blocks
- [ ] Functions reference `apiAuth.isLoggedIn()`
- [ ] No syntax errors in browser console

### blockedWords.js

- [ ] File exports `BANNED_WORDS` array
- [ ] File exports `HATE_PATTERNS` array
- [ ] `script.js` can access `BANNED_WORDS` (check console)

## ✅ API Endpoint Compatibility

Test each endpoint from browser console:

### Authentication Endpoints

```javascript
// Test Register
await apiAuth.register("testuser123", "test@example.com", "TestPass123");
// Expected: Returns user object with id, username, email

// Test Login
await apiAuth.login("testuser123", "TestPass123");
// Expected: Returns object with access_token, token_type

// Test Get Profile
await apiAuth.getProfile();
// Expected: Returns user object
```

- [ ] POST `/auth/register` - Returns 201 with user object
- [ ] POST `/auth/login` - Returns 200 with JWT token
- [ ] GET `/auth/me` - Returns 200 with current user

### Game Save Endpoints

```javascript
// Test Save
await apiSave.save(pet, player, 1);
// Expected: Returns save object with id, save_slot

// Test Load
await apiSave.load(1);
// Expected: Returns save object with game_data

// Test List
await apiSave.listSaves();
// Expected: Returns array of saves

// Test Delete
await apiSave.delete(1);
// Expected: No error
```

- [ ] POST `/game/save?save_slot=1` - Returns 200 with save object
- [ ] GET `/game/save/1` - Returns 200 with save data
- [ ] GET `/game/saves` - Returns 200 with array of saves
- [ ] DELETE `/game/save/1` - Returns 204 No Content

### Validation Endpoints

```javascript
// Test Valid Name
await apiValidate.validateName("ValidPlayer123", "player");
// Expected: {valid: true, error: null}

// Test Banned Word
await apiValidate.validateName("fuck123", "player");
// Expected: {valid: false, error: "..."}
```

- [ ] POST `/validate/name` - Returns 200 with validation result

## ✅ Data Structure Compatibility

### Frontend Objects

```javascript
// Check pet object has all required fields
console.log(pet);
// Should have: name, type, mood, energy, health, fedCounter, playCounter, etc.

// Check player object has all required fields
console.log(player);
// Should have: name, currentDay, coins, health, mood, difficulty, etc.
```

In browser console after starting game:

- [ ] `pet.name` is a string
- [ ] `pet.type` is one of: "Dog", "Cat", "Dragon"
- [ ] `pet.energy` is a number 0-100
- [ ] `pet.health` is a number 0-100
- [ ] `player.name` is a string
- [ ] `player.currentDay` is a number
- [ ] `player.coins` is a number
- [ ] `player.difficulty` is one of: "easy", "normal", "hard"

### Backend Schemas

Check backend schemas match frontend objects:

- [ ] `PetState` fields match `pet` object keys
- [ ] `PlayerState` fields match `player` object keys
- [ ] All required fields have defaults in schema
- [ ] camelCase naming is consistent

## ✅ Core Workflows

### New Game Creation

1. [ ] Open http://localhost:3000
2. [ ] Fill in player name
3. [ ] Fill in pet name
4. [ ] Select pet type
5. [ ] Select difficulty
6. [ ] Click "Start Game"
7. [ ] Game displays with pet emoji and names
8. [ ] Click "Feed" or other action
9. [ ] Save indicator shows "💾 Saved!"
10. [ ] Check browser console for no errors

### Save/Load Local (No Authentication)

1. [ ] Close browser tab completely
2. [ ] Reopen http://localhost:3000
3. [ ] Click "Load Game"
4. [ ] Verify pet name is restored ✓
5. [ ] Verify day count is restored ✓
6. [ ] Verify player stats are restored ✓

### Save/Load Cloud (With Authentication)

1. [ ] Click "Register" on setup screen
2. [ ] Fill in email, password (min 8 chars)
3. [ ] Click "Register" button
4. [ ] Login with credentials
5. [ ] Play game normally
6. [ ] Check browser console: `apiAuth.isLoggedIn()` returns `true`
7. [ ] Close browser tab
8. [ ] Reopen http://localhost:3000
9. [ ] Login again
10. [ ] Click "Load Game"
11. [ ] Verify data is restored from backend
12. [ ] Check SQLite database: `sqlite3 backend/instance/app.db "SELECT * FROM game_save;"`

## ✅ Offline Mode

1. [ ] Start with game loaded
2. [ ] Open DevTools → Network tab
3. [ ] Check "Offline" checkbox
4. [ ] Try playing game - click actions
5. [ ] Save indicator still shows
6. [ ] Check browser console: No network errors
7. [ ] Uncheck "Offline"
8. [ ] Check console: "🟢 Backend connection restored"

## ✅ Error Handling

### Network Error Scenarios

```javascript
// Test timeout (disable backend temporarily)
// Try any action, should show error notification
```

- [ ] Network error shows user-friendly message
- [ ] "Retry" button works
- [ ] Game continues in offline mode
- [ ] localStorage is updated as fallback

### Validation Error Scenarios

```javascript
// Try these names:
await apiValidate.validateName("fuck", "player"); // Should reject
await apiValidate.validateName("fuck123", "player"); // Should reject
await apiValidate.validateName("n4zi", "player"); // Should reject (leetspeak)
await apiValidate.validateName("ValidName123", "player"); // Should accept
```

- [ ] Banned word shows error message
- [ ] User can't proceed with invalid name
- [ ] Validation works on game start
- [ ] Validation works via `/validate/name` endpoint

### Authentication Error Scenarios

- [ ] Wrong password shows error, doesn't log in
- [ ] Duplicate username shows error on register
- [ ] Empty field shows validation message
- [ ] Expired token (delete from localStorage, refresh) redirects to login

## ✅ Performance & Monitoring

### Console Checks

Open DevTools console (F12):

```javascript
// Check API state
console.log("API State:", API_STATE);
// Should show: isAuthenticated, accessToken, isOnline, etc.

// Check for warnings
// Should see: ✅ messages, not ❌ errors

// Check network tab
// POST requests to /auth/login, /game/save should show 200/201 status
```

- [ ] No errors in console on page load
- [ ] No errors on game start
- [ ] No errors on save/load
- [ ] Network requests show correct status codes
- [ ] API calls complete within 2 seconds (not timing out)

### Performance Checks

- [ ] Game loads in < 2 seconds
- [ ] Save completes in < 1 second
- [ ] Load completes in < 2 seconds
- [ ] Auto-sync doesn't cause lag (every 30 seconds)
- [ ] 60 FPS maintained during gameplay

## ✅ Backend Database

### Verify Data Persistence

```bash
# Connect to SQLite database
sqlite3 backend/instance/app.db

# Check user table
SELECT id, username, email, is_active FROM user;
# Expected: Your test user(s)

# Check game_save table
SELECT id, user_id, save_slot, day_reached, score FROM game_save;
# Expected: Your saved games

# Check achievement table (for future)
SELECT id, user_id, achievement_key, unlocked_date FROM achievement;

# Exit
.quit
```

- [ ] User table has records
- [ ] GameSave table has records
- [ ] GameSave.user_id references correct User.id
- [ ] Timestamps are recorded correctly

## ✅ CORS & Security

### CORS Headers in Response

Open DevTools → Network tab, click any API request:

- [ ] Response headers show `Access-Control-Allow-Origin: *` (or specific origin)
- [ ] Response headers show `Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS`
- [ ] No CORS errors in console

### Security Checks

```javascript
// Token should be in localStorage and Authorization headers
console.log("Token:", localStorage.getItem("access_token"));

// Backend should never expose passwords
// Check: SQLite doesn't store plain passwords
```

- [ ] JWT token is used for authentication
- [ ] Token is sent in Authorization header
- [ ] Passwords are hashed (bcrypt) in database
- [ ] No sensitive data in browser storage

## ✅ Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (Mac)
- [ ] Edge

For each browser:

- [ ] All features work
- [ ] No console errors
- [ ] All styling looks correct
- [ ] Forms are usable

## ✅ Integration Test Suite

Run from browser console:

```javascript
// Include test file
const script = document.createElement("script");
script.src = "./INTEGRATION_TEST_SUITE.js";
document.head.appendChild(script);

// Wait and run
setTimeout(() => {
  runIntegrationTests();
}, 1000);
```

- [ ] Test suite loads without errors
- [ ] All health checks pass
- [ ] CORS headers verified
- [ ] Registration succeeds
- [ ] Login succeeds
- [ ] Save game succeeds
- [ ] Load game succeeds
- [ ] Name validation works

## ✅ Documentation

- [ ] [QUICK_START.md](QUICK_START.md) - Setup instructions reviewed
- [ ] [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md) - Architecture understood
- [ ] [backend/README.md](backend/README.md) - Backend setup documented
- [ ] API endpoints documented and working
- [ ] Error handling documented

## 🎯 Final Verification

Run this complete flow:

1. [ ] Backend running on http://localhost:8000
2. [ ] Frontend served on http://localhost:3000
3. [ ] Open http://localhost:3000 in browser
4. [ ] Register new account
5. [ ] Login
6. [ ] Start new game
7. [ ] Play for 1 minute (feed, play, clean)
8. [ ] Verify save indicator shows
9. [ ] Close tab
10. [ ] Reopen http://localhost:3000
11. [ ] Login again
12. [ ] Load game
13. [ ] Verify all data is restored
14. [ ] Check database: `sqlite3 backend/instance/app.db "SELECT COUNT(*) FROM game_save;"`
15. [ ] All console errors should be 0

## ✅ Go Live Preparation

Before deploying to production:

- [ ] All tests pass
- [ ] No console errors
- [ ] Backend uses PostgreSQL (not SQLite)
- [ ] HTTPS enabled
- [ ] CORS_ORIGINS configured for production domain
- [ ] SECRET_KEY is cryptographically random
- [ ] DEBUG = False in production
- [ ] Rate limiting configured
- [ ] Database backups scheduled
- [ ] Error monitoring configured (Sentry, etc.)

---

**Checklist Status:**

Mark your completion:

- ✅ = Complete
- 🟡 = In Progress
- ❌ = Incomplete
- ⊘ = Not Applicable

**Total Items:** 150+
**Completed:** \_**\_ / 150+
**Pass Rate:** \_\_\_**%

If all checkboxes are ✅, your integration is complete and production-ready!
